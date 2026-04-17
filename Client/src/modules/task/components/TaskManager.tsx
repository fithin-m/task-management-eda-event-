"use client";
import { useState } from "react";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { TaskList } from "./TaskList";
import { KanbanBoard } from "./KanbanBoard";

export function TaskManager() {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* View Toggle */}
      <div className="flex justify-end">
        <ViewToggle view={view} onChange={setView} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === "list" ? <TaskList /> : <KanbanBoard />}
      </div>
    </div>
  );
}
