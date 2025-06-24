"use client";

import { getPaste } from "@/features/paste/actions/paste.actions";
import { Logo } from "@/components/common/logo";
import { Badge } from "@/shared/components/dupui/badge";
import { Skeleton } from "@/shared/components/dupui/skeleton";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/dupui/button";
import { Card, CardContent } from "@/shared/components/dupui/card";
import { Separator } from "@/shared/components/dupui/separator";
import { useAuth } from "@/hooks/use-auth";
import type { PasteResult } from "@/shared/types/paste";
import { ThemeSwitch } from "@/shared/components/common/theme-switch";
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
  Plus,
  Shield,
  Tag,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { PasswordDialog } from "../forms/password-dialog";
import { usePasteModal } from "../providers/paste-modal-provider";
import { PasteViewer } from "../ui/paste-viewer";
import { CommentsSection, CommentsSectionRef } from "../ui/comments/comments-section";
import { getCommentCount } from "../../actions/comment.actions";

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
  const commentsSectionRef = useRef<CommentsSectionRef>(null);

  const loadPaste = useCallback(async (password?: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getPaste({ slug, password });

      if (result.success && result.paste) {
        setPaste(result.paste);
        setShowPasswordDialog(false);
        setPasswordError(null);

        // Load comment count
        loadCommentCount(result.paste.id);

        // Show burn after read notification
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
  }, [slug]);

  const loadCommentCount = async (pasteId: string) => {
    try {
      const result = await getCommentCount(pasteId);
      
      if (result.success && result.count !== undefined) {
        const count = typeof result.count === 'string' ? parseInt(result.count, 10) : result.count;
        setCommentCount(count);
      } else {
        // Fallback to 0 if result is not successful
        setCommentCount(0);
      }
    } catch (error) {
      console.error("Failed to load comment count:", error);
      // Set to 0 on error to show something
      setCommentCount(0);
    }
  };

  const handleCommentIconClick = () => {
    commentsSectionRef.current?.scrollToComments();
    // Small delay to ensure scroll completes before focusing
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

  // Header component
  const Header = () => (
    <header className="max-w-5xl mx-auto pr-3 sticky top-0 z-50 w-full border rounded-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <Button
              onClick={() => openModal()}
              className="flex items-center gap-2"
              aria-label="Create new paste"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Paste</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header section skeleton */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  {/* Title */}
                  <Skeleton className="h-8 w-64" />
                  {/* Created time */}
                  <Skeleton className="h-4 w-32" />
                </div>

                {/* Tags skeleton */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex gap-1 flex-wrap">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Metadata skeleton */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Calendar */}
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                
                {/* Views */}
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                
                {/* Visibility */}
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-12" />
                </div>
                
                {/* Expiry */}
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                
                {/* Burn after read */}
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* Separator */}
            <Skeleton className="h-px w-full" />

            {/* Code viewer skeleton */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Code header - matches PasteViewer header exactly */}
                <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
                
                {/* Code content area */}
                <div className="relative">
                  {/* Line numbers and code */}
                  <div className="p-4 space-y-3 bg-muted/5 font-mono text-sm">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        {/* Line number */}
                        <Skeleton className="h-4 w-6 flex-shrink-0" />
                        {/* Code line with realistic varying widths */}
                        <Skeleton 
                          className="h-4" 
                          style={{ 
                            width: `${Math.random() * 70 + 15}%`,
                            maxWidth: '95%'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
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
                {!error.includes("not found") &&
                  !error.includes("expired") &&
                  "Error"}
              </h1>
              <p className="text-muted-foreground">{error}</p>
            </div>

            <div className="space-y-4">
              {error.includes("not found") && (
                <p className="text-sm text-muted-foreground">
                  This paste may have been deleted, expired, or the URL might be
                  incorrect.
                </p>
              )}
              {error.includes("expired") && (
                <p className="text-sm text-muted-foreground">
                  This paste has reached its expiry time and is no longer
                  available.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => openModal()}>Create New Paste</Button>
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Password dialog
  if (showPasswordDialog) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <Shield className="h-16 w-16 text-primary mx-auto" />
              <h1 className="text-2xl font-bold">Password Protected</h1>
              <p className="text-muted-foreground">
                This paste is protected with a password. Enter the correct
                password to view its contents.
              </p>
            </div>
          </div>
        </div>

        <PasswordDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          onSubmit={handlePasswordSubmit}
          error={passwordError || undefined}
          isLoading={passwordLoading}
        />
      </>
    );
  }

  // Main paste view
  if (!paste) {
    return null;
  }

  const isOwner = user && paste.userId === user.id;
  const createdDate = new Date(paste.createdAt);
  const expiryDate = paste.expiresAt ? new Date(paste.expiresAt) : null;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  {paste.title || `Paste ${paste.slug}`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Created{" "}
                  {formatDistanceToNow(createdDate, { addSuffix: true })}
                </p>
              </div>

              {/* Tags */}
              {paste.tags && paste.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1 flex-wrap">
                    {paste.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs px-2 py-1 h-6"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : undefined,
                          borderColor: tag.color || undefined,
                          color: tag.color || undefined,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {paste.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1 h-6">
                        +{paste.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(createdDate, "PPP 'at' p")}</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{paste.views} views</span>
              </div>

              <button
                onClick={handleCommentIconClick}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{commentCount} comments</span>
              </button>

              <div className="flex items-center gap-1">
                {getVisibilityIcon(paste.visibility)}
                <span>{getVisibilityLabel(paste.visibility)}</span>
              </div>

              {expiryDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Expires{" "}
                    {formatDistanceToNow(expiryDate, { addSuffix: true })}
                  </span>
                </div>
              )}

              {paste.burnAfterRead && (
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">
                    Burn after read
                    {paste.burnAfterReadViews && (
                      <span className="ml-1 font-mono text-xs">
                        ({Math.max(0, paste.burnAfterReadViews - paste.views)}{" "}
                        views left)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {paste.burnAfterRead && !isOwner && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <Zap className="h-4 w-4" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        This paste will be permanently deleted after viewing it.
                      </p>
                      {paste.burnAfterReadViews && (
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                          {Math.max(0, paste.burnAfterReadViews - paste.views)}{" "}
                          view
                          {Math.max(
                            0,
                            paste.burnAfterReadViews - paste.views
                          ) !== 1
                            ? "s"
                            : ""}{" "}
                          remaining before deletion
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Paste Content */}
          <PasteViewer
            content={paste.content}
            language={paste.language}
            title={paste.title}
            slug={paste.slug}
          />

          {/* Comments Section */}
          <CommentsSection
            ref={commentsSectionRef}
            pasteId={paste.id}
            onCommentCountChange={handleCommentCountUpdate}
          />
        </div>
      </div>
    </>
  );
}
