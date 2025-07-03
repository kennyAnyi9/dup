"use client";

import { useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/utils/url";

export function useQrDownload() {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadQrCode = async (
    slug: string, 
    title?: string | null,
    qrCodeColor?: string | null,
    qrCodeBackground?: string | null
  ) => {
    try {
      setIsGenerating(true);
      const pasteUrl = `${getBaseUrl()}/p/${slug}`;
      
      // Create QR code with styling consistent with dialog
      const qrCode = new QRCodeStyling({
        width: 512, // Higher resolution for download
        height: 512,
        type: "svg",
        data: pasteUrl,
        image: "/qr-avatar.png",
        dotsOptions: {
          color: qrCodeColor || '#000000',
          type: "square",
        },
        backgroundOptions: {
          color: qrCodeBackground || '#ffffff',
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 8,
          imageSize: 0.45,
        },
        cornersSquareOptions: {
          type: "square",
          color: qrCodeColor || '#000000',
        },
        cornersDotOptions: {
          type: "square",
          color: qrCodeColor || '#000000',
        },
      });

      // Generate filename
      const filename = title 
        ? `qr-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${slug}`
        : `qr-code-${slug}`;

      // Download using qr-code-styling's built-in download
      qrCode.download({
        name: filename,
        extension: "png",
      });
      
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