"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseCopyUrlOptions {
  successMessage?: string;
  errorMessage?: string;
  resetDelay?: number;
}

export function useCopyUrl(options: UseCopyUrlOptions = {}) {
  const {
    successMessage = "URL copied to clipboard!",
    errorMessage = "Failed to copy URL",
    resetDelay = 2000,
  } = options;

  const [copied, setCopied] = useState(false);

  const copyUrl = async (slug: string) => {
    try {
      const pasteUrl = `${window.location.origin}/p/${slug}`;
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), resetDelay);
    } catch (error) {
      toast.error(errorMessage);
      console.error("Copy failed:", error);
    }
  };

  const copyText = async (text: string, customSuccessMessage?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(customSuccessMessage || successMessage);
      setTimeout(() => setCopied(false), resetDelay);
    } catch (error) {
      toast.error(errorMessage);
      console.error("Copy failed:", error);
    }
  };

  return {
    copied,
    copyUrl,
    copyText,
  };
}