import { Button, Card, CardContent } from "@orafi/ui";
import { FiCheckCircle } from "react-icons/fi";
import { Link } from "wouter";
import logo from "@orafi/ui/assets/OraFi.png";

const PaymentSuccess = ({ txId, returnUrl }: { txId: string, returnUrl: string }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-xl bg-white text-center p-8">
        <div className="flex justify-center mb-6">
           <img src={logo} alt="OraFi" className="h-10 w-10 object-contain" />
        </div>

        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <FiCheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-8">
          Your transaction has been processed successfully. A receipt has been sent to your email.
        </p>

        <CardContent className="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-100">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Transaction ID</span>
            <span className="text-sm font-medium text-gray-900 font-mono">{txId.slice(0, 18)}...</span>
          </div>
          <div className="flex justify-between mb-2">
             <span className="text-sm text-gray-500">Status</span>
             <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase">Completed</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date</span>
            <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>

        <div className="space-y-3">
          <Link href={returnUrl}>
             <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900">
                Return to Store
             </Button>
          </Link>
        </div>
      </Card>
      
      <div className="fixed bottom-4 text-center w-full text-xs text-gray-400">
        Provided by OraFi
      </div>
    </div>
  );
};

export default PaymentSuccess;
