"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Globe,
  Lock,
  EyeOff,
  Eye,
  Clock,
  Shield,
  Zap,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { deletePaste } from "@/app/actions/paste";

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
  const previewContent = paste.content.slice(0, 200);
  const pasteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${paste.slug}` 
    : `/${paste.slug}`;

  function getVisibilityInfo(visibility: string) {
    switch (visibility) {
      case "public":
        return {
          icon: <Globe className="h-3 w-3" />,
          label: "Public",
          color: "text-green-600 dark:text-green-400",
        };
      case "private":
        return {
          icon: <Lock className="h-3 w-3" />,
          label: "Private",
          color: "text-red-600 dark:text-red-400",
        };
      case "unlisted":
        return {
          icon: <EyeOff className="h-3 w-3" />,
          label: "Unlisted",
          color: "text-orange-600 dark:text-orange-400",
        };
      default:
        return {
          icon: <Globe className="h-3 w-3" />,
          label: visibility,
          color: "text-muted-foreground",
        };
    }
  }

  async function handleCopyUrl() {
    try {
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
      <Card className={`group transition-all hover:shadow-md ${isExpired ? "opacity-60" : ""}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/${paste.slug}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <h3 className="font-medium truncate">
                  {paste.title || `Paste ${paste.slug}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(paste.createdAt, { addSuffix: true })}
                </p>
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/${paste.slug}`} className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyUrl}>
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? "Copied!" : "Copy URL"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {paste.language}
            </Badge>
            
            <Badge variant="outline" className={`text-xs ${visibilityInfo.color}`}>
              <span className="flex items-center gap-1">
                {visibilityInfo.icon}
                {visibilityInfo.label}
              </span>
            </Badge>

            {paste.hasPassword && (
              <Badge variant="outline" className="text-xs">
                <Shield className="h-2 w-2 mr-1" />
                Protected
              </Badge>
            )}

            {paste.burnAfterRead && (
              <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400">
                <Zap className="h-2 w-2 mr-1" />
                Burn
              </Badge>
            )}

            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                <Clock className="h-2 w-2 mr-1" />
                Expired
              </Badge>
            )}
          </div>

          {/* Content Preview */}
          <div className="bg-muted/30 rounded-md p-3 mb-3">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-hidden">
              {previewContent}
              {paste.content.length > 200 && "..."}
            </pre>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {paste.views} {paste.views === 1 ? "view" : "views"}
            </div>
            
            {paste.expiresAt && !isExpired && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires {formatDistanceToNow(paste.expiresAt, { addSuffix: true })}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" size="sm" onClick={handleCopyUrl} className="flex-1">
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span className="ml-1">{copied ? "Copied!" : "Copy URL"}</span>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${paste.slug}`}>
                <ExternalLink className="h-3 w-3" />
                <span className="ml-1">View</span>
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
              Are you sure you want to delete "{paste.title || `Paste ${paste.slug}`}"? 
              This action cannot be undone.
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