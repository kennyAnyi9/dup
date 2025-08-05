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
    // Set content in textarea
    if (contentRef.current) {
      contentRef.current.value = content;
      handleContentInput();
    }
    setUploadedFilename(filename);

    // Auto-fill title if empty
    if (!form.getValues("title") && filename && typeof filename === "string" && filename.trim().length > 0) {
      // Improved regex to handle edge cases: matches dot followed by extension at end of string
      // Handles cases like: "file.txt", "archive.tar.gz", ".hidden", "file.", "file"
      const nameWithoutExt = filename.replace(/\.[^./\\]*$/, "").trim();
      
      // Only set title if we have a meaningful name after processing
      if (nameWithoutExt.length > 0) {
        form.setValue("title", nameWithoutExt);
      }
    }

    // Detect and set language automatically
    const detection = detectLanguage(filename, content);
    form.setValue("language", detection.language);

    // Show success notification
    const languageDisplayName = getLanguageDisplayName(detection.language);
    toast.success(
      `File "${filename}" uploaded successfully! Detected language: ${languageDisplayName}`
    );
  };

  const handleFileError = (error: string) => {
    toast.error(error);
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