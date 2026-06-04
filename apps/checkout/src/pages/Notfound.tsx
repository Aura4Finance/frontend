import { Card } from "@orafi/ui";
import { FiShoppingBag } from "react-icons/fi";
import { Helmet } from "react-helmet-async";

const CheckoutNotFound = () => {

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col text-gray-900">
        <Helmet>
            <title> Checkout Session Not Found </title>
        </Helmet>
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden border border-gray-100 bg-white shadow-sm rounded-2xl p-8 md:p-10 flex flex-col items-center text-center">
          
          {/* Shopping Context Error Icon */}
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100">
            <FiShoppingBag className="w-7 h-7" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            Checkout Session Empty
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
            We couldn't retrieve your active checkout session data. This window may have timed out, or the reference invoice identifier is invalid.
          </p>

        </Card>
      </div>  

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-xs">
        <p>&copy; {new Date().getFullYear()} OraFi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CheckoutNotFound;