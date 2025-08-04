"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/dupui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dupui/dialog";
import { Label } from "@/shared/components/dupui/label";
import { QrCode, Download, Copy } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { toast } from "sonner";
import type { QRCodeDialogProps } from "../types";

const COLOR_PRESETS = [
  { name: "Classic", foreground: "#000000", background: "#ffffff" },
  { name: "Blue Ocean", foreground: "#1e40af", background: "#dbeafe" },
  { name: "Forest", foreground: "#166534", background: "#dcfce7" },
  { name: "Sunset", foreground: "#dc2626", background: "#fef2f2" },
  { name: "Purple", foreground: "#7c3aed", background: "#f3e8ff" },
  { name: "Dark Mode", foreground: "#ffffff", background: "#1f2937" },
];


export function QRCodeDialog({ 
  open, 
  onOpenChange, 
  url, 
  initialColor = "#000000", 
  initialBackground = "#ffffff",
  onColorsChange,
  isAuthenticated
}: QRCodeDialogProps) {
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(-1); // -1 for custom
  const [customColors, setCustomColors] = useState({
    foreground: initialColor,
    background: initialBackground,
  });
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Initialize colors from props when dialog opens
  useEffect(() => {
    if (open) {
      setCustomColors({
        foreground: initialColor,
        background: initialBackground,
      });
      
      // Find matching preset or set to custom
      const matchingPreset = COLOR_PRESETS.findIndex(
        preset => preset.foreground === initialColor && preset.background === initialBackground
      );
      setSelectedPreset(matchingPreset >= 0 ? matchingPreset : -1);
    }
  }, [open, initialColor, initialBackground]);

  // Initialize and update QR code
  useEffect(() => {
    if (!open || !url) return;

    let isCancelled = false;

    // Create new QR code instance
    const qr = new QRCodeStyling({
      width: 180,
      height: 180,
      type: "svg",
      data: url,
      image: "/qr-avatar.png",
      dotsOptions: {
        color: customColors.foreground,
        type: "square",
      },
      backgroundOptions: {
        color: customColors.background,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 8,
        imageSize: 0.45,
      },
      cornersSquareOptions: {
        type: "square",
        color: customColors.foreground,
      },
      cornersDotOptions: {
        type: "square",
        color: customColors.foreground,
      },
    });

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (isCancelled) return;
      
      const qrContainer = qrContainerRef.current;
      if (qrContainer) {
        // Clear container
        qrContainer.innerHTML = '';
        // Append QR code
        qr.append(qrContainer);
        setQrCode(qr);
      }
    }, 50);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [open, url, customColors]);

  // Clean up when dialog closes
  useEffect(() => {
    if (!open) {
      const container = qrContainerRef.current;
      if (container) {
        container.innerHTML = '';
      }
      setQrCode(null);
    }
  }, [open]);

  const handlePresetChange = (presetIndex: number) => {
    setSelectedPreset(presetIndex);
    const newColors = {
      foreground: COLOR_PRESETS[presetIndex].foreground,
      background: COLOR_PRESETS[presetIndex].background,
    };
    setCustomColors(newColors);
    onColorsChange?.(newColors.foreground, newColors.background);
  };

  const handleCustomColorChange = (type: 'foreground' | 'background', color: string) => {
    const newColors = {
      ...customColors,
      [type]: color,
    };
    setCustomColors(newColors);
    setSelectedPreset(-1); // Set to custom when manually changing colors
    onColorsChange?.(newColors.foreground, newColors.background);
  };

  const handleDownload = () => {
    if (!qrCode) return;
    
    qrCode.download({
      name: `qr-code-${Date.now()}`,
      extension: "png",
    });
    toast.success("QR code downloaded successfully!");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </DialogTitle>
          <DialogDescription>
            Customize your QR code appearance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* QR Code Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">QR Code Preview</Label>
              {/* Download and Copy Icons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!qrCode}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center items-center bg-white rounded-lg border-2 border-dashed border-border p-6 min-h-[220px]">
              <div ref={qrContainerRef} className="flex justify-center" />
            </div>
          </div>

          {/* QR Code Color */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              QR Code Color
            </Label>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customColors.foreground}
                    onChange={(e) => handleCustomColorChange('foreground', e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColors.foreground}
                    onChange={(e) => handleCustomColorChange('foreground', e.target.value)}
                    className="w-20 px-2 py-1 text-xs border rounded"
                  />
                </div>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((preset, index) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetChange(index)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedPreset === index ? "border-primary ring-2 ring-primary/20" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: preset.foreground }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 opacity-60">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded border bg-muted cursor-not-allowed" />
                  <div className="w-20 px-2 py-1 text-xs border rounded bg-muted cursor-not-allowed text-center text-muted-foreground">
                    #000000
                  </div>
                </div>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      disabled
                      className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-not-allowed opacity-50"
                      style={{ backgroundColor: preset.foreground }}
                      title={`${preset.name} - Sign in to customize`}
                    />
                  ))}
                </div>
              </div>
            )}
            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground">
                Sign in to customize QR code colors and themes
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={() => {
              onColorsChange?.(customColors.foreground, customColors.background);
              toast.success("QR code customization saved!");
              onOpenChange(false);
            }}
            disabled={!isAuthenticated}
            className={!isAuthenticated ? "cursor-not-allowed" : ""}
          >
            {!isAuthenticated ? "Sign in to save changes" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}