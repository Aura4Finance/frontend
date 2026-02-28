import { useState } from "react";
import { Button, Card } from "@orafi/ui";

interface PopupModalProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: { fullName: string; email: string; network: string }) => void;
}

const PopupModal = ({ open, onClose, isLoading, onSubmit }: PopupModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [network, setNetwork] = useState("SUI");

  const supportedNetworks = ["SUI"] as const;

  if (!open) return null;

  const handleSubmit = () => {
    if (!firstName || !lastName || !email || !network) return;
    onSubmit({ fullName: `${firstName} ${lastName}`, email, network });
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
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Name
              </label>

              <div className="mt-1 flex gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-1/2 h-11 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="First name"
                />

                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-1/2 h-11 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="Last name"
                />
              </div>
            </div>
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

          <div>
            <label className="text-sm font-medium text-gray-700">
              Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="mt-1 w-full h-11 rounded-md border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              {supportedNetworks.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="default"
            className="flex-1 bg-blue-950 text-white hover:bg-blue-900 flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isLoading ? "Processing..." : "Proceed"}
          </Button>

        </div>
      </Card>
    </div>
  );
};

export default PopupModal;
