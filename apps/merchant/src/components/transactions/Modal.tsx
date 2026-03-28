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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 hover:bg-black/50" 
        onClick={onClose} 
      />
      <div
        className={`relative mx-auto max-h-[90vh] w-full overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] ${sizeClasses[size]} transform transition-all duration-300`}
      >
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${variantClasses[variant]} border-b ${variantBorders[variant]} px-6 py-5 sm:py-6`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className="mt-0.5 flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className={`text-lg sm:text-xl font-bold ${variantTitles[variant]} truncate`}>
                  {title}
                </h2>
                {description && (
                  <p className={`text-sm ${variantDescriptions[variant]} mt-1 line-clamp-2`}>
                    {description}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={onClose} 
              className={`flex-shrink-0 rounded-lg p-2 transition-all duration-200 hover:bg-black/10 active:scale-95`}
              aria-label="Close modal"
            >
              <FiX className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            </button>
          </div>
        </div>
        
        {/* Content area with smooth scrolling */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="px-6 py-6 sm:px-8">
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* Smooth scrollbar styling */
        .max-h-\\[calc\\(90vh-80px\\)\\]::-webkit-scrollbar {
          width: 8px;
        }
        
        .max-h-\\[calc\\(90vh-80px\\)\\]::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .max-h-\\[calc\\(90vh-80px\\)\\]::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          transition: background 0.3s;
        }
        
        .max-h-\\[calc\\(90vh-80px\\)\\]::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
};

export default Modal;
