import { useState, useCallback } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

interface CopyButtonProps {
  text: string;
  className?: string;
}

const CopyButton = ({ text, className = "" }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [text]
  );

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to clipboard"}
      className={`inline-flex items-center justify-center p-1 rounded-md transition-colors ${
        copied
          ? "text-green-600 bg-green-50"
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      } ${className}`}
    >
      {copied ? (
        <FiCheck className="w-3 h-3" />
      ) : (
        <FiCopy className="w-3 h-3" />
      )}
    </button>
  );
};

export default CopyButton;
