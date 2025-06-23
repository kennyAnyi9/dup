"use client";

import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";
import { Button } from "@/shared/components/dupui/button";

export function HeaderNewPasteButton() {
  const { openModal } = usePasteModal();


  return (
    <Button
      size="sm"
      className="hidden sm:flex gap-2"
      onClick={() => openModal()}
    >
      New Paste
    </Button>
  );
}
