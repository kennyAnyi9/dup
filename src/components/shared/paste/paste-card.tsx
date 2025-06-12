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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Loader2,
  Lock,
  MoreHorizontal,
  Shield,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface PasteCardProps {
  paste: {
    id: string;
    slug: string;
    title: string | null;
    content: string;
    language: string;
    visibility: string;
    views: number;
    createdAt: Date;
    expiresAt: Date | null;
    burnAfterRead: boolean;
    hasPassword: boolean;
  };
}

export function PasteCard({ paste }: PasteCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isExpired = paste.expiresAt && new Date() > paste.expiresAt;

  function getVisibilityInfo(visibility: string) {
    switch (visibility) {
      case "public":
        return {
          icon: <Globe className="h-3 w-3" />,
          label: "Public",
          className:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
        };
      case "private":
        return {
          icon: <Lock className="h-3 w-3" />,
          label: "Private",
          className:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
        };
      case "unlisted":
        return {
          icon: <EyeOff className="h-3 w-3" />,
          label: "Unlisted",
          className:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50",
        };
      default:
        return {
          icon: <Globe className="h-3 w-3" />,
          label: visibility,
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  }

  async function handleCopyUrl() {
    try {
      // Calculate the URL at copy time to ensure we have the correct absolute URL
      const pasteUrl = `${window.location.origin}/${paste.slug}`;
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
      console.error("Copy failed:", error);
    }
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deletePaste({ id: paste.id });
        if (result.success) {
          toast.success("Paste deleted successfully");
          setShowDeleteDialog(false);
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

  const visibilityInfo = getVisibilityInfo(paste.visibility);

  return (
    <>
      <Card
        className={`group h-auto flex flex-col transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01] border-border/60 hover:border-border ${
          isExpired ? "opacity-60" : ""
        }`}
      >
        <CardContent className="p-4 flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/${paste.slug}`}
                className="hover:text-primary transition-colors duration-200 block group-hover:text-primary"
              >
                <h3 className="font-semibold text-sm truncate leading-tight">
                  {paste.title || `Paste ${paste.slug}`}
                </h3>
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(paste.createdAt, { addSuffix: true })}
                </p>
                {paste.expiresAt && !isExpired && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Clock className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      Expires {formatDistanceToNow(paste.expiresAt, { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyUrl}
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted/80"
              >
                <div className="relative h-3 w-3">
                  <Clipboard
                    className={`h-3 w-3 absolute transition-all duration-300 ${
                      copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                    }`}
                  />
                  <Check
                    className={`h-3 w-3 absolute transition-all duration-300 ${
                      copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  />
                </div>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted/80"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${paste.slug}`}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Paste
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyUrl}>
                    <div className="relative h-4 w-4 mr-2">
                      <Clipboard
                        className={`h-4 w-4 absolute transition-all duration-300 ${
                          copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                        }`}
                      />
                      <Check
                        className={`h-4 w-4 absolute transition-all duration-300 ${
                          copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        }`}
                      />
                    </div>
                    {copied ? "Copied!" : "Copy URL"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <Badge
              variant="outline"
              className="h-5 px-2 text-xs font-medium bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/50"
            >
              {paste.language}
            </Badge>

            <Badge
              variant="outline"
              className={`h-5 px-2 text-xs font-medium ${visibilityInfo.className}`}
            >
              <span className="flex items-center gap-1">
                {visibilityInfo.icon}
                {visibilityInfo.label}
              </span>
            </Badge>

            {paste.hasPassword && (
              <Badge
                variant="outline"
                className="h-5 px-2 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50"
              >
                <Shield className="h-2.5 w-2.5 mr-1" />
                Protected
              </Badge>
            )}

            {paste.burnAfterRead && (
              <Badge
                variant="outline"
                className="h-5 px-2 text-xs font-medium bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/50"
              >
                <Zap className="h-2.5 w-2.5 mr-1" />
                Burn
              </Badge>
            )}

            {isExpired && (
              <Badge
                variant="outline"
                className="h-5 px-2 text-xs font-medium bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50"
              >
                <Clock className="h-2.5 w-2.5 mr-1" />
                Expired
              </Badge>
            )}
          </div>

        </CardContent>

        <CardFooter className="px-4 py-3 border-t border-muted/30">
          <div className="flex items-center justify-between w-full">
            {/* View count and stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {paste.views} {paste.views === 1 ? "view" : "views"}
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/40" />
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-xs">
                  {paste.content.length} chars
                </span>
              </div>
            </div>

            {/* Action button */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Link href={`/${paste.slug}`} className="flex items-center gap-1.5">
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">View</span>
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

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
              {paste.title || `Paste ${paste.slug}`}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
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
