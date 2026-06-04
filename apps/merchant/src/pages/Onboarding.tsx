import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FiArrowRight } from "react-icons/fi";
import { FaShieldHalved, FaCopy, FaCheck, FaLock } from "react-icons/fa6";
import { Input, Select } from "@orafi/ui";
import logo from "@orafi/ui/assets/OraFi.png";
import { useCompleteOnboarding } from "@/hooks/mutations/useOnboarding";
import { setupTwoFactorAuthentication, verifyTwoFactorAuthentication } from "../hooks/mutations/useSettings";
import { tokenStore } from "@/store/client";
import { getUserProfile } from "@/hooks/mutations/useSettings";
import { BUSINESS_SECTORS, COUNTRIES } from "@/constants/onboardingOptions";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import Modal from "@/components/utils/Modal";
import { Helmet } from "react-helmet-async";

const businessSectorOptions = BUSINESS_SECTORS.map((sector) => ({
  label: sector,
  value: sector,
}));

const countryOptions = COUNTRIES.map((country) => ({
  label: country,
  value: country,
}));

const OnboardingBrand = () => (
  <div className="mb-8 flex flex-col items-center gap-3 text-center">
    <img src={logo} alt="OraFi Logo" className="h-16 w-16 rounded-2xl object-contain shadow-md" />
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-900">
        OraFi Merchant
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Complete onboarding to activate your merchant account.
      </p>
    </div>
  </div>
);

const Onboarding = () => {
  const [, setLocation] = useLocation();
  const { profile } = tokenStore();
  const completeOnboardingMutation = useCompleteOnboarding();
  const setupTwoFAMutation = setupTwoFactorAuthentication();
  const verifyTwoFAMutation = verifyTwoFactorAuthentication();
  const { refetch: refetchProfile } = getUserProfile();

  // Step 1 - Business Details
  const [businessName, setBusinessName] = useState("");
  const [businessSector, setBusinessSector] = useState("");
  const [country, setCountry] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  
  // Step 2 - 2FA Setup
  const [currentStep, setCurrentStep] = useState<"business" | "twofa">("business");
  const [twoFAData, setTwoFAData] = useState<{ otpauth_url: string; manualCode: string } | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const isTestMode = profile?.businessProfile?.isLive === false;
  const triggerTwoFA = () =>  {
      setupTwoFAMutation.mutate(undefined, {
          onSuccess: (data) => {
            setTwoFAData(data);
          }
        });
  }

  useEffect(() => {
    if (profile?.businessProfile?.onboarded && profile?.twoFactorEnabled) {
      setLocation("/");
    }
    if(!(profile?.twoFactorEnabled) && profile?.businessProfile?.onboarded) {
      triggerTwoFA();
      setCurrentStep("twofa")
    }
  }, [profile?.businessProfile?.onboarded, profile?.twoFactorEnabled, setLocation]);

  const handleBusinessSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!businessName.trim() || !businessSector.trim() || !country.trim()) {
      return;
    }

    completeOnboardingMutation.mutate(
      {
        businessName: businessName.trim(),
        businessSector: businessSector.trim(),
        country: country.trim(),
        websiteLink: websiteLink.trim()
      },
      {
        onSuccess: async () => {
          toast.success("Onboarding completed successfully! Your business profile has been updated.");
          await refetchProfile();
          
          // Give a small delay to ensure store is updated
          setTimeout(() => {
            // Get the fresh profile from Zustand store
            const freshProfile = tokenStore.getState().profile;
            const twoFAEnabled = freshProfile?.twoFactorEnabled;
            
            if (!twoFAEnabled) {
              // Show the 2FA modal instead of automatically proceeding
              setShow2FAModal(true);
            } else {
              setLocation("/");
            }
          }, 100);
        },
      }
    );
  };

  const handleVerifyToken = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!verificationToken.trim()) {
      toast.error("Please enter the verification token");
      return;
    }

    verifyTwoFAMutation.mutate(
      { token: verificationToken.trim() },
      {
        onSuccess: async () => {
          // Refetch profile to confirm 2FA is enabled
          await refetchProfile();
          setLocation("/");
        }
      }
    );
  };

  const handleCopyCode = () => {
    if (twoFAData?.manualCode) {
      navigator.clipboard.writeText(twoFAData.manualCode);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handle2FAYes = () => {
    setShow2FAModal(false);
    setCurrentStep("twofa");
    triggerTwoFA();
  };

  const handle2FANo = () => {
    setShow2FAModal(false);
    setLocation("/");
  };

  // Step tracking
  const isStep1Complete = profile?.businessProfile?.onboarded || false;
  const isStep2Complete = profile?.twoFactorEnabled || false;
  const continueWithTwoFAModal = (
    <Modal
      isOpen={show2FAModal}
      onClose={handle2FANo}
      title="Continue with 2FA?"
      description="Choose whether to continue the normal 2FA setup now or return to the dashboard."
      size="default"
      variant="info"
      icon={
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-950/10">
          <FaShieldHalved className="h-5 w-5 text-blue-950" />
        </div>
      }
    >
      <div className="space-y-5">
        <p className="text-sm leading-6 text-gray-600">
          Two-factor authentication secures your account and unlocks sensitive actions like payouts,
          refunds, and API key creation.
        </p>

        <div className="rounded-lg border border-blue-950/10 bg-blue-950/5 p-4">
          <p className="text-xs font-semibold text-blue-950 mb-2">Why continue with 2FA:</p>
          <ul className="space-y-1 text-xs text-gray-700">
            <li>• Protects your account from unauthorized access</li>
            <li>• Required for high-risk operations</li>
            <li>• Takes less than 2 minutes to complete</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handle2FANo}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            No, return to dashboard
          </button>
          <button
            type="button"
            onClick={handle2FAYes}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-900"
          >
            Yes, continue
            <FiArrowRight size={15} />
          </button>
        </div>
      </div>
    </Modal>
  );


  if (currentStep === "business") {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <OnboardingBrand />
          {continueWithTwoFAModal}

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                  isStep1Complete 
                    ? "border-green-500 bg-green-50" 
                    : "border-blue-900 bg-blue-50"
                }`}>
                  {isStep1Complete ? (
                    <FaCheck className="h-6 w-6 text-green-500" />
                  ) : (
                    <span className="text-lg font-semibold text-blue-900">1</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                  Filing Information
                </p>
              </div>

              {/* Connector Line */}
              <div className={`mx-4 mb-6 flex-1 h-1 rounded transition-all ${
                isStep1Complete ? "bg-green-500" : "bg-gray-300"
              }`}></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                  isStep2Complete 
                    ? "border-green-500 bg-green-50" 
                    : "border-gray-300 bg-gray-50"
                }`}>
                  {isStep2Complete ? (
                    <FaCheck className="h-6 w-6 text-green-500" />
                  ) : (
                    <span className="text-lg font-semibold text-gray-400">2</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                  2FA Setup
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-900">
                OraFi Merchant
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
                Step 1: Filing Information
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Add your business details to get started. You'll then set up two-factor authentication (2FA) for account security.
              </p>
            </div>

            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              <div className="max-w-xl">
                <label className="text-sm font-medium text-gray-700">Business name</label>
                <Input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Enter business name"
                  className="mt-1"
                />
              </div>

              <div className="max-w-xl">
                <label className="text-sm font-medium text-gray-700">Business sector</label>
                <Select
                  value={businessSector}
                  onChange={(value) => setBusinessSector(value)}
                  placeholder="Select business sector"
                  searchPlaceholder="Search business sectors..."
                  options={businessSectorOptions}
                  className="mt-1"
                />
              </div>

              <div className="max-w-xl">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <Select
                  value={country}
                  onChange={(value) => setCountry(value)}
                  placeholder="Select country"
                  searchPlaceholder="Search countries..."
                  options={countryOptions}
                  className="mt-1"
                />
              </div>

              <div className="max-w-xl">
                <label className="text-sm font-medium text-gray-700">Website (optional)</label>
                <Input
                  value={websiteLink}
                  onChange={(event) => setWebsiteLink(event.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="mt-1"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {isTestMode && (
                  <button
                    type="button"
                    onClick={() => setLocation("/")}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Continue later
                  </button>
                )}
                <button
                  type="submit"
                  disabled={
                    completeOnboardingMutation.isPending ||
                    !businessName.trim() ||
                    !businessSector.trim() ||
                    !country.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-md bg-blue-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {completeOnboardingMutation.isPending ? "Saving..." : "Next"}
                  <FiArrowRight size={15} />
                </button>
              </div>
              {isTestMode && (
                <p className="text-xs text-gray-500">
                  You are in test mode. You can continue now and complete onboarding later from the
                  top notification banner.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <Helmet>
        <title>Complete Onboarding | OraFi</title>
      </Helmet>
      <div className="mx-auto w-full max-w-3xl">
        <OnboardingBrand />
        {continueWithTwoFAModal}

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                isStep1Complete 
                  ? "border-green-500 bg-green-50" 
                  : "border-gray-300 bg-gray-50"
              }`}>
                {isStep1Complete ? (
                  <FaCheck className="h-6 w-6 text-green-500" />
                ) : (
                  <span className="text-lg font-semibold text-gray-400">1</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                Filing Information
              </p>
            </div>

            {/* Connector Line */}
            <div className={`mx-4 mb-6 flex-1 h-1 rounded transition-all ${
              isStep1Complete ? "bg-green-500" : "bg-gray-300"
            }`}></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                isStep2Complete 
                  ? "border-green-500 bg-green-50" 
                  : "border-blue-900 bg-blue-50"
              }`}>
                {isStep2Complete ? (
                  <FaCheck className="h-6 w-6 text-green-500" />
                ) : (
                  <span className="text-lg font-semibold text-blue-900">2</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                2FA Setup
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-900">
              Step 2 of 2
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
              Set Up Two-Factor Authentication
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Complete this step to secure your account and enable high-risk actions like payouts, refunds, and API key creation.
            </p>
          </div>

          {/* High-Risk Actions Warning */}
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <FaLock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">2FA Required for High-Risk Actions</p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Two-factor authentication is required to perform sensitive operations: 
                  <span className="font-semibold"> Payouts</span>,
                  <span className="font-semibold"> Refunds</span>, and 
                  <span className="font-semibold"> API Key Creation</span>. 
                  These are protected actions that require an additional level of authentication.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-950/10">
              <FaShieldHalved className="h-7 w-7 text-blue-950" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mt-2">
              Scan the QR code
            </h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) to scan the QR code below.
            </p>
          </div>

          {setupTwoFAMutation.isPending ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950"></div>
            </div>
          ) : twoFAData ? (
            <div className="space-y-5">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-xl border-2 border-dashed border-blue-950/20 bg-white p-4">
                  <QRCodeSVG
                    value={twoFAData.otpauth_url}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Manual Code */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 text-center uppercase tracking-wide">
                  Or enter this code manually
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-300 px-3 py-2.5">
                  <code className="flex-1 text-center text-sm font-mono font-semibold tracking-widest text-blue-950 select-all">
                    {twoFAData.manualCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="shrink-0 rounded-md p-1.5 text-gray-400 hover:text-blue-950 hover:bg-gray-200 transition-colors"
                    type="button"
                    title="Copy code"
                  >
                    {copied ? (
                      <FaCheck className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <FaCopy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="rounded-lg bg-blue-950/5 border border-blue-950/10 p-3.5 space-y-2">
                <p className="text-xs font-semibold text-blue-950">How it works:</p>
                <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
                  <li>
                    Open your authenticator app and scan the QR code or enter the manual code above.
                  </li>
                  <li>
                    The app will generate a 6-digit code that refreshes every 30 seconds.
                  </li>
                  <li>
                    Enter this code below to complete the setup.
                  </li>
                </ol>
              </div>

              {/* Token Input Form */}
              <form onSubmit={handleVerifyToken} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Verification Code</label>
                  <Input
                    type="text"
                    value={verificationToken}
                    onChange={(event) => setVerificationToken(event.target.value)}
                    placeholder="Enter 6-digit code"
                    className="mt-1 text-center font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyTwoFAMutation.isPending || verificationToken.length !== 6}
                  className="w-full bg-blue-950 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {verifyTwoFAMutation.isPending ? "Verifying..." : "Verify & Complete Setup"}
                </button>
              </form>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-600">Failed to load 2FA setup. Please try again.</p>
              <button
                onClick={() => setupTwoFAMutation.mutate()}
                className="mt-4 text-blue-950 font-medium hover:underline text-sm"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
