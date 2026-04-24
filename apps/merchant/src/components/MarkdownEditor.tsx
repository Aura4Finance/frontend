import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { LuBold, LuCode, LuHeading1, LuItalic, LuLink2, LuList, LuListOrdered, LuMinus, LuQuote } from "react-icons/lu";
import { renderMarkdown } from "../lib/markdown";

type EditorTab = "write" | "preview";

type SelectionRange = {
  start: number;
  end: number;
};

interface MarkdownEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MIN_EDITOR_HEIGHT = 120;

const tabButtonBase =
  "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1";

const toolbarButtonBase =
  "inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-blue-50 active:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1";

const MarkdownEditor = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Write a description… Markdown is supported.",
}: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectionRef = useRef<SelectionRange>({ start: 0, end: 0 });
  const [activeTab, setActiveTab] = useState<EditorTab>("write");

  const syncHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(textarea.scrollHeight, MIN_EDITOR_HEIGHT)}px`;
  };

  useEffect(() => {
    if (activeTab === "write") {
      syncHeight();
    }
  }, [activeTab, value]);

  const getSelection = () => {
    const textarea = textareaRef.current;
    if (textarea && document.activeElement === textarea) {
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      selectionRef.current = { start, end };
      return selectionRef.current;
    }

    return selectionRef.current;
  };

  const commitValue = (nextValue: string, nextSelection: SelectionRange) => {
    selectionRef.current = nextSelection;
    onChange(nextValue);

    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus();
      textarea.setSelectionRange(nextSelection.start, nextSelection.end);
      syncHeight();
    });
  };

  const wrapSelection = (prefix: string, suffix: string, placeholderText: string) => {
    const { start, end } = getSelection();
    const selectedText = value.slice(start, end);
    const content = selectedText || placeholderText;
    const nextValue = `${value.slice(0, start)}${prefix}${content}${suffix}${value.slice(end)}`;

    commitValue(nextValue, {
      start: start + prefix.length,
      end: start + prefix.length + content.length,
    });
  };

  const prefixSelection = (prefix: string, placeholderText: string) => {
    const { start, end } = getSelection();
    const selectedText = value.slice(start, end);
    const content = selectedText || placeholderText;
    const transformed = content.split("\n").map((line) => `${prefix}${line}`).join("\n");
    const nextValue = `${value.slice(0, start)}${transformed}${value.slice(end)}`;

    commitValue(nextValue, {
      start: start + prefix.length,
      end: start + transformed.length,
    });
  };

  const insertHorizontalRule = () => {
    const { start, end } = getSelection();
    const insertion = `${start > 0 ? "\n" : ""}---\n`;
    const nextValue = `${value.slice(0, start)}${insertion}${value.slice(end)}`;

    commitValue(nextValue, {
      start: start + insertion.length,
      end: start + insertion.length,
    });
  };

  const insertLink = () => {
    const { start, end } = getSelection();
    const selectedText = value.slice(start, end);
    const labelText = selectedText || "label";
    const nextValue = `${value.slice(0, start)}[${labelText}](url)${value.slice(end)}`;

    commitValue(nextValue, {
      start: start + 1,
      end: start + 1 + labelText.length,
    });
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();

    setActiveTab((currentTab) => {
      const currentIndex = currentTab === "write" ? 0 : 1;

      if (event.key === "Home") return "write";
      if (event.key === "End") return "preview";
      if (event.key === "ArrowLeft") return currentIndex === 0 ? "preview" : "write";
      return currentIndex === 0 ? "preview" : "write";
    });
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <div
        role="tablist"
        aria-label={`${label} editor mode`}
        className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1"
        onKeyDown={handleTabKeyDown}
      >
        <button
          type="button"
          id={`${id}-write-tab`}
          role="tab"
          aria-selected={activeTab === "write"}
          aria-controls={`${id}-write-panel`}
          onClick={() => setActiveTab("write")}
          className={`${tabButtonBase} ${activeTab === "write" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}
        >
          Write
        </button>
        <button
          type="button"
          id={`${id}-preview-tab`}
          role="tab"
          aria-selected={activeTab === "preview"}
          aria-controls={`${id}-preview-panel`}
          onClick={() => setActiveTab("preview")}
          className={`${tabButtonBase} ${activeTab === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:bg-white/70 hover:text-gray-900"}`}
        >
          Preview
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {activeTab === "write" ? (
          <div id={`${id}-write-panel`} role="tabpanel" aria-labelledby={`${id}-write-tab`}>
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50/80 px-2 py-1.5">
              <button
                type="button"
                aria-label="Bold"
                title="Bold"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => wrapSelection("**", "**", "bold text")}
                className={toolbarButtonBase}
              >
                <LuBold size={13} />
              </button>
              <button
                type="button"
                aria-label="Italic"
                title="Italic"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => wrapSelection("*", "*", "italic text")}
                className={toolbarButtonBase}
              >
                <LuItalic size={13} />
              </button>
              <button
                type="button"
                aria-label="Heading"
                title="Heading"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => prefixSelection("## ", "Heading")}
                className={toolbarButtonBase}
              >
                <LuHeading1 size={13} />
              </button>
              <button
                type="button"
                aria-label="Unordered list"
                title="Unordered list"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => prefixSelection("- ", "List item")}
                className={toolbarButtonBase}
              >
                <LuList size={13} />
              </button>
              <button
                type="button"
                aria-label="Ordered list"
                title="Ordered list"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => prefixSelection("1. ", "List item")}
                className={toolbarButtonBase}
              >
                <LuListOrdered size={13} />
              </button>
              <button
                type="button"
                aria-label="Blockquote"
                title="Blockquote"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => prefixSelection("> ", "Quote")}
                className={toolbarButtonBase}
              >
                <LuQuote size={13} />
              </button>
              <button
                type="button"
                aria-label="Inline code"
                title="Inline code"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => wrapSelection("`", "`", "code")}
                className={toolbarButtonBase}
              >
                <LuCode size={13} />
              </button>
              <button
                type="button"
                aria-label="Horizontal rule"
                title="Horizontal rule"
                onMouseDown={(event) => event.preventDefault()}
                onClick={insertHorizontalRule}
                className={toolbarButtonBase}
              >
                <LuMinus size={13} />
              </button>
              <button
                type="button"
                aria-label="Link"
                title="Link"
                onMouseDown={(event) => event.preventDefault()}
                onClick={insertLink}
                className={toolbarButtonBase}
              >
                <LuLink2 size={13} />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              id={id}
              value={value}
              onChange={(event) => {
                onChange(event.target.value);
                syncHeight();
              }}
              onSelect={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;

                selectionRef.current = {
                  start: textarea.selectionStart ?? 0,
                  end: textarea.selectionEnd ?? 0,
                };
              }}
              onMouseUp={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;

                selectionRef.current = {
                  start: textarea.selectionStart ?? 0,
                  end: textarea.selectionEnd ?? 0,
                };
              }}
              onKeyUp={() => {
                const textarea = textareaRef.current;
                if (!textarea) return;

                selectionRef.current = {
                  start: textarea.selectionStart ?? 0,
                  end: textarea.selectionEnd ?? 0,
                };
              }}
              placeholder={placeholder}
              rows={5}
              spellCheck
              className="block w-full resize-none border-0 bg-transparent px-3 py-2.5 font-mono text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-0"
              style={{ minHeight: `${MIN_EDITOR_HEIGHT}px` }}
            />
          </div>
        ) : (
          <div id={`${id}-preview-panel`} role="tabpanel" aria-labelledby={`${id}-preview-tab`} className="min-h-[120px] px-3 py-2.5">
            {value.trim() ? (
              <div className="markdown-content text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
            ) : (
              <p className="text-sm text-gray-400">Preview will appear here as you write.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;