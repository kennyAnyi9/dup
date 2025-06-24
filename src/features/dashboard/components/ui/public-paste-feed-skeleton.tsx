"use client";

import { Skeleton } from "@/shared/components/dupui/skeleton";

interface PublicPasteFeedSkeletonProps {
  count?: number;
  compact?: boolean;
}

export function PublicPasteFeedSkeleton({ count = 5, compact = false }: PublicPasteFeedSkeletonProps) {
  if (compact) {
    // Compact version for mobile
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-3 border-l-2 border-transparent rounded-r-md">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-8" />
            </div>
            
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16 rounded" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Full version for desktop sidebar
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative p-4 rounded-xl border border-border/40 bg-gradient-to-br from-background to-background/80">
          {/* Header with title and time */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          
          {/* Language and stats */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-lg" />
            
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}