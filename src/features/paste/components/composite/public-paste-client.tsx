"use client";

import { getPaste } from "@/features/paste/actions/paste.actions";
import { Badge } from "@/shared/components/dupui/badge";
import { Button } from "@/shared/components/dupui/button";
import {
  Panel,
  PanelContent,
  Pattern,
} from "@/shared/components/dupui/panel";
import { Skeleton } from "@/shared/components/dupui/skeleton";
import { ThemeSwitch } from "@/shared/components/theme/theme-switch";
import { Footer } from "@/shared/components/common/footer";
import { useAuth } from "@/shared/hooks/use-auth";
import type { PasteResult } from "@/shared/types/paste";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  FileX,
  Globe,
  Lock,
  MessageCircle,

  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getCommentCount } from "../../actions/comment.actions";
import { PasswordDialog } from "../forms/password-dialog";
import { usePasteModal } from "../providers/paste-modal-provider";
import {
  CommentsSection,
  CommentsSectionRef,
} from "../ui/comments/comments-section";
import { PasteViewerActions, PasteViewerCode } from "../ui/paste-viewer";

interface PublicPasteClientProps {
  slug: string;
}

export function PublicPasteClient({ slug }: PublicPasteClientProps) {
  const { user } = useAuth();
  const { openModal } = usePasteModal();
  const router = useRouter();

  const [paste, setPaste] = useState<PasteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapText, setWrapText] = useState(false);
  const commentsSectionRef = useRef<CommentsSectionRef>(null);

  const loadPaste = useCallback(
    async (password?: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await getPaste({ slug, password });

        if (result.success && result.paste) {
          setPaste(result.paste);
          setShowPasswordDialog(false);
          setPasswordError(null);

          fetch("/api/analytics/view", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pasteId: result.paste.id }),
          }).catch(console.error);

          loadCommentCount(result.paste.id);

          if (result.burnedAfterRead) {
            toast.warning("This paste has been deleted after being viewed!", {
              duration: 5000,
            });
          }
        } else if (result.requiresPassword) {
          setShowPasswordDialog(true);
          setPasswordError(result.error || null);
        } else {
          setError(result.error || "Paste not found");
        }
      } catch (error) {
        console.error("Failed to load paste:", error);
        setError("Failed to load paste");
      } finally {
        setLoading(false);
      }
    },
    [slug]
  );

  const loadCommentCount = async (pasteId: string) => {
    try {
      const result = await getCommentCount(pasteId);
      if (result.success && result.count !== undefined) {
        const count =
          typeof result.count === "string"
            ? parseInt(result.count, 10)
            : result.count;
        setCommentCount(count);
      } else {
        setCommentCount(0);
      }
    } catch (error) {
      console.error("Failed to load comment count:", error);
      setCommentCount(0);
    }
  };

  const handleCommentIconClick = () => {
    commentsSectionRef.current?.scrollToComments();
    setTimeout(() => {
      commentsSectionRef.current?.focusCommentForm();
    }, 300);
  };

  const handleCommentCountUpdate = (newCount: number) => {
    setCommentCount(newCount);
  };

  useEffect(() => {
    loadPaste();
  }, [loadPaste]);

  async function handlePasswordSubmit(password: string) {
    setPasswordLoading(true);
    setPasswordError(null);

    try {
      const result = await getPaste({ slug, password });
      if (result.success && result.paste) {
        setPaste(result.paste);
        setShowPasswordDialog(false);
        toast.success("Paste unlocked successfully!");
      } else {
        setPasswordError(result.error || "Invalid password");
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      setPasswordError("Failed to verify password");
    } finally {
      setPasswordLoading(false);
    }
  }

  function getVisibilityIcon(visibility: string) {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "unlisted":
        return <EyeOff className="h-4 w-4" />;
      case "private":
        return <Lock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  }

  function getVisibilityLabel(visibility: string) {
    switch (visibility) {
      case "public":
        return "Public";
      case "unlisted":
        return "Unlisted";
      case "private":
        return "Private";
      default:
        return visibility;
    }
  }

  // Sticky header — same styling as landing page navbar
  const StickyHeader = () => (
    <header className="sticky top-0 z-40 w-full">
      <div className="font-commit-mono max-w-4xl mx-auto px-4 lg:px-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <Panel>
          <div className="pl-4">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center">
                  [dup]
                </Link>
              </div>

              <div className="flex items-center border-l h-full">
                <div className="h-full flex place-items-center px-2">
                  <ThemeSwitch />
                </div>
                <button
                  onClick={() => openModal()}
                  className="h-full flex place-items-center border-l hover:bg-accent w-44 p-5 cursor-pointer transition-colors"
                  aria-label="Create new paste"
                >
                  New Paste
                </button>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </header>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader />
        <div className="max-w-4xl mx-auto px-4 lg:px-0 flex-1 w-full">
          <Panel className="border-t-0">
            <PanelContent className="p-0">
              {/* Title skeleton */}
              <div className="p-5 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>

            {/* Metadata grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border border-t">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-background p-3 flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>

            {/* Actions skeleton */}
            <div className="border-t p-3 flex items-center justify-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </PanelContent>
        </Panel>

        <Pattern />

        {/* Code viewer skeleton */}
        <Panel>
          <PanelContent className="p-4 space-y-3 font-mono text-sm">
            {Array.from({ length: 15 }).map((_, i) => {
              const widths = [85, 60, 40, 75, 45, 90, 35, 80, 55, 70, 25, 95, 50, 65, 30];
              const width = widths[i % widths.length];
              return (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-6 flex-shrink-0" />
                  <Skeleton className="h-4" style={{ width: `${width}%`, maxWidth: "95%" }} />
                </div>
              );
            })}
          </PanelContent>
        </Panel>

          <Pattern />
          <Footer />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader />
        <div className="max-w-4xl mx-auto px-4 lg:px-0 flex-1 w-full">
          <Panel className="border-t-0">
          <PanelContent className="text-center py-16 space-y-6">
            {error.includes("not found") ? (
              <FileX className="h-16 w-16 text-muted-foreground mx-auto" />
            ) : error.includes("expired") ? (
              <Clock className="h-16 w-16 text-muted-foreground mx-auto" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
            )}
            <h1 className="text-2xl font-bold">
              {error.includes("not found") && "Paste Not Found"}
              {error.includes("expired") && "Paste Expired"}
              {!error.includes("not found") && !error.includes("expired") && "Error"}
            </h1>
            <p className="text-muted-foreground">{error}</p>

            {error.includes("not found") && (
              <p className="text-sm text-muted-foreground">
                This paste may have been deleted, expired, or the URL might be incorrect.
              </p>
            )}
            {error.includes("expired") && (
              <p className="text-sm text-muted-foreground">
                This paste has reached its expiry time and is no longer available.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => openModal()} className="rounded-none">Create New Paste</Button>
              <Button variant="outline" onClick={() => router.back()} className="rounded-none">
                Go Back
              </Button>
            </div>
          </PanelContent>
        </Panel>

          <Pattern />
          <Footer />
        </div>
      </div>
    );
  }

  // Password dialog
  if (showPasswordDialog) {
    return (
      <div className="min-h-screen flex flex-col">
        <StickyHeader />
        <div className="max-w-4xl mx-auto px-4 lg:px-0 flex-1 w-full">
          <Panel className="border-t-0">
          <PanelContent className="text-center py-16 space-y-6">
            <Shield className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Password Protected</h1>
            <p className="text-muted-foreground">
              This paste is protected with a password. Enter the correct password to view its contents.
            </p>
          </PanelContent>
        </Panel>

          <Pattern />
          <Footer />
        </div>

        <PasswordDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          onSubmit={handlePasswordSubmit}
          error={passwordError || undefined}
          isLoading={passwordLoading}
        />
      </div>
    );
  }

  // Main paste view
  if (!paste) {
    return null;
  }

  const isOwner = user && paste.userId === user.id;
  const createdDate = new Date(paste.createdAt);
  const expiryDate = paste.expiresAt ? new Date(paste.expiresAt) : null;
  const lineCount = paste.content.split("\n").length;
  const charCount = paste.content.length;
  const wordCount = paste.content.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen flex flex-col">
      <StickyHeader />
      <div className="max-w-4xl mx-auto px-4 lg:px-0 flex-1 w-full">
        {/* Title + Metadata + Actions — one continuous Panel */}
        <Panel className="border-t-0">
          <PanelContent className="p-0">
            {/* Title section */}
            <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  {paste.title || `Paste ${paste.slug}`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(createdDate, { addSuffix: true })}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs rounded-none">
                    {paste.language}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {lineCount} lines &middot; {charCount} chars &middot; {wordCount} words
                  </span>
                </div>
              </div>

              {/* Tags */}
              {paste.tags && paste.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {paste.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs px-2 py-1 rounded-none"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : undefined,
                        borderColor: tag.color || undefined,
                        color: tag.color || undefined,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metadata grid row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-border border-t">
            <div className="bg-background p-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{format(createdDate, "MMMM do, yyyy")}</span>
            </div>

            <div className="bg-background p-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4 flex-shrink-0" />
              <span>{paste.views} views</span>
            </div>

            <button
              onClick={handleCommentIconClick}
              className="bg-background p-3 flex items-center gap-2 text-sm text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              <span>{commentCount} Comments</span>
            </button>

            <div className="bg-background p-3 flex items-center gap-2 text-sm text-muted-foreground">
              {getVisibilityIcon(paste.visibility)}
              <span>{getVisibilityLabel(paste.visibility)}</span>
            </div>

            <div className="bg-background p-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {expiryDate
                  ? `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`
                  : "No expiry"}
              </span>
            </div>
          </div>

          {/* Burn after read warning */}
          {paste.burnAfterRead && (
            <div className="border-t bg-orange-50 dark:bg-orange-950/30 p-3 flex items-center gap-2 text-orange-800 dark:text-orange-200 text-sm">
              <Zap className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Burn after read</span>
              {paste.burnAfterReadViews && !isOwner && (
                <span className="font-mono text-xs">
                  ({Math.max(0, paste.burnAfterReadViews - paste.views)} view{Math.max(0, paste.burnAfterReadViews - paste.views) !== 1 ? "s" : ""} remaining)
                </span>
              )}
            </div>
          )}

          {/* Actions row */}
          <PasteViewerActions
            content={paste.content}
            title={paste.title}
            slug={paste.slug}
            qrCodeColor={paste.qrCodeColor}
            qrCodeBackground={paste.qrCodeBackground}
            showLineNumbers={showLineNumbers}
            onShowLineNumbersChange={setShowLineNumbers}
            wrapText={wrapText}
            onWrapTextChange={setWrapText}
          />
          </PanelContent>
        </Panel>

        <Pattern />

        {/* Code content */}
        <PasteViewerCode
          content={paste.content}
          language={paste.language}
          showLineNumbers={showLineNumbers}
          wrapText={wrapText}
        />

        {/* Comments Section */}
        <CommentsSection
          ref={commentsSectionRef}
          pasteId={paste.id}
          onCommentCountChange={handleCommentCountUpdate}
        />

        <Pattern />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
