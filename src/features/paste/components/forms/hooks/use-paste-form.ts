"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/shared/hooks/use-auth";
import {
  CHAR_LIMIT_ANONYMOUS,
  PASTE_VISIBILITY,
  type SupportedLanguage,
  type PasteVisibility,
} from "@/shared/lib/constants";
import { createPasteSchema, type CreatePasteInput, type UpdatePasteInput } from "@/shared/types/paste";
import { createPaste, updatePaste } from "@/features/paste/actions/paste.actions";
import { checkUrlAvailability } from "@/shared/lib/api-client";
import type { URLAvailability } from "../types";

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

interface UsePasteFormProps {
  initialContent?: string;
  editingPaste?: EditingPaste | null;
  isAuthenticated?: boolean; // Override auth state
  onSuccess?: () => void;
}

export function usePasteForm({ initialContent = "", editingPaste = null, isAuthenticated: overrideAuth, onSuccess }: UsePasteFormProps) {
  const { isAuthenticated: authState } = useAuth();
  const isAuthenticated = overrideAuth !== undefined ? overrideAuth : authState;
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [urlAvailability, setUrlAvailability] = useState<URLAvailability>({ 
    isChecking: false, 
    available: null 
  });

  // Uncontrolled textarea for performance
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [contentLength, setContentLength] = useState(0);

  const charLimit = isAuthenticated ? null : CHAR_LIMIT_ANONYMOUS;
  const isEditing = !!editingPaste;

  const form = useForm({
    resolver: zodResolver(createPasteSchema),
    mode: editingPaste ? "onChange" : "onSubmit", // More responsive validation in edit mode
    defaultValues: {
      title: "",
      description: "",
      content: initialContent,
      language: "plain",
      visibility: PASTE_VISIBILITY.PUBLIC,
      password: "",
      customUrl: "",
      tags: [],
      burnAfterRead: false,
      burnAfterReadViews: undefined,
      expiresIn: isAuthenticated ? "never" : "30m",
      qrCodeColor: "#000000",
      qrCodeBackground: "#ffffff",
    },
  });

  // Helper function to convert expiresAt to expiresIn
  const getExpiresInValue = (expiresAt: Date | null): "1h" | "1d" | "7d" | "30d" | "never" => {
    if (!expiresAt) return "never";
    
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return "never";
    
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffHours <= 1) return "1h";
    if (diffHours <= 24) return "1d";
    if (diffDays <= 7) return "7d";
    if (diffDays <= 30) return "30d";
    return "never";
  };

  // Handle content input changes for uncontrolled textarea
  const handleContentInput = () => {
    if (contentRef.current) {
      const content = contentRef.current.value;
      setContentLength(content.length);
      form.setValue("content", content);
    }
  };

  // Only reset form when editingPaste initially loads, not on every change
  useEffect(() => {
    // Only run when editingPaste first becomes available (not on subsequent changes)
    if (editingPaste && editingPaste.id) {
      const resetData = {
        title: editingPaste.title || "",
        description: editingPaste.description || "",
        content: editingPaste.content,
        language: (editingPaste.language as SupportedLanguage) || "plain",
        visibility: (editingPaste.visibility as PasteVisibility) || PASTE_VISIBILITY.PUBLIC,
        password: "",
        customUrl: "",
        tags: editingPaste.tags?.map(tag => tag.name) || [],
        burnAfterRead: editingPaste.burnAfterRead,
        burnAfterReadViews: editingPaste.burnAfterRead ? (editingPaste.burnAfterReadViews || 1) : undefined,
        expiresIn: getExpiresInValue(editingPaste.expiresAt),
        qrCodeColor: editingPaste.qrCodeColor || "#000000",
        qrCodeBackground: editingPaste.qrCodeBackground || "#ffffff",
      };
      
      // Only reset once when editingPaste first loads
      form.reset(resetData);
      
      // Set content in uncontrolled textarea
      if (contentRef.current) {
        contentRef.current.value = editingPaste.content;
        setContentLength(editingPaste.content.length);
      }
    } else if (!editingPaste && initialContent !== "") {
      // Only reset for new paste creation
      form.reset({
        title: "",
        description: "",
        content: initialContent,
        language: "plain",
        visibility: PASTE_VISIBILITY.PUBLIC,
        password: "",
        customUrl: "",
        tags: [],
        burnAfterRead: false,
        burnAfterReadViews: undefined,
        expiresIn: isAuthenticated ? "never" : "30m",
        qrCodeColor: "#000000",
        qrCodeBackground: "#ffffff",
      });
      
      // Set initial content in uncontrolled textarea
      if (contentRef.current) {
        contentRef.current.value = initialContent;
        setContentLength(initialContent.length);
      }
    }
    // Only depend on the paste ID to avoid unnecessary resets
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPaste?.id]);

  // Optimized form watching using useWatch for better performance
  const watchedFields = useWatch({
    control: form.control,
    name: ["visibility", "burnAfterRead", "customUrl"]
  });

  // Memoize watched values to prevent unnecessary re-renders
  const { watchedVisibility, watchedBurnAfterRead, watchedCustomUrl } = useMemo(() => ({
    watchedVisibility: watchedFields?.[0] || PASTE_VISIBILITY.PUBLIC,
    watchedBurnAfterRead: watchedFields?.[1] || false,
    watchedCustomUrl: watchedFields?.[2] || ""
  }), [watchedFields]);

  // Standardized URL availability check with consistent error handling
  useEffect(() => {
    if (!isAuthenticated || !watchedCustomUrl?.trim()) {
      setUrlAvailability({ isChecking: false, available: null });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUrlAvailability({ isChecking: true, available: null });
      
      const result = await checkUrlAvailability(watchedCustomUrl);
      
      if (result.success && result.data) {
        setUrlAvailability({
          isChecking: false,
          available: result.data.available,
        });
      } else {
        setUrlAvailability({
          isChecking: false,
          available: false,
          error: result.error,
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedCustomUrl, isAuthenticated]);

  const onSubmit = (data: Omit<CreatePasteInput, 'content'>) => {
    startTransition(async () => {
      try {
        // Get content from uncontrolled textarea
        const content = contentRef.current?.value || "";
        
        let result;
        
        if (isEditing && editingPaste) {
          const updateData: UpdatePasteInput = {
            id: editingPaste.id,
            title: data.title,
            description: data.description,
            content: content,
            language: data.language,
            visibility: data.visibility,
            password: data.password,
            removePassword: false,
            burnAfterRead: data.burnAfterRead,
            burnAfterReadViews: data.burnAfterReadViews,
            tags: data.tags,
            expiresIn: data.expiresIn === "30m" ? "1h" : data.expiresIn,
          };
          result = await updatePaste(updateData);
        } else {
          const createData: CreatePasteInput = {
            ...data,
            content: content,
            // Set defaults for empty values
            language: data.language || "plain",
            visibility: data.visibility || PASTE_VISIBILITY.PUBLIC,
            expiresIn: data.expiresIn || (isAuthenticated ? "never" : "30m"),
          };
          result = await createPaste(createData);
        }

        if (result.success && result.paste) {
          const pasteUrl = `${window.location.origin}/p/${result.paste.slug}`;
          
          try {
            await navigator.clipboard.writeText(pasteUrl);
            toast.success(
              isEditing 
                ? "Paste updated successfully! URL copied to clipboard."
                : "Paste created successfully! URL copied to clipboard."
            );
          } catch {
            toast.success(
              isEditing 
                ? "Paste updated successfully!"
                : "Paste created successfully!"
            );
          }
          
          form.reset();
          
          // Call onSuccess outside of transition for immediate redirect
          setTimeout(() => {
            onSuccess?.();
          }, 0);
        } else {
          toast.error(result.error || (isEditing ? "Failed to update paste" : "Failed to create paste"));
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(isEditing ? "Paste update error:" : "Paste creation error:", error);
      }
    });
  };

  const isSubmitDisabled = 
    isPending ||
    contentLength === 0 ||
    (charLimit && contentLength > charLimit) ||
    (!!watchedCustomUrl.trim() && urlAvailability.isChecking) ||
    (!!watchedCustomUrl.trim() && urlAvailability.available === false);

  return {
    form,
    isPending,
    showPassword,
    setShowPassword,
    urlAvailability,
    charLimit,
    isEditing,
    isAuthenticated,
    // Replace watchedContent with uncontrolled alternatives
    contentRef,
    contentLength,
    handleContentInput,
    watchedVisibility,
    watchedBurnAfterRead,
    watchedCustomUrl,
    onSubmit,
    isSubmitDisabled,
  };
}