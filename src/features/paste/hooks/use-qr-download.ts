"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/utils/url";

export function useQrDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadQrCode = async (slug: string, title?: string | null) => {
    try {
      setIsGenerating(true);
      const pasteUrl = `${getBaseUrl()}/p/${slug}`;
      
      const dataUrl = await QRCode.toDataURL(pasteUrl, {
        width: 512, // Higher resolution for download
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });

      // Create download link
      const link = document.createElement('a');
      const filename = title 
        ? `qr-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${slug}.png`
        : `qr-${slug}.png`;
      
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('QR code downloaded successfully');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to download QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  return { downloadQrCode, isGenerating };
}