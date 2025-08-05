"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { validateFileType } from "@/shared/lib/file-validation";
import { Button } from "./button";
import { Card } from "./card";
import { Upload, File, X, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (content: string, filename: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeBytes?: number;
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  ".txt", ".md", ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".cpp", ".c", ".h",
  ".css", ".scss", ".sass", ".less", ".html", ".xml", ".json", ".yaml", ".yml",
  ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd", ".php", ".rb", ".go",
  ".rs", ".swift", ".kt", ".dart", ".scala", ".clj", ".hs", ".elm", ".sql",
  ".dockerfile", ".gitignore", ".env", ".conf", ".ini", ".toml", ".lock"
];

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({
  onFileSelect,
  onError,
  accept = DEFAULT_ACCEPTED_TYPES.join(","),
  maxSizeBytes = DEFAULT_MAX_SIZE,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = useCallback(async (file: File) => {
    setIsReading(true);
    
    try {
      // Comprehensive file validation
      const validation = await validateFileType(file);
      if (!validation.isValid) {
        throw new Error(validation.error || "File validation failed");
      }

      // Additional size check (client-side backup)
      if (file.size > maxSizeBytes) {
        throw new Error(`File size exceeds ${Math.round(maxSizeBytes / 1024 / 1024)}MB limit`);
      }

      // Read file content
      const text = await file.text();
      
      setSelectedFile(file);
      onFileSelect(text, file.name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to read file";
      onError?.(errorMessage);
      setSelectedFile(null);
    } finally {
      setIsReading(false);
    }
  }, [maxSizeBytes, onFileSelect, onError]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    handleFileRead(file);
  }, [handleFileRead]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    onFileSelect("", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);


  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      
      {selectedFile ? (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isReading && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!isReading ? handleClick : undefined}
        >
          <div className="p-6 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isReading ? "Reading file..." : "Upload a file"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isReading 
                  ? "Please wait while we process your file"
                  : "Drag and drop or click to select a file"
                }
              </p>
            </div>
            {!isReading && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span>Supports: .txt, .js, .ts, .py, .md and more</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}