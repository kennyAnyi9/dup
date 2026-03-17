import { Skeleton } from "@/shared/components/dupui/skeleton";

export function PasteCardSkeleton() {
  return (
    <div className="relative flex items-stretch justify-between gap-2 rounded-xl border border-border bg-background p-3 max-w-full">
      {/* Left section with avatar, title, and metadata */}
      <div className="flex min-w-0 items-center gap-x-3 flex-1">
        {/* Avatar */}
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />

        {/* Title and metadata */}
        <div className="min-w-0 overflow-hidden flex-1">
          {/* Title with action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-1 sm:gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>

          {/* Metadata and status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* URL */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-3 w-24" />
            </div>
            {/* Time */}
            <Skeleton className="h-3 w-16" />
            {/* Language badge */}
            <Skeleton className="h-4 w-12 rounded-sm" />
            {/* Visibility badge */}
            <Skeleton className="h-4 w-14 rounded-sm" />
            {/* Additional badge */}
            <Skeleton className="h-4 w-16 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Center section with tags */}
      <div className="flex items-center justify-center min-w-0 px-4">
        <div className="flex flex-wrap items-center gap-1 justify-center max-w-48">
          <Skeleton className="h-4 w-12 rounded-sm" />
          <Skeleton className="h-4 w-16 rounded-sm" />
          <Skeleton className="h-4 w-10 rounded-sm" />
        </div>
      </div>

      {/* Far right section with stats and menu */}
      <div className="flex items-center gap-2">
        {/* Views button */}
        <Skeleton className="h-7 w-16 rounded-md" />
        {/* Checkbox */}
        <Skeleton className="h-4 w-4 rounded" />
        {/* More options */}
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    </div>
  );
}

export function DashboardLoading() {
  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PasteCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}