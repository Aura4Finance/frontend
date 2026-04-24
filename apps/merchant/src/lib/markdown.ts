const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeUrl = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();

  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return null;
  }

  if (/^[a-z][a-z0-9+.-]*:/.test(lower)) {
    if (lower.startsWith("http:") || lower.startsWith("https:") || lower.startsWith("mailto:") || lower.startsWith("tel:")) {
      return trimmed;
    }

    return null;
  }

  return trimmed;
};

const renderInlineMarkdown = (value: string) => {
  const codeSpans: string[] = [];
  let rendered = escapeHtml(value).replace(/`([^`]+)`/g, (_match, code: string) => {
    const placeholder = `\u0000CODE_${codeSpans.length}\u0000`;
    codeSpans.push(`<code>${code}</code>`);
    return placeholder;
  });

  rendered = rendered.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) => {
    const safeHref = sanitizeUrl(href);

    if (!safeHref) {
      return label;
    }

    return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noreferrer">${label}</a>`;
  });

  rendered = rendered.replace(/(^|[^\w])(\*\*|__)(.+?)\2(?=$|[^\w])/g, (_match, prefix: string, _marker: string, content: string) => {
    return `${prefix}<strong>${content}</strong>`;
  });

  rendered = rendered.replace(/(^|[^\w])(\*|_)(.+?)\2(?=$|[^\w])/g, (_match, prefix: string, _marker: string, content: string) => {
    return `${prefix}<em>${content}</em>`;
  });

  rendered = rendered.replace(/\u0000CODE_(\d+)\u0000/g, (_match, index: string) => codeSpans[Number(index)] ?? "");

  return rendered;
};

export const renderMarkdown = (value: string) => {
  const source = (value ?? "").replace(/\r\n/g, "\n");

  if (!source.trim()) {
    return "";
  }

  const blocks: string[] = [];
  const lines = source.split("\n");
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let quoteLines: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraphLines.join("\n")).replace(/\n/g, "<br />")}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) {
      return;
    }

    blocks.push(`<${listType}>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${listType}>`);
    listItems = [];
    listType = null;
  };

  const flushQuote = () => {
    if (!quoteLines.length) {
      return;
    }

    blocks.push(`<blockquote>${renderInlineMarkdown(quoteLines.join("\n")).replace(/\n/g, "<br />")}</blockquote>`);
    quoteLines = [];
  };

  const flushCode = () => {
    if (!inCodeBlock) {
      return;
    }

    blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeLines = [];
    inCodeBlock = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
      } else {
        flushParagraph();
        flushList();
        flushQuote();
        inCodeBlock = true;
        codeLines = [];
      }

      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();

      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push("<hr />");
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);

    if (unorderedMatch) {
      flushParagraph();
      flushQuote();

      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }

      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);

    if (orderedMatch) {
      flushParagraph();
      flushQuote();

      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }

      listItems.push(orderedMatch[1]);
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/);

    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();
  flushCode();

  return blocks.join("");
};