import React from "react";

export type ViewType = "table" | "card";

// Common component prop patterns
export interface ComponentWithChildren {
  children: React.ReactNode;
}

export interface ComponentWithClassName {
  className?: string;
}

// Common button/action types
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "theme";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

// Modal/Dialog types
export interface ModalProps extends ComponentWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Table/List related types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Form related types
export interface FormFieldProps {
  id: string;
  label?: string;
  error?: string;
  required?: boolean;
}
