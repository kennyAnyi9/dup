"use client";

import { Button } from "@/components/ui/button";
import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";

export function DashboardHeaderButton() {
  const { openModal } = usePasteModal();

  return (
    <Button onClick={() => openModal()} className="flex items-center gap-2">
      New Paste
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        N
      </kbd>
    </Button>
  );
}