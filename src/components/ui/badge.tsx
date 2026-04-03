import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const colorStyles = {
  green: "bg-green-50 text-green-700 ring-green-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-700/20",
  gray: "bg-gray-50 text-gray-600 ring-gray-500/20",
  purple: "bg-purple-50 text-purple-700 ring-purple-700/20",
} as const;

export type BadgeColor = keyof typeof colorStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  dot?: boolean;
}

export function Badge({
  className,
  color = "gray",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        colorStyles[color],
        className
      )}
      {...props}
    >
      {dot && (
        <svg className="h-1.5 w-1.5 fill-current" viewBox="0 0 6 6">
          <circle cx={3} cy={3} r={3} />
        </svg>
      )}
      {children}
    </span>
  );
}
