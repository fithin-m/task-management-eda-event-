import { cn } from "@/shared/utils/cn";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-primary">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={cn(
            "w-full h-9 rounded-md border border-border bg-white px-3 text-sm text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-9",
            error && "border-red-400 focus:ring-red-200",
            className
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-primary">{label}</label>
      )}
      <textarea
        {...props}
        className={cn(
          "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none",
          "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-400 focus:ring-red-200",
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-primary">{label}</label>
      )}
      <select
        {...props}
        className={cn(
          "w-full h-9 rounded-md border border-border bg-white px-3 text-sm text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-400",
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
