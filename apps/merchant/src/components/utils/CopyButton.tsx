import { useCallback, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

interface CopyButtonProps {
  text: string;
  className?: string;
}

const CopyButton = ({ text, className = "" }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
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
      className={`inline-flex items-center justify-center rounded-md p-1 transition-colors ${
        copied
          ? "bg-green-50 text-green-600"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      } ${className}`}
    >
      {copied ? <FiCheck className="h-3 w-3" /> : <FiCopy className="h-3 w-3" />}
    </button>
  );
};

export default CopyButton;
