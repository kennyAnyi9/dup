"use client";

import { Button } from "@/shared/components/dupui/button";
import { Search, FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  hasSearch: boolean;
}

export function EmptyState({ hasSearch }: EmptyStateProps) {
  const router = useRouter();

  if (hasSearch) {
    return (
      <div className="col-span-full w-full rounded-lg border border-border border-dashed bg-background p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <Search className="h-6 w-6" />
            <p className="text-base text-foreground">No pastes found</p>
            <p className="text-center text-muted-foreground">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Clear filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full w-full rounded-lg border border-border border-dashed bg-background p-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-1">
          <FolderOpen className="h-6 w-6" />
          <p className="text-base text-foreground">No pastes yet</p>
          <p className="text-center text-muted-foreground">
            Create your first paste to get started organizing your code snippets.
          </p>
        </div>
        <Button onClick={() => router.push('/new')}>
          Create New Paste
        </Button>
      </div>
    </div>
  );
}