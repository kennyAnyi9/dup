"use client";

import { Button } from "@/components/ui/button";
import { Search, FolderOpen } from "lucide-react";
import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  hasSearch: boolean;
}

export function EmptyState({ hasSearch }: EmptyStateProps) {
  const { openModal } = usePasteModal();
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
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          Create New Paste
          <kbd className="inline-flex h-4 select-none items-center gap-1 rounded border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            N
          </kbd>
        </Button>
      </div>
    </div>
  );
}