import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FiArrowRight } from "react-icons/fi";
import { FaShieldHalved, FaCopy, FaCheck } from "react-icons/fa6";
import { Input } from "@orafi/ui";
import { useCompleteOnboarding } from "../hooks/mutations/useOnboarding";
import { setupTwoFactorAuthentication, verifyTwoFactorAuthentication } from "../hooks/mutations/useSettings";
import { tokenStore } from "../store/client";
import { getUserProfile } from "../hooks/mutations/useSettings";
import { BUSINESS_SECTORS, COUNTRIES } from "../constants/onboardingOptions";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

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

  const isTestMode = profile?.businessProfile?.isLive === false;

  useEffect(() => {
    if (profile?.businessProfile?.onboarded) {
      setLocation("/");
    }
  }, [profile?.businessProfile?.onboarded, setLocation]);

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
        websiteLink: websiteLink.trim(),
      },
      {
        onSuccess: async () => {
          // Refetch profile to update the store
          await refetchProfile();
          
          // Give a small delay to ensure store is updated
          setTimeout(() => {
            // Get the fresh profile from Zustand store
            const freshProfile = tokenStore.getState().profile;
            const twoFAEnabled = freshProfile?.twoFactorEnabled;
            
            console.log("2FA Enabled:", twoFAEnabled, "Profile:", freshProfile);
            
            if (!twoFAEnabled) {
              // Go to 2FA setup step
              setCurrentStep("twofa");
              
              // Auto-trigger 2FA setup
              setupTwoFAMutation.mutate(undefined, {
                onSuccess: (data) => {
                  setTwoFAData(data);
                }
              });
            } else {
              // 2FA already enabled, go to dashboard
              setLocation("/dashboard");
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


  if (currentStep === "business") {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-900">
                OraFi Merchant
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
                Complete your onboarding
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Add your business details to finish setup and continue to your dashboard.
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
                <select
                  value={businessSector}
                  onChange={(event) => setBusinessSector(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none ring-blue-900/20 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select business sector</option>
                  {BUSINESS_SECTORS.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-w-xl">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none ring-blue-900/20 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((countryOption) => (
                    <option key={countryOption} value={countryOption}>
                      {countryOption}
                    </option>
                  ))}
                </select>
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
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 sm:p-8">
          <div className="text-center pb-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-950/10">
              <FaShieldHalved className="h-7 w-7 text-blue-950" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Set Up Two-Factor Authentication
            </h1>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Scan the QR code below with an authenticator app (e.g. Google Authenticator, Authy) to enable 2FA on your account.
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
