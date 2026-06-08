import React, { useState, useEffect } from "react";
// @ts-ignore
import QRCode from "qrcode";
import { FiCopy, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import { Button } from "@orafi/ui";
import { useVerifyTransferMutation } from "../hooks/useVerifyTransferMutation";
import { toast } from "sonner";

interface TransferPaymentProps {
    transferAddress?: string;
    amountInUSDC: string;
    transactionId?: string;
    redirectUrl?: string;
    isTestnet?: boolean;
    selectedToken?: {
        name: string;
        symbol: string;
        logoUrl: string;
        decimals: string;
        mainnet: { coinType: string };
        testnet: { coinType: string };
    };
}

export const TransferPayment = ({
    transferAddress,
    amountInUSDC,
    transactionId,
    redirectUrl,
    isTestnet = true,
    selectedToken
}: TransferPaymentProps) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [copied, _setCopied] = useState<boolean>(false);
    const [tokenAmount, setTokenAmount] = useState<string>(amountInUSDC);
    const [isLoadingAmount, setIsLoadingAmount] = useState<boolean>(false);
    const verifyTransferMutation = useVerifyTransferMutation(redirectUrl);

    // Fetch token price and calculate amount
    useEffect(() => {
        const fetchTokenAmount = async () => {
            if (!selectedToken || selectedToken.symbol === "USDC") {
                // If USDC is selected, amount stays the same
                setTokenAmount(amountInUSDC);
                return;
            }

            setIsLoadingAmount(true);
            try {
                // Dynamic import to avoid build issues
                const { getTokenPrice } = await import("@7kprotocol/sdk-ts");
                
                // Get the coin type based on network
                const coinType = isTestnet 
                    ? selectedToken.testnet.coinType 
                    : selectedToken.mainnet.coinType;
                
                // Get the price rate
                const rate = await getTokenPrice(coinType);
                
                // Calculate amount: amountInUSDC / rate
                const amountInToken = parseFloat(amountInUSDC) / rate;
                // Format with proper decimals
                setTokenAmount((Math.ceil(amountInToken * 100) / 100).toFixed(2));
            } catch (error) {
                console.error("Failed to fetch token price", error);
                // Fallback to amountInUSDC if fetch fails
                setTokenAmount(amountInUSDC);
            } finally {
                setIsLoadingAmount(false);
            }
        };

        fetchTokenAmount();
    }, [selectedToken, amountInUSDC, isTestnet]);

    // Get the token symbol, with fallback to USDC
    const tokenSymbol = selectedToken?.symbol || "USDC";
    const tokenLogo = selectedToken?.logoUrl || "";
    const tokenName = selectedToken?.name || "USDC";

    // Generate QR code on mount
    const generateQRCode = async () => {
        try {
            const url = await QRCode.toDataURL(String(transferAddress), {
                margin: 1,
                width: 200,
                color: {
                    dark: "#1e3a8a", // blue-900
                    light: "#ffffff",
                },
            });
            setQrCodeUrl(url);
        } catch (err) {
            console.error("Failed to generate QR code", err);
        }
    };

    React.useEffect(() => {
        generateQRCode();
    }, [transferAddress]);

    const handleCopyAddress = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(String(transferAddress));
            } else {
                // Fallback for mobile / in-app browsers
                const textArea = document.createElement("textarea");
                textArea.value = String(transferAddress);
                textArea.style.position = "fixed"; // avoid scroll jump
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }

        } catch (err) {
            console.error("Failed to copy", err);
        }
        toast.success("Address copied to clipboard!");
    };

    const handleVerifyTransfer = () => {
        verifyTransferMutation.mutate({ paymentId: String(transactionId), token: tokenSymbol });
    };

    return (
        <div className="space-y-6">
            {/* Transfer Address Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-4">
                    Send {tokenSymbol} to
                </p>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                    {qrCodeUrl ? (
                        <div className="bg-white p-3 rounded-lg shadow-md border border-blue-100">
                            <img
                                src={qrCodeUrl}
                                alt="Wallet Address QR Code"
                                className="w-48 h-48"
                            />
                        </div>
                    ) : (
                        <div className="w-48 h-48 bg-white rounded-lg shadow-md border border-blue-100 animate-pulse flex items-center justify-center">
                            <FiLoader className="animate-spin text-blue-900" size={24} />
                        </div>
                    )}
                </div>

                {/* Wallet Address */}
                <div className="bg-white rounded-md p-4 border border-blue-200 mb-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-2">
                        Wallet Address
                    </p>
                    <div className="flex items-center justify-between gap-2">
                        <code className="text-sm font-mono text-blue-900 font-bold truncate flex-1 break-all">
                            {transferAddress}
                        </code>
                        <button
                            onClick={handleCopyAddress}
                            className="flex-shrink-0 p-2 hover:bg-blue-50 rounded transition-colors"
                            title="Copy address"
                        >
                            {copied ? (
                                <FiCheckCircle className="text-green-600" size={18} />
                            ) : (
                                <FiCopy className="text-blue-900 hover:text-blue-700" size={18} />
                            )}
                        </button>
                    </div>
                </div>

            {/* Amount Info */}
            <div className="bg-blue-900/5 rounded-md p-3 text-center">
                <p className="text-xs text-gray-600 font-medium uppercase tracking-widest mb-1">
                    Amount to Transfer
                </p>
                <div className="flex items-center justify-center gap-2 mb-2">
                    {tokenLogo && (
                        <img src={tokenLogo} alt={tokenSymbol} className="h-5 w-5 object-contain" />
                    )}
                    <span className="text-sm font-semibold text-blue-900">{tokenName}</span>
                </div>
                {isLoadingAmount ? (
                    <div className="flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin" size={16} />
                        <span className="text-sm text-gray-600">Calculating amount...</span>
                    </div>
                ) : (
                    <p className="text-2xl font-bold text-blue-900 font-mono">
                        {tokenAmount} {tokenSymbol}
                    </p>
                )}
            </div>
            </div>

            {/* Verify Transfer Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-6">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Verify Transfer
                    </p>
                    <p className="text-sm text-gray-600">
                        After sending, click the button below to verify your transaction
                    </p>
                </div>

                {verifyTransferMutation.isError && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
                        <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                        <span>
                            {(verifyTransferMutation.error as any)?.response?.data?.message ||
                                "Failed to verify transfer"}
                        </span>
                    </div>
                )}

                {verifyTransferMutation.isSuccess && (
                    <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-start gap-2">
                        <FiCheckCircle className="mt-0.5 flex-shrink-0" />
                        <span>Transfer verified successfully!</span>
                    </div>
                )}

                <Button
                    variant="default"
                    onClick={handleVerifyTransfer}
                    disabled={
                        verifyTransferMutation.isPending ||
                        verifyTransferMutation.isSuccess
                    }
                    className="w-full h-12 bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {verifyTransferMutation.isPending ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Verifying...
                        </div>
                    ) : verifyTransferMutation.isSuccess ? (
                        <div className="flex items-center justify-center gap-2 ">
                            <FiCheckCircle size={20} />
                            Transfer Verified
                        </div>
                    ) : (
                        "Verify Transfer"
                    )}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-4">
                    This may take a few moments to process
                </p>
            </div>
        </div>
    );
};
