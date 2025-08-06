"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/dupui/sheet";
import { Button } from "@/shared/components/dupui/button";
import { Form } from "@/shared/components/dupui/form";
import { Settings } from "lucide-react";
import { PasteSettings } from "./paste-settings";
import { SecuritySettings } from "./security-settings";
import type { PasteSettingsDrawerProps } from "../types";

export function PasteSettingsDrawer({
  form,
  showPassword,
  setShowPassword,
  urlAvailability,
  isEditing,
  isAuthenticated,
  currentSlug,
  open,
  onOpenChange,
}: PasteSettingsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          type="button"
          variant="outline" 
          size="sm"
          className="lg:hidden"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Paste Settings
          </SheetTitle>
        </SheetHeader>
        
        <Form {...form}>
          <div className="overflow-y-auto text-sm flex-1">
            <div className="p-4 border-b">
              <PasteSettings
                form={form}
                isAuthenticated={isAuthenticated}
                isMobile={true}
              />
            </div>

            <div className="p-4">
              <SecuritySettings
                form={form}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                urlAvailability={urlAvailability}
                isEditing={isEditing}
                isAuthenticated={isAuthenticated}
                currentSlug={currentSlug}
                isMobile={true}
              />
            </div>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  );
}