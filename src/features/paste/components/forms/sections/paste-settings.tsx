"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/dupui/form";
import { Combobox } from "@/shared/components/dupui/combobox";
import {
  PASTE_VISIBILITY,
  SUPPORTED_LANGUAGES,
} from "@/shared/lib/constants";
import {
  ClockFading,
  FileText,
  EyeOff,
  Globe,
  Lock,
  MessageCircle,
  Tags,
} from "lucide-react";
import { Textarea } from "@/shared/components/dupui/textarea";
import { TagsInput } from "../../ui/tags-input";
import { usePasteForm } from "../hooks/use-paste-form";

interface PasteSettingsProps {
  form: ReturnType<typeof usePasteForm>["form"];
  isAuthenticated: boolean;
  isMobile?: boolean;
}

export function PasteSettings({
  form,
  isAuthenticated,
  isMobile = false,
}: PasteSettingsProps) {
  // Language options
  const languageOptions = SUPPORTED_LANGUAGES.map(lang => ({
    value: lang,
    label: lang.charAt(0).toUpperCase() + lang.slice(1),
    icon: <FileText className="h-4 w-4" />
  }));

  // Visibility options  
  const visibilityOptions = [
    {
      value: PASTE_VISIBILITY.PUBLIC,
      label: "Public",
      icon: <Globe className="h-4 w-4" />
    },
    {
      value: PASTE_VISIBILITY.UNLISTED,
      label: "Unlisted", 
      icon: <EyeOff className="h-4 w-4" />
    },
    {
      value: PASTE_VISIBILITY.PRIVATE,
      label: `Private${!isAuthenticated ? " ⭐" : ""}`,
      icon: <Lock className="h-4 w-4" />,
      disabled: !isAuthenticated
    }
  ];

  // Expiration options
  const expirationOptions = [
    { value: "30m", label: "30 minutes", icon: <ClockFading className="h-4 w-4" /> },
    { value: "1h", label: `1 hour${!isAuthenticated ? " ⭐" : ""}`, icon: <ClockFading className="h-4 w-4" />, disabled: !isAuthenticated },
    { value: "1d", label: `1 day${!isAuthenticated ? " ⭐" : ""}`, icon: <ClockFading className="h-4 w-4" />, disabled: !isAuthenticated },
    { value: "7d", label: `7 days${!isAuthenticated ? " ⭐" : ""}`, icon: <ClockFading className="h-4 w-4" />, disabled: !isAuthenticated },
    { value: "never", label: `Never${!isAuthenticated ? " ⭐" : ""}`, icon: <ClockFading className="h-4 w-4" />, disabled: !isAuthenticated }
  ];

  return (
    <div className="space-y-6">
      {/* Comment */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              Comment
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Optional comment on your paste..."
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
              <Tags className="h-4 w-4 text-muted-foreground" />
              Tags
            </FormLabel>
            <FormControl>
              <TagsInput
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Optional tags to organize..."
                maxTags={5}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Comboboxes Row */}
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'grid-cols-3 gap-6'}`}>
      {/* Language */}
      <FormField
        control={form.control}
        name="language"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Combobox
                options={languageOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Language</span>
                  </div>
                }
                className="w-40 h-10"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Visibility */}
      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Combobox
                options={visibilityOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Visibility</span>
                  </div>
                }
                className="w-40 h-10"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Expires */}
      <FormField
        control={form.control}
        name="expiresIn"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Combobox
                options={expirationOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClockFading className="h-4 w-4" />
                    <span>Expires</span>
                  </div>
                }
                className="w-40 h-10"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      </div>
    </div>
  );
}