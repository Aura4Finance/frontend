import { type ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "default" | "wide" | "xl";
}

const sizeClasses = {
  default: "max-w-lg",
  wide: "max-w-2xl",
  xl: "max-w-3xl",
};

const Modal = ({ isOpen, onClose, title, children, size = "default" }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative mx-4 max-h-[85vh] w-full overflow-hidden rounded-xl bg-white shadow-2xl ${sizeClasses[size]}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-gray-100">
            <FiX className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="max-h-[calc(85vh-60px)] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
