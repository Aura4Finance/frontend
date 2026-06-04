import { Button, Card } from "@orafi/ui";
import { FiAlertTriangle, FiHome } from "react-icons/fi";
import { Helmet } from "react-helmet-async"

const PayLinkNotFound = () => {

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col text-gray-900">
        <Helmet>
          <title>Payment Link Not Found | OraFi</title>
        </Helmet>
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden border border-gray-100 bg-white shadow-sm rounded-2xl p-8 md:p-10 flex flex-col items-center text-center">
          
          {/* Warning Icon Container */}
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <FiAlertTriangle className="w-8 h-8" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            Payment Link Not Found
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
            We couldn't find the payment link you're looking for. It may have expired, been deactivated by the merchant, or the URL might be incorrect.
          </p>

          {/* Action Button */}
          <Button
            variant="default"
            onClick={() => window.location.replace("https://orafi.app")}
            className="w-full h-12 text-base font-bold bg-blue-950 hover:bg-blue-900 text-white shadow-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <FiHome className="w-5 h-5" />
            Go to Home
          </Button>

        </Card>
      </div>  

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-xs">
        <p>&copy; {new Date().getFullYear()} OraFi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PayLinkNotFound;