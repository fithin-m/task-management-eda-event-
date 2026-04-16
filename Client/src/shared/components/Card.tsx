import { cn } from "@/shared/utils/cn";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-border shadow-card",
        hover && "hover:shadow-card-hover hover:border-gray-200 transition-all duration-200 cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  color?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  color = "text-brand",
}: MetricCardProps) {
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className={cn("text-2xl font-bold", color)}>{value}</p>
          {delta !== undefined && (
            <p
              className={cn(
                "text-xs mt-1 font-medium",
                isPositive ? "text-status-completed" : "text-status-overdue"
              )}
            >
              {isPositive ? "▲" : "▼"} {Math.abs(delta)}{" "}
              {deltaLabel ?? "this week"}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-3 flex-shrink-0 text-text-muted">{icon}</div>
        )}
      </div>
    </Card>
  );
}
