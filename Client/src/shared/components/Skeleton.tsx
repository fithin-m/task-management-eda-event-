import { cn } from "@/shared/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-100",
        className
      )}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border shadow-card p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border p-4 flex items-center gap-3">
      <Skeleton className="h-4 w-4 rounded" />
      <div className="flex-1">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-md" />
      <Skeleton className="h-6 w-16 rounded-md" />
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
