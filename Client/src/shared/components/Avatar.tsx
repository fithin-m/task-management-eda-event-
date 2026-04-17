import { cn } from "@/shared/utils/cn";

// Safeguard: derive initials locally so we can handle empty/undefined names
function safeInitials(name: string | undefined | null): string {
  if (!name || !name.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Use explicit, strong Tailwind color classes so they are never purged.
// Each entry is a [bg, ring] pair for consistent theming.
const AVATAR_PALETTE: [string, string][] = [
  ["bg-indigo-600", "ring-indigo-300"],
  ["bg-blue-600",   "ring-blue-300"],
  ["bg-violet-600", "ring-violet-300"],
  ["bg-emerald-600","ring-emerald-300"],
  ["bg-rose-600",   "ring-rose-300"],
  ["bg-amber-600",  "ring-amber-300"],
  ["bg-teal-600",   "ring-teal-300"],
  ["bg-pink-600",   "ring-pink-300"],
];

function getAvatarColor(name: string | undefined | null): string {
  if (!name || !name.trim()) return AVATAR_PALETTE[0][0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length][0];
}

interface AvatarProps {
  name: string | undefined | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const initials = safeInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div
      className={cn(
        // Layout & shape
        "rounded-full flex items-center justify-center flex-shrink-0",
        // Typography — always white on the colored background
        "text-white font-bold leading-none select-none",
        // Subtle shadow so the avatar stands out against white backgrounds
        "shadow-sm",
        sizeMap[size],
        bgColor,
        className
      )}
      title={name ?? undefined}
      aria-label={name ?? "User avatar"}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: "xs" | "sm" | "md";
}

export function AvatarGroup({ names, max = 3, size = "sm" }: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const overflow = names.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((name, i) => (
        <Avatar
          key={i}
          name={name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center bg-gray-300 text-gray-700 font-bold ring-2 ring-white text-xs shadow-sm",
            sizeMap[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
