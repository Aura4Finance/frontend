import { Card, CardContent, CardDescription } from "@orafi/ui";
import { type IconType } from "react-icons";
import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: IconType;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}

const KPICard = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-700",
  iconBgColor = "bg-blue-100",
  trend,
}: KPICardProps) => {
  return (
    <Card className="w-full bg-white p-3 transition-shadow duration-200 hover:shadow-lg">
      <CardDescription className="text-xs font-medium text-gray-500">{title}</CardDescription>
      <CardContent className="mt-1.5 flex items-center justify-between !p-0">
        <div>
          <span className="text-lg font-bold text-gray-900">{value}</span>
          {trend && (
            <div className="mt-0.5 flex items-center gap-1">
              {trend.isPositive ? (
                <FiArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <FiArrowDownLeft className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-[10px] ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={`${iconBgColor} rounded-lg p-2`}>
          <Icon className={`${iconColor} text-lg`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
