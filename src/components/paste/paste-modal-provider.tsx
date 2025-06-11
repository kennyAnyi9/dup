"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PasteFormModal } from "./paste-form-modal";

interface PasteModalContextType {
  isOpen: boolean;
  openModal: (initialContent?: string) => void;
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

  const openModal = (content = "") => {
    setInitialContent(content);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setInitialContent("");
  };

  return (
    <PasteModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <PasteFormModal
        open={isOpen}
        onOpenChange={setIsOpen}
        initialContent={initialContent}
      />
    </PasteModalContext.Provider>
  );
}