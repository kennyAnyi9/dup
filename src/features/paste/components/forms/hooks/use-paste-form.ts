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
  onSuccess?: () => void;
}

export function usePasteForm({ initialContent = "", editingPaste = null, onSuccess }: UsePasteFormProps) {
  const { isAuthenticated } = useAuth();
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
    mode: "onSubmit",
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

  // Reset form values when editingPaste changes
  useEffect(() => {
    if (editingPaste) {
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
      
      form.reset(resetData);
      
      // Set content in uncontrolled textarea
      if (contentRef.current) {
        contentRef.current.value = editingPaste.content;
        setContentLength(editingPaste.content.length);
      }
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
  }, [editingPaste, initialContent, isAuthenticated, form]);

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

  // Enhanced URL availability check with retry logic and better error handling
  useEffect(() => {
    if (!isAuthenticated || !watchedCustomUrl?.trim()) {
      setUrlAvailability({ isChecking: false, available: null });
      return;
    }

    const checkUrlAvailability = async (url: string, retryCount = 0): Promise<void> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch("/api/check-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: url.trim() }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Retry for server errors (5xx) up to 3 times
          if (response.status >= 500 && retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            return checkUrlAvailability(url, retryCount + 1);
          }
          
          // Handle different error types
          if (response.status === 429) {
            throw new Error("Too many requests. Please wait a moment and try again.");
          } else if (response.status === 401) {
            throw new Error("Authentication required to check URL availability.");
          } else if (response.status >= 400 && response.status < 500) {
            throw new Error("Invalid request. Please check your input.");
          } else {
            throw new Error(`Server error: ${response.status}`);
          }
        }

        const result = await response.json();
        setUrlAvailability({
          isChecking: false,
          available: result.available,
          error: result.error,
        });
      } catch (error) {
        console.error("URL availability check failed:", error);
        
        // Handle specific error types
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            setUrlAvailability({
              isChecking: false,
              available: false,
              error: "Request timed out. Please try again.",
            });
          } else if (error.message.includes('fetch')) {
            setUrlAvailability({
              isChecking: false,
              available: false,
              error: "Network error. Please check your connection.",
            });
          } else {
            setUrlAvailability({
              isChecking: false,
              available: false,
              error: error.message,
            });
          }
        } else {
          setUrlAvailability({
            isChecking: false,
            available: false,
            error: "An unexpected error occurred.",
          });
        }
      }
    };

    const timeoutId = setTimeout(() => {
      setUrlAvailability({ isChecking: true, available: null });
      checkUrlAvailability(watchedCustomUrl);
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