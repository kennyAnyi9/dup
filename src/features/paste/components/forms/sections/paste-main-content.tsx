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
import { Edit3, Upload } from "lucide-react";
import { useFileUpload } from "../hooks/use-file-upload";
import { CharacterCounter } from "../../ui/character-counter";
import type { PasteMainContentProps } from "../types";

export function PasteMainContent({
  form,
  contentRef,
  contentLength,
  handleContentInput,
  charLimit,
  isAuthenticated,
}: PasteMainContentProps) {
  const {
    inputMode,
    uploadedFilename,
    handleFileSelect,
    handleFileError,
    switchToTypeMode,
    switchToUploadMode,
  } = useFileUpload({
    form,
    contentRef,
    handleContentInput,
    isAuthenticated,
  });

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-hidden">
      {/* Title - Fixed height section */}
      <div className="flex-shrink-0 pb-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                Title
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Give your paste a descriptive title..."
                  className="text-sm h-10 border-2 focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Content - Flexible height section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <label 
            htmlFor="paste-content"
            className="text-sm font-medium flex items-center gap-2"
          >
            Content
          </label>
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <CharacterCounter current={contentLength} limit={charLimit} />
            </div>
            <div 
              className="flex items-center gap-2"
              role="tablist"
              aria-label="Content input method"
            >
              <Button
                type="button"
                variant={inputMode === "type" ? "default" : "outline"}
                size="sm"
                onClick={switchToTypeMode}
                className="h-8 px-3 text-sm"
                role="tab"
                aria-selected={inputMode === "type"}
                aria-controls="content-input-area"
              >
                <Edit3 className="h-4 w-4 mr-1" aria-hidden="true" />
                Text
              </Button>
              <Button
                type="button"
                variant={inputMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={switchToUploadMode}
                disabled={!isAuthenticated}
                className={`h-8 px-3 text-sm ${!isAuthenticated ? "cursor-not-allowed opacity-60" : ""}`}
                role="tab"
                aria-selected={inputMode === "upload"}
                aria-controls="content-input-area"
                title={!isAuthenticated ? "Sign in to upload files" : "Upload files"}
              >
                <Upload className="h-4 w-4 mr-1" aria-hidden="true" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* File Upload Section - Fixed height when visible */}
        {inputMode === "upload" && (
          <div className="flex-shrink-0 mb-4">
            <FileUpload
              onFileSelect={handleFileSelect}
              onError={handleFileError}
            />
          </div>
        )}

        {/* Content Textarea - Takes remaining space with proper overflow */}
        <div 
          className="flex-1 relative min-h-0"
          id="content-input-area"
          role="tabpanel"
          aria-labelledby="paste-content"
        >
          {uploadedFilename && inputMode === "type" && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md border">
                From: {uploadedFilename}
              </div>
            </div>
          )}
          <Textarea
            id="paste-content"
            ref={contentRef}
            placeholder={
              inputMode === "upload"
                ? "File content will appear here..."
                : "Paste or type your content here..."
            }
            className="w-full h-full text-sm leading-relaxed font-mono border-2 focus:border-primary resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent touch-pan-y"
            spellCheck={false}
            onInput={handleContentInput}
            readOnly={inputMode === "upload" && !uploadedFilename}
            aria-describedby={charLimit ? "character-count" : undefined}
            aria-label={`Paste content${charLimit ? `, ${contentLength} of ${charLimit.toLocaleString()} characters used` : ""}`}
          />
        </div>
      </div>
    </div>
  );
}
