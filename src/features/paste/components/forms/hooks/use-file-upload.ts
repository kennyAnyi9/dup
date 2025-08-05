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
    try {
      // Validate inputs
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid file content');
      }
      
      if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid filename');
      }

      // Set content in textarea with null check
      const textareaElement = contentRef.current;
      if (textareaElement) {
        textareaElement.value = content;
        handleContentInput();
      } else {
        console.warn('Textarea ref is null, content not set in DOM');
      }
      
      setUploadedFilename(filename);

      // Auto-fill title if empty with additional safety checks
      const currentTitle = form.getValues("title");
      if (!currentTitle && filename.trim().length > 0) {
        try {
          // Improved regex to handle edge cases: matches dot followed by extension at end of string
          // Handles cases like: "file.txt", "archive.tar.gz", ".hidden", "file.", "file"
          const nameWithoutExt = filename.replace(/\.[^./\\]*$/, "").trim();
          
          // Only set title if we have a meaningful name after processing
          if (nameWithoutExt.length > 0 && nameWithoutExt.length <= 100) {
            form.setValue("title", nameWithoutExt);
          }
        } catch (titleError) {
          console.warn('Failed to extract title from filename:', titleError);
        }
      }

      // Detect and set language automatically with error handling
      try {
        const detection = detectLanguage(filename, content);
        if (detection && detection.language) {
          form.setValue("language", detection.language);
          
          // Show success notification
          const languageDisplayName = getLanguageDisplayName(detection.language);
          toast.success(
            `File "${filename}" uploaded successfully! Detected language: ${languageDisplayName}`
          );
        } else {
          // Fallback if language detection fails
          form.setValue("language", "plain");
          toast.success(`File "${filename}" uploaded successfully!`);
        }
      } catch (languageError) {
        console.warn('Language detection failed:', languageError);
        form.setValue("language", "plain");
        toast.success(`File "${filename}" uploaded successfully!`);
      }
    } catch (error) {
      console.error('File selection handling failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process uploaded file');
    }
  };

  const handleFileError = (error: string) => {
    // Ensure error is properly handled and logged
    const errorMessage = error || 'Unknown file upload error';
    console.error('File upload error:', errorMessage);
    toast.error(errorMessage);
  };

  const switchToTypeMode = () => {
    setInputMode("type");
    setUploadedFilename("");
  };

  const switchToUploadMode = () => {
    if (isAuthenticated) {
      setInputMode("upload");
    } else {
      toast.error('Please sign in to upload files');
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