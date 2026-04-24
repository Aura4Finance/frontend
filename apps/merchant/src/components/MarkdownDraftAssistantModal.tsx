import { useEffect, useState } from "react";
import { LuSparkles } from "react-icons/lu";
import { toast } from "sonner";
import Modal from "./transactions/Modal";
import { generateMarkdownDescription, type MarkdownDraftInput } from "../lib/descriptionAssistant";

interface MarkdownDraftAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: string;
  onApply: (markdown: string) => void;
}

const toneOptions = ["Professional", "Friendly", "Warm", "Bold", "Minimal"] as const;

const createInitialForm = (currentValue: string): MarkdownDraftInput => ({
  topic: "",
  audience: "",
  tone: "Professional",
  highlights: "",
  callToAction: "",
  roughNotes: currentValue.trim(),
});

const MarkdownDraftAssistantModal = ({ isOpen, onClose, currentValue, onApply }: MarkdownDraftAssistantModalProps) => {
  const [form, setForm] = useState<MarkdownDraftInput>(createInitialForm(currentValue));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(createInitialForm(currentValue));
    setError(null);
    setIsGenerating(false);
  }, [currentValue, isOpen]);

  const handleGenerate = async () => {
    if (!form.topic.trim() && !form.roughNotes.trim()) {
      setError("Start with a short topic or a rough note so the assistant has something to work with.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateMarkdownDescription(form);
      onApply(result.content);
      onClose();

      if (result.source === "local-ai") {
        toast.success("Description drafted with the free local AI model.");
      } else {
        toast.info("Local AI was unavailable, so a structured markdown draft was inserted instead.");
      }
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Unable to draft the description right now.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Draft Description with AI"
      description="Answer a few questions and the assistant will write a well-structured markdown description."
      icon={<LuSparkles className="h-5 w-5 text-blue-600" />}
      size="xl"
      variant="info"
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          The assistant can turn rough notes into a polished markdown description, or create one from scratch.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2 block">
            <span className="block text-xs font-semibold text-gray-700">What is this payment link for? *</span>
            <input
              type="text"
              value={form.topic}
              onChange={(event) => setForm({ ...form, topic: event.target.value })}
              placeholder="e.g. Premium subscription, event ticket, or custom service"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label>
            <span className="block text-xs font-semibold text-gray-700">Who should read it?</span>
            <input
              type="text"
              value={form.audience}
              onChange={(event) => setForm({ ...form, audience: event.target.value })}
              placeholder="e.g. new customers, returning clients"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label>
            <span className="block text-xs font-semibold text-gray-700">Tone</span>
            <select
              value={form.tone}
              onChange={(event) => setForm({ ...form, tone: event.target.value as MarkdownDraftInput["tone"] })}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {toneOptions.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2 block">
            <span className="block text-xs font-semibold text-gray-700">What details should it include?</span>
            <textarea
              value={form.highlights}
              onChange={(event) => setForm({ ...form, highlights: event.target.value })}
              placeholder="Add key benefits, inclusions, deadlines, or any important specifics"
              rows={4}
              className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="md:col-span-2 block">
            <span className="block text-xs font-semibold text-gray-700">Call to action or closing line</span>
            <input
              type="text"
              value={form.callToAction}
              onChange={(event) => setForm({ ...form, callToAction: event.target.value })}
              placeholder="e.g. Proceed to checkout to complete your payment"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="md:col-span-2 block">
            <span className="block text-xs font-semibold text-gray-700">Optional rough notes</span>
            <textarea
              value={form.roughNotes}
              onChange={(event) => setForm({ ...form, roughNotes: event.target.value })}
              placeholder="Paste anything messy here and the assistant will turn it into clean markdown"
              rows={5}
              className="mt-1 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate markdown"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MarkdownDraftAssistantModal;