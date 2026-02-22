import { Card, CardContent, CardDescription } from "@orafi/ui";
import { type IconType } from "react-icons";
import { FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";

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
    <Card className="bg-white w-full p-3 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
      <CardDescription className="font-medium text-gray-500 text-xs">
        {title}
      </CardDescription>
      <CardContent className="flex justify-between items-center mt-1.5 !p-0">
        <div>
          <span className="font-bold text-lg text-gray-900">{value}</span>
          {trend && (
            <div className="flex items-center gap-1 mt-0.5">
              {trend.isPositive ? (
                <FiArrowUpRight className="text-green-500 w-3 h-3" />
              ) : (
                <FiArrowDownLeft className="text-red-500 w-3 h-3" />
              )}
              <span className={`text-[10px] ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className={`${iconBgColor} p-2 rounded-lg`}>
          <Icon className={`${iconColor} text-lg`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
