"use client";

import { Button } from "@/shared/components/dupui/button";
import { Checkbox } from "@/shared/components/dupui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/dupui/form";
import { Input } from "@/shared/components/dupui/input";
import {
  Check,
  Eye,
  EyeOff as EyeOffIcon,
  Loader,
  Lock,
  Type,
  Zap,
} from "lucide-react";
import { usePasteForm } from "../hooks/use-paste-form";

interface AdvancedOptionsProps {
  form: ReturnType<typeof usePasteForm>["form"];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: ReturnType<typeof usePasteForm>["urlAvailability"];
  isEditing: boolean;
  isAuthenticated: boolean;
  watchedBurnAfterRead: boolean;
  isMobile?: boolean;
}

export function AdvancedOptions({
  form,
  showPassword,
  setShowPassword,
  urlAvailability,
  isEditing,
  isAuthenticated,
  watchedBurnAfterRead,
  isMobile = false,
}: AdvancedOptionsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">Advanced Options</h4>
      
      <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'sm:grid-cols-2 gap-4'}`}>
        {/* Password Protection */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Password (optional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Protect with password..."
                    className="h-9 pr-8"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Custom URL - Only for authenticated users when creating */}
        {isAuthenticated && !isEditing && (
          <FormField
            control={form.control}
            name="customUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm flex items-center gap-1.5">
                  <Type className="h-3 w-3" />
                  Custom URL (optional)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      /p/
                    </span>
                    <Input
                      placeholder="my-custom-url"
                      className={`h-9 pl-8 pr-8 ${
                        field.value && urlAvailability.available === false
                          ? "border-destructive focus-visible:ring-destructive"
                          : field.value && urlAvailability.available === true
                          ? "border-green-500 focus-visible:ring-green-500"
                          : ""
                      }`}
                      {...field}
                    />
                    {field.value && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {urlAvailability.isChecking ? (
                          <Loader className="h-3 w-3 animate-spin text-muted-foreground" />
                        ) : urlAvailability.available === true ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : urlAvailability.available === false ? (
                          <div className="h-3 w-3 rounded-full bg-destructive" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </FormControl>
                {field.value && urlAvailability.available === false && (
                  <p className="text-xs text-destructive">
                    {urlAvailability.error || "This URL is already taken"}
                  </p>
                )}
                {field.value && urlAvailability.available === true && (
                  <p className="text-xs text-green-600">
                    URL is available
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Burn After Read - Enhanced */}
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="burnAfterRead"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm flex items-center gap-1.5">
                  <Zap className="h-3 w-3" />
                  Burn After Read
                </FormLabel>
                <div className="text-xs text-muted-foreground">
                  Delete after specified views
                </div>
              </div>
            </FormItem>
          )}
        />

        {watchedBurnAfterRead && (
          <FormField
            control={form.control}
            name="burnAfterReadViews"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">
                  Delete after how many views?
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="1"
                    className="h-9"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}