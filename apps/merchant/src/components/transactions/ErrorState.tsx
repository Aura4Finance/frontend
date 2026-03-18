import { Button } from "@orafi/ui";
import { FiAlertTriangle, FiRefreshCw, FiXCircle } from "react-icons/fi";

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
        return <FiAlertTriangle className="h-12 w-12 text-yellow-500" />;
      case "info":
        return <FiAlertTriangle className="h-12 w-12 text-blue-500" />;
      default:
        return <FiXCircle className="h-12 w-12 text-red-500" />;
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
    <div className={`flex flex-col items-center justify-center rounded-xl px-4 py-12 ${getBgColor()}`}>
      {showIcon && <div className="mb-4">{getIcon()}</div>}
      <p className="mb-4 max-w-md text-center text-sm text-gray-700">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2 text-sm">
          <FiRefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
