"use client";

import { usePasteModal } from "@/components/shared/paste/paste-modal-provider";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function HeaderNewPasteButton() {
  const { openModal } = usePasteModal();

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "n",
      callback: () => {
        openModal();
      },
      description: "New paste",
    },
  ]);

  return (
    <Button
      size="sm"
      className="hidden sm:flex gap-2"
      onClick={() => openModal()}
    >
      New Paste
      <kbd className="hidden lg:inline-flex h-4 select-none items-center gap-1 rounded-sm border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        N
      </kbd>
    </Button>
  );
}
