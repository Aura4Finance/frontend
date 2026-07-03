import DashboardWrapper from "@/components/DashboardWrapper";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useActiveTabStore } from "@/store/activeTab";
import { toast } from "sonner";
import {
  useRegisterWehbook,
  useGetWebhookDetails,
  useGetWebhookEventTypes,
  useSubcribeToWebhookEvent,
  useRetrieveWebhookDeliveries,
  type FilterOptions
} from "@/hooks/mutations/useWehbooks";
import Modal from "@/components/utils/Modal";
import CopyButton from "@/components/utils/CopyButton";
import WebhookFilters from "@/components/webhooks/WebhookFilters";
import {
  FiCopy,
  FiCheck,
  FiAlertTriangle,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import type {
  WebhookDelivery,
  WebhookDeliveryQueryParams,
  EventType,
  Event
} from "@/hooks/mutations/useWehbooks";
import { buildWebhookParams, useWebhookFilters } from "@/store/webhookFilters";
import { isBrowser, updateQueryParams } from "@/lib/queryState";
import { Helmet } from "react-helmet-async";

const WEBHOOK_QUERY_KEYS = ["status", "transactionId", "event", "startDate", "endDate", "limit", "cursor", "page"];

function SyntaxHighlightedJSON({ data }: { data: unknown }) {
  const json = JSON.stringify(data, null, 2);

  const highlighted = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-blue-600"; // numbers
      if (/^"/.test(match)) {
        cls = /:$/.test(match)
          ? "text-purple-700 font-medium" // keys
          : "text-green-700"; // string values
      } else if (/true|false/.test(match)) {
        cls = "text-orange-600";
      } else if (/null/.test(match)) {
        cls = "text-gray-500";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );

  return (
    <pre
      className="text-xs whitespace-pre-wrap break-words font-mono leading-relaxed"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

const Webhook = () => {
  const { setActiveTab } = useActiveTabStore();

  // State
  const [activeModal, setActiveModal] = useState<"register" | "secret" | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [secretShown, setSecretShown] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [currentSecret, setCurrentSecret] = useState("");
  const [showDeliveries, setShowDeliveries] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [appliedParams, setAppliedParams] = useState<WebhookDeliveryQueryParams | undefined>(undefined);

  const { data: webhookEvents, isLoading: webhookEventLoading } = useGetWebhookEventTypes();
  const webhookOptions = useMemo<FilterOptions<Event>>(
    () => {
      if (!Array.isArray(webhookEvents)) return [] as FilterOptions<Event>;
      return (webhookEvents as EventType[]).map((event: EventType) => ({
        label: event.name,
        value: event.type,
      }));
    },
    [webhookEvents]
  )
  // Filter store
  const filters = useWebhookFilters();
  const setFromQueryParams = useWebhookFilters((state) => state.setFromQueryParams);
  const getQueryParams = useWebhookFilters((state) => state.getQueryParams);

  // API hooks
  const registerWebhookMutation = useRegisterWehbook();
  const { data: webhookDetails, isLoading: detailsLoading, refetch: refetchDetails } = useGetWebhookDetails();
  const { data: eventTypes } = useGetWebhookEventTypes();
  const { mutate: subscribeToEvent, isPending: isSubscribing } = useSubcribeToWebhookEvent();
  const { data: deliveries, isLoading: deliveriesLoading, refetch: refetchDeliveries } = useRetrieveWebhookDeliveries(appliedParams);

  useEffect(() => {
    setActiveTab("Webhook");
  }, [setActiveTab]);

  useEffect(() => {
    if (!isBrowser) return;
    const params = new URLSearchParams(window.location.search);
    setFromQueryParams(params);
    setAppliedParams(buildWebhookParams(useWebhookFilters.getState()));
  }, [setFromQueryParams]);

  useEffect(() => {
    if (!isBrowser) return;
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFromQueryParams(params);
      setAppliedParams(buildWebhookParams(useWebhookFilters.getState()));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setFromQueryParams]);

  const handleRegisterWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }

    registerWebhookMutation.mutate(
      { url: webhookUrl },
      {
        onSuccess: (data) => {
          setCurrentSecret(data.secret);
          setWebhookUrl("");
          setActiveModal("secret");
          refetchDetails();
        },
      }
    );
  };

  const handleSubscribeEvent = (event: string) => {
    subscribeToEvent(
      { event: event as any },
      {
        onSuccess: () => {
          toast.success(`Subscribed to ${event}`);
          refetchDetails();
        },
      }
    );
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(currentSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = currentSecret;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-50 text-green-700 border-green-200";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleApplyFilters = useCallback(() => {
    const params = buildWebhookParams(filters);
    setAppliedParams(params);
    updateQueryParams(getQueryParams(), { managedKeys: WEBHOOK_QUERY_KEYS, replace: false });
  }, [filters, getQueryParams]);

  const handleDeliveryClick = useCallback((delivery: WebhookDelivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryModal(true);
  }, []);

  const subscribedEvents = webhookDetails?.events || [];
  const availableEvents = eventTypes || [];

  return (
    <DashboardWrapper>
      <Helmet>
        <title>Webhooks | OraFi</title>
        <meta name="description" content="Manage your webhook configurations and view delivery logs." />
      </Helmet>
      <div className="p-4 space-y-6">
        {/* Webhook Information Card */}
        {detailsLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : webhookDetails ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 space-y-4">
              {/* URL */}
              <div>
                <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                <div className="mt-2 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <input
                    type="text"
                    value={webhookDetails.url}
                    readOnly
                    className="flex-1 bg-transparent text-gray-700 outline-none text-sm"
                  />
                  <CopyButton text={webhookDetails.url} />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(webhookDetails.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(webhookDetails.updatedAt)}</p>
                </div>
              </div>

              {/* Event Subscriptions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Event Subscriptions</label>
                  <span className="text-xs text-gray-600">
                    {subscribedEvents.length}/{availableEvents.length} subscribed
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Select events you want to receive webhooks for. Your webhook will be triggered whenever these events occur.
                </p>
                <div className="space-y-2">
                  {availableEvents.length > 0 ? (
                    availableEvents.map((event) => {
                      const isSubscribed = subscribedEvents.includes(event.type);
                      return (
                        <button
                          key={event.type}
                          onClick={() => handleSubscribeEvent(event.type)}
                          disabled={isSubscribing || isSubscribed}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${isSubscribed
                            ? "bg-blue-50 border-blue-300 cursor-default"
                            : "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                            } disabled:opacity-100`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">{event.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{event.type}</p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              {isSubscribed ? (
                                <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                                  <span>✓</span>
                                  <span>Subscribed</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium hover:bg-blue-100">
                                  + Add
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No events available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiAlertTriangle className="text-yellow-600" size={20} />
              <h3 className="font-medium text-gray-900">No Webhook Registered</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Register a webhook URL to start receiving event notifications for your transactions.
            </p>
            <button
              onClick={() => setActiveModal("register")}
              className="px-4 py-2 bg-blue-950 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register Webhook
            </button>
          </div>
        )}

        {/* Register Button (if webhook exists, show text instead) */}
        {webhookDetails && (
          <div className="flex justify-end">
            <button
              onClick={() => setActiveModal("register")}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Register New Webhook
            </button>
          </div>
        )}

        {/* Webhook Deliveries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Webhook Deliveries</h3>
            <button
              onClick={() => {
                setShowDeliveries(!showDeliveries);
                if (!showDeliveries) refetchDeliveries();
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showDeliveries ? "Hide" : "Show"} Logs
            </button>
          </div>

          {showDeliveries && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <WebhookFilters eventOptions={webhookOptions} isLoading={webhookEventLoading} onApply={handleApplyFilters} />
              </div>
              {deliveriesLoading ? (
                <div className="p-8">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : deliveries && deliveries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Event</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Attempts</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Response</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Sent At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {deliveries.map((delivery) => (
                        <tr
                          key={delivery.id}
                          onClick={() => handleDeliveryClick(delivery)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-gray-900 font-medium">{delivery.event}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(
                                delivery.status
                              )}`}
                            >
                              {delivery.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{delivery.attemptCount}</td>
                          <td className="px-4 py-3 text-gray-600">{delivery.responseStatus || "—"}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(delivery.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No webhook deliveries yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <FiAlertTriangle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-medium text-blue-900 text-sm mb-1">How to Verify Webhooks</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Save your webhook secret immediately when registering a webhook</li>
                <li>Use the secret to verify the webhook signature in the request headers</li>
                <li>Calculate HMAC-SHA256 hash using your secret and request payload</li>
                <li>Compare the computed hash with the signature in the X-Webhook-Signature header</li>
                <li>Reject any requests with invalid signatures</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Register Webhook Modal */}
      <Modal
        isOpen={activeModal === "register"}
        onClose={() => setActiveModal(null)}
        title="Register Webhook"
      >
        <form onSubmit={handleRegisterWebhook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Must be a valid HTTPS URL
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={registerWebhookMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-950 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {registerWebhookMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Registering...
                </span>
              ) : "Register"}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Secret Modal */}
      <Modal
        isOpen={activeModal === "secret"}
        onClose={() => {
          setActiveModal(null);
          setSecretShown(false);
          setCurrentSecret("");
        }}
        title="Save Your Webhook Secret"
      >
        <div className="space-y-4">
          {/* Secret Display */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Your Webhook Secret</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg p-3">
              <input
                type={secretShown ? "text" : "password"}
                value={currentSecret}
                readOnly
                className="flex-1 bg-transparent text-gray-900 outline-none font-mono text-sm"
              />
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setSecretShown(!secretShown)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded transition-colors"
                  type="button"
                  title={secretShown ? "Hide secret" : "Show secret"}
                >
                  {secretShown ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
                <button
                  onClick={handleCopySecret}
                  className={`p-2 rounded transition-colors ${secretCopied
                    ? "bg-gray-200 text-gray-700"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                  type="button"
                  title="Copy to clipboard"
                >
                  {secretCopied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                </button>
              </div>
            </div>
            {secretCopied && (
              <p className="text-xs text-gray-600 mt-2">
                Copied to clipboard
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">Save this secret in a secure location. It will never be shown again.</p>
          </div>

          <button
            onClick={() => {
              setActiveModal(null);
              setSecretShown(false);
              setCurrentSecret("");
            }}
            className="w-full px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 text-sm"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Webhook Delivery Detail Modal */}
      <Modal
        isOpen={showDeliveryModal && !!selectedDelivery}
        onClose={() => {
          setShowDeliveryModal(false);
          setSelectedDelivery(null);
        }}
        title="Webhook Delivery Details"
      >
        {selectedDelivery && (
          <div className="space-y-4">
            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Event</label>
                <p className="text-sm font-semibold text-gray-900">{selectedDelivery.event}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <span
                  className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedDelivery.status)}`}
                >
                  {selectedDelivery.status}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Attempts</label>
                <p className="text-sm font-semibold text-gray-900">{selectedDelivery.attemptCount}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Response Code</label>
                <p className="text-sm font-semibold text-gray-900">{selectedDelivery.responseStatus || "—"}</p>
              </div>
            </div>

            {/* IDs Section */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">{selectedDelivery.subscriptionId ? "Subscription" : "Transaction"} ID</label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg p-2">
                <code className="flex-1 text-xs text-gray-900 font-mono break-all">{selectedDelivery.subscriptionId || selectedDelivery.transactionId}</code>
                <CopyButton text={String(selectedDelivery.subscriptionId || selectedDelivery.transactionId)} />
              </div>
            </div>

            {/* Timestamps Section */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Created At</label>
                <p className="text-sm text-gray-900">{formatDate(selectedDelivery.createdAt)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Attempt</label>
                <p className="text-sm text-gray-900">{formatDate(selectedDelivery.lastAttemptAt)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Next Retry</label>
                <p className="text-sm text-gray-900">{formatDate(selectedDelivery.nextRetryAt)}</p>
              </div>
            </div>

            {/* Full JSON Payload */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Payload</label>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                <SyntaxHighlightedJSON data={selectedDelivery.payload} />
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowDeliveryModal(false);
                setSelectedDelivery(null);
              }}
              className="w-full px-4 py-2 bg-blue-950 text-white font-medium rounded-lg hover:bg-gray-800 text-sm"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Webhook;
