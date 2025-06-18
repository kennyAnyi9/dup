"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  CHAR_LIMIT_ANONYMOUS,
  PASTE_VISIBILITY,
  type SupportedLanguage,
  type PasteVisibility,
} from "@/lib/constants";
import { createPasteSchema, type CreatePasteInput, type UpdatePasteInput } from "@/types/paste";
import { createPaste, updatePaste } from "@/features/paste/actions/paste.actions";

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

interface UsePasteFormProps {
  initialContent?: string;
  editingPaste?: EditingPaste | null;
  onSuccess?: () => void;
}

export function usePasteForm({ initialContent = "", editingPaste = null, onSuccess }: UsePasteFormProps) {
  const { isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [urlAvailability, setUrlAvailability] = useState<{
    isChecking: boolean;
    available: boolean | null;
    error?: string;
  }>({ isChecking: false, available: null });

  const charLimit = isAuthenticated ? null : CHAR_LIMIT_ANONYMOUS;
  const isEditing = !!editingPaste;

  const form = useForm({
    resolver: zodResolver(createPasteSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      language: "plain",
      visibility: PASTE_VISIBILITY.PUBLIC,
      password: "",
      customUrl: "",
      tags: [],
      burnAfterRead: false,
      burnAfterReadViews: 1,
      expiresIn: isAuthenticated ? "never" : "30m",
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

  // Reset form values when editingPaste changes
  useEffect(() => {
    if (editingPaste) {
      const resetData = {
        id: editingPaste.id,
        title: editingPaste.title || "",
        description: editingPaste.description || "",
        content: editingPaste.content,
        language: (editingPaste.language as SupportedLanguage) || "plain",
        visibility: (editingPaste.visibility as PasteVisibility) || PASTE_VISIBILITY.PUBLIC,
        password: "",
        tags: editingPaste.tags?.map(tag => tag.name) || [],
        burnAfterRead: editingPaste.burnAfterRead,
        burnAfterReadViews: editingPaste.burnAfterReadViews || 1,
        expiresIn: getExpiresInValue(editingPaste.expiresAt),
      };
      
      form.reset(resetData);
    } else {
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
        burnAfterReadViews: 1,
        expiresIn: isAuthenticated ? "never" : "30m",
      });
    }
  }, [editingPaste, initialContent, isAuthenticated, form]);

  const watchedContent = form.watch("content") || "";
  const watchedVisibility = form.watch("visibility") || PASTE_VISIBILITY.PUBLIC;
  const watchedBurnAfterRead = form.watch("burnAfterRead") || false;
  const watchedCustomUrl = form.watch("customUrl") || "";

  // Check URL availability with debouncing
  useEffect(() => {
    if (!isAuthenticated || !watchedCustomUrl.trim()) {
      setUrlAvailability({ isChecking: false, available: null });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUrlAvailability({ isChecking: true, available: null });
      
      try {
        const response = await fetch("/api/check-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: watchedCustomUrl.trim() }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setUrlAvailability({
          isChecking: false,
          available: result.available,
          error: result.error,
        });
      } catch (error) {
        console.error("URL availability check failed:", error);
        setUrlAvailability({
          isChecking: false,
          available: false,
          error: "Failed to check URL availability",
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedCustomUrl, isAuthenticated]);

  const onSubmit = (data: CreatePasteInput) => {
    startTransition(async () => {
      try {
        let result;
        
        if (isEditing && editingPaste) {
          const updateData: UpdatePasteInput = {
            id: editingPaste.id,
            title: data.title,
            description: data.description,
            content: data.content,
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
          result = await createPaste(data);
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
          
          onSuccess?.();
          form.reset();
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
    watchedContent.length === 0 ||
    (charLimit && watchedContent.length > charLimit) ||
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
    watchedContent,
    watchedVisibility,
    watchedBurnAfterRead,
    watchedCustomUrl,
    onSubmit,
    isSubmitDisabled,
  };
}