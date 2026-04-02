import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { FiTrash2, FiPlus, FiEdit2, FiLink2, FiImage, FiX, FiSearch, FiArrowRight, FiEye } from "react-icons/fi";
import DashboardWrapper from "./DashboardWrapper";
import Modal from "./transactions/Modal";
import CopyButton from "./transactions/CopyButton";
import ErrorState from "./transactions/ErrorState";
import ImageGallery from "./ImageGallery";
import { 
  useGetPaylinks, 
  useCreatePaylink, 
  useEditPaylink, 
  useDeletePaylink, 
  type Paylink 
} from "../hooks/mutations/usePaylinks";
import { tokenStore } from "../store/client"
import { getSupportedCurrencies } from "../hooks/mutations/useSettings";
import { useActiveTabStore } from "../store/activeTab";

const PaymentLink = () => {
  const [, setLocation] = useLocation();
  const { setActiveTab } = useActiveTabStore();
  const WALRUS_GATEWAY =
  "https://aggregator.walrus-testnet.walrus.space/v1/blobs";
  const mode = tokenStore.getState().profile?.businessProfile?.isLive ? "live" : "test"

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPaylink, setSelectedPaylink] = useState<Paylink | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "USD",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  // API hooks
  const { data: paylinks = [], isLoading, error } = useGetPaylinks(mode);
  const { data: supportedCurrencies = [] } = getSupportedCurrencies();
  const { mutate: createPaylink, isPending: isCreating } = useCreatePaylink();
  const { mutate: editPaylink, isPending: isEditing } = useEditPaylink();
  const { mutate: deletePaylink, isPending: isDeleting } = useDeletePaylink();

  // Set active tab
  useEffect(() => {
    setActiveTab("Payment Links");
  }, [setActiveTab]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setImages((prev) => [...prev, ...newFiles]);
      setImagePreview((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setImagePreview((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset form
  const resetForm = () => {
    setFormData({ title: "", description: "", amount: "", currency: "USD" });
    setImages([]);
    setImagePreview([]);
  };

  // Handle create
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
    };

    createPaylink(
      { payload, images },
      {
        onSuccess: () => {
          resetForm();
          setShowCreateModal(false);
          toast.success("Payment link created successfully");
        },
      }
    );
  };

  // Handle edit
  const handleEditClick = (paylink: Paylink) => {
    setSelectedPaylink(paylink);
    setFormData({
      title: paylink.title,
      description: paylink.description,
      amount: paylink.amount.toString(),
      currency: paylink.currency,
    });
    setShowEditModal(true);
  };

  // Handle view details
  const handleViewDetails = (paylink: Paylink) => {
    setSelectedPaylink(paylink);
    setShowDetailsModal(true);
  };

  // Handle update
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPaylink) return;
    if (!formData.title.trim() || !formData.description.trim() || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
    };

    editPaylink(
      {
        paylinkId: selectedPaylink.id,
        payload,
        images: images.length > 0 ? images : undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          setShowEditModal(false);
          setSelectedPaylink(null);
          toast.success("Payment link updated successfully");
        },
      }
    );
  };

  // Handle delete
  const handleDeleteClick = (paylink: Paylink) => {
    setSelectedPaylink(paylink);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedPaylink) {
      deletePaylink(selectedPaylink.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedPaylink(null);
        },
      });
    }
  };

  // Filter paylinks based on search
  const filteredPaylinks = paylinks.filter(
    (link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <DashboardWrapper>
        <ErrorState message="Failed to load payment links" />
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Payment Links: {paylinks.length.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus size={16} />
              Create Payment Link
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Search Bar */}
        {paylinks.length > 0 && (
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Payment Links Grid */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredPaylinks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FiLink2 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-sm font-semibold text-gray-900">No payment links</h3>
            <p className="mt-1 text-xs text-gray-500">
              {searchQuery
                ? "No payment links match your search"
                : "Get started by creating your first payment link"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus size={16} />
                Create First Link
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPaylinks.map((link) => (
              <div
                key={link.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:border-gray-200"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-50">
                  {link.images?.length > 0 ? (
                    <img
                      src={`${WALRUS_GATEWAY}/${link.images[0].blobId}`}
                      alt={link.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <FiImage className="h-6 w-6" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  {/* Mode Badge */}
                  <div className="absolute right-2 top-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                        link.mode === "live"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {link.mode}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{link.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{link.description}</p>

                  {/* Amount */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {link.currency} {link.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleViewDetails(link)}
                      className="flex-1 rounded-md bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 active:bg-blue-200"
                    >
                      <FiEye className="mx-auto h-3.5 w-3.5" />
                    </button>
                    <CopyButton
                      text={`https://paylink.orafi.app/${link.id}`}
                      className="flex-1"
                    />
                    <button
                      onClick={() => handleEditClick(link)}
                      className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-center text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300"
                    >
                      <FiEdit2 className="mx-auto h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(link)}
                      className="rounded-md bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 active:bg-red-200"
                    >
                      <FiTrash2 className="mx-auto h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create Payment Link"
        size="wide"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Premium Subscription"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this payment link is for..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Currency *</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {supportedCurrencies.length > 0 ? (
                  supportedCurrencies.map((curr) => (
                    <option key={curr.id} value={curr.symbol}>
                      {curr.name} - {curr.symbol} ({curr.sign})
                    </option>
                  ))
                ) : (
                  <option value={formData.currency}>{formData.currency}</option>
                )}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Images (Optional)</label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
              >
                <FiImage className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Click to upload images</p>
                  <p className="text-xs text-gray-500">or drag and drop</p>
                </div>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreview.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {imagePreview.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={`${WALRUS_GATEWAY}/${preview}`}
                      alt={`Preview ${idx}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Link"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedPaylink(null);
        }}
        title="Edit Payment Link"
        size="wide"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Premium Subscription"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this payment link is for..."
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Currency *</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {supportedCurrencies.length > 0 ? (
                  supportedCurrencies.map((curr) => (
                    <option key={curr.id} value={curr.symbol}>
                      {curr.name} - {curr.symbol} ({curr.sign})
                    </option>
                  ))
                ) : (
                  <option value={formData.currency}>{formData.currency}</option>
                )}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Update Images (Optional)</label>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="edit-image-upload"
              />
              <label
                htmlFor="edit-image-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
              >
                <FiImage className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Click to upload images</p>
                  <p className="text-xs text-gray-500">or drag and drop</p>
                </div>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreview.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {imagePreview.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${idx}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
                setSelectedPaylink(null);
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditing}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
            >
              {isEditing ? "Updating..." : "Update Link"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPaylink(null);
        }}
        title="Delete Payment Link"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold">"{selectedPaylink?.title}"</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedPaylink(null);
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment Link Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedPaylink(null);
        }}
        title="Payment Link Details"
        size="fullscreen"
      >
        {selectedPaylink && (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Left Column: Image Gallery - 65% width */}
            <div className="w-full lg:w-[65%] flex-shrink-0">
              <ImageGallery images={selectedPaylink.images || []} />
            </div>

            {/* Right Column: Details - 35% width */}
            <div className="w-full lg:w-[35%] space-y-4 overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-base font-semibold text-gray-900">{selectedPaylink.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{selectedPaylink.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Amount</p>
                  <p className="font-semibold text-sm text-gray-900 mt-1">
                    {selectedPaylink.currency} {selectedPaylink.amount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Mode</p>
                  <p className="font-semibold text-sm mt-1">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase inline-flex ${
                        selectedPaylink.mode === "live"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedPaylink.mode}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-2">Payment Link ID</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-gray-900 font-mono font-bold bg-white px-2 py-1.5 rounded border border-gray-100 break-all">
                      {selectedPaylink.id}
                    </code>
                    <CopyButton text={selectedPaylink.id} />
                  </div>
                </div>
              </div>

              {/* Public Link */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-[11px] text-blue-600 uppercase tracking-wider font-semibold mb-2">Public Link</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-blue-900 font-mono bg-white px-2 py-1.5 rounded border border-blue-100 break-all">
                    https://paylink.orafi.app/{selectedPaylink.id}
                  </code>
                  <CopyButton text={`https://paylink.orafi.app/${selectedPaylink.id}`} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setLocation(`/transactions?type=PAYMENT&paymentLinkId=${selectedPaylink.id}`);
                    setShowDetailsModal(false);
                    setSelectedPaylink(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
                >
                  <FiArrowRight size={16} />
                  View Transactions
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPaylink(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardWrapper>
  );
};

export default PaymentLink;