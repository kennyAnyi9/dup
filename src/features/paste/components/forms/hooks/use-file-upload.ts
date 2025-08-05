import { RefObject, useState } from "react";
import { toast } from "sonner";
import { detectLanguage, getLanguageDisplayName } from "@/shared/lib/language-detection";
import type { PasteForm } from "../types";

interface UseFileUploadProps {
  form: PasteForm;
  contentRef: RefObject<HTMLTextAreaElement | null>;
  handleContentInput: () => void;
  isAuthenticated: boolean;
}

interface UseFileUploadReturn {
  inputMode: "type" | "upload";
  uploadedFilename: string;
  handleFileSelect: (content: string, filename: string) => void;
  handleFileError: (error: string) => void;
  switchToTypeMode: () => void;
  switchToUploadMode: () => void;
}

export function useFileUpload({
  form,
  contentRef,
  handleContentInput,
  isAuthenticated,
}: UseFileUploadProps): UseFileUploadReturn {
  const [inputMode, setInputMode] = useState<"type" | "upload">("type");
  const [uploadedFilename, setUploadedFilename] = useState<string>("");

  const handleFileSelect = (content: string, filename: string) => {
    // Validate inputs
    if (!content || typeof content !== "string") {
      toast.error("Invalid file content received");
      return;
    }
    
    if (!filename || typeof filename !== "string" || filename.trim().length === 0) {
      toast.error("Invalid filename received");
      return;
    }

    // Set content in textarea
    if (contentRef.current) {
      contentRef.current.value = content;
      handleContentInput();
    } else {
      console.warn("Content textarea ref is not available");
    }
    
    setUploadedFilename(filename);

    // Auto-fill title if empty
    const currentTitle = form.getValues("title");
    if (!currentTitle && filename.trim().length > 0) {
      // Improved regex to handle edge cases: matches dot followed by extension at end of string
      // Handles cases like: "file.txt", "archive.tar.gz", ".hidden", "file.", "file"
      const nameWithoutExt = filename.replace(/\.[^./\\]*$/, "").trim();
      
      // Only set title if we have a meaningful name after processing
      if (nameWithoutExt.length > 0) {
        form.setValue("title", nameWithoutExt);
      }
    }

    try {
      // Detect and set language automatically
      const detection = detectLanguage(filename, content);
      if (detection?.language) {
        form.setValue("language", detection.language);
      }

      // Show success notification
      const languageDisplayName = getLanguageDisplayName(detection?.language || "plain");
      toast.success(
        `File "${filename}" uploaded successfully! Detected language: ${languageDisplayName}`
      );
    } catch (error) {
      console.error("Language detection failed:", error);
      // Still proceed with upload, just use default language
      form.setValue("language", "plain");
      toast.success(`File "${filename}" uploaded successfully!`);
    }
  };

  const handleFileError = (error: string) => {
    // Validate error input and provide meaningful feedback
    if (!error || typeof error !== "string" || error.trim().length === 0) {
      toast.error("An unknown error occurred during file upload");
      return;
    }
    
    const trimmedError = error.trim();
    
    // Sanitize error message to prevent potential XSS
    const sanitizedError = trimmedError.replace(/<[^>]*>/g, '');
    
    toast.error(sanitizedError);
  };

  const switchToTypeMode = () => {
    setInputMode("type");
    setUploadedFilename("");
  };

  const switchToUploadMode = () => {
    if (isAuthenticated) {
      setInputMode("upload");
    }
  };

  return {
    inputMode,
    uploadedFilename,
    handleFileSelect,
    handleFileError,
    switchToTypeMode,
    switchToUploadMode,
  };
}