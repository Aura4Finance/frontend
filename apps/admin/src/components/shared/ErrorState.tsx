import { FiAlertTriangle, FiRefreshCw, FiXCircle } from "react-icons/fi";
import { Button } from "@orafi/ui";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showIcon?: boolean;
  type?: "error" | "warning" | "info";
}

const ErrorState = ({
  message = "Something went wrong. Please try again.",
  onRetry,
  showIcon = true,
  type = "error",
}: ErrorStateProps) => {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <FiAlertTriangle className="w-12 h-12 text-yellow-500" />;
      case "info":
        return <FiAlertTriangle className="w-12 h-12 text-blue-500" />;
      default:
        return <FiXCircle className="w-12 h-12 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-50";
      case "info":
        return "bg-blue-50";
      default:
        return "bg-red-50";
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 rounded-xl ${getBgColor()}`}>
      {showIcon && <div className="mb-4">{getIcon()}</div>}
      <p className="text-gray-700 text-sm text-center mb-4 max-w-md">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2 text-sm"
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({
  title = "No data available",
  message = "There's nothing to display at the moment.",
  icon,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-gray-900 font-semibold text-base mb-2">{title}</h3>
      <p className="text-gray-500 text-sm text-center mb-4 max-w-md">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="default" className="text-sm">
          {action.label}
        </Button>
      )}
    </div>
  );
};
