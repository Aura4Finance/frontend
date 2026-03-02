import { useState, useEffect } from "react";
import { Button, Card } from "@orafi/ui";
import { useGetSupportedNetworkQuery } from "../queries/useQueries";

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
  const [network, setNetwork] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: networks, isLoading: networksLoading } =
    useGetSupportedNetworkQuery();

  useEffect(() => {
    if (networks && networks.length > 0) {
      setNetwork(networks[0].symbol);
    }
  }, [networks]);

  if (!open) return null;

  const selectedNetwork = networks?.find((n) => n.symbol === network);

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

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 flex gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-1/2 h-11 rounded-md border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-blue-900"
                placeholder="First name"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-1/2 h-11 rounded-md border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-blue-900"
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full h-11 rounded-md border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-blue-900"
              placeholder="john@example.com"
            />
          </div>

          {/* Network Dropdown */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">
              Network
            </label>

            <button
              type="button"
              disabled={networksLoading}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="mt-1 w-full h-11 rounded-md border border-gray-200 px-3 text-sm bg-white flex items-center justify-between focus:ring-2 focus:ring-blue-900"
            >
              {selectedNetwork ? (
                <div className="flex items-center gap-2">
                  <img
                    src={selectedNetwork.logo}
                    alt={selectedNetwork.symbol}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{selectedNetwork.symbol}</span>
                </div>
              ) : (
                "Select network"
              )}

              <span className="text-xs">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md">
                {networks?.map((n) => (
                  <button
                    key={n.symbol}
                    type="button"
                    onClick={() => {
                      setNetwork(n.symbol);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    <img
                      src={n.logo}
                      alt={n.symbol}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    {n.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="default"
            className="flex-1 bg-blue-950 text-white hover:bg-blue-900 flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={isLoading || networksLoading}
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