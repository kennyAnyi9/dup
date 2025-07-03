"use client";

import { Button } from "@/shared/components/dupui/button";
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
  Link2,
  Loader,
  LockKeyhole,
} from "lucide-react";
import { usePasteForm } from "../hooks/use-paste-form";

interface SecuritySettingsProps {
  form: ReturnType<typeof usePasteForm>["form"];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: ReturnType<typeof usePasteForm>["urlAvailability"];
  isEditing: boolean;
  isAuthenticated: boolean;
  isMobile?: boolean;
}

export function SecuritySettings({
  form,
  showPassword,
  setShowPassword,
  urlAvailability,
  isEditing,
  isAuthenticated,
  isMobile = false,
}: SecuritySettingsProps) {
  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      {/* Password Protection */}
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-muted-foreground" />
              Encrypt
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Optional password protection..."
                  className="h-10 pr-10"
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`absolute right-0 top-0 ${
                    isMobile ? "h-8 w-8" : "h-9 w-9"
                  } hover:bg-transparent`}
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
              <FormLabel className="text-sm font-medium flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                Link
              </FormLabel>
              <FormControl>
                <div className="relative flex rounded-md">
                  <div className="z-[1]">
                    <div className="inline-flex items-center whitespace-nowrap rounded-md border text-sm border-input bg-background text-foreground h-10 rounded-r-none border-r-transparent justify-start px-3">
                      <div className="min-w-0 truncate text-left text-muted-foreground font-mono">
                        dup.it.com/p/
                      </div>
                    </div>
                  </div>
                  <Input
                    placeholder="Optional custom link"
                    className={`block w-full rounded-r-md rounded-l-none border-l-transparent focus:border-l-input sm:text-sm z-0 focus:z-[1] h-10 ${
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
                  {urlAvailability.error || `${field.value} is already taken`}
                </p>
              )}
              {field.value && urlAvailability.available === true && (
                <p className="text-xs text-green-600">
                  {field.value} is available
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
