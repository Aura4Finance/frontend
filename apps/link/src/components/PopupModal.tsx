import { useState, useEffect } from "react";
import { Button, Card } from "@orafi/ui";
import { useGetSupportedNetworkQuery } from "../hooks/useGetPayinkInformationQuery";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiChevronDown, FiGlobe, FiMail, FiUser } from "react-icons/fi";

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

  const inputBaseClass =
    "w-full h-10 rounded border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <Card className="w-full max-w-md bg-white rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Continue to Checkout
        </h2>

        <div className="flex flex-col gap-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`${inputBaseClass} pl-9`}
                  placeholder="First"
                />
              </div>
              <div className="relative flex-1">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`${inputBaseClass} pl-9`}
                  placeholder="Last"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBaseClass} pl-9`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Network Dropdown */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Network
            </label>

            <button
              type="button"
              disabled={networksLoading}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-10 rounded border border-gray-200 bg-white px-3 text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FiGlobe className="h-4 w-4 shrink-0 text-gray-400" />
                {selectedNetwork ? (
                  <>
                  <img
                    src={selectedNetwork.logoUrl}
                    alt={selectedNetwork.symbol}
                    className="w-4 h-4 rounded-full shrink-0"
                  />
                    <span className="text-sm text-gray-900 truncate">{selectedNetwork.symbol}</span>
                  </>
                ) : (
                  <span className="text-gray-500">Select network</span>
                )}
              </div>

              <FiChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 z-10 mt-1 w-full rounded border border-gray-200 bg-white shadow-md">
                {networks?.map((n) => (
                  <button
                    key={n.symbol}
                    type="button"
                    onClick={() => {
                      setNetwork(n.symbol);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                  >
                    <img
                      src={n.logoUrl}
                      alt={n.symbol}
                      className="w-4 h-4 rounded-full shrink-0"
                    />
                    {n.symbol}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="ghost" 
            className="flex-1 text-sm" 
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="default"
            className="flex-1 bg-blue-950 hover:bg-blue-900 text-white text-sm"
            onClick={handleSubmit}
            disabled={isLoading || networksLoading}
          >
            {isLoading && (
              <img src={logo} alt="OraFi" className="mr-2 h-5 w-5 object-contain" />
            )}
            {isLoading ? "Processing..." : "Proceed"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PopupModal;