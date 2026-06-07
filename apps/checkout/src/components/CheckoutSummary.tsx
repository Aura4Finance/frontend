import React from "react";
import { Card } from "@orafi/ui";
import type { SupportedNetwork } from "../hooks/useGetSupportedNetworksAndTokens";

interface CheckoutSummaryProps {
  businessName: string;
  matchedNetwork?: SupportedNetwork;
  displayTokenSymbol: string;
  displayTokenAmount: string;
  currency: string;
  amount: number;
  isDesktopOnly?: boolean;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  businessName,
  matchedNetwork,
  displayTokenSymbol,
  displayTokenAmount,
  currency,
  amount,
  isDesktopOnly = false,
}) => {
  const initialLetter = Array.from(businessName || "O")[0];

  if (!isDesktopOnly) {
    // Mobile Layout rendering variant
    return (
      <div className="lg:hidden p-6 pb-4 border-b border-gray-100 bg-white mb-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-inner">
            {initialLetter}
          </div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Payment to</p>
          <h2 className="text-xl font-bold text-gray-900 mb-6">{businessName}</h2>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-blue-950 font-mono tracking-tighter">
              {displayTokenAmount} {displayTokenSymbol}
            </span>
            <span className="text-sm text-gray-500 font-medium mt-1">
              ≈ {currency}
              {amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Card View variant
  return (
    <Card className="hidden lg:block bg-white shadow-md border border-gray-100 rounded-lg overflow-hidden p-6 w-80">
      <div className="flex flex-col items-start">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">Payment Summary</p>
        <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-center text-lg font-bold mb-4 shadow-inner">
          {initialLetter}
        </div>
        <p className="text-xs text-gray-500 font-medium mb-1">Paying to</p>
        <h3 className="text-lg font-bold text-gray-900 mb-6">{businessName}</h3>

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
            <span className="text-sm text-gray-600">Equivalent ({currency})</span>
            <span className="font-semibold text-gray-700">{amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};