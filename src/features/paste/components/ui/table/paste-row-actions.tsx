"use client";

import { Button } from "@/shared/components/dupui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/dupui/dropdown-menu";
import {
  Check,
  Clipboard,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  QrCode,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/utils/url";
import { useRouter } from "next/navigation";

interface PasteRowActionsProps {
  paste: {
    id: string;
    slug: string;
    title: string | null;
    description: string | null;
    content: string;
    language: string;
    visibility: string;
    views: number;
    createdAt: Date;
    expiresAt: Date | null;
    burnAfterRead: boolean;
    burnAfterReadViews: number | null;
    qrCodeColor: string | null;
    qrCodeBackground: string | null;
    hasPassword: boolean;
    tags?: Array<{
      id: string;
      name: string;
      slug: string;
      color: string | null;
    }>;
    user?: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  };
  onDelete: (pasteId: string) => void;
  onShowQrCode?: (paste: PasteRowActionsProps["paste"]) => void;
  copied: string | null;
  setCopied: (id: string | null) => void;
}

export function PasteRowActions({
  paste,
  onDelete,
  onShowQrCode,
  copied,
  setCopied,
}: PasteRowActionsProps) {
  const router = useRouter();
  
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(paste.id);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error(`Failed to copy ${type.toLowerCase()}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/p/${paste.slug}/edit`);
  };

  const pasteUrl = `${getBaseUrl()}/p/${paste.slug}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard(pasteUrl, "URL");
          }}
        >
          {copied === paste.id ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Clipboard className="h-4 w-4 mr-2" />
          )}
          Copy URL
        </DropdownMenuItem>
        {onShowQrCode && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onShowQrCode(paste);
            }}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Show QR Code
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            window.open(pasteUrl, "_blank");
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in new tab
        </DropdownMenuItem>
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
        </>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(paste.id);
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}