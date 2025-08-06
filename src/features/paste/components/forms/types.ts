import type { UseFormReturn } from "react-hook-form";
import type { CreatePasteInput } from "@/shared/types/paste";
import type { RefObject } from "react";

// Use a flexible form type that matches what's actually returned by useForm
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PasteForm = UseFormReturn<any>;

export interface URLAvailability {
  isChecking: boolean;
  available: boolean | null;
  error?: string;
}

export interface PasteFormProps {
  form: PasteForm;
  contentRef: RefObject<HTMLTextAreaElement | null>;
  contentLength: number;
  handleContentInput: () => void;
  charLimit: number | null;
}

export interface PasteMainContentProps extends PasteFormProps {
  isAuthenticated: boolean;
}

export interface PasteSettingsProps {
  form: PasteForm;
  isAuthenticated: boolean;
  isMobile?: boolean;
}

export interface SecuritySettingsProps {
  form: PasteForm;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: URLAvailability;
  isEditing: boolean;
  isAuthenticated: boolean;
  currentSlug?: string; // Current paste slug when editing
  isMobile?: boolean;
}

export interface BasicInformationProps {
  form: PasteForm;
  contentRef: RefObject<HTMLTextAreaElement | null>;
  contentLength: number;
  handleContentInput: () => void;
  charLimit: number | null;
  isAuthenticated: boolean;
  isMobile?: boolean;
}

export interface PasteSettingsDrawerProps {
  form: PasteForm;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: URLAvailability;
  isEditing: boolean;
  isAuthenticated: boolean;
  currentSlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface PasteSettingsSidebarProps {
  form: PasteForm;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: URLAvailability;
  isEditing: boolean;
  isAuthenticated: boolean;
  currentSlug?: string;
}

export interface BurnAfterReadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PasteForm;
  isAuthenticated: boolean;
}

export interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  initialColor?: string;
  initialBackground?: string;
  onColorsChange?: (foreground: string, background: string) => void;
  isAuthenticated: boolean;
}

export interface UsePasteFormReturn {
  form: PasteForm;
  isPending: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: URLAvailability;
  charLimit: number | null;
  isEditing: boolean;
  isAuthenticated: boolean;
  contentRef: RefObject<HTMLTextAreaElement | null>;
  contentLength: number;
  handleContentInput: () => void;
  watchedVisibility: CreatePasteInput['visibility'];
  watchedBurnAfterRead: CreatePasteInput['burnAfterRead'];
  watchedCustomUrl: string;
  onSubmit: (data: Omit<CreatePasteInput, 'content'>) => void;
  isSubmitDisabled: boolean;
}