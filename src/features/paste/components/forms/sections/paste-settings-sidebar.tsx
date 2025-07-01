"use client";

import { Settings, Flame, QrCode } from "lucide-react";
import { usePasteForm } from "../hooks/use-paste-form";
import { SecuritySettings } from "./security-settings";
import { PasteSettings } from "./paste-settings";
import { ThemeSwitch } from "@/shared/components/theme/theme-switch";
import { Button } from "@/shared/components/dupui/button";
import { BurnAfterReadDialog } from "../dialogs/burn-after-read-dialog";
import { QRCodeDialog } from "../dialogs/qr-code-dialog";
import { useState } from "react";

interface PasteSettingsSidebarProps {
  form: ReturnType<typeof usePasteForm>["form"];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: ReturnType<typeof usePasteForm>["urlAvailability"];
  isEditing: boolean;
  isAuthenticated: boolean;
}

export function PasteSettingsSidebar({
  form,
  showPassword,
  setShowPassword,
  urlAvailability,
  isEditing,
  isAuthenticated,
}: PasteSettingsSidebarProps) {
  const [burnDialogOpen, setBurnDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Get current burn after read status for button display
  const burnAfterRead = form.watch("burnAfterRead");
  const burnAfterReadViews = form.watch("burnAfterReadViews");
  
  const getBurnButtonText = () => {
    if (!burnAfterRead) return "Burn After Read";
    return `${burnAfterReadViews} view${burnAfterReadViews !== 1 ? 's' : ''}`;
  };

  // Generate paste URL for QR code (will use actual URL after paste creation)
  const customUrl = form.watch("customUrl");
  const pasteUrl = customUrl 
    ? `https://dup.it/p/${customUrl}`
    : "https://dup.it/p/preview";
  return (
    <div className="w-[32rem] xl:w-[36rem] border-l bg-muted/30 flex flex-col h-full">
      <div className="p-6 border-b bg-background/50">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Settings className="h-5 w-5" />
          Paste Settings
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 border-b">
          <PasteSettings
            form={form}
            isAuthenticated={isAuthenticated}
            isMobile={false}
          />
        </div>

        <div className="p-6 pb-20">
          <SecuritySettings
            form={form}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            urlAvailability={urlAvailability}
            isEditing={isEditing}
            isAuthenticated={isAuthenticated}
            isMobile={false}
          />
        </div>
      </div>

      {/* Footer - Controls */}
      <div className="border-t bg-background/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Burn After Read Button */}
            <Button
              type="button"
              variant={burnAfterRead ? "default" : "outline"}
              onClick={() => setBurnDialogOpen(true)}
              className="w-40 justify-start gap-2 h-10"
            >
              <Flame className={`h-4 w-4 ${burnAfterRead ? "text-white" : "text-muted-foreground"}`} />
              <span className="truncate">{getBurnButtonText()}</span>
            </Button>

            {/* QR Code Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setQrDialogOpen(true)}
              className="w-32 justify-start gap-2 h-10"
            >
              <QrCode className="h-4 w-4 text-muted-foreground" />
              <span>QR Code</span>
            </Button>
          </div>
          
          {/* Theme Toggle - Far Right */}
          <ThemeSwitch />
        </div>
      </div>

      {/* Dialogs */}
      <BurnAfterReadDialog
        open={burnDialogOpen}
        onOpenChange={setBurnDialogOpen}
        form={form}
      />
      
      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        url={pasteUrl}
      />
    </div>
  );
}
