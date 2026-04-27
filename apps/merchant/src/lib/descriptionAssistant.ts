export type MarkdownDraftMode = "Compact" | "Balanced" | "Detailed" | "Persuasive";

export type MarkdownDraftTone = "Professional" | "Friendly" | "Warm" | "Bold" | "Minimal";

export interface MarkdownDraftInput {
  mode: MarkdownDraftMode;
  topic: string;
  audience: string;
  tone: MarkdownDraftTone;
  highlights: string;
  callToAction: string;
  roughNotes: string;
}