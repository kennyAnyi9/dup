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
  Download,
  ExternalLink,
  Eye,
  MoreVertical,
  Pencil,
  QrCode,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface PasteCardActionsProps {
  paste: {
    id: string;
    slug: string;
    title: string | null;
    views: number;
  };
  copied: boolean;
  isSelected?: boolean;
  onSelect?: (pasteId: string, selected: boolean) => void;
  onCopyUrl: () => void;
  onDeletePaste: () => void;
  onShowQrCode: () => void;
}

export function PasteCardActions({
  paste,
  copied,
  isSelected,
  onSelect,
  onCopyUrl,
  onDeletePaste,
  onShowQrCode,
}: PasteCardActionsProps) {
  const formatViews = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Views/Stats - Clickable to go to analytics */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="h-auto px-2 py-1 rounded-md border border-border bg-muted transition-colors hover:bg-muted/80 hover:text-primary"
      >
        <Link href={`/dashboard/analytics/${paste.id}`} className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex items-center whitespace-nowrap text-xs text-muted-foreground">
            {formatViews(paste.views)}
            <span className="ml-1 hidden sm:inline-block">views</span>
          </div>
        </Link>
      </Button>

      {/* Selection checkbox (if selectable) */}
      {onSelect && (
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={(e) => onSelect(paste.id, e.target.checked)}
          className="rounded border-border"
          aria-label={`Select paste ${paste.title || paste.slug}`}
        />
      )}

      {/* More options button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 transition-all duration-200 hover:bg-muted/80"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link
              href={`/p/${paste.slug}`}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Paste
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/p/${paste.slug}/edit`}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Paste
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCopyUrl}>
            <div className="relative h-4 w-4 mr-2">
              <Clipboard
                className={`h-4 w-4 absolute transition-all duration-300 ${
                  copied
                    ? "scale-0 opacity-0"
                    : "scale-100 opacity-100"
                }`}
              />
              <Check
                className={`h-4 w-4 absolute transition-all duration-300 ${
                  copied
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0"
                }`}
              />
            </div>
            {copied ? "Copied!" : "Copy URL"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShowQrCode}>
            <QrCode className="h-4 w-4" />
            Show QR Code
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDeletePaste}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete Paste
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}