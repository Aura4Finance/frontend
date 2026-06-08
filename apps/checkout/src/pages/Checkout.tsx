import { useState, useEffect, useMemo } from "react";
import { useRoute, Redirect } from "wouter";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { Button, Card } from "@orafi/ui";
import logo from "@orafi/ui/assets/OraFi.png";
import { FiAlertCircle, FiArrowLeft, FiChevronDown } from "react-icons/fi";
import { RiSecurePaymentLine } from "react-icons/ri";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

import { PaymentMethodSelector } from "../components/PaymentMethodSelector";
import { CheckoutSummary } from "../components/CheckoutSummary";
import { useCheckoutPayment } from "../hooks/useCheckoutPayment";
import { useGetPaymentInformationQuery, useGeneratePaymentIntentMutation } from "../hooks/useGetPaymentInformationQuery";
import { useGetSupportedNetworksAndTokens } from "../hooks/useGetSupportedNetworksAndTokens";

const Checkout = () => {
  const [_match, params] = useRoute("/:txId");
  const [paymentMethod, setPaymentMethod] = useState<"transfer_address" | "deposit_address" | null>(null);
  const [redirect, setRedirect] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [isGeneratingIntent, setIsGeneratingIntent] = useState(false);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [isLoadingTokenAmount, setIsLoadingTokenAmount] = useState(false);
  const [generatedAddresses, setGeneratedAddresses] = useState<{
    depositAddress?: string;
    transferAddress?: string;
  }>({});

  const wallet = useWallet();
  const accounts = useMemo(() => (wallet.connected ? wallet.getAccounts?.() ?? [] : []), [wallet]);

  const paymentQueryResult = useGetPaymentInformationQuery(params?.txId as string);
  const supportedNetworksQuery = useGetSupportedNetworksAndTokens();
  const generateIntentMutation = useGeneratePaymentIntentMutation(params?.txId as string);

  const matchedNetwork = useMemo(() => {
    if (!supportedNetworksQuery.data || !paymentQueryResult.data) return undefined;
    return supportedNetworksQuery.data.find(
      (n) => n.symbol.toLowerCase() === paymentQueryResult.data.network.toLowerCase()
    );
  }, [supportedNetworksQuery.data, paymentQueryResult.data]);

  const selectedTokenObject = useMemo(() => {
    if (!matchedNetwork || !selectedToken) return undefined;
    return matchedNetwork.supportedTokens.find((t) => t.symbol === selectedToken);
  }, [matchedNetwork, selectedToken]);

  const roundedAmountInUSDC = useMemo(() => {
    if (!paymentQueryResult.data) return "0.00";
    return (Math.ceil(paymentQueryResult.data.amountInUSDC * 100) / 100).toFixed(2);
  }, [paymentQueryResult.data]);

  const displayTokenSymbol = selectedTokenObject?.symbol || "USDC";
  const displayTokenLogoUrl = selectedTokenObject?.logoUrl;
  const displayTokenAmount = isLoadingTokenAmount ? "..." : tokenAmount || roundedAmountInUSDC;
  const hasNoRedirect = !redirect || new URL(window.location.href).searchParams.get("redirect") === "false";

  // Use the isolated hook for handling payment processing executions
  const { executePayment, processing, error, setError } = useCheckoutPayment({
    wallet,
    paymentData: paymentQueryResult.data,
    generatedAddresses,
    selectedTokenObject,
    matchedNetwork,
    txId: params?.txId,
    hasNoRedirect,
    redirectUrl: redirect,
  });

  useEffect(() => {
    const fetchTokenAmount = async () => {
      if (!paymentQueryResult.data) return;
      const amountInUSDC = (Math.ceil(paymentQueryResult.data.amountInUSDC * 100) / 100).toFixed(2);

      if (!selectedTokenObject || selectedTokenObject.symbol === "USDC") {
        setTokenAmount(amountInUSDC);
        return;
      }

      setIsLoadingTokenAmount(true);
      try {
        const { getTokenPrice } = await import("@7kprotocol/sdk-ts");
        const coinType =
          paymentQueryResult.data.mode === "test"
            ? selectedTokenObject.testnet.coinType
            : selectedTokenObject.mainnet.coinType;

        const rate = await getTokenPrice(coinType);
        const amountInToken = parseFloat(amountInUSDC) / rate;
        setTokenAmount((Math.ceil(amountInToken * 100) / 100).toFixed(2));
      } catch (err) {
        console.error("Failed to fetch token price", err);
        setTokenAmount(amountInUSDC);
      } finally {
        setIsLoadingTokenAmount(false);
      }
    };

    fetchTokenAmount();
  }, [paymentQueryResult.data, selectedTokenObject]);

  const isTokenDisabled = (tokenSymbol: string): boolean => {
    if (!matchedNetwork) return true;
    return paymentQueryResult.data?.mode === "test" ? !["SUI", "USDC"].includes(tokenSymbol) : false;
  };

  useEffect(() => {
    if (matchedNetwork && matchedNetwork.supportedTokens.length > 0) {
      const enabledToken = matchedNetwork.supportedTokens.find((t) => !isTokenDisabled(t.symbol));
      setSelectedToken(enabledToken?.symbol || matchedNetwork.supportedTokens[0].symbol);
    }
  }, [matchedNetwork]);

  useEffect(() => {
    const redirectUrl = paymentQueryResult.data?.redirectUrl?.trim();
    if (!redirectUrl) return;
    try {
      const url = new URL(redirectUrl);
      url.searchParams.set("oratx", params?.txId as string);
      setRedirect(url.toString());
    } catch { }
  }, [paymentQueryResult.data?.redirectUrl]);

  const handleSelectPaymentMethod = async (method: "transfer_address" | "deposit_address") => {
    const propertyName = method === "transfer_address" ? "transferAddress" : "depositAddress";
    const existingAddress = paymentQueryResult.data?.[propertyName as keyof typeof paymentQueryResult.data] || generatedAddresses[propertyName as keyof typeof generatedAddresses];

    if (existingAddress) {
      setPaymentMethod(method);
      return;
    }

    setIsGeneratingIntent(true);
    setError(null);
    generateIntentMutation.mutate(
      { intent: method, token: selectedToken },
      {
        onSuccess: (address: string) => {
          setGeneratedAddresses((prev) => ({ ...prev, [propertyName]: address }));
          setPaymentMethod(method);
          setIsGeneratingIntent(false);
          toast.success(`${method === "deposit_address" ? "Deposit" : "Transfer"} address generated`);
        },
        onError: () => {
          setIsGeneratingIntent(false);
          toast.error("Failed to generate payment address");
        },
      }
    );
  };

  if (paymentQueryResult.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <img src={logo} alt="OraFi" className="h-20 w-20 object-contain animate-pulse" />
      </div>
    );
  }

  if (!paymentQueryResult.data || paymentQueryResult.isError) return <Redirect to="/" />;
  if (supportedNetworksQuery.isPending) return <div className="p-10 text-center">Loading networks...</div>;

  return (
    <>
      <Helmet>
        <title>OraFi Checkout</title>
        <meta name="description" content="Secure checkout for OraFi payments" />
      </Helmet>

      {processing && (
        <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 mb-6 relative">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Transaction</h2>
          <p className="text-gray-500 max-w-xs mx-auto">Please wait while we confirm your payment on the Sui Network...</p>
          <div className="mt-8 px-4 py-2 bg-blue-50 text-blue-900 text-[10px] font-black uppercase tracking-widest rounded-full">
            OraFi Secure Node
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 flex flex-col items-center lg:flex-row lg:items-center lg:justify-center lg:gap-12 p-4 font-sans">

        {/* Left Side Info Panel */}
        <div className="mb-8 lg:mb-0 lg:flex-shrink-0 lg:w-auto flex flex-col items-center lg:items-start">
          <div className="flex items-center gap-2 mb-6">
            <img src={logo} alt="OraFi" className="h-8 w-8" />
            <span className="text-xl font-bold text-blue-950 tracking-tight">OraFi Checkout</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 mb-8">
            <RiSecurePaymentLine className="text-green-600" /> Secured by OraFi Protocol
          </div>

          <CheckoutSummary
            businessName={paymentQueryResult.data.businessName}
            matchedNetwork={matchedNetwork}
            displayTokenSymbol={displayTokenSymbol}
            displayTokenAmount={displayTokenAmount}
            currency={paymentQueryResult.data.currency}
            amount={paymentQueryResult.data.amount}
            isDesktopOnly
          />
        </div>

        {/* Right Side Checkout Box Form */}
        <Card className="w-full max-w-md bg-white shadow-xl border-t-4 border-t-blue-900 border-x-0 border-b-0 rounded-xl overflow-hidden p-5 lg:shadow-lg">
          {paymentMethod && (
            <div className="mb-4">
              <button
                onClick={() => setPaymentMethod(null)}
                className="flex items-center gap-2 text-xs text-blue-900 hover:text-blue-700 font-semibold uppercase tracking-wider transition-colors"
              >
                <FiArrowLeft size={14} /> Change Payment Method
              </button>
            </div>
          )}

          <CheckoutSummary
            businessName={paymentQueryResult.data.businessName}
            matchedNetwork={matchedNetwork}
            displayTokenSymbol={displayTokenSymbol}
            displayTokenAmount={displayTokenAmount}
            currency={paymentQueryResult.data.currency}
            amount={paymentQueryResult.data.amount}
          />

          <div className="hidden lg:block pb-4 border-b border-gray-100 bg-white mb-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-4">Payment Method</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {matchedNetwork && matchedNetwork.supportedTokens.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Token</label>
                <div className="relative">
                  <button
                    onClick={() => setShowTokenDropdown((v) => !v)}
                    disabled={paymentMethod === "deposit_address" || isGeneratingIntent}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm flex items-center justify-between hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
                  >
                    <div className="flex items-center gap-2">
                      {displayTokenLogoUrl && (
                        <img src={displayTokenLogoUrl} alt={displayTokenSymbol} className="h-4 w-4 object-contain" />
                      )}
                      <span>{displayTokenSymbol}</span>
                    </div>
                    <FiChevronDown size={16} className={`transition-transform ${showTokenDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showTokenDropdown && paymentMethod !== "deposit_address" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-40 max-h-64 overflow-y-auto">
                      {matchedNetwork.supportedTokens.map((token) => (
                        <button
                          key={token.symbol}
                          onClick={() => {
                            setSelectedToken(token.symbol);
                            setShowTokenDropdown(false);
                          }}
                          disabled={isTokenDisabled(token.symbol)}
                          className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${selectedToken === token.symbol ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"
                            } ${isTokenDisabled(token.symbol) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {token.logoUrl && (
                            <img src={token.logoUrl} alt={token.symbol} className="h-4 w-4 object-contain" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold">{token.symbol}</span>
                            <span className="text-xs text-gray-600">{token.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!paymentMethod ? (
              <PaymentMethodSelector onSelectMethod={handleSelectPaymentMethod} isLoading={isGeneratingIntent} />
            ) : paymentMethod === "deposit_address" ? (
              <>
                {!wallet.connected ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600 text-center">Connect your Sui wallet to pay</p>
                    <div className="flex justify-center suiet-custom-wrapper">
                      <ConnectButton label="Connect Wallet" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => setShowModal((v) => !v)}
                      className="w-full bg-blue-50 border border-blue-100 p-3 rounded-md flex items-center gap-3"
                    >
                      <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Wallet Connected</span>
                      <span className="text-xs font-mono text-blue-600 truncate max-w-[120px] ml-auto">
                        {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                      </span>
                      <FiChevronDown className={`w-4 h-4 text-blue-700 transition-transform ${showModal ? "rotate-180" : ""}`} />
                    </button>

                    {showModal && (
                      <div className="absolute right-0 mt-2 w-64 rounded-lg border border-blue-100 bg-white shadow-xl z-50 overflow-hidden">
                        <div className="bg-blue-50 border-b border-blue-100 p-3">
                          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Wallet Connected</p>
                          <p className="text-xs font-mono text-blue-800 truncate mt-1">{wallet.address}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => {
                              wallet.disconnect();
                              setShowModal(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm rounded-md text-red-600 hover:bg-red-50 transition"
                          >
                            Disconnect wallet
                          </button>
                          {accounts.length > 1 && <div className="h-px bg-blue-100 my-1" />}
                          {accounts
                            .filter((acc) => acc.address !== wallet.address)
                            .map((acc) => (
                              <button
                                key={acc.address}
                                onClick={async () => {
                                  await wallet.select(acc.address);
                                  setShowModal(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-blue-50 transition"
                              >
                                <span className="font-mono text-blue-700 truncate block">
                                  {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={executePayment}
                      className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                      disabled={processing}>
                      {processing ? "Processing..." : `Pay ${displayTokenAmount} ${displayTokenSymbol}`}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div>{/* Content placeholder for transfer address info layout if needed */}</div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default Checkout;