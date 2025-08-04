"use client";

import { Badge } from "@/shared/components/dupui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dupui/dialog";
import { ScrollArea } from "@/shared/components/dupui/scroll-area";
import { Code, Globe, Zap } from "lucide-react";
import { usePasteForm } from "./hooks/use-paste-form";
import { PasteFormContent } from "./paste-form-content";
import { PasteFormFooter } from "./paste-form-footer";

interface EditingPaste {
  id: string;
  title: string | null;
  description: string | null;
  content: string;
  language: string;
  visibility: string;
  burnAfterRead: boolean;
  burnAfterReadViews: number | null;
  expiresAt: Date | null;
  hasPassword: boolean;
  qrCodeColor: string | null;
  qrCodeBackground: string | null;
  tags?: Array<{ name: string }>;
}

interface PasteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
  editingPaste?: EditingPaste | null;
}

export function PasteFormDialog({
  open,
  onOpenChange,
  initialContent = "",
  editingPaste = null,
}: PasteFormDialogProps) {
  const formHook = usePasteForm({
    initialContent,
    editingPaste,
    onSuccess: () => onOpenChange(false),
  });

  const {
    form,
    isPending,
    showPassword,
    setShowPassword,
    urlAvailability,
    charLimit,
    isEditing,
    isAuthenticated,
    contentRef,
    contentLength,
    handleContentInput,
    watchedVisibility,
    watchedBurnAfterRead,
    onSubmit,
    isSubmitDisabled,
  } = formHook;

  const HeaderContent = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-base sm:text-lg">
        <Code className="h-4 w-4" />
        <span>{isEditing ? "Edit Paste" : "Create Paste"}</span>
      </div>
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
            Burn After Read
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full max-h-[85vh] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0 gap-0 flex flex-col">
        <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b space-y-2 shrink-0">
          <DialogTitle asChild>
            <HeaderContent />
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(85vh-120px)]">
            <PasteFormContent
              form={form}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              urlAvailability={urlAvailability}
              charLimit={charLimit}
              isEditing={isEditing}
              isAuthenticated={isAuthenticated}
              contentRef={contentRef}
              contentLength={contentLength}
              handleContentInput={handleContentInput}
              isMobile={false}
            />
          </ScrollArea>
        </div>

        <PasteFormFooter
          form={form}
          isPending={isPending}
          isEditing={isEditing}
          watchedVisibility={watchedVisibility}
          watchedBurnAfterRead={watchedBurnAfterRead}
          onSubmit={form.handleSubmit(onSubmit)}
          isSubmitDisabled={isSubmitDisabled}
          onCancel={() => onOpenChange(false)}
          isMobile={false}
        />
      </DialogContent>
    </Dialog>
  );
}
