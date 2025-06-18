"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/dupui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/dupui/select";
import {
  PASTE_VISIBILITY,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
import {
  Calendar,
  Code,
  Eye,
  EyeOff,
  Globe,
  Lock,
} from "lucide-react";
import { usePasteForm } from "../hooks/use-paste-form";

interface BasicSettingsProps {
  form: ReturnType<typeof usePasteForm>["form"];
  isAuthenticated: boolean;
  isMobile?: boolean;
}

export function BasicSettings({
  form,
  isAuthenticated,
  isMobile = false,
}: BasicSettingsProps) {
  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'sm:grid-cols-3 gap-4'}`}>
      {/* Language */}
      <FormField
        control={form.control}
        name="language"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm flex items-center gap-1.5">
              <Code className="h-3 w-3" />
              Language
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <FormLabel className="text-sm flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              Visibility
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={PASTE_VISIBILITY.PUBLIC}>
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value={PASTE_VISIBILITY.UNLISTED}>
                  <div className="flex items-center gap-2">
                    <EyeOff className="h-3 w-3" />
                    <span>Unlisted</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value={PASTE_VISIBILITY.PRIVATE}
                  disabled={!isAuthenticated}
                >
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    <span>Private {!isAuthenticated && "⭐"}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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
            <FormLabel className="text-sm flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Expires
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="30m">30 minutes</SelectItem>
                <SelectItem value="1h" disabled={!isAuthenticated}>
                  1 hour {!isAuthenticated && "⭐"}
                </SelectItem>
                <SelectItem value="1d" disabled={!isAuthenticated}>
                  1 day {!isAuthenticated && "⭐"}
                </SelectItem>
                <SelectItem value="7d" disabled={!isAuthenticated}>
                  7 days {!isAuthenticated && "⭐"}
                </SelectItem>
                <SelectItem
                  value="never"
                  disabled={!isAuthenticated}
                >
                  Never {!isAuthenticated && "⭐"}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}