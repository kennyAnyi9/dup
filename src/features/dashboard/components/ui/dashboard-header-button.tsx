"use client";

import { Button } from "@/components/ui/button";
import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";
import { Plus } from "lucide-react";

export function DashboardHeaderButton() {
  const { openModal } = usePasteModal();

  return (
    <Button onClick={() => openModal()} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      New Paste
    </Button>
  );
}