"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import { PasteFormModal } from "@/features/paste/components";

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
  qrCodeColor: string | null;
  qrCodeBackground: string | null;
  tags?: Array<{ name: string }>;
}

interface PasteModalContextType {
  isOpen: boolean;
  openModal: (initialContent?: string) => void;
  openEditModal: (paste: EditingPaste) => void;
  closeModal: () => void;
}

const PasteModalContext = createContext<PasteModalContextType | null>(null);

export function usePasteModal() {
  const context = useContext(PasteModalContext);
  if (!context) {
    throw new Error("usePasteModal must be used within PasteModalProvider");
  }
  return context;
}

interface PasteModalProviderProps {
  children: ReactNode;
}

export function PasteModalProvider({ children }: PasteModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialContent, setInitialContent] = useState("");
  const [editingPaste, setEditingPaste] = useState<EditingPaste | null>(null);

  const openModal = useCallback((content = "") => {
    setInitialContent(content);
    setEditingPaste(null);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((paste: EditingPaste) => {
    setEditingPaste(paste);
    setInitialContent("");
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setInitialContent("");
    setEditingPaste(null);
  }, []);

  const contextValue = useMemo(
    () => ({ isOpen, openModal, openEditModal, closeModal }),
    [isOpen, openModal, openEditModal, closeModal]
  );

  return (
    <PasteModalContext.Provider value={contextValue}>
      {children}
      <PasteFormModal
        open={isOpen}
        onOpenChange={setIsOpen}
        initialContent={initialContent}
        editingPaste={editingPaste}
      />
    </PasteModalContext.Provider>
  );
}