"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Button } from "@/shared/components/dupui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dupui/dialog";
import { 
  Download, 
  Copy, 
  Check,
  QrCode,
  Smartphone 
} from "lucide-react";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/utils/url";

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paste: {
    slug: string;
    title: string | null;
  };
}

export function QRCodeModal({ open, onOpenChange, paste }: QRCodeModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const pasteUrl = `${getBaseUrl()}/p/${paste.slug}`;
  const displayTitle = paste.title || `Untitled Paste`;

  const generateQRCode = useCallback(async () => {
    try {
      setIsGenerating(true);
      const dataUrl = await QRCode.toDataURL(pasteUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, [pasteUrl]);

  useEffect(() => {
    if (open) {
      generateQRCode();
    }
  }, [open, generateQRCode]);

  const handleDownload = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${paste.slug}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded successfully');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code for Paste
          </DialogTitle>
          <DialogDescription>
            Scan this QR code to quickly access your paste on any device
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Paste Info */}
          <div className="text-center space-y-1">
            <h3 className="font-medium text-sm truncate">{displayTitle}</h3>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {pasteUrl}
            </p>
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              {isGenerating ? (
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-64 h-64"
                  width={256}
                  height={256}
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                  Failed to generate QR code
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Smartphone className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">How to use:</p>
              <p>Open your phone&apos;s camera app and point it at the QR code above. Tap the notification that appears to open the paste.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopyUrl}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!qrCodeDataUrl || isGenerating}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}