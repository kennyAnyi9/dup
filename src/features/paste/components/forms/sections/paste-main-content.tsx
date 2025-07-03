"use client";

import { Button } from "@/shared/components/dupui/button";
import { FileUpload } from "@/shared/components/dupui/file-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/dupui/form";
import { Input } from "@/shared/components/dupui/input";
import { Textarea } from "@/shared/components/dupui/textarea";
import {
  detectLanguage,
  getLanguageDisplayName,
} from "@/shared/lib/language-detection";
import { Edit3, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CharacterCounter } from "../../ui/character-counter";
import { usePasteForm } from "../hooks/use-paste-form";

interface PasteMainContentProps {
  form: ReturnType<typeof usePasteForm>["form"];
  contentRef: ReturnType<typeof usePasteForm>["contentRef"];
  contentLength: ReturnType<typeof usePasteForm>["contentLength"];
  handleContentInput: ReturnType<typeof usePasteForm>["handleContentInput"];
  charLimit: number | null;
}

export function PasteMainContent({
  form,
  contentRef,
  contentLength,
  handleContentInput,
  charLimit,
}: PasteMainContentProps) {
  const [inputMode, setInputMode] = useState<"type" | "upload">("type");
  const [uploadedFilename, setUploadedFilename] = useState<string>("");

  const handleFileSelect = (content: string, filename: string) => {
    if (contentRef.current) {
      contentRef.current.value = content;
      handleContentInput();
    }
    setUploadedFilename(filename);

    // Auto-fill title if empty
    if (!form.getValues("title") && filename) {
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      form.setValue("title", nameWithoutExt);
    }

    // Detect and set language automatically
    const detection = detectLanguage(filename, content);
    form.setValue("language", detection.language);

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
    setInputMode("upload");
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-6">
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold flex items-center gap-2">
              Title
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Give your paste a descriptive title..."
                className="text-lg h-12 border-2 focus:border-primary"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />


      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <label className="text-lg font-semibold flex items-center gap-2">
            Content
          </label>
          <div className="flex items-center gap-3">
            <CharacterCounter current={contentLength} limit={charLimit} />
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={inputMode === "type" ? "default" : "outline"}
                size="sm"
                onClick={switchToTypeMode}
                className="h-8 px-3 text-sm"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Type
              </Button>
              <Button
                type="button"
                variant={inputMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={switchToUploadMode}
                className="h-8 px-3 text-sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {inputMode === "upload" && (
          <FileUpload
            onFileSelect={handleFileSelect}
            onError={handleFileError}
            className="mb-4"
          />
        )}

        {/* Content Textarea - Takes remaining space */}
        <div className="flex-1 relative">
          {uploadedFilename && inputMode === "type" && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md border">
                From: {uploadedFilename}
              </div>
            </div>
          )}
          <Textarea
            ref={contentRef}
            placeholder={
              inputMode === "upload"
                ? "File content will appear here..."
                : "Paste or type your content here..."
            }
            className="h-full text-base leading-relaxed font-mono border-2 focus:border-primary resize-none"
            spellCheck={false}
            onInput={handleContentInput}
            readOnly={inputMode === "upload" && !uploadedFilename}
          />
        </div>
      </div>
    </div>
  );
}
