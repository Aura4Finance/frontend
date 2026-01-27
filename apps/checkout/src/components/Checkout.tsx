import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { Button, Card } from "@orafi/ui";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiCheckCircle, FiShield, FiAlertCircle } from "react-icons/fi";
import { RiSecurePaymentLine } from "react-icons/ri";
import { MobileWalletPrompt } from "./MobileWalletPrompt";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { TransferPayment } from "./TransferPayment";
import { useGetPaymentInformationQuery } from "../hooks/useGetPaymentInformationQuery";
import { PACKAGE_ID } from "../client/constant";
import { toast } from "sonner";

const Checkout = () => {
    const [_match, params] = useRoute("/:txId");
    const [_location, _setLocation] = useLocation();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"mobile" | "transfer" | null>(null);
    const [redirect, setRedirect] = useState<string | undefined>(undefined);
    const wallet = useWallet();

    const paymentQueryResult = useGetPaymentInformationQuery(params?.txId as string);
    // Check if redirect=false is in URL
    const hasNoRedirect = new URL(window.location.href).searchParams.get('redirect') === 'false';

    const network = paymentQueryResult.data?.mode === "live" ? "mainnet" : "testnet";
    const client = new SuiClient({
        url: getFullnodeUrl(network),
    });

    useEffect(() => {
        if (paymentQueryResult.data?.redirectUrl) {
            const url = new URL(
                paymentQueryResult.data?.redirectUrl
            );

            url.searchParams.set(
                "oratx",
                params?.txId as string
            );
            setRedirect(url.toString());
        }
    }
        , [paymentQueryResult.data]);
    // 2. Handle Payment
    const executePayment = async () => {
        if (!wallet.connected || !paymentQueryResult.data || !wallet.address) {
            toast.error("Wallet not connected");
            return;
        }

        setProcessing(true);
        setError(null);

        if (params?.txId) {
            localStorage.setItem(
                `orafi-tx-session-active-${params.txId}`,
                "true"
            );
        }
        try {
            /* ------------------------------------------------------------
               1. Setup Sui Client
            ------------------------------------------------------------- */

            /* ------------------------------------------------------------
               2. Read required payment amount (BASE UNITS)
            ------------------------------------------------------------- */
            const depositObject = await client.getObject({
                id: paymentQueryResult.data.depositAddress,
                options: { showContent: true },
            });

            if (
                depositObject.data?.content?.dataType !== "moveObject"
            ) {
                throw new Error("Invalid deposit object");
            }

            const rawAmount = (
                depositObject.data.content as any
            ).fields.amount;

            // ALWAYS bigint for on-chain values
            const amount: bigint = BigInt(rawAmount);

            if (amount <= 0n) {
                throw new Error("Invalid payment amount");
            }

            /* ------------------------------------------------------------
               3. Fetch ALL USDC coins owned by wallet
            ------------------------------------------------------------- */
            const USDC_TYPE =
                "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";

            const coins = await client.getCoins({
                owner: wallet.address,
                coinType: USDC_TYPE,
            });

            const allCoins = coins.data;

            if (allCoins.length === 0) {
                toast.error("No USDC balance");
                return;
            }

            /* ------------------------------------------------------------
               4. Ensure total balance is sufficient
            ------------------------------------------------------------- */
            const totalBalance = allCoins.reduce(
                (sum, c) => sum + BigInt(c.balance),
                0n
            );

            if (totalBalance < amount) {
                toast.error("Insufficient USDC balance");
                return;
            }

            /* ------------------------------------------------------------
               5. Build Transaction
            ------------------------------------------------------------- */
            const tx = new Transaction();

            /* ------------------------------------------------------------
               6. Select or merge USDC coins (NO GAS COIN INVOLVEMENT)
            ------------------------------------------------------------- */
            let baseCoinId: string;

            const singleCoin = allCoins.find(
                (c) => BigInt(c.balance) >= amount
            );

            if (singleCoin) {
                baseCoinId = singleCoin.coinObjectId;
            } else {
                const [target, ...rest] = allCoins;
                const targetObj = tx.object(target.coinObjectId);

                for (const c of rest) {
                    tx.mergeCoins(
                        targetObj,
                        [tx.object(c.coinObjectId)]
                    );
                }

                baseCoinId = target.coinObjectId;
            }

            /* ------------------------------------------------------------
               7. Split EXACT amount (CRITICAL STEP)
            ------------------------------------------------------------- */
            const [paymentCoin] = tx.splitCoins(
                tx.object(baseCoinId),
                [tx.pure.u64(amount)]
            );

            /* ------------------------------------------------------------
               8. Call Move contract
            ------------------------------------------------------------- */
            tx.moveCall({
                target: `${PACKAGE_ID}::main::pay`,
                arguments: [
                    paymentCoin,
                    tx.object(paymentQueryResult.data.depositAddress),
                ],
            });

            /* ------------------------------------------------------------
               9. Sign and Execute (wallet provides SUI gas)
            ------------------------------------------------------------- */
            await wallet.signAndExecuteTransactionBlock({
                transactionBlock: tx as any,
            });

            /* ------------------------------------------------------------
               10. Success handling
            ------------------------------------------------------------- */
            toast.success("Payment successful");

            if (params?.txId) {
                localStorage.setItem(
                    `orafi-tx-status-${params.txId}`,
                    "completed"
                );
                localStorage.removeItem(
                    `orafi-tx-session-active-${params.txId}`
                );
            }


            if (!hasNoRedirect) window.location.href = redirect as string;
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Payment failed");
        } finally {
            setProcessing(false);
        }
    };


    const handlePay = () => {
        if (!wallet.connected) return;

        executePayment();
    };

    if (paymentQueryResult.isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!paymentQueryResult.data) return <div className="p-10 text-center">Payment not found</div>;

    return (
        <>
            {/* Verification Overlay */}
            {processing && (
                <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="w-20 h-20 mb-6 relative">
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Transaction</h2>
                    <p className="text-gray-500 max-w-xs mx-auto">
                        Please wait while we confirm your payment on the Sui Network...
                    </p>
                    <div className="mt-8 px-4 py-2 bg-blue-50 text-blue-900 text-[10px] font-black uppercase tracking-widest rounded-full">
                        OraFi Secure Node
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-12 p-4 font-sans">

                {/* Left Side - Payment Summary (shown on top for mobile, left for desktop) */}
                <div className="mb-8 lg:mb-0 lg:flex-shrink-0 lg:w-auto flex flex-col items-center lg:items-start">
                    <div className="flex items-center gap-2 mb-6">
                        <img src={logo} alt="OraFi" className="h-8 w-8" />
                        <span className="text-xl font-bold text-blue-950 tracking-tight">OraFi Checkout</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 mb-8">
                        <RiSecurePaymentLine className="text-green-600" />
                        Secured by OraFi Protocol
                    </div>

                    {/* Payment Summary Card - Desktop Only */}
                    <Card className="hidden lg:block bg-white shadow-md border border-gray-100 rounded-lg overflow-hidden p-6 w-80">
                        <div className="flex flex-col items-start">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">Payment Summary</p>
                            
                            <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-center text-lg font-bold mb-4 shadow-inner">
                                {Array.from(paymentQueryResult.data?.businessName)[0]}
                            </div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Paying to</p>
                            <h3 className="text-lg font-bold text-gray-900 mb-6">{paymentQueryResult.data.businessName}</h3>

                            <div className="w-full space-y-3">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Amount (USD)</span>
                                    <span className="font-bold text-gray-900">${paymentQueryResult?.data.amountInUSDC.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Equivalent (NGN)</span>
                                    <span className="font-semibold text-gray-700">₦{paymentQueryResult.data.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side - Checkout Form */}
                <Card className="w-full max-w-md bg-white shadow-xl border-t-4 border-t-blue-900 border-x-0 border-b-0 rounded-xl overflow-hidden p-5 lg:shadow-lg">
                    {/* Mobile Header - Hidden on Desktop */}
                    <div className="lg:hidden p-6 pb-4 border-b border-gray-100 bg-white mb-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-inner">
                                {Array.from(paymentQueryResult.data?.businessName)[0]}
                            </div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Payment to</p>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{paymentQueryResult.data.businessName}</h2>

                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-extrabold text-blue-950 font-mono tracking-tighter">
                                    ${paymentQueryResult?.data.amountInUSDC.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 font-medium mt-1">
                                    ≈ ₦{paymentQueryResult.data.amount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Header - Hidden on Mobile */}
                    <div className="hidden lg:block pb-4 border-b border-gray-100 bg-white mb-4">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">Payment Method</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                            <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Payment Method Selection or Active Method */}
                        {!paymentMethod ? (
                            <PaymentMethodSelector
                                onSelectMethod={setPaymentMethod}
                            />
                        ) : paymentMethod === "mobile" ? (
                            <>
                                {/* Mobile/Wallet Payment Method */}
                                {!wallet.connected ? (
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm text-gray-600 text-center">Connect your Sui wallet to pay</p>
                                        <div className="flex justify-center suiet-custom-wrapper">
                                            <ConnectButton label="Connect Wallet" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-md flex items-center justify-between">
                                            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Wallet Connected</span>
                                            <span className="text-xs font-mono text-blue-600 truncate max-w-[120px]">
                                                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                                            </span>
                                        </div>
                                        <Button
                                            variant="default"
                                            onClick={handlePay}
                                            disabled={processing}
                                            className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
                                        >
                                            {processing ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                `Pay $${paymentQueryResult.data.amountInUSDC.toFixed(2)}`
                                            )}
                                        </Button>
                                        <button
                                            onClick={() => setPaymentMethod(null)}
                                            className="text-xs text-gray-500 hover:text-gray-700 text-center py-2 transition-colors"
                                        >
                                            Change payment method
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : paymentMethod === "transfer" ? (
                            <>
                                {/* Transfer Payment Method */}
                                <TransferPayment
                                    transferAddress={paymentQueryResult.data.transferAddress}
                                    amountInUSDC={paymentQueryResult.data.amountInUSDC}
                                    redirectUrl={!hasNoRedirect ? redirect as string : undefined}
                                    transactionId={params?.txId as string}
                                />
                                <button
                                    onClick={() => setPaymentMethod(null)}
                                    className="text-xs text-gray-500 hover:text-gray-700 text-center py-2 transition-colors"
                                >
                                    Change payment method
                                </button>
                            </>
                        ) : null}
                    </div>

                    <div className="mt-6 lg:mt-4 flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5 hover:text-gray-600 cursor-pointer transition">
                            <FiShield /> Privacy
                        </span>
                        <span className="flex items-center gap-1.5 hover:text-gray-600 cursor-pointer transition">
                            <FiCheckCircle /> Terms
                        </span>
                    </div>

                    <style>
                        {`
                .suiet-custom-wrapper .w-full { width: 100% !important; }
                .suiet-custom-wrapper button { 
                    width: 100%; 
                    justify-content: center;
                    background-color: white;
                    color: #1e3a8a; /* blue-900 */
                    border: 1px solid #e5e7eb;
                    font-weight: 600;
                    height: 48px;
                    }
                    .suiet-custom-wrapper button:hover {
                        background-color: #f9fafb;
                        border-color: #1e3a8a;
                        }
                        `}
                    </style>
                    {paymentMethod === "mobile" && (
                        <MobileWalletPrompt
                            redirectUrl={!hasNoRedirect ? redirect : undefined}
                            client={client}
                            depositAddress={paymentQueryResult.data.depositAddress}
                        />
                    )}
                </Card>
            </div>
        </>
    );
};

export default Checkout;
