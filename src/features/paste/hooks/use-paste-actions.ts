"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deletePaste } from "@/features/paste/actions/paste.actions";

export function usePasteActions() {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (pasteId: string, onSuccess?: () => void) => {
    setDeletingIds(prev => new Set(prev).add(pasteId));
    
    try {
      const result = await deletePaste({ id: pasteId });
      
      if (result.success) {
        toast.success("Paste deleted successfully");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to delete paste");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete paste");
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(pasteId);
        return next;
      });
    }
  };

  return {
    deletingIds,
    isDeleting: (id: string) => deletingIds.has(id),
    handleDelete,
  };
}