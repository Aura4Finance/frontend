import { useEffect, useState } from "react";
import { useParams, useSearch } from "wouter";
import { Button, Card } from "@orafi/ui";
import { FiTruck, FiRotateCcw, FiStar, FiMapPin, FiGlobe, FiMail } from "react-icons/fi";
import { RiSecurePaymentLine } from "react-icons/ri";
import logo from "@orafi/ui/assets/OraFi.png";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailed from "./PaymentFailed";
import ImageGallery from "./ImageGallery";

// Mock data
const MOCK_DATA = {
  success: true,
  message: "Paylink retrieved successfully",
  data: {
    id: "cmkg20xis0002v8h80ch35g05",
    title: "Chidi and Co. Battery Series X", 
    description: "High performance vehicle battery suitable for all weather conditions. Durable, long-lasting, and reliable power source for your automotive needs. Comes with a 2-year warranty.",
    mode: "test",
    amount: 40000,
    // Provide 4 image IDs to demonstrate gallery
    imageBlobIds: [
      "AaV6MqcXjdhL64Crb_OqGu9qyHXAaYFxDvKzyvOpgnY",
      "BbW2NrdVkfiM75Dsc_PqHv9rzIYBbZGyEwLzxwPqhZ",
      "CcX8OseWlgjN86Etd_QrIw0saJCCcAHzFzMzyxQriA",
      "DdY4PtfXmhkO97Fue_RsJx1tbKDdRBI0G1N0yRsjB"
    ],
    profileId: "87122f99-2f37-438a-aa70-0b438e8908cf",
    profile: {
      id: "87122f99-2f37-438a-aa70-0b438e8908cf",
      userId: "154ecd07-55a1-4031-94d3-605b791c68c6",
      businessName: "Chidi and Co. Auto Parts",
      businessSector: "Automotive",
      country: "Nigeria",
      websiteLink: "https://chidi-autos.com",
      onboarded: false,
      isLive: false,
    },
  },
};

const PayLink = () => {
  const { id } = useParams();
  const search = useSearch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<typeof MOCK_DATA.data | null>(null);
  
  // Payment Verification State
  const [verifying, setVerifying] = useState(false);
  const [txnStatus, setTxnStatus] = useState<"success" | "failed" | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for transaction ID in URL (return from checkout)
    const params = new URLSearchParams(search);
    const oratx = params.get("oratx");

    if (oratx) {
      setTxId(oratx);
      verifyTransaction(oratx);
    } else {
      // 2. Normal page load: fetch product data
      loadProductData();
    }
  }, [id, search]);

  const loadProductData = () => {
    // Simulate API fetch delay
    setTimeout(() => {
      setData(MOCK_DATA.data);
      setLoading(false);
    }, 800);
  };

  const verifyTransaction = (transactionId: string) => {
    setVerifying(true);
    // Simulate verification API call
    setTimeout(() => {
      setVerifying(false);
      // Mock result depending on some logic (e.g. random or hardcoded)
      // For demo, we'll assume success
      setTxnStatus("success");
    }, 2000);
  };

  const retryPayment = () => {
    setTxnStatus(null);
    window.location.href = window.location.pathname; // Clear query params
  };

  // Rendering verification states
  if (verifying) {
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

  if (txnStatus === "success" && txId) {
    return <PaymentSuccess txId={txId} />;
  }

  if (txnStatus === "failed" && txId) {
    return <PaymentFailed txId={txId} onRetry={retryPayment} />;
  }

  // Loading Product Data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

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
             {data.mode === "test" && (
                <div className="bg-yellow-50 text-yellow-800 text-xs font-bold px-4 py-2 text-center uppercase tracking-wider border-b border-yellow-100">
                    Test Mode Transaction
                </div>
            )}

            <div className="flex flex-col lg:flex-row">
                 {/* Left Column: Image Gallery */}
                 <div className="lg:w-1/2 bg-gray-50 p-6 md:p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
                     <div className="w-full max-w-md">
                        <ImageGallery images={data.imageBlobIds} />
                     </div>
                 </div>

                 {/* Right Column: Details */}
                 <div className="lg:w-1/2 p-6 md:p-10 flex flex-col">
                    
                    {/* Merchant Info (Header) */}
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            {data.profile.businessName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                             <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Pay to</p>
                             <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{data.profile.businessName}</h3>
                             <p className="text-xs text-gray-400 font-medium truncate">{data.profile.businessSector}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                             {data.profile.country && (
                                 <div className="text-xs text-gray-500 font-medium flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                    <FiMapPin className="text-gray-400" /> {data.profile.country}
                                 </div>
                             )}
                             {data.profile.websiteLink && (
                                <a href={data.profile.websiteLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline px-2 py-1">
                                    <FiGlobe /> Visit Website
                                </a>
                             )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start gap-4 mb-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-blue-950 leading-tight">{data.title}</h1>
                        </div>
                    
                         <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mt-2">₦ {data.amount.toLocaleString()}</h2>
                         </div>

                        <div className="prose prose-sm prose-blue text-gray-600 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <p>{data.description}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                         <div className="flex flex-col gap-4">
                            <Button 
                                variant="default"
                                className="w-full h-12 text-base font-bold bg-blue-950 hover:bg-blue-900 text-white shadow-md rounded-md transition-all active:scale-[0.98]">
                                    Pay Now
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

       {/* Footer */}
       <footer className="py-6 text-center text-gray-400 text-xs">
         <p>&copy; {new Date().getFullYear()} OraFi. All rights reserved.</p>
       </footer>

    </div>
  );
};

export default PayLink;
