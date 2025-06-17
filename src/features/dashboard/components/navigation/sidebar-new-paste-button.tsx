"use client";

import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";
import { Button } from "@/shared/components/dupui/button";
import { useCallback } from "react";

export function SidebarNewPasteButton() {
  const { openModal } = usePasteModal();

  const handleClick = useCallback(() => openModal(), [openModal]);

  return (
    <Button
      onClick={handleClick}
      className="w-full flex items-center justify-between"
    >
      <span>Create New Paste</span>
      <kbd aria-hidden className="inline-flex h-4 select-none items-center gap-1 rounded border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        N
      </kbd>
    </Button>
  );
}
