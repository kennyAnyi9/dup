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
  const contentAreaHeight = isMobile ? "h-28" : "h-52";
  const textareaMinHeight = isMobile ? "min-h-[104px]" : "min-h-[200px]";
  const spacing = isMobile ? "space-y-3" : "space-y-4";

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
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className={`text-sm font-medium flex items-center gap-1.5`}>
                <Code className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
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
                  className={`${textareaMinHeight} border-0 resize-none focus-visible:ring-0 font-mono ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}
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