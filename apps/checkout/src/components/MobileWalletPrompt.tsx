import { useState, useRef, useEffect } from "react";
import { Button } from "@orafi/ui";
import { FiCopy, FiCheck, FiSmartphone } from "react-icons/fi";
import { toast } from "sonner";
import type { SuiClient } from "@mysten/sui/client";

interface MobileWalletPromptProps {
    client: SuiClient;
    depositAddress: string;
    redirectUrl?: string;
}

export const MobileWalletPrompt = ({ redirectUrl, client, depositAddress }: MobileWalletPromptProps) => {
    const [showPayWithMobile, setShowPayWithMobile] = useState(false);
    const [copied, setCopied] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<null | 'verifying' | 'failed' | 'success'>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleCopyLink = async () => {
        const linkToCopy =
            window.location.href +
            (window.location.href.includes("?") ? "&" : "?") +
            "redirect=false";

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(linkToCopy);
            } else {
                // Fallback for mobile / in-app browsers
                const textArea = document.createElement("textarea");
                textArea.value = linkToCopy;
                textArea.style.position = "fixed"; // avoid scroll jump
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }

            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };


    const handleVerifyPayment = async () => {
        setVerifyingPayment(true);
        setPaymentStatus('verifying');

        try {
            // Check if deposit address exists on-chain
            const exists = await checkDepositAddressOnChain();

            if (exists) {
                setPaymentStatus('failed');
            } else {
                setPaymentStatus('success'); 
                
                if (redirectUrl) {
                    setTimeout(() => {
                        window.location.href = redirectUrl
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Error checking deposit address:', error);
            setPaymentStatus('failed');
        } finally {
            setVerifyingPayment(false);
        }
    };

    const checkDepositAddressOnChain = async (): Promise<boolean> => {
        try {
            const depositObject = await client.getObject({
                id: depositAddress,
                options: { showContent: true }
            });
            return !!depositObject.data;
        } catch (error: any) {
            if (
                error.message?.includes("not find") ||
                error.message?.includes("deleted")
            ) {
                return false;
            }

            return false; // Placeholder
        };
    }

        const linkToCopy = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'redirect=false';

        // Generate QR code when modal opens
        useEffect(() => {
            if (showPayWithMobile && canvasRef.current) {
                generateQRCode(linkToCopy, canvasRef.current);
            }
        }, [showPayWithMobile, linkToCopy]);

        const generateQRCode = async (text: string, canvas: HTMLCanvasElement) => {
            try {
                // @ts-ignore - qrcode module doesn't have type definitions
                const QRCode = (await import('qrcode')).default;
                await QRCode.toCanvas(canvas, text, {
                    errorCorrectionLevel: 'H',
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#1e3a8a',
                        light: '#ffffff',
                    },
                });
            } catch (error) {
                console.error('Error generating QR code:', error);
                // Fallback: just show the text if QR code fails
            }
        };

        return (
            <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                    onClick={() => setShowPayWithMobile(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200"
                >
                    <FiSmartphone size={18} />
                    Pay with Mobile
                </button>

                {showPayWithMobile && (
                    <div 
                        className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-300"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowPayWithMobile(false);
                                setPaymentStatus(null);
                            }
                        }}
                    >
                        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-t-blue-900 space-y-4 p-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Copy & Paste Link</h3>
                                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                    Copy the link below and paste it in your wallet(slush) browser to sign the transaction.
                                </p>

                                <div className="bg-white rounded-lg p-3 border border-blue-200 flex items-center gap-2 group hover:border-blue-300 transition-colors">
                                    <input
                                        type="text"
                                        value={linkToCopy}
                                        readOnly
                                        className="flex-1 text-xs bg-transparent outline-none text-gray-700 font-mono truncate"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="p-2 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                                        title={copied ? "Copied!" : "Copy link"}
                                    >
                                        {copied ? (
                                            <FiCheck size={16} className="text-green-600 font-bold" />
                                        ) : (
                                            <FiCopy size={16} className="text-blue-900" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex flex-col items-center">
                                <p className="text-xs text-gray-600 mb-3 font-medium">Scan with your phone camera</p>
                                <canvas
                                    ref={canvasRef}
                                    className="border border-blue-300 rounded-lg bg-white p-2"
                                />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Instructions</h3>
                                <ol className="text-xs text-gray-700 space-y-1.5 list-decimal list-inside bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                    <li>Open it in your browser</li>
                                    <li>Connect and sign in your wallet</li>
                                    <li>Return here and click Verify Payment</li>
                                </ol>
                            </div>

                            {paymentStatus === 'verifying' && (
                                <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-900 rounded-full animate-spin"></div>
                                    <span className="text-xs font-semibold text-blue-900">Verifying payment...</span>
                                </div>
                            )}

                            {paymentStatus === 'failed' && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs font-semibold text-red-700">
                                        Payment verification failed. Please try again.
                                    </p>
                                </div>
                            )}

                            {paymentStatus === 'success' && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                    <FiCheck size={16} className="text-green-600 flex-shrink-0" />
                                    <p className="text-xs font-semibold text-green-700">
                                        Payment verified!
                                    </p>
                                </div>
                            )}

                            <Button
                                variant="default"
                                onClick={handleVerifyPayment}
                                disabled={verifyingPayment || paymentStatus === 'success'}
                                className="w-full h-10 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold text-sm rounded-lg transition-all active:scale-[0.98]"
                            >
                                {verifyingPayment ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify Payment'
                                )}
                            </Button>

                            <button
                                onClick={() => {
                                    setShowPayWithMobile(false);
                                    setPaymentStatus(null);
                                }}
                                className="w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
