"use client";

import { Form } from "@/shared/components/dupui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/dupui/card";
import { Separator } from "@/shared/components/dupui/separator";
import { Settings } from "lucide-react";
import { usePasteForm } from "./hooks/use-paste-form";
import { AuthNotice } from "./sections/auth-notice";
import { BasicInformation } from "./sections/basic-information";
import { PasteSettings } from "./sections/paste-settings";
import { SecuritySettings } from "./sections/security-settings";

interface PasteFormContentProps {
  form: ReturnType<typeof usePasteForm>["form"];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: ReturnType<typeof usePasteForm>["urlAvailability"];
  charLimit: number | null;
  isEditing: boolean;
  isAuthenticated: boolean;
  contentRef: ReturnType<typeof usePasteForm>["contentRef"];
  contentLength: ReturnType<typeof usePasteForm>["contentLength"];
  handleContentInput: ReturnType<typeof usePasteForm>["handleContentInput"];
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
  contentRef,
  contentLength,
  handleContentInput,
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
            contentRef={contentRef}
            contentLength={contentLength}
            handleContentInput={handleContentInput}
            charLimit={charLimit}
            isAuthenticated={isAuthenticated}
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
              
              {/* Paste Settings */}
              <PasteSettings
                form={form}
                isAuthenticated={isAuthenticated}
                isMobile={isMobile}
              />

              <div className="h-px bg-border" />

              {/* Security Settings */}
              <SecuritySettings
                form={form}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                urlAvailability={urlAvailability}
                isEditing={isEditing}
                isAuthenticated={isAuthenticated}
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
                {/* Paste Settings */}
                <PasteSettings
                  form={form}
                  isAuthenticated={isAuthenticated}
                  isMobile={isMobile}
                />

                <Separator />

                {/* Security Settings */}
                <SecuritySettings
                  form={form}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  urlAvailability={urlAvailability}
                  isEditing={isEditing}
                  isAuthenticated={isAuthenticated}
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