type MarkdownParser = {
  parse: (
    source: string,
    options?: {
      breaks?: boolean;
      gfm?: boolean;
    }
  ) => string;
};

type MarkdownSanitizer = {
  sanitize: (dirty: string) => string;
};

type MarkdownRuntime = typeof globalThis & {
  marked?: MarkdownParser;
  DOMPurify?: MarkdownSanitizer;
};

const markdownRuntime = globalThis as MarkdownRuntime;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderMarkdown = (value: string) => {
  const source = value ?? "";
  const parsed = markdownRuntime.marked?.parse(source, {
    breaks: true,
    gfm: true,
  });
  const parsedHtml = typeof parsed === "string" ? parsed : escapeHtml(source).replace(/\n/g, "<br />");

  if (markdownRuntime.DOMPurify) {
    return markdownRuntime.DOMPurify.sanitize(parsedHtml);
  }

  return parsedHtml;
};