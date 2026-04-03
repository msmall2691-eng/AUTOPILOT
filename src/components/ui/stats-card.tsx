import { type ElementType } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatsCardProps {
  icon: ElementType;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  className?: string;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel = "vs last period",
  className,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>

      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
          {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive && "text-green-600",
              isNegative && "text-red-600"
            )}
          >
            {isPositive && "+"}
            {change}%
          </span>
          <span className="text-sm text-gray-400">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
