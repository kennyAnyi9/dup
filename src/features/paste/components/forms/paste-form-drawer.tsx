"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/shared/components/dupui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/dupui/drawer";
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
  tags?: Array<{ name: string }>;
}

interface PasteFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
  editingPaste?: EditingPaste | null;
}

export function PasteFormDrawer({
  open,
  onOpenChange,
  initialContent = "",
  editingPaste = null,
}: PasteFormDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

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
    watchedContent,
    watchedVisibility,
    watchedBurnAfterRead,
    onSubmit,
    isSubmitDisabled,
  } = formHook;

  // Handle drawer visibility with slight delay for smooth animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const HeaderContent = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Code className="h-5 w-5" />
        <span>{isEditing ? "Edit Paste" : "Create Paste"}</span>
      </div>
      <div className="flex items-center gap-2">
        {!isAuthenticated && (
          <Badge variant="outline" className="text-xs px-2 py-1">
            <Globe className="h-3 w-3 mr-1" />
            Guest Mode
          </Badge>
        )}
        {watchedBurnAfterRead && (
          <Badge variant="destructive" className="text-xs px-2 py-1">
            <Zap className="h-3 w-3 mr-1" />
            Burn After Read
          </Badge>
        )}
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[92vh] max-h-[92vh] flex flex-col">
        {/* Fixed Header - More Compact */}
        <DrawerHeader className="px-3 py-2 border-b shrink-0 bg-background">
          <DrawerTitle asChild>
            <HeaderContent />
          </DrawerTitle>
        </DrawerHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full overflow-y-auto touch-pan-y overscroll-contain">
            <PasteFormContent
              form={form}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              urlAvailability={urlAvailability}
              charLimit={charLimit}
              isEditing={isEditing}
              isAuthenticated={isAuthenticated}
              watchedContent={watchedContent}
              watchedBurnAfterRead={watchedBurnAfterRead}
              isMobile={true}
            />
          </ScrollArea>
        </div>

        {/* Fixed Footer - More Compact */}
        <PasteFormFooter
          form={form}
          isPending={isPending}
          isEditing={isEditing}
          watchedVisibility={watchedVisibility}
          watchedBurnAfterRead={watchedBurnAfterRead}
          onSubmit={form.handleSubmit(onSubmit)}
          isSubmitDisabled={isSubmitDisabled}
          onCancel={() => onOpenChange(false)}
          isMobile={true}
        />
      </DrawerContent>
    </Drawer>
  );
}