"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/shared/components/dupui/input";
import { X, Tag } from "lucide-react";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

export function TagsInput({ 
  value = [], 
  onChange, 
  placeholder = "Add tags...", 
  maxTags = 5,
  disabled = false,
  className = ""
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    if (disabled) return;
    const trimmedTag = tag.trim().toLowerCase();
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      value.length < maxTags &&
      trimmedTag.length <= 20 &&
      /^[a-zA-Z0-9-_\s]+$/.test(trimmedTag)
    ) {
      onChange([...value, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={`flex flex-wrap gap-2 min-h-[2.5rem] p-3 border rounded-lg bg-background/50 backdrop-blur-sm transition-all duration-200 ${
        disabled 
          ? "opacity-60 cursor-not-allowed" 
          : "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/20"
      }`}>
        {value.map((tag, index) => (
          <div
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium border border-primary/20 animate-in fade-in-0 zoom-in-95 duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Tag className="h-3 w-3" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className={`ml-0.5 rounded-full p-0.5 transition-colors duration-150 group ${
                disabled ? "cursor-not-allowed" : "hover:bg-primary/20"
              }`}
            >
              <X className={`h-3 w-3 ${disabled ? "" : "group-hover:text-destructive"}`} />
            </button>
          </div>
        ))}
        {value.length < maxTags && !disabled && (
          <div className="flex-1 min-w-[120px]">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              placeholder={value.length === 0 ? placeholder : "Add another tag..."}
              className="border-0 bg-transparent px-2.5 py-1 h-auto focus-visible:ring-0 text-sm placeholder:text-sm placeholder:text-muted-foreground/60"
            />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{value.length}/{maxTags} tags</span>
        <span className="text-muted-foreground/70">Press Enter or comma to add</span>
      </div>
    </div>
  );
}