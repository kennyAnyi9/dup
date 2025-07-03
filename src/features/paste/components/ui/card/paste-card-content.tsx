import { Badge } from "@/shared/components/dupui/badge";
import { Button } from "@/shared/components/dupui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Clipboard,
  Clock,
  CornerDownRight,
  QrCode,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getVisibilityInfo } from "../../../lib/paste-utils";
import { getBaseUrl } from "@/lib/utils/url";
import { useQrDownload } from "../../../hooks/use-qr-download";

interface PasteCardContentProps {
  paste: {
    slug: string;
    title: string | null;
    language: string;
    visibility: string;
    createdAt: Date;
    expiresAt: Date | null;
    burnAfterRead: boolean;
    hasPassword: boolean;
    qrCodeColor?: string | null;
    qrCodeBackground?: string | null;
  };
  displayTitle: string;
  isExpired: boolean;
  copied: boolean;
  onCopyUrl: () => void;
}

export function PasteCardContent({
  paste,
  displayTitle,
  isExpired,
  copied,
  onCopyUrl,
}: PasteCardContentProps) {
  const visibilityInfo = getVisibilityInfo(paste.visibility);
  const { downloadQrCode, isGenerating } = useQrDownload();

  const handleQrDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    downloadQrCode(paste.slug, paste.title, paste.qrCodeColor, paste.qrCodeBackground);
  };

  return (
    <div className="min-w-0 overflow-hidden flex-1">
      {/* Title with action buttons */}
      <div className="flex items-center gap-1 sm:gap-2 mb-1">
        <Link
          href={`/p/${paste.slug}`}
          className="truncate font-semibold text-sm hover:text-primary transition-colors"
        >
          {displayTitle}
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Copy button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopyUrl}
            className="h-6 w-6 p-0 rounded-full border border-border bg-muted hover:bg-muted/80 transition-all duration-200 flex items-center justify-center"
            aria-label="Copy paste URL"
          >
            <div className="relative h-3 w-3 flex items-center justify-center">
              <Clipboard
                className={`h-3 w-3 absolute transition-all duration-300 ${
                  copied
                    ? "scale-0 opacity-0"
                    : "scale-100 opacity-100"
                }`}
              />
              <Check
                className={`h-3 w-3 absolute transition-all duration-300 ${
                  copied
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0"
                }`}
              />
            </div>
          </Button>

          {/* QR Code button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQrDownload}
            disabled={isGenerating}
            className="h-6 w-6 p-0 rounded-full border border-border bg-muted hover:bg-muted/80 transition-all duration-200"
            aria-label="Download QR code"
          >
            {isGenerating ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              <QrCode className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Metadata and status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <a
            href={`${getBaseUrl()}/p/${paste.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-32 truncate text-xs text-muted-foreground underline-offset-4 transition-all hover:text-foreground hover:underline"
          >
            {getBaseUrl().replace(/^https?:\/\//, '')}/p/{paste.slug}
          </a>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(paste.createdAt, {
            addSuffix: true,
          })}
        </span>

        {/* Language badge */}
        <Badge
          variant="outline"
          className="h-4 px-1.5 text-xs font-medium bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/50"
        >
          {paste.language}
        </Badge>

        {/* Visibility badge */}
        <Badge
          variant="outline"
          className={`h-4 px-1.5 text-xs font-medium ${visibilityInfo.className}`}
        >
          <span className="flex items-center gap-1">
            <visibilityInfo.icon className="h-2.5 w-2.5" />
            {visibilityInfo.label}
          </span>
        </Badge>

        {paste.hasPassword && (
          <Badge
            variant="outline"
            className="h-4 px-1.5 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50"
          >
            <Shield className="h-2 w-2 mr-1" />
            Protected
          </Badge>
        )}

        {paste.burnAfterRead && (
          <Badge
            variant="outline"
            className="h-4 px-1.5 text-xs font-medium bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/50"
          >
            <Zap className="h-2 w-2 mr-1" />
            Burn
          </Badge>
        )}

        {isExpired && (
          <Badge
            variant="outline"
            className="h-4 px-1.5 text-xs font-medium bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50"
          >
            <Clock className="h-2 w-2 mr-1" />
            Expired
          </Badge>
        )}

        {paste.expiresAt && !isExpired && (
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">
              Expires{" "}
              {formatDistanceToNow(paste.expiresAt, {
                addSuffix: true,
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}