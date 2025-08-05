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
import { sanitizeQRUrl, validateColorContrast } from "@/shared/lib/url-sanitization";
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

    // Sanitize URL before using in QR code
    const urlValidation = sanitizeQRUrl(url);
    if (!urlValidation.isValid) {
      console.error('Invalid URL for QR code:', urlValidation.error);
      toast.error(urlValidation.error || 'Invalid URL for QR code');
      return;
    }

    // Validate color contrast
    const contrastValidation = validateColorContrast(customColors.foreground, customColors.background);
    if (!contrastValidation.isValid) {
      console.warn('Color contrast warning:', contrastValidation.error);
      // Don't block QR generation for contrast issues, just warn
    }

    const sanitizedUrl = urlValidation.sanitizedUrl || url;

    // Create new QR code instance
    const qr = new QRCodeStyling({
      width: 180,
      height: 180,
      type: "svg",
      data: sanitizedUrl,
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
      
      try {
        const qrContainer = qrContainerRef.current;
        if (!qrContainer) {
          console.warn('QR container ref is null, skipping QR code generation');
          return;
        }

        // Verify container is still attached to DOM
        if (!document.contains(qrContainer)) {
          console.warn('QR container is detached from DOM, skipping QR code generation');
          return;
        }

        // Clear container safely
        while (qrContainer.firstChild) {
          qrContainer.removeChild(qrContainer.firstChild);
        }
        
        // Append QR code with additional error handling
        qr.append(qrContainer);
        
        // Verify QR code was actually rendered
        if (qrContainer.children.length === 0) {
          throw new Error('QR code failed to render - no content generated');
        }
        
        setQrCode(qr);
      } catch (error) {
        console.error('Failed to render QR code:', error);
        toast.error('Failed to generate QR code. Please try again.');
        
        // Reset QR code state on error
        setQrCode(null);
        
        // Clear container on error
        const container = qrContainerRef.current;
        if (container) {
          container.innerHTML = '<div class="text-muted-foreground text-sm">Failed to generate QR code</div>';
        }
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
      // Safe cleanup
      try {
        const container = qrContainerRef.current;
        if (container && document.contains(container)) {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }
      } catch (error) {
        console.warn('Error during QR container cleanup:', error);
      }
      
      setQrCode(null);
    }
  }, [open]);

  const handlePresetChange = (presetIndex: number) => {
    // Validate array bounds to prevent runtime exceptions
    if (presetIndex < 0 || presetIndex >= COLOR_PRESETS.length) {
      console.error(`Invalid preset index: ${presetIndex}. Valid range: 0-${COLOR_PRESETS.length - 1}`);
      toast.error('Invalid color preset selected');
      return;
    }

    const preset = COLOR_PRESETS[presetIndex];
    if (!preset) {
      console.error(`Preset not found at index: ${presetIndex}`);
      toast.error('Color preset not found');
      return;
    }

    // Validate color contrast before applying
    const contrastValidation = validateColorContrast(preset.foreground, preset.background);
    if (!contrastValidation.isValid) {
      toast.error(contrastValidation.error || 'Invalid color combination');
      return;
    }

    setSelectedPreset(presetIndex);
    const newColors = {
      foreground: preset.foreground,
      background: preset.background,
    };
    setCustomColors(newColors);
    onColorsChange?.(newColors.foreground, newColors.background);
  };

  const handleCustomColorChange = (type: 'foreground' | 'background', color: string) => {
    const newColors = {
      ...customColors,
      [type]: color,
    };

    // Validate color contrast
    const contrastValidation = validateColorContrast(newColors.foreground, newColors.background);
    if (!contrastValidation.isValid) {
      toast.error(contrastValidation.error || 'Invalid color combination');
      return;
    }

    setCustomColors(newColors);
    setSelectedPreset(-1); // Set to custom when manually changing colors
    onColorsChange?.(newColors.foreground, newColors.background);
  };

  const handleDownload = () => {
    if (!qrCode) {
      toast.error('No QR code available to download');
      return;
    }
    
    try {
      qrCode.download({
        name: `qr-code-${Date.now()}`,
        extension: "png",
      });
      toast.success("QR code downloaded successfully!");
    } catch (error) {
      console.error('QR code download failed:', error);
      toast.error('Failed to download QR code. Please try again.');
    }
  };

  const handleCopyUrl = async () => {
    if (!url) {
      toast.error('No URL available to copy');
      return;
    }

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      
      // Fallback to legacy method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("URL copied to clipboard!");
      } catch (fallbackError) {
        console.error("Fallback copy method also failed:", fallbackError);
        toast.error("Failed to copy URL. Please manually copy the URL.");
      }
    }
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
                      type="button"
                      onClick={() => handlePresetChange(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePresetChange(index);
                        }
                      }}
                      className={`w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        selectedPreset === index ? "border-primary ring-2 ring-primary/20" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: preset.foreground }}
                      title={preset.name}
                      aria-label={`Apply ${preset.name} color preset`}
                      aria-pressed={selectedPreset === index}
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
                      type="button"
                      disabled
                      className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-not-allowed opacity-50 focus:outline-none"
                      style={{ backgroundColor: preset.foreground }}
                      title={`${preset.name} - Sign in to customize`}
                      aria-label={`${preset.name} color preset - Sign in to customize`}
                      aria-disabled="true"
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