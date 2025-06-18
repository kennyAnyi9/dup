"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/dupui/form";
import { Input } from "@/shared/components/dupui/input";
import { ScrollArea } from "@/shared/components/dupui/scroll-area";
import { Textarea } from "@/shared/components/dupui/textarea";
import { Code, Tag, Type } from "lucide-react";
import { CharacterCounter } from "../../ui/character-counter";
import { TagsInput } from "../../ui/tags-input";
import { usePasteForm } from "../hooks/use-paste-form";

interface BasicInformationProps {
  form: ReturnType<typeof usePasteForm>["form"];
  watchedContent: string;
  charLimit: number | null;
  isMobile?: boolean;
}

export function BasicInformation({
  form,
  watchedContent,
  charLimit,
  isMobile = false,
}: BasicInformationProps) {
  const contentAreaHeight = isMobile ? "h-32" : "h-52";
  const textareaMinHeight = isMobile ? "min-h-[120px]" : "min-h-[200px]";

  return (
    <div className="space-y-4">
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Title (optional)
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Give your paste a descriptive title..."
                className="h-9"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description and Tags Row */}
      <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-4`}>
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Description (optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of your paste..."
                  className="h-20 resize-none"
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
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
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
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <Code className="h-4 w-4" />
                Content
              </FormLabel>
              <CharacterCounter
                current={watchedContent.length}
                limit={charLimit}
              />
            </div>
            <FormControl>
              <ScrollArea className={`${contentAreaHeight} border rounded-md`}>
                <Textarea
                  placeholder="Paste your content here..."
                  className={`${textareaMinHeight} border-0 resize-none focus-visible:ring-0 font-mono text-sm leading-relaxed`}
                  {...field}
                />
              </ScrollArea>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}