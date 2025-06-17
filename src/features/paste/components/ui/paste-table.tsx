"use client";

import { deletePaste } from "@/app/actions/paste";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Check,
  Clipboard,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Loader,
  Lock,
  MoreHorizontal,
  Pencil,
  Shield,
  Tag,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface PasteTableProps {
  pastes: Array<{
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
  }>;
  onEdit?: (paste: PasteTableProps["pastes"][0]) => void;
  visibleColumns?: {
    avatar: boolean;
    language: boolean;
    status: boolean;
    views: boolean;
    created: boolean;
  };
  selectedPastes?: Set<string>;
  onSelectPaste?: (pasteId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  allSelected?: boolean;
}

export function PasteTable({
  pastes,
  onEdit,
  visibleColumns = {
    avatar: true,
    language: true,
    status: true,
    views: true,
    created: true,
  },
  selectedPastes = new Set(),
  onSelectPaste,
  onSelectAll,
  allSelected = false,
}: PasteTableProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function getVisibilityInfo(visibility: string) {
    switch (visibility) {
      case "public":
        return {
          icon: <Globe className="h-3 w-3" />,
          label: "Public",
          className:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
          dotColor: "bg-green-500",
        };
      case "private":
        return {
          icon: <Lock className="h-3 w-3" />,
          label: "Private",
          className:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
          dotColor: "bg-red-500",
        };
      case "unlisted":
        return {
          icon: <EyeOff className="h-3 w-3" />,
          label: "Unlisted",
          className:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50",
          dotColor: "bg-yellow-500",
        };
      default:
        return {
          icon: <Globe className="h-3 w-3" />,
          label: visibility,
          className: "bg-muted text-muted-foreground border-border",
          dotColor: "bg-muted-foreground",
        };
    }
  }

  async function handleCopyUrl(paste: PasteTableProps["pastes"][0]) {
    try {
      const pasteUrl = `${window.location.origin}/p/${paste.slug}`;
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(paste.id);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
      console.error("Copy failed:", error);
    }
  }

  function handleDelete(pasteId: string) {
    startTransition(async () => {
      try {
        const result = await deletePaste({ id: pasteId });
        if (result.success) {
          toast.success("Paste deleted successfully");
          setShowDeleteDialog(null);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to delete paste");
        }
      } catch (error) {
        toast.error("Failed to delete paste");
        console.error("Delete error:", error);
      }
    });
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table
          className={`${
            Object.values(visibleColumns).some((visible) => visible)
              ? "min-w-[600px]"
              : ""
          }`}
        >
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                {onSelectAll && (
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all pastes"
                  />
                )}
              </TableHead>
              {visibleColumns.avatar && (
                <TableHead className="w-10">Avatar</TableHead>
              )}
              <TableHead className="min-w-0 max-w-xs">Title</TableHead>
              {visibleColumns.language && <TableHead>Language</TableHead>}
              {visibleColumns.status && <TableHead>Status</TableHead>}
              {visibleColumns.views && <TableHead>Reads</TableHead>}
              {visibleColumns.created && <TableHead>Created</TableHead>}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pastes.map((paste) => {
              const isExpired = paste.expiresAt && new Date() > paste.expiresAt;
              const visibilityInfo = getVisibilityInfo(paste.visibility);

              return (
                <TableRow
                  key={paste.id}
                  className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                    isExpired ? "opacity-60" : ""
                  }`}
                  onClick={() => router.push(`/p/${paste.slug}`)}
                >
                  <TableCell>
                    {onSelectPaste && (
                      <Checkbox
                        checked={selectedPastes.has(paste.id)}
                        onCheckedChange={(checked) =>
                          onSelectPaste(paste.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select paste ${paste.title || paste.slug}`}
                      />
                    )}
                  </TableCell>
                  {visibleColumns.avatar && (
                    <TableCell>
                      {paste.user && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={paste.user.image || undefined}
                            alt={paste.user.name}
                          />
                          <AvatarFallback className="text-xs bg-muted">
                            {paste.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="min-w-0 max-w-xs">
                    <div className="flex flex-col gap-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/p/${paste.slug}`);
                        }}
                        className="font-medium text-sm hover:text-primary transition-colors block truncate text-left"
                        title={paste.title || `Paste ${paste.slug}`}
                      >
                        {paste.title || `Paste ${paste.slug}`}
                      </button>
                      {paste.description && (
                        <p
                          className="text-xs text-muted-foreground line-clamp-1 mt-0.5"
                          title={paste.description}
                        >
                          {paste.description}
                        </p>
                      )}

                      {/* Mobile-only metadata */}
                      <div className="flex items-center gap-2 sm:hidden mt-1">
                        <Badge
                          variant="outline"
                          className="h-4 px-1.5 text-xs bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/50"
                        >
                          {paste.language}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {paste.views}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(paste.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {paste.hasPassword && (
                          <Badge
                            variant="outline"
                            className="h-4 px-1.5 text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50"
                          >
                            <Shield className="h-2.5 w-2.5 mr-0.5" />
                            Protected
                          </Badge>
                        )}
                        {paste.burnAfterRead && (
                          <Badge
                            variant="outline"
                            className="h-4 px-1.5 text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/50"
                          >
                            <Zap className="h-2.5 w-2.5 mr-0.5" />
                            Burn after {paste.burnAfterReadViews || 1} view
                            {(paste.burnAfterReadViews || 1) !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        {paste.expiresAt && !isExpired && (
                          <Badge
                            variant="outline"
                            className="h-4 px-1.5 text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50"
                          >
                            <Clock className="h-2.5 w-2.5 mr-0.5" />
                            Expires{" "}
                            {formatDistanceToNow(paste.expiresAt, {
                              addSuffix: true,
                            })}
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge
                            variant="outline"
                            className="h-4 px-1.5 text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50"
                          >
                            <Clock className="h-2.5 w-2.5 mr-0.5" />
                            Expired
                          </Badge>
                        )}
                      </div>
                      {/* Tags */}
                      {paste.tags && paste.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {paste.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="h-4 px-1.5 text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700/50"
                            >
                              <Tag className="h-2.5 w-2.5 mr-0.5" />
                              {tag.name}
                            </Badge>
                          ))}
                          {paste.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{paste.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {visibleColumns.language && (
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="h-5 px-2 text-xs font-medium bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/50"
                      >
                        {paste.language}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.status && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${visibilityInfo.dotColor}`}
                        />
                        <span className="text-sm">{visibilityInfo.label}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.views && (
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        {paste.views}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.created && (
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(paste.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/${paste.slug}`}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Paste
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(paste);
                          }}
                        >
                          <div className="relative h-4 w-4 mr-2">
                            <Clipboard
                              className={`h-4 w-4 absolute transition-all duration-300 ${
                                copied === paste.id
                                  ? "scale-0 opacity-0"
                                  : "scale-100 opacity-100"
                              }`}
                            />
                            <Check
                              className={`h-4 w-4 absolute transition-all duration-300 ${
                                copied === paste.id
                                  ? "scale-100 opacity-100"
                                  : "scale-0 opacity-0"
                              }`}
                            />
                          </div>
                          {copied === paste.id ? "Copied!" : "Copy URL"}
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(paste);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit Paste
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteDialog(paste.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Paste
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this paste? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
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
