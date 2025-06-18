"use client";

import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";
import { Button } from "@/shared/components/dupui/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useMemo } from "react";

export function HeaderNewPasteButton() {
  const { openModal } = usePasteModal();

  // Create stable wrapper functions to avoid re-renders
  const handleKeyboardShortcut = useMemo(() => () => openModal(), [openModal]);
  const handleClick = useMemo(() => () => openModal(), [openModal]);

  // Memoize keyboard shortcuts to prevent unnecessary re-registrations
  const shortcuts = useMemo(
    () => [
      {
        key: "n",
        callback: handleKeyboardShortcut,
        description: "New paste",
      },
    ],
    [handleKeyboardShortcut]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <Button
      size="sm"
      className="hidden sm:flex gap-2"
      onClick={handleClick}
    >
      New Paste
      <kbd className="hidden lg:inline-flex h-4 select-none items-center gap-1 rounded-sm border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        N
      </kbd>
    </Button>
  );
}
