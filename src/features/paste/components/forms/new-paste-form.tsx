"use client";

import { usePasteForm } from "@/features/paste/components/forms/hooks/use-paste-form";
import { AuthNotice } from "@/features/paste/components/forms/sections/auth-notice";
import { PasteMainContent } from "@/features/paste/components/forms/sections/paste-main-content";
import { PasteSettingsDrawer } from "@/features/paste/components/forms/sections/paste-settings-drawer";
import { PasteSettingsSidebar } from "@/features/paste/components/forms/sections/paste-settings-sidebar";
import { Badge } from "@/shared/components/dupui/badge";
import { Button } from "@/shared/components/dupui/button";
import { Form } from "@/shared/components/dupui/form";
import { ClipboardPenLine, Globe, Loader, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewPasteForm() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const formHook = usePasteForm({
    initialContent: "",
    editingPaste: null,
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const {
    form,
    isPending,
    showPassword,
    setShowPassword,
    urlAvailability,
    charLimit,
    isAuthenticated,
    contentRef,
    contentLength,
    handleContentInput,
    onSubmit,
    isSubmitDisabled,
  } = formHook;

  const handleCancel = () => {
    const hasContent = contentRef.current?.value?.trim();
    const hasFormData = form.getValues("title") || form.getValues("description");
    
    if (hasContent || hasFormData) {
      const confirmed = window.confirm("Are you sure you want to discard your changes?");
      if (!confirmed) return;
    }
    
    router.back();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <ClipboardPenLine />
            <h1 className="text-lg font-semibold">New Paste</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <Globe className="h-2.5 w-2.5 mr-1" />
                  Guest Mode
                </Badge>
              )}
              {form.watch("burnAfterRead") && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  Burn After Read
                </Badge>
              )}
            </div>

            {/* Mobile Settings Drawer */}
            <PasteSettingsDrawer
              form={form}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              urlAvailability={urlAvailability}
              isEditing={false}
              isAuthenticated={isAuthenticated}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
            />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="h-9 px-3 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="paste-form"
                disabled={isSubmitDisabled}
                className="h-9 px-4 text-sm"
              >
                {isPending ? (
                  <>
                    <Loader className="h-3 w-3 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Paste"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Notice */}
      <AuthNotice isAuthenticated={isAuthenticated} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Form {...form}>
          <form
            id="paste-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex overflow-hidden"
          >
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <PasteMainContent
                form={form}
                contentRef={contentRef}
                contentLength={contentLength}
                handleContentInput={handleContentInput}
                charLimit={charLimit}
              />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <PasteSettingsSidebar
                form={form}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                urlAvailability={urlAvailability}
                isEditing={false}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </form>
        </Form>
      </div>

      {/* Footer with character count and actions - Mobile only */}
      <div className="border-t bg-background p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {contentLength} characters
            {charLimit && ` / ${charLimit.toLocaleString()}`}
          </p>
        </div>
      </div>
    </div>
  );
}