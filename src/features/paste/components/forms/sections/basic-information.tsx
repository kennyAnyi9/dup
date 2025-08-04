"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/dupui/form";
import { Input } from "@/shared/components/dupui/input";
import { Textarea } from "@/shared/components/dupui/textarea";
import { Button } from "@/shared/components/dupui/button";
import { FileUpload } from "@/shared/components/dupui/file-upload";
import { Code, Tag, Type, Upload, Edit3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { detectLanguage, getLanguageDisplayName } from "@/shared/lib/language-detection";
import { CharacterCounter } from "../../ui/character-counter";
import { TagsInput } from "../../ui/tags-input";
import type { BasicInformationProps } from "../types";

export function BasicInformation({
  form,
  contentRef,
  contentLength,
  handleContentInput,
  charLimit,
  isMobile = false,
}: BasicInformationProps) {
  const [inputMode, setInputMode] = useState<"type" | "upload">("type");
  const [uploadedFilename, setUploadedFilename] = useState<string>("");
  
  const textareaMinHeight = isMobile ? "min-h-[104px]" : "min-h-[200px]";
  const spacing = isMobile ? "space-y-3" : "space-y-4";

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
    <div className={spacing}>
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={`text-sm font-medium flex items-center gap-1.5`}>
              <Type className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              Title (optional)
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Give your paste a descriptive title..."
                className={`${isMobile ? 'h-8 text-sm' : 'h-9'}`}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description and Tags Row - Stack on mobile for space */}
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'lg:grid-cols-2 gap-4'}`}>
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-sm font-medium flex items-center gap-1.5`}>
                <Type className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                Description (optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of your paste..."
                  className={`${isMobile ? 'h-16 text-sm' : 'h-20'} resize-none`}
                  maxLength={500}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-sm font-medium flex items-center gap-1.5`}>
                <Tag className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                Tags (optional)
              </FormLabel>
              <FormControl>
                <TagsInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Add tags to organize..."
                  maxTags={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={`text-sm font-medium flex items-center gap-1.5`}>
            <Code className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            Content
          </label>
          <div className="flex items-center gap-2">
            <CharacterCounter
              current={contentLength}
              limit={charLimit}
            />
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={inputMode === "type" ? "default" : "outline"}
                size="sm"
                onClick={switchToTypeMode}
                className="h-7 px-2 text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Type
              </Button>
              <Button
                type="button"
                variant={inputMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={switchToUploadMode}
                className="h-7 px-2 text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {inputMode === "upload" ? (
          <FileUpload
            onFileSelect={handleFileSelect}
            onError={handleFileError}
            className="mb-4"
          />
        ) : null}

        {/* Always show textarea, but indicate file source */}
        <div className="relative">
          {uploadedFilename && inputMode === "type" && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md border">
                From: {uploadedFilename}
              </div>
            </div>
          )}
          <Textarea
            ref={contentRef}
            placeholder={inputMode === "upload" ? "File content will appear here..." : "Paste your content here..."}
            className={`${textareaMinHeight} ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed font-mono border rounded-md resize-none`}
            style={{
              height: isMobile ? '112px' : '208px',
            }}
            spellCheck={false}
            onInput={handleContentInput}
            readOnly={inputMode === "upload" && !uploadedFilename}
          />
        </div>
      </div>
    </div>
  );
}