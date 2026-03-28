import DashboardWrapper from "./DashboardWrapper";
import { useEffect, useState, useCallback } from "react";
import { useActiveTabStore } from "../store/activeTab";
import { toast } from "sonner";
import {
  useRegisterWehbook,
  useGetWebhookDetails,
  useGetWebhookEventTypes,
  useSubcribeToWebhookEvent,
  useRetrieveWebhookDeliveries,
} from "../hooks/mutations/useWehbooks";
import Modal from "./transactions/Modal";
import CopyButton from "./transactions/CopyButton";
import WebhookFilters from "./webhooks/WebhookFilters";
import { FiCopy, FiCheck, FiAlertTriangle, FiEye, FiEyeOff, FiLink2, FiLock, FiFileText } from "react-icons/fi";
import type { WebhookDelivery, WebhookDeliveryQueryParams } from "../hooks/mutations/useWehbooks";
import { buildWebhookParams, useWebhookFilters } from "../store/webhookFilters";

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

  // Filter store
  const filters = useWebhookFilters();

  // API hooks
  const registerWebhookMutation = useRegisterWehbook();
  const { data: webhookDetails, isLoading: detailsLoading, refetch: refetchDetails } = useGetWebhookDetails();
  const { data: eventTypes } = useGetWebhookEventTypes();
  const { mutate: subscribeToEvent, isPending: isSubscribing } = useSubcribeToWebhookEvent();
  const { data: deliveries, isLoading: deliveriesLoading, refetch: refetchDeliveries } = useRetrieveWebhookDeliveries(appliedParams);

  useEffect(() => {
    setActiveTab("Webhook");
  }, [setActiveTab]);

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
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleApplyFilters = useCallback(() => {
    const params = buildWebhookParams(filters);
    setAppliedParams(params);
  }, [filters]);

  const handleDeliveryClick = useCallback((delivery: WebhookDelivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryModal(true);
  }, []);

  const subscribedEvents = webhookDetails?.events || [];
  const availableEvents = eventTypes || [];

  return (
    <DashboardWrapper>
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
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-4">
              <h2 className="text-lg font-semibold text-blue-900">Webhook Configuration</h2>
              <p className="text-sm text-blue-700 mt-1">Manage your webhook endpoint and subscriptions</p>
            </div>
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
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                            isSubscribed
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
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                <WebhookFilters onApply={handleApplyFilters} />
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
        description="Add a new webhook endpoint to receive event notifications"
        icon={<FiLink2 className="h-6 w-6 text-blue-600" />}
        variant="info"
      >
        <form onSubmit={handleRegisterWebhook} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm font-medium placeholder-gray-400"
              required
            />
            <p className="text-xs text-gray-500 mt-2.5 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 bg-blue-500 rounded-full"></span>
              Must be a valid HTTPS URL where we'll send webhook events
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-800 leading-relaxed">
              <span className="font-semibold block mb-1">💡 Tip:</span>
              Make sure your endpoint can handle POST requests and returns a 2xx status code within 30 seconds.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={registerWebhookMutation.isPending}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md hover:shadow-lg"
            >
              {registerWebhookMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Registering...
                </span>
              ) : "Register Webhook"}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95"
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
        description="This secret is required to verify webhook signatures"
        icon={<FiLock className="h-6 w-6 text-amber-600" />}
        variant="warning"
        size="wide"
      >
        <div className="space-y-6">
          {/* Critical Warning */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <FiAlertTriangle className="text-amber-700 h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900 text-sm mb-1">
                ⚠️ Save this secret now - it will never be shown again
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                Store this in a secure location. You'll need it to verify webhook signatures and validate the authenticity of webhook requests.
              </p>
            </div>
          </div>

          {/* Secret Display */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Your Webhook Secret</label>
            <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 backdrop-blur-sm hover:border-gray-300 transition-all">
              <input
                type={secretShown ? "text" : "password"}
                value={currentSecret}
                readOnly
                className="flex-1 bg-transparent text-gray-900 outline-none font-mono text-sm font-bold tracking-wide"
              />
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setSecretShown(!secretShown)}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 active:scale-95"
                  type="button"
                  title={secretShown ? "Hide secret" : "Show secret"}
                >
                  {secretShown ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
                <button
                  onClick={handleCopySecret}
                  className={`p-2.5 rounded-lg transition-all duration-200 active:scale-95 ${
                    secretCopied
                      ? "bg-emerald-100 text-emerald-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                  type="button"
                  title="Copy to clipboard"
                >
                  {secretCopied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                </button>
              </div>
            </div>
            {secretCopied && (
              <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1.5 font-medium">
                <span className="inline-block w-1 h-1 bg-emerald-600 rounded-full"></span>
                Copied to clipboard
              </p>
            )}
          </div>

          {/* Example Code */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FiFileText className="w-4 h-4 text-gray-600" />
              <label className="block text-sm font-semibold text-gray-900">Example: Verify Webhook Signature</label>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-slate-300 font-mono leading-relaxed">{`const crypto = require('crypto');

function verifyWebhook(secret, payload, signature) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
}`}</pre>
            </div>
          </div>

          {/* Steps to implement */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-3">How to use this secret:</h4>
            <ol className="space-y-2 text-xs text-blue-800">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Include the secret in a secure environment variable</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Extract the <code className="bg-white px-1.5 py-0.5 rounded text-blue-900 font-mono text-xs">X-Webhook-Signature</code> header from the request</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Calculate HMAC-SHA256 hash using the secret and raw request body</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <span>Use timing-safe comparison to verify the signature</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                <span>Reject requests with invalid or missing signatures</span>
              </li>
            </ol>
          </div>

          <button
            onClick={() => {
              setActiveModal(null);
              setSecretShown(false);
              setCurrentSecret("");
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
          >
            ✓ I've Saved the Secret
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
        description="View detailed information about this webhook delivery attempt"
        icon={<FiFileText className="h-6 w-6 text-blue-600" />}
        variant="info"
        size="wide"
      >
        {selectedDelivery && (
          <div className="space-y-6">
            {/* Status Overview Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Event</span>
                  <p className="text-lg font-bold text-slate-900">{selectedDelivery.event}</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Status</span>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold w-fit ${getStatusColor(
                      selectedDelivery.status
                    )}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {selectedDelivery.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Attempts</span>
                  <p className="text-lg font-bold text-slate-900">{selectedDelivery.attemptCount}</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Response Code</span>
                  <p className="text-lg font-bold text-slate-900">{selectedDelivery.responseStatus || "—"}</p>
                </div>
              </div>
            </div>

            {/* IDs Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Identifiers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Transaction ID</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-gray-900 font-mono font-bold bg-white px-2 py-1.5 rounded border border-gray-100 break-all">{selectedDelivery.transactionId}</code>
                    <CopyButton text={selectedDelivery.transactionId} />
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Delivery ID</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-gray-900 font-mono font-bold bg-white px-2 py-1.5 rounded border border-gray-100 break-all">{selectedDelivery.id}</code>
                    <CopyButton text={selectedDelivery.id} />
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Timeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Created At</label>
                  <p className="text-sm font-bold text-blue-900">{formatDate(selectedDelivery.createdAt)}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1.5">Last Attempt</label>
                  <p className="text-sm font-bold text-purple-900">{formatDate(selectedDelivery.lastAttemptAt)}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1.5">Next Retry</label>
                  <p className="text-sm font-bold text-orange-900">{formatDate(selectedDelivery.nextRetryAt)}</p>
                </div>
              </div>
            </div>

            {/* Payload Information */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Payload Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">Amount</label>
                  <p className="text-sm font-bold text-emerald-900">
                    {selectedDelivery.payload.data.amount}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Currency</label>
                  <p className="text-sm font-bold text-blue-900">
                    {selectedDelivery.payload.data.currency}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1.5">Status</label>
                  <p className="text-sm font-bold text-purple-900">
                    {selectedDelivery.payload.data.status}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Occurred At</label>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {formatDate(selectedDelivery.payload.data.occuredAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Full JSON Payload */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                Complete Payload (JSON)
              </h3>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-h-80 overflow-y-auto">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {JSON.stringify(selectedDelivery.payload, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Use this payload to debug and test your webhook handler implementation
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowDeliveryModal(false);
                setSelectedDelivery(null);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-900 font-semibold rounded-xl transition-all duration-200 active:scale-95"
            >
              Close Details
            </button>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default Webhook;