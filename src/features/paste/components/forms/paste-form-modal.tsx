"use client";

import { useState, useEffect } from "react";
import { PasteFormDialog } from "./paste-form-dialog";
import { PasteFormDrawer } from "./paste-form-drawer";

interface EditingPaste {
  id: string;
  title: string | null;
  description: string | null;
  content: string;
  language: string;
  visibility: string;
  burnAfterRead: boolean;
  burnAfterReadViews: number | null;
  expiresAt: Date | null;
  hasPassword: boolean;
  tags?: Array<{ name: string }>;
}

interface PasteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
  editingPaste?: EditingPaste | null;
}

export function PasteFormModal({
  open,
  onOpenChange,
  initialContent = "",
  editingPaste = null,
}: PasteFormModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Conditional rendering based on screen size
  if (isMobile) {
    return (
      <PasteFormDrawer
        open={open}
        onOpenChange={onOpenChange}
        initialContent={initialContent}
        editingPaste={editingPaste}
      />
    );
  }

  return (
    <PasteFormDialog
      open={open}
      onOpenChange={onOpenChange}
      initialContent={initialContent}
      editingPaste={editingPaste}
    />
  );
}