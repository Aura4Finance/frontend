import { useEffect, useState } from "react";
import { LuSparkles } from "react-icons/lu";
import { toast } from "sonner";
import Modal from "@/components/utils/Modal";
import {
  type MarkdownDraftInput,
  type MarkdownDraftMode,
  type MarkdownDraftTone,
} from "@/lib/descriptionAssistant";
import { useGeneratePaylinkDescription } from "@/hooks/mutations/usePaylinks";

interface MarkdownDraftAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: string;
  onApply: (markdown: string) => void;
}

const modeOptions = [
  {
    value: "Compact",
    title: "Compact",
    description: "Short and direct",
  },
  {
    value: "Balanced",
    title: "Balanced",
    description: "Clear with a few sections",
  },
  {
    value: "Detailed",
    title: "Detailed",
    description: "More context and structure",
  },
  {
    value: "Persuasive",
    title: "Persuasive",
    description: "Benefit-led and action focused",
  },
] as const satisfies ReadonlyArray<{
  value: MarkdownDraftMode;
  title: string;
  description: string;
}>;

const toneByMode: Record<MarkdownDraftMode, MarkdownDraftTone> = {
  Compact: "Minimal",
  Balanced: "Professional",
  Detailed: "Warm",
  Persuasive: "Bold",
};

const createInitialForm = (currentValue: string): MarkdownDraftInput => ({
  mode: "Balanced",
  topic: "",
  audience: "",
  tone: toneByMode.Balanced,
  highlights: "",
  callToAction: "",
  roughNotes: currentValue.trim(),
});

const MarkdownDraftAssistantModal = ({ isOpen, onClose, currentValue, onApply }: MarkdownDraftAssistantModalProps) => {
  const [form, setForm] = useState<MarkdownDraftInput>(createInitialForm(currentValue));
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generateDescription = useGeneratePaylinkDescription();

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
      setError("Add a topic or a few notes so the assistant has something to work with.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateDescription.mutateAsync(form);

      if (!result?.success || !result.data) {
        throw new Error(result?.message || "Unable to draft the description right now.");
      }

      onApply(result.data);
      onClose();
      toast.success("Description drafted successfully.");
    } catch (generateError) {
      const message =
        (generateError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (generateError instanceof Error ? generateError.message : "Unable to draft the description right now.");
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate link description"
      icon={<LuSparkles className="h-5 w-5 text-blue-600" />}
      size="wide"
      variant="info"
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          {currentValue.trim()
            ? "We will use the current editor content as context, so the draft can refine what is already there."
            : "Pick a mode and share a few details to generate a draft description."}
        </div>

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-700">Mode</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {modeOptions.map((option) => {
              const selected = form.mode === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      mode: option.value,
                      tone: toneByMode[option.value],
                    }))
                  }
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-sm font-semibold ${selected ? "text-blue-900" : "text-gray-900"}`}>
                      {option.title}
                    </span>
                    {selected ? (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-1 text-xs ${selected ? "text-blue-700" : "text-gray-500"}`}>{option.description}</p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-4">
          <label className="block">
            <span className="block text-xs font-semibold text-gray-700">What is this about? *</span>
            <input
              type="text"
              value={form.topic}
              onChange={(event) => setForm({ ...form, topic: event.target.value })}
              placeholder="e.g. Premium subscription, event ticket, or custom service"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-gray-700">
              Who is it for? <span className="font-normal text-gray-500">(optional)</span>
            </span>
            <input
              type="text"
              value={form.audience}
              onChange={(event) => setForm({ ...form, audience: event.target.value })}
              placeholder="e.g. new customers, returning clients"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold text-gray-700">What should it mention?</span>
            <textarea
              value={form.highlights}
              onChange={(event) => setForm({ ...form, highlights: event.target.value })}
              placeholder="Add key benefits, inclusions, deadlines, or any important specifics"
              rows={4}
              className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Include any must-mention details you want highlighted.</p>
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
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MarkdownDraftAssistantModal;
