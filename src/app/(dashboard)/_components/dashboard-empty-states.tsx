"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FolderOpen } from "lucide-react";
import { usePasteModal } from "@/components/shared/paste/paste-modal-provider";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  hasSearch: boolean;
}

export function EmptyState({ hasSearch }: EmptyStateProps) {
  const { openModal } = usePasteModal();
  const router = useRouter();

  if (hasSearch) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No pastes found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Clear filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No pastes yet</h3>
        <p className="text-muted-foreground text-center mb-4">
          Create your first paste to get started
        </p>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          Create New Paste
          <kbd className="inline-flex h-4 select-none items-center gap-1 rounded border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            N
          </kbd>
        </Button>
      </CardContent>
    </Card>
  );
}