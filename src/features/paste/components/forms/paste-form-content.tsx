"use client";

import { Form } from "@/shared/components/dupui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/dupui/card";
import { Separator } from "@/shared/components/dupui/separator";
import { Settings } from "lucide-react";
import { usePasteForm } from "./hooks/use-paste-form";
import { AuthNotice } from "./sections/auth-notice";
import { BasicInformation } from "./sections/basic-information";
import { BasicSettings } from "./sections/basic-settings";
import { AdvancedOptions } from "./sections/advanced-options";

interface PasteFormContentProps {
  form: ReturnType<typeof usePasteForm>["form"];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: ReturnType<typeof usePasteForm>["urlAvailability"];
  charLimit: number | null;
  isEditing: boolean;
  isAuthenticated: boolean;
  watchedContent: string;
  watchedBurnAfterRead: boolean;
  isMobile?: boolean;
}

export function PasteFormContent({
  form,
  showPassword,
  setShowPassword,
  urlAvailability,
  charLimit,
  isEditing,
  isAuthenticated,
  watchedContent,
  watchedBurnAfterRead,
  isMobile = false,
}: PasteFormContentProps) {
  return (
    <>
      {/* Auth Notice */}
      <AuthNotice isAuthenticated={isAuthenticated} />

      <Form {...form}>
        <div className={`${isMobile ? 'space-y-3 p-3' : 'space-y-4 p-4'}`}>
          {/* Basic Information Section */}
          <BasicInformation
            form={form}
            watchedContent={watchedContent}
            charLimit={charLimit}
            isMobile={isMobile}
          />

          {isMobile ? (
            <div className="h-px bg-border" />
          ) : (
            <Separator />
          )}

          {/* Settings Section - Simplified for Mobile */}
          {isMobile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Settings className="h-3 w-3" />
                Settings
              </div>
              
              {/* Basic Settings */}
              <BasicSettings
                form={form}
                isAuthenticated={isAuthenticated}
                isMobile={isMobile}
              />

              <div className="h-px bg-border" />

              {/* Advanced Options */}
              <AdvancedOptions
                form={form}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                urlAvailability={urlAvailability}
                isEditing={isEditing}
                isAuthenticated={isAuthenticated}
                watchedBurnAfterRead={watchedBurnAfterRead}
                isMobile={isMobile}
              />
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Settings */}
                <BasicSettings
                  form={form}
                  isAuthenticated={isAuthenticated}
                  isMobile={isMobile}
                />

                <Separator />

                {/* Advanced Options */}
                <AdvancedOptions
                  form={form}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  urlAvailability={urlAvailability}
                  isEditing={isEditing}
                  isAuthenticated={isAuthenticated}
                  watchedBurnAfterRead={watchedBurnAfterRead}
                  isMobile={isMobile}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </Form>
    </>
  );
}