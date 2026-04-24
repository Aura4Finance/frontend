export type MarkdownDraftTone = "Professional" | "Friendly" | "Warm" | "Bold" | "Minimal";

export interface MarkdownDraftInput {
  topic: string;
  audience: string;
  tone: MarkdownDraftTone;
  highlights: string;
  callToAction: string;
  roughNotes: string;
}

export interface MarkdownDraftResult {
  content: string;
  source: "local-ai" | "template";
}

const defaultOllamaBaseUrl = "http://localhost:11434";
const defaultModel = "qwen2.5:3b-instruct";

const normalizeWhitespace = (value: string) => value.replace(/\r\n/g, "\n").trim();

const stripMarkdownFences = (value: string) => {
  const trimmed = value.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```(?:markdown|md)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  return trimmed;
};

const splitHighlights = (value: string) =>
  value
    .split(/\n|,/)
    .map((part) => part.trim())
    .filter(Boolean);

const buildFallbackMarkdown = (input: MarkdownDraftInput) => {
  const topic = input.topic.trim() || "Payment details";
  const notes = normalizeWhitespace(input.roughNotes) || `This payment link is designed to make checkout simple and clear.`;
  const audience = input.audience.trim();
  const callToAction = input.callToAction.trim() || "Proceed to checkout to complete your payment.";
  const highlights = splitHighlights(input.highlights);
  const blocks: string[] = [`## ${topic}`, "", notes];

  if (audience) {
    blocks.push("", "### Who it is for", "", audience);
  }

  if (highlights.length) {
    blocks.push("", "### What it covers", "", ...highlights.map((item) => `- ${item}`));
  }

  blocks.push("", "### Next step", "", callToAction);

  return blocks.join("\n").trim();
};

const buildPrompt = (input: MarkdownDraftInput) => {
  const topic = input.topic.trim() || "the payment link";
  const audience = input.audience.trim() || "the intended customer";
  const highlights = input.highlights.trim() || "key benefits, inclusions, or details";
  const callToAction = input.callToAction.trim() || "Proceed to checkout to complete the payment.";
  const roughNotes = normalizeWhitespace(input.roughNotes);

  return [
    "You write concise, polished markdown descriptions for payment links.",
    "Return only markdown. Do not use code fences, JSON, bullet points about the task, or any extra commentary.",
    "The output should be easy to read in a payment form preview.",
    "Use one short heading, a short opening paragraph, a compact list of highlights, and a closing call to action.",
    `Tone: ${input.tone}.`,
    `Topic: ${topic}.`,
    `Audience: ${audience}.`,
    `Highlights to include: ${highlights}.`,
    `Call to action: ${callToAction}.`,
    roughNotes ? `Rough notes: ${roughNotes}.` : "Rough notes: none provided.",
  ].join("\n");
};

const getOllamaBaseUrl = () => {
  const configuredBaseUrl = (import.meta.env.VITE_OLLAMA_BASE_URL as string | undefined)?.trim();

  return configuredBaseUrl || defaultOllamaBaseUrl;
};

const getOllamaModel = () => {
  const configuredModel = (import.meta.env.VITE_OLLAMA_MODEL as string | undefined)?.trim();

  return configuredModel || defaultModel;
};

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};

export const generateMarkdownDescription = async (input: MarkdownDraftInput): Promise<MarkdownDraftResult> => {
  const baseUrl = getOllamaBaseUrl().replace(/\/+$/, "");
  const model = getOllamaModel();

  try {
    const response = await fetchWithTimeout(
      `${baseUrl}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          stream: false,
          messages: [
            {
              role: "system",
              content:
                "You are a payment-link copywriter. Write structured markdown that sounds clear, trustworthy, and concise.",
            },
            {
              role: "user",
              content: buildPrompt(input),
            },
          ],
          options: {
            temperature: 0.6,
            top_p: 0.9,
          },
        }),
      },
      20000
    );

    if (!response.ok) {
      throw new Error(`Local AI request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };

    const generated = stripMarkdownFences(data.message?.content || data.response || "");

    if (!generated) {
      throw new Error("Local AI returned an empty response.");
    }

    return {
      content: generated,
      source: "local-ai",
    };
  } catch {
    return {
      content: buildFallbackMarkdown(input),
      source: "template",
    };
  }
};