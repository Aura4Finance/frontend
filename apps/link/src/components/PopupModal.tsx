import { useState } from "react";
import { Button, Card } from "@orafi/ui";

interface PopupModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: { fullName: string; email: string }) => void;
}

const PopupModal = ({ open, onClose, isLoading, onSubmit }: PopupModalProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!fullName || !email) return;
    onSubmit({ fullName, email });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <Card className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Continue to Checkout
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your details to proceed with this payment.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full h-11 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-11 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="default"
            className="flex-1 bg-blue-950 text-white hover:bg-blue-900"
            onClick={handleSubmit}
          >
            {isLoading ? "Processing..." : "Proceed to Checkout"}
  
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PopupModal;
