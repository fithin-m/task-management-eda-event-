"use client";
import { LayoutList, LayoutGrid } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type ViewMode = "list" | "board";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
          view === "list"
            ? "bg-white text-brand shadow-sm"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        <LayoutList size={14} />
        <span>List View</span>
      </button>
      <button
        onClick={() => onChange("board")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
          view === "board"
            ? "bg-white text-brand shadow-sm"
            : "text-text-muted hover:text-text-primary"
        )}
      >
        <LayoutGrid size={14} />
        <span>Board View</span>
      </button>
    </div>
  );
}
