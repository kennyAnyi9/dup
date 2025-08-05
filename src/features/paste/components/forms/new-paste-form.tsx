"use client";

import { usePasteForm } from "@/features/paste/components/forms/hooks/use-paste-form";
import { AuthNotice } from "@/features/paste/components/forms/sections/auth-notice";
import { DiscardChangesDialog } from "@/features/paste/components/forms/dialogs/discard-changes-dialog";
import { PasteMainContent } from "@/features/paste/components/forms/sections/paste-main-content";
import { PasteSettingsDrawer } from "@/features/paste/components/forms/sections/paste-settings-drawer";
import { PasteSettingsSidebar } from "@/features/paste/components/forms/sections/paste-settings-sidebar";
import { Badge } from "@/shared/components/dupui/badge";
import { Button } from "@/shared/components/dupui/button";
import { Form } from "@/shared/components/dupui/form";
import { Globe, Loader, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewPasteForm() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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
    watchedBurnAfterRead,
    onSubmit,
    isSubmitDisabled,
  } = formHook;

  const handleCancel = () => {
    const hasContent = contentRef.current?.value?.trim();
    const hasFormData = form.getValues("title") || form.getValues("description");
    
    if (hasContent || hasFormData) {
      setShowDiscardDialog(true);
      return;
    }
    
    router.back();
  };

  const handleConfirmDiscard = () => {
    setShowDiscardDialog(false);
    router.back();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div>
            <h1 className="text-base lg:text-lg font-semibold">New Paste</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <Globe className="h-2.5 w-2.5 mr-1" />
                  Guest Mode
                </Badge>
              )}
              {watchedBurnAfterRead && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  {form.watch("burnAfterReadViews")} view{form.watch("burnAfterReadViews") !== 1 ? "s" : ""} then burn
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

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="h-9 px-3 text-sm"
                aria-label="Cancel creating paste"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="paste-form"
                disabled={isSubmitDisabled}
                className="h-9 px-4 text-sm"
                aria-label={isPending ? "Creating paste..." : "Create paste"}
              >
                {isPending ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                    Creating...
                  </>
                ) : (
                  "Create Paste"
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Notice */}
      <AuthNotice isAuthenticated={isAuthenticated} />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        <Form {...form}>
          <form
            id="paste-form"
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              // Only prevent Enter on text-based inputs to avoid interfering with native interactions
              if (e.key === 'Enter' && e.target && e.target !== e.currentTarget) {
                const target = e.target as HTMLInputElement;
                
                // Type guard and check for text-based input types only
                if (target && typeof target.tagName === 'string' && target.tagName.toLowerCase() === 'input') {
                  const inputType = target.type?.toLowerCase() || 'text';
                  
                  // Only prevent Enter for text-based input types
                  const textBasedTypes = ['text', 'password', 'search', 'url', 'email', 'tel'];
                  if (textBasedTypes.includes(inputType)) {
                    e.preventDefault();
                  }
                  // Allow native behavior for checkboxes, radio buttons, buttons, etc.
                }
              }
            }}
            className="flex-1 flex overflow-hidden"
            aria-label="Create new paste"
          >
            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <PasteMainContent
                form={form}
                contentRef={contentRef}
                contentLength={contentLength}
                handleContentInput={handleContentInput}
                charLimit={charLimit}
                isAuthenticated={isAuthenticated}
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
      </main>

      {/* Footer with character count and actions - Mobile only */}
      <div className="border-t bg-background p-4 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs lg:text-sm text-muted-foreground flex-1">
            {contentLength} characters
            {charLimit && ` / ${charLimit.toLocaleString()}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="h-9 px-3 text-sm"
              aria-label="Cancel creating paste"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="paste-form"
              disabled={isSubmitDisabled}
              className="h-9 px-4 text-sm"
              aria-label={isPending ? "Creating paste..." : "Create paste"}
            >
              {isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                "Create Paste"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <DiscardChangesDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleConfirmDiscard}
      />
    </div>
  );
}