import { Button, Card } from "@orafi/ui";
import { FiXCircle, FiRotateCw, FiAlertTriangle } from "react-icons/fi";
import logo from "@orafi/ui/assets/OraFi.png";

const PaymentFailed = ({ txId, onRetry }: { txId: string, onRetry: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-xl bg-white text-center p-8">
        <div className="flex justify-center mb-6">
           <img src={logo} alt="OraFi" className="h-10 w-10 object-contain" />
        </div>

        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
            <FiXCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-500 mb-6">
          We couldn't process your payment. This might be due to insufficient funds or a network issue.
        </p>

        {txId && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-xs text-gray-500 font-mono mb-8">
                <FiAlertTriangle className="w-3 h-3" />
                Ref: {txId.slice(0, 12)}
            </div>
        )}

        <div className="space-y-3">
          <Button 
            variant="default"
            onClick={onRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FiRotateCw className="mr-2" /> Try Again
          </Button>
          <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50">
             Contact Support
          </Button>
        </div>
      </Card>

      <div className="fixed bottom-4 text-center w-full text-xs text-gray-400">
        Provided by OraFi
      </div>
    </div>
  );
};

export default PaymentFailed;
