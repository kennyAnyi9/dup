"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deletePaste } from "../actions/paste.actions";

export function usePasteActions() {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (pasteId: string, onSuccess?: () => void) => {
    setLoading(true);
    setDeletingId(pasteId);
    
    try {
      const result = await deletePaste(pasteId);
      
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
      setLoading(false);
      setDeletingId(null);
    }
  };

  return {
    loading,
    deletingId,
    handleDelete,
  };
}