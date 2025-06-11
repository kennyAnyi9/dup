"use client";

import { Button } from "@/components/ui/button";
import { usePasteModal } from "@/components/paste/paste-modal-provider";

export function SidebarNewPasteButton() {
  const { openModal } = usePasteModal();

  return (
    <Button onClick={() => openModal()} className="w-full flex items-center justify-between">
      <span>Create New Paste</span>
      <kbd className="inline-flex h-4 select-none items-center gap-1 rounded border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        N
      </kbd>
    </Button>
  );
}