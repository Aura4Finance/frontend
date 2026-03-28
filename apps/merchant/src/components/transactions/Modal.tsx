import { type ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: "default" | "wide" | "xl";
  variant?: "default" | "info" | "success" | "warning" | "danger";
}

const sizeClasses = {
  default: "max-w-lg",
  wide: "max-w-2xl",
  xl: "max-w-3xl",
};

const variantClasses = {
  default: "from-slate-50 to-slate-100",
  info: "from-blue-50 to-blue-100",
  success: "from-emerald-50 to-emerald-100",
  warning: "from-amber-50 to-amber-100",
  danger: "from-red-50 to-red-100",
};

const variantBorders = {
  default: "border-slate-200",
  info: "border-blue-200",
  success: "border-emerald-200",
  warning: "border-amber-200",
  danger: "border-red-200",
};

const variantTitles = {
  default: "text-gray-900",
  info: "text-blue-900",
  success: "text-emerald-900",
  warning: "text-amber-900",
  danger: "text-red-900",
};

const variantDescriptions = {
  default: "text-gray-600",
  info: "text-blue-700",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-red-700",
};

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  icon, 
  children, 
  size = "default",
  variant = "default"
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div
        className={`relative mx-auto max-h-[90vh] w-full overflow-hidden rounded-xl bg-white shadow-lg ${sizeClasses[size]}`}
      >
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${variantClasses[variant]} border-b ${variantBorders[variant]} px-6 py-5`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className="mt-0.5 flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg font-bold ${variantTitles[variant]} truncate`}>
                  {title}
                </h2>
                {description && (
                  <p className={`text-sm ${variantDescriptions[variant]} mt-1`}>
                    {description}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="flex-shrink-0 rounded p-1.5 hover:bg-black/5"
              aria-label="Close modal"
            >
              <FiX className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Content area with smooth scrolling */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
