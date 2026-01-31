import { useEffect, useState } from "react";
import { useRoute, useSearch } from "wouter";
import { Button, Card } from "@orafi/ui";
import { FiMapPin, FiGlobe } from "react-icons/fi";
import { RiSecurePaymentLine } from "react-icons/ri";
import logo from "@orafi/ui/assets/OraFi.png";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailed from "./PaymentFailed";
import ImageGallery from "./ImageGallery";
import { useGetPayLinkInformationQuery } from "../hooks/useGetPayinkInformationQuery";
import { useVerifyPaymentMutation } from "../hooks/useVerifyPaymentMutation";
import { useCreatePaymentMutation } from "../hooks/useCreatePaymentMutation";
import PopupModal from "./PopupModal";

const PayLink = () => {
  const [_match, params] = useRoute("/:paylinkId");
  const search = useSearch();
  const paylinkData = useGetPayLinkInformationQuery(params?.paylinkId as string);
  const verifyPaymentMutation = useVerifyPaymentMutation();
  const createPaymentMutation = useCreatePaymentMutation();
  const [txId, setTxId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);


  useEffect(() => {
    // 1. Check for transaction ID in URL (return from checkout)
    const params = new URLSearchParams(search);
    const oratx = params.get("oratx");

    if (oratx) {
      setTxId(oratx);
      verifyPaymentMutation.mutate(oratx);
    }
  }, [search]);

  // Rendering verification states
  if (verifyPaymentMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Verifying payment...</p>
        <div className="flex items-center gap-2 mt-4 opacity-50">
          <img src={logo} alt="OraFi" className="h-5 w-5" />
          <span className="text-sm font-semibold text-gray-900">OraFi</span>
        </div>
      </div>
    );
  }

  if (verifyPaymentMutation.isSuccess && verifyPaymentMutation.data && txId) {
    return <PaymentSuccess txId={txId} />;
  }

  if (verifyPaymentMutation.isError || (verifyPaymentMutation.isSuccess && !verifyPaymentMutation.data && txId)) {
    return <PaymentFailed txId={txId as string} onRetry={() => verifyPaymentMutation.mutate(txId as string)} />;
  }

  // Loading Product Data
  if (paylinkData.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!paylinkData.data) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Simple Header */}
      <header className="w-full py-6 flex justify-center">
        <div className="flex items-center gap-2">
          <img src={logo} alt="OraFi Logo" className="h-8 w-8 rounded-full shadow-sm" />
          <span className="text-xl font-bold text-blue-950 tracking-tight">OraFi</span>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center p-4">
        <Card className="w-full max-w-5xl bg-white shadow-sm border border-gray-100 overflow-hidden">

          {/* Test Mode Banner */}
          {paylinkData.data?.mode === "test" && (
            <div className="bg-yellow-50 text-yellow-800 text-xs font-bold px-4 py-2 text-center uppercase tracking-wider border-b border-yellow-100">
              Test Mode Transaction
            </div>
          )}

          <div className="flex flex-col lg:flex-row">
            {/* Left Column: Image Gallery */}
            <div className="lg:w-1/2 bg-gray-50 p-6 md:p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="w-full max-w-md">
                <ImageGallery images={paylinkData.data?.imageBlobIds || []} />
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:w-1/2 p-6 md:p-10 flex flex-col">

              {/* Merchant Info (Header) */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {paylinkData.data?.profile.businessName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Pay to</p>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{paylinkData.data?.profile.businessName}</h3>
                  <p className="text-xs text-gray-400 font-medium truncate">{paylinkData.data?.profile.businessSector}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {paylinkData.data?.profile.country && (
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <FiMapPin className="text-gray-400" /> {paylinkData.data?.profile.country}
                    </div>
                  )}
                  {paylinkData.data?.profile.websiteLink && (
                    <a href={paylinkData.data?.profile.websiteLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline px-2 py-1">
                      <FiGlobe /> Visit Website
                    </a>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-blue-950 leading-tight">{paylinkData.data?.title}</h1>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">₦ {paylinkData.data?.amount.toLocaleString()}</h2>
                </div>

                <div className="prose prose-sm prose-blue text-gray-600 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  <p>{paylinkData.data?.description}</p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="default"
                    className="w-full h-12 text-base font-bold bg-blue-950 hover:bg-blue-900 text-white shadow-md rounded-md transition-all active:scale-[0.98]">
                    Proceed to Checkout
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <RiSecurePaymentLine className="w-4 h-4 text-green-600" />
                    <span>Secured by OraFi</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Card>
      </div>

      <PopupModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={(data) => {
          setCheckoutOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-xs">
        <p>&copy; {new Date().getFullYear()} OraFi. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default PayLink;
