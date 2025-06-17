"use client";

import { useCopyUrl } from "../../hooks/use-copy-url";
import { usePasteActions } from "../../hooks/use-paste-actions";
import { getVisibilityInfo } from "../../lib/paste-utils";
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
  Loader,
  MoreHorizontal,
  Shield,
  Tag,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PasteCardProps {
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
}

export function PasteCard({ paste }: PasteCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { copied, copyUrl } = useCopyUrl();
  const { loading: isDeleting, handleDelete } = usePasteActions();

  const isExpired = paste.expiresAt && new Date() > paste.expiresAt;


  const handleCopyUrl = () => copyUrl(paste.slug);

  const handleDeletePaste = async () => {
    await handleDelete(paste.id);
    setShowDeleteDialog(false);
    router.refresh();
  };

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
            <div className="flex gap-3 flex-1 min-w-0">
              {/* Avatar */}
              {paste.user && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={paste.user.image || undefined} alt={paste.user.name} />
                  <AvatarFallback className="text-xs bg-muted">
                    {paste.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex-1 min-w-0">
                <Link
                  href={`/p/${paste.slug}`}
                  className="hover:text-primary transition-colors duration-200 block group-hover:text-primary"
                >
                  <h3 className="font-semibold text-sm truncate leading-tight">
                    {paste.title || `Paste ${paste.slug}`}
                  </h3>
                </Link>
                
                {/* Description */}
                {paste.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {paste.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  {paste.user && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {paste.user.name}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(paste.createdAt, { addSuffix: true })}
                  </span>
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
                      href={`/p/${paste.slug}`}
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
                {(() => {
                  const Icon = visibilityInfo.icon;
                  return <Icon className="h-3 w-3" />;
                })()}
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
                Burn after {paste.burnAfterReadViews || 1} view{(paste.burnAfterReadViews || 1) !== 1 ? 's' : ''}
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

          {/* Tags */}
          {paste.tags && paste.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {paste.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="h-5 px-2 text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700/50"
                >
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

        </CardContent>

        <CardFooter className="px-4 py-3 border-t border-muted/30">
          <div className="flex items-center justify-between w-full">
            {/* View count and stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {paste.views} {paste.views === 1 ? "read" : "reads"}
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
              <Link href={`/p/${paste.slug}`} className="flex items-center gap-1.5">
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
              onClick={handleDeletePaste}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
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
