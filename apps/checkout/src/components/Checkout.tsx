import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { Button, Card } from "@orafi/ui";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiCheckCircle, FiShield, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { RiSecurePaymentLine } from "react-icons/ri";
import { FiChevronDown } from "react-icons/fi";
import { MobileWalletPrompt } from "./MobileWalletPrompt";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { TransferPayment } from "./TransferPayment";
import { useGetPaymentInformationQuery, useGeneratePaymentIntentMutation } from "../hooks/useGetPaymentInformationQuery";
import { useGetSupportedNetworksAndTokens } from "../hooks/useGetSupportedNetworksAndTokens";
import { toast } from "sonner";

const Checkout = () => {
    const [_match, params] = useRoute("/:txId");
    const [_location, _setLocation] = useLocation();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"transfer_address" | "deposit_address" | null>(null);
    const [redirect, setRedirect] = useState<string | undefined>(undefined);
    const [showModal, setShowModal] = useState(false);
    const [showTokenDropdown, setShowTokenDropdown] = useState(false);
    const [selectedToken, setSelectedToken] = useState<string>("");
    const [isGeneratingIntent, setIsGeneratingIntent] = useState(false);
    const [tokenAmount, setTokenAmount] = useState<string>("");
    const [isLoadingTokenAmount, setIsLoadingTokenAmount] = useState(false);
    const [generatedAddresses, setGeneratedAddresses] = useState<{
        depositAddress?: string;
        transferAddress?: string;
    }>({});
    const wallet = useWallet();
    const accounts = useMemo(
        () => (wallet.connected ? wallet.getAccounts?.() ?? [] : []),
        [wallet]
    );

    const paymentQueryResult = useGetPaymentInformationQuery(params?.txId as string);
    const supportedNetworksQuery = useGetSupportedNetworksAndTokens();
    const generateIntentMutation = useGeneratePaymentIntentMutation(params?.txId as string);
    // Find the supported network that matches paymentData.network
    const matchedNetwork = useMemo(() => {
        if (!supportedNetworksQuery.data || !paymentQueryResult.data) return null;
        return supportedNetworksQuery.data.find(
            (n) => n.symbol.toLowerCase() === paymentQueryResult.data.network.toLowerCase()
        );
    }, [supportedNetworksQuery.data, paymentQueryResult.data]);

    // Get the selected token object from matched network
    const selectedTokenObject = useMemo(() => {
        if (!matchedNetwork || !selectedToken) return null;
        return matchedNetwork.supportedTokens.find(t => t.symbol === selectedToken);
    }, [matchedNetwork, selectedToken]);

    const roundedAmountInUSDC = useMemo(() => {
        if (!paymentQueryResult.data) return "0.00";
        return (Math.ceil(paymentQueryResult.data.amountInUSDC * 100) / 100).toFixed(2);
    }, [paymentQueryResult.data]);

    const formatTokenAmount = (value: number) =>
        (Math.ceil(value * 100) / 100).toFixed(2);

    const displayTokenSymbol = selectedTokenObject?.symbol || "USDC";
    const displayTokenLogoUrl = selectedTokenObject?.logoUrl;
    const displayTokenAmount = isLoadingTokenAmount ? "..." : (tokenAmount || roundedAmountInUSDC);

    useEffect(() => {
        const fetchTokenAmount = async () => {
            if (!paymentQueryResult.data) return;

            const amountInUSDC = (Math.ceil(paymentQueryResult.data.amountInUSDC * 100) / 100).toFixed(2);

            if (!selectedTokenObject || selectedTokenObject.symbol === "USDC") {
                setTokenAmount(amountInUSDC);
                return;
            }

            setIsLoadingTokenAmount(true);
            try {
                const { getTokenPrice } = await import("@7kprotocol/sdk-ts");

                const coinType = paymentQueryResult.data.mode === "test"
                    ? selectedTokenObject.testnet.coinType
                    : selectedTokenObject.mainnet.coinType;

                const rate = await getTokenPrice(coinType);
                const amountInToken = parseFloat(amountInUSDC) / rate;

                setTokenAmount(formatTokenAmount(amountInToken));
            } catch (error) {
                console.error("Failed to fetch token price", error);
                setTokenAmount(amountInUSDC);
            } finally {
                setIsLoadingTokenAmount(false);
            }
        };

        fetchTokenAmount();
    }, [paymentQueryResult.data, selectedTokenObject]);

    // Determine if token should be disabled
    const isTokenDisabled = (tokenSymbol: string): boolean => {
        if (!matchedNetwork) return true;
        const isTestnet = paymentQueryResult.data?.mode === "test";

        if (isTestnet) {
            // On testnet, only allow SUI and USDC
            return !["SUI", "USDC"].includes(tokenSymbol);
        }
        // On mainnet (live mode), allow all tokens
        return false;
    };

    // Set default token when network changes
    useEffect(() => {
        if (matchedNetwork && matchedNetwork.supportedTokens.length > 0) {
            // Find first enabled token or first token available
            const enabledToken = matchedNetwork.supportedTokens.find(t => !isTokenDisabled(t.symbol));
            setSelectedToken(enabledToken?.symbol || matchedNetwork.supportedTokens[0].symbol);
        }
    }, [matchedNetwork]);

    // Handle payment method selection - call mutation to generate intent
    const handleSelectPaymentMethod = async (method: "transfer_address" | "deposit_address") => {
        // Map method to property name
        const propertyName = method === "transfer_address" ? "transferAddress" : "depositAddress";

        // Check if address already exists (in payment data or cached)
        const existingAddress = paymentQueryResult.data?.[propertyName as keyof typeof paymentQueryResult.data] || generatedAddresses[propertyName as keyof typeof generatedAddresses];

        if (existingAddress) {
            // Address already exists, just proceed
            setPaymentMethod(method);
            return;
        }

        // Need to generate new address
        setIsGeneratingIntent(true);
        setError(null);
        try {
            generateIntentMutation.mutate({ intent: method, token: selectedToken }, {
                onSuccess: (address: string) => {
                    setGeneratedAddresses(prev => ({
                        ...prev,
                        [propertyName]: address
                    }));
                    setPaymentMethod(method);
                    setIsGeneratingIntent(false);
                    toast.success(`${method === "deposit_address" ? "Deposit" : "Transfer"} address generated`);
                },
                onError: () => {
                    setIsGeneratingIntent(false);
                    toast.error("Failed to generate payment address");
                }
            });
        } catch (err) {
            setIsGeneratingIntent(false);       
            toast.error("Failed to generate payment address");
        }
    };
    // Check if redirect=false is in URL
    const hasNoRedirect = !redirect || new URL(window.location.href).searchParams.get('redirect') === 'false';

    const network = paymentQueryResult.data?.mode === "live" ? "mainnet" : "testnet";
    const client = new SuiClient({
        url: getFullnodeUrl(network),
    });

    useEffect(() => {
        const redirectUrl = paymentQueryResult.data?.redirectUrl?.trim();

        if (!redirectUrl) return;

        try {
            const url = new URL(redirectUrl);
            url.searchParams.set("oratx", params?.txId as string);
            setRedirect(url.toString());
        } catch {
        }
    }, [paymentQueryResult.data?.redirectUrl]);
    // 2. Handle Payment
    const executePayment = async () => {
        if (!wallet.connected || !paymentQueryResult.data || !wallet.address) {
            toast.error("Wallet not connected");
            return;
        }

        const depositAddress = paymentQueryResult.data.depositAddress || generatedAddresses.depositAddress;
        if (!depositAddress) {
            toast.error("Deposit address not available");
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
                id: depositAddress,
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
               3. Fetch coins for selected token
            ------------------------------------------------------------- */
            if (!selectedTokenObject) {
                throw new Error("No token selected");
            }

            const tokenCoinType = paymentQueryResult.data.mode === "live" ?
                selectedTokenObject.mainnet.coinType :
                selectedTokenObject.testnet.coinType;

            const coins = await client.getCoins({
                owner: wallet.address,
                coinType: tokenCoinType,
            });

            const allCoins = coins.data;

            if (allCoins.length === 0) {
                toast.error(`No ${selectedTokenObject.symbol} balance`);
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
                toast.error(`Insufficient ${selectedTokenObject.symbol} balance`);
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

            const packageId = paymentQueryResult.data.mode == "live"
                ? matchedNetwork?.smartContractPackageId.mainnet
                : matchedNetwork?.smartContractPackageId.testnet;

            if (!packageId) {
                throw new Error("Package ID not available for this network");
            }

            tx.moveCall({
                target: `${packageId}::main::pay`,
                arguments: [
                    paymentCoin,
                    tx.object(depositAddress),
                ],
                typeArguments: [tokenCoinType]
            });

            await wallet.signAndExecuteTransactionBlock({
                transactionBlock: tx as any,
            });
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <img
                    src={logo}
                    alt="OraFi"
                    className="h-20 w-20 object-contain animate-pulse"
                />
            </div>
        );
    }

    if (!paymentQueryResult.data) return <div className="p-10 text-center">Payment not found</div>;
    if (supportedNetworksQuery.isPending) return <div className="p-10 text-center">Loading networks...</div>;

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

                            {/* Network Info */}
                            {matchedNetwork && (
                                <div className="w-full mb-4 pb-4 border-b border-gray-100">
                                    <p className="text-xs text-gray-500 font-medium mb-2">Network</p>
                                    <div className="flex items-center gap-2">
                                        {matchedNetwork.logoUrl && (
                                            <img src={matchedNetwork.logoUrl} alt={matchedNetwork.name} className="h-4 w-4 object-contain" />
                                        )}
                                        <span className="text-sm font-semibold text-blue-950">{matchedNetwork.name.toUpperCase()}</span>
                                    </div>
                                </div>
                            )}

                            <div className="w-full space-y-3">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Amount ({displayTokenSymbol})</span>
                                    <span className="font-bold text-gray-900">
                                        {displayTokenAmount} {displayTokenSymbol}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Equivalent ({paymentQueryResult.data.currency})</span>
                                    <span className="font-semibold text-gray-700">{paymentQueryResult.data.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Side - Checkout Form */}
                <Card className="w-full max-w-md bg-white shadow-xl border-t-4 border-t-blue-900 border-x-0 border-b-0 rounded-xl overflow-hidden p-5 lg:shadow-lg">
                    {/* Top Change Method Button */}
                    {paymentMethod && (
                        <div className="mb-4">
                            <button
                                onClick={() => setPaymentMethod(null)}
                                className="flex items-center gap-2 text-xs text-blue-900 hover:text-blue-700 font-semibold uppercase tracking-wider transition-colors"
                            >
                                <FiArrowLeft size={14} />
                                Change Payment Method
                            </button>
                        </div>
                    )}

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
                                    {displayTokenAmount} {displayTokenSymbol}
                                </span>
                                <span className="text-sm text-gray-500 font-medium mt-1">
                                    ≈ {paymentQueryResult.data.currency}{paymentQueryResult.data.amount.toLocaleString()}
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
                        {/* Token Dropdown */}
                        {matchedNetwork && matchedNetwork.supportedTokens.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Token</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowTokenDropdown((v) => !v)}
                                        disabled={paymentMethod === "deposit_address" || isGeneratingIntent}
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm flex items-center justify-between hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                                    >
                                        <div className="flex items-center gap-2">
                                            {displayTokenLogoUrl && (
                                                <img
                                                    src={displayTokenLogoUrl}
                                                    alt={displayTokenSymbol}
                                                    className="h-4 w-4 object-contain"
                                                />
                                            )}
                                            <span>{displayTokenSymbol}</span>
                                        </div>
                                        <FiChevronDown size={16} className={`transition-transform ${showTokenDropdown ? "rotate-180" : ""}`} />
                                    </button>

                                    {showTokenDropdown && paymentMethod !== "deposit_address" && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-40 max-h-64 overflow-y-auto">
                                            {matchedNetwork.supportedTokens.map((token) => (
                                                <button
                                                    key={token.symbol}
                                                    onClick={() => {
                                                        setSelectedToken(token.symbol);
                                                        setShowTokenDropdown(false);
                                                    }}
                                                    disabled={isTokenDisabled(token.symbol)}
                                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${selectedToken === token.symbol
                                                        ? "bg-blue-50 text-blue-900"
                                                        : "hover:bg-gray-50"
                                                        } ${isTokenDisabled(token.symbol) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                                >
                                                    {token.logoUrl && (
                                                        <img
                                                            src={token.logoUrl}
                                                            alt={token.symbol}
                                                            className="h-4 w-4 object-contain"
                                                        />
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{token.symbol}</span>
                                                        <span className="text-xs text-gray-600">{token.name}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Payment Method Selection or Active Method */}
                        {!paymentMethod ? (
                            <PaymentMethodSelector
                                onSelectMethod={handleSelectPaymentMethod}
                                isLoading={isGeneratingIntent}
                            />
                        ) : paymentMethod === "deposit_address" ? (
                            <>
                                {/* Deposit Address Payment Method */}
                                {!wallet.connected ? (
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm text-gray-600 text-center">Connect your Sui wallet to pay</p>
                                        <div className="flex justify-center suiet-custom-wrapper">
                                            <ConnectButton label="Connect Wallet" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <button
                                            onClick={() => setShowModal((v) => !v)}
                                            className="w-full bg-blue-50 border border-blue-100 p-3 rounded-md flex items-center gap-3"
                                        >
                                            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                                                Wallet Connected
                                            </span>

                                            <span className="text-xs font-mono text-blue-600 truncate max-w-[120px] ml-auto">
                                                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                                            </span>

                                            {/* Dropdown Icon */}
                                            <FiChevronDown
                                                className={`w-4 h-4 text-blue-700 transition-transform ${showModal ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        {/* Dropdown */}
                                        {showModal && (
                                            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-blue-100 bg-white shadow-xl z-50 overflow-hidden">

                                                {/* Header */}
                                                <div className="bg-blue-50 border-b border-blue-100 p-3">
                                                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                                                        Wallet Connected
                                                    </p>
                                                    <p className="text-xs font-mono text-blue-800 truncate mt-1">
                                                        {wallet.address}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="p-2 space-y-1">

                                                    {/* Disconnect */}
                                                    <button
                                                        onClick={() => {
                                                            wallet.disconnect();
                                                            setShowModal(false);
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm rounded-md
                   text-red-600 hover:bg-red-50 transition"
                                                    >
                                                        Disconnect wallet
                                                    </button>

                                                    {/* Divider */}
                                                    {accounts.length > 1 && (
                                                        <div className="h-px bg-blue-100 my-1" />
                                                    )}

                                                    {/* Other accounts only */}
                                                    {accounts
                                                        .filter(acc => acc.address !== wallet.address)
                                                        .map((acc) => (
                                                            <button
                                                                key={acc.address}
                                                                onClick={async () => {
                                                                    await wallet.select(acc.address);
                                                                    setShowModal(false);
                                                                }}
                                                                className="w-full px-3 py-2 text-left text-sm rounded-md
                       hover:bg-blue-50 transition"
                                                            >
                                                                <span className="font-mono text-blue-700 truncate block">
                                                                    {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                                                                </span>
                                                            </button>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            variant="default"
                                            onClick={handlePay}
                                            disabled={processing}
                                            className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg shadow-lg active:scale-[0.98]"
                                        >
                                            {processing ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                `Pay ${displayTokenAmount} ${displayTokenSymbol}`
                                            )}
                                        </Button>
                                    </div>
                                )}
                                {paymentMethod === "deposit_address" && (
                                    <MobileWalletPrompt
                                        redirectUrl={!hasNoRedirect ? redirect : undefined}
                                        client={client}
                                        depositAddress={paymentQueryResult.data.depositAddress || generatedAddresses.depositAddress || ""}
                                    />
                                )}
                            </>
                        ) : paymentMethod === "transfer_address" ? (
                            <>
                                {/* Transfer Address Payment Method */}
                                {(paymentQueryResult.data.transferAddress || generatedAddresses.transferAddress) && (
                                    <TransferPayment
                                        transferAddress={paymentQueryResult.data.transferAddress || generatedAddresses.transferAddress || ""}
                                        amountInUSDC={(Math.ceil(paymentQueryResult?.data.amountInUSDC * 100) / 100).toFixed(2)}
                                        redirectUrl={!hasNoRedirect ? redirect as string : undefined}
                                        transactionId={params?.txId as string}
                                        selectedToken={selectedTokenObject || undefined}
                                        isTestnet={paymentQueryResult.data?.mode === "test"}
                                    />
                                )}
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
                </Card>
            </div>
        </>
    );
};

export default Checkout;
