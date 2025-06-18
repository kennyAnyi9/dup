"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/dupui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { Badge } from "@/shared/components/dupui/badge";
import { Button } from "@/shared/components/dupui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/dupui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Check,
  Clipboard,
  Clock,
  CornerDownRight,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Loader,
  Lock,
  MoreVertical,
  Pencil,
  QrCode,
  Share,
  Shield,
  Tag,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCopyUrl } from "../../hooks/use-copy-url";
import { usePasteActions } from "../../hooks/use-paste-actions";
import { getVisibilityInfo } from "../../lib/paste-utils";
import { getBaseUrl } from "@/lib/utils/url";

interface PasteCardViewProps {
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
  onEdit?: (paste: PasteCardViewProps["paste"]) => void;
  isSelected?: boolean;
  onSelect?: (pasteId: string, selected: boolean) => void;
}

export function PasteCardView({
  paste,
  onEdit,
  isSelected,
  onSelect,
}: PasteCardViewProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { copied, copyUrl } = useCopyUrl();
  const { isDeleting, handleDelete } = usePasteActions();

  const isExpired = paste.expiresAt && new Date() > paste.expiresAt;
  const displayTitle = paste.title || `Untitled ${paste.language}`;

  const handleCopyUrl = () => copyUrl(paste.slug);

  const handleDeletePaste = async () => {
    await handleDelete(paste.id);
    setShowDeleteDialog(false);
    router.refresh();
  };

  const handleEditPaste = () => {
    if (onEdit) {
      onEdit(paste);
    }
  };

  const visibilityInfo = getVisibilityInfo(paste.visibility);

  const formatViews = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <>
      <div
        className={`relative flex items-stretch justify-between gap-2 rounded-xl border border-border bg-background p-3 max-w-full transition-all duration-200 hover:bg-accent/50 ${
          isExpired ? "opacity-60" : ""
        } ${
          isSelected
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
            : ""
        }`}
      >
                {/* Left section with avatar, title, and metadata */}
                <div className="flex min-w-0 items-center gap-x-3 flex-1">
                  {/* Avatar/User */}
                  {paste.user ? (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={paste.user.image || undefined}
                        alt={paste.user.name}
                      />
                      <AvatarFallback className="text-xs bg-muted">
                        {paste.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex-none rounded-full border border-border bg-gradient-to-t from-muted p-2">
                      <div className="h-6 w-6 rounded-full bg-muted-foreground/20" />
                    </div>
                  )}

                  {/* Title and metadata */}
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
                          onClick={handleCopyUrl}
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
                          className="h-6 w-6 p-0 rounded-full border border-border bg-muted hover:bg-muted/80 transition-all duration-200"
                          aria-label="Show QR code"
                        >
                          <QrCode className="h-3.5 w-3.5" />
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
                </div>

                {/* Center section with tags */}
                <div className="flex items-center justify-center min-w-0 px-4">
                  {paste.tags && paste.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 justify-center max-w-48">
                      {paste.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="h-4 px-1.5 text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700/50"
                        >
                          <Tag className="h-2 w-2 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                      {paste.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1.5 text-xs font-medium bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50"
                        >
                          +{paste.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Far right section with stats and menu */}
                <div className="flex items-center gap-2">
                  {/* Views/Stats */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-muted transition-colors hover:bg-muted/80">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex items-center whitespace-nowrap text-xs text-muted-foreground">
                      {formatViews(paste.views)}
                      <span className="ml-1 hidden sm:inline-block">views</span>
                    </div>
                  </div>

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
                      <DropdownMenuItem onClick={handleEditPaste}>
                        <Pencil className="h-4 w-4" />
                        Edit Paste
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleCopyUrl}>
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
                      <DropdownMenuItem>
                        <Share className="h-4 w-4" />
                        Share Paste
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Globe className="h-4 w-4" />
                        Change Visibility
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Lock className="h-4 w-4" />
                        Add Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Paste
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Paste
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;
              {displayTitle}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePaste}
              disabled={isDeleting(paste.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting(paste.id) ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-3 w-3 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
