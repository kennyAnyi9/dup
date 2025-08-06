"use client";

import { Button } from "@/shared/components/dupui/button";
import { ThemeSwitch } from "@/shared/components/theme/theme-switch";
import { Flame, QrCode, Settings } from "lucide-react";
import { useState } from "react";
import { BurnAfterReadDialog } from "../dialogs/burn-after-read-dialog";
import { QRCodeDialog } from "../dialogs/qr-code-dialog";
import type { PasteSettingsSidebarProps } from "../types";
import { PasteSettings } from "./paste-settings";
import { SecuritySettings } from "./security-settings";

export function PasteSettingsSidebar({
  form,
  showPassword,
  setShowPassword,
  urlAvailability,
  isEditing,
  isAuthenticated,
  currentSlug,
}: PasteSettingsSidebarProps) {
  const [burnDialogOpen, setBurnDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  // Watch QR code colors from form
  const qrCodeColor = form.watch("qrCodeColor");
  const qrCodeBackground = form.watch("qrCodeBackground");

  // Get current burn after read status for button display (removed unused variables)

  const getBurnButtonText = () => {
    return "Burn After Read";
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
            currentSlug={currentSlug}
            isMobile={false}
          />
        </div>
      </div>

      {/* Footer - Controls */}
      <div className="border-t bg-background/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Burn After Read Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => isAuthenticated && setBurnDialogOpen(true)}
              disabled={!isAuthenticated}
              className={`w-40 justify-start gap-2 h-10 ${!isAuthenticated ? "cursor-not-allowed opacity-60" : ""}`}
              title={!isAuthenticated ? "Sign in to use burn after read" : ""}
            >
              <Flame className="h-4 w-4 text-muted-foreground" />
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
        isAuthenticated={isAuthenticated}
      />

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        url={pasteUrl}
        isAuthenticated={isAuthenticated}
        initialColor={qrCodeColor}
        initialBackground={qrCodeBackground}
        onColorsChange={(foreground, background) => {
          form.setValue("qrCodeColor", foreground);
          form.setValue("qrCodeBackground", background);
        }}
      />
    </div>
  );
}
