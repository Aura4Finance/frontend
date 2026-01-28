import { useState } from "react";
import { Button } from "@orafi/ui";
import { FiArrowRight } from "react-icons/fi";

interface PaymentMethodSelectorProps {
    onSelectMethod: (method: "mobile" | "transfer") => void;
}

export const PaymentMethodSelector = ({
    onSelectMethod,
}: PaymentMethodSelectorProps) => {
    const [selectedMethod, setSelectedMethod] = useState<"mobile" | "transfer" | null>(
        null
    );

    const handleSelect = (method: "mobile" | "transfer") => {
        setSelectedMethod(method);
        onSelectMethod(method);
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Choose Payment Method
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Pay with Mobile */}
                <button
                    onClick={() => handleSelect("mobile")}
                    className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300 ${
                        selectedMethod === "mobile"
                            ? "border-blue-900 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900 text-sm">
                                Pay via SUI Wallet
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Direct wallet payment via Sui Network
                            </p>
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedMethod === "mobile"
                                    ? "border-blue-900 bg-blue-900"
                                    : "border-gray-300"
                            }`}
                        >
                            {selectedMethod === "mobile" && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                            )}
                        </div>
                    </div>
                </button>

                {/* Pay with Transfer USDC */}
                <button
                    onClick={() => handleSelect("transfer")}
                    className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300 ${
                        selectedMethod === "transfer"
                            ? "border-blue-900 bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900 text-sm">
                                Pay via Transfer USDC
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                Send USDC to wallet address manually
                            </p>
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedMethod === "transfer"
                                    ? "border-blue-900 bg-blue-900"
                                    : "border-gray-300"
                            }`}
                        >
                            {selectedMethod === "transfer" && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                            )}
                        </div>
                    </div>
                </button>
            </div>

            {selectedMethod && (
                <Button
                    variant="default"
                    className="w-full h-11 bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    disabled={!selectedMethod}
                >
                    Continue <FiArrowRight size={16} />
                </Button>
            )}
        </div>
    );
};
