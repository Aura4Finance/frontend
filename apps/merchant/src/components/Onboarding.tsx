import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FiArrowRight } from "react-icons/fi";
import { Input } from "@orafi/ui";
import { useCompleteOnboarding } from "../hooks/mutations/useOnboarding";
import { tokenStore } from "../store/client";
import { getUserProfile } from "../hooks/mutations/useSettings";
import { BUSINESS_SECTORS, COUNTRIES } from "../constants/onboardingOptions";

const Onboarding = () => {
  const [, setLocation] = useLocation();
  const { profile } = tokenStore();
  const completeOnboardingMutation = useCompleteOnboarding();
  const { refetch: refetchProfile } = getUserProfile();

  const [businessName, setBusinessName] = useState("");
  const [businessSector, setBusinessSector] = useState("");
  const [country, setCountry] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const isTestMode = profile?.businessProfile?.isLive === false;

  useEffect(() => {
    if (profile?.businessProfile?.onboarded) {
      setLocation("/dashboard");
    }
  }, [profile?.businessProfile?.onboarded, setLocation]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
          await refetchProfile();
          setLocation("/dashboard");
        },
      }
    );
  };

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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onClick={() => setLocation("/dashboard")}
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
                {completeOnboardingMutation.isPending ? "Saving..." : "Complete onboarding"}
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
};

export default Onboarding;
