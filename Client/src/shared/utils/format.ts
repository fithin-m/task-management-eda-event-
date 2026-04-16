import { formatDistanceToNow, format, isPast, parseISO } from "date-fns";

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy · h:mm a");
}

export function isOverdue(deadline?: string | null): boolean {
  if (!deadline) return false;
  return isPast(parseISO(deadline));
}

export function getDueSoon(deadline?: string | null): string | null {
  if (!deadline) return null;
  const d = parseISO(deadline);
  if (isPast(d)) return "Overdue";
  return `Due ${formatRelative(d)}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const PROJECT_COLORS = [
  "bg-project-purple",
  "bg-project-yellow",
  "bg-project-green",
  "bg-project-pink",
  "bg-project-teal",
  "bg-project-orange",
  "bg-project-blue",
  "bg-project-red",
];

export function getProjectColor(index: number): string {
  return PROJECT_COLORS[index % PROJECT_COLORS.length];
}
