"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { Badge } from "@/shared/components/dupui/badge";
import { Button } from "@/shared/components/dupui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Clipboard,
  CornerDownRight,
  Eye,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/utils/url";

interface Paste {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  language: string;
  views: number;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  } | null;
}

interface PublicPasteCardsProps {
  pastes: Paste[];
}

export function PublicPasteCards({ pastes }: PublicPasteCardsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopyUrl(paste: Paste) {
    try {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      const pasteUrl = `${window.location.origin}/p/${paste.slug}`;
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(paste.id);
      toast.success("URL copied to clipboard!");
      
      timeoutRef.current = window.setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
      console.error("Copy failed:", error);
    }
  }

  const formatViews = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (pastes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-sm font-medium">No public pastes yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to share a public paste!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pastes.map((paste) => (
        <div
          key={paste.id}
          className="relative flex items-stretch justify-between gap-2 rounded-xl border border-border bg-background p-3 max-w-full transition-all duration-200 hover:bg-accent/50"
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
              {/* Title with copy button */}
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Link
                  href={`/p/${paste.slug}`}
                  className="truncate font-semibold text-sm hover:text-primary transition-colors"
                >
                  {paste.title || `Paste ${paste.slug}`}
                </Link>

                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Copy button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyUrl(paste)}
                    className="h-6 w-6 p-0 rounded-full border border-border bg-muted hover:bg-muted/80 transition-all duration-200 flex items-center justify-center"
                    aria-label="Copy paste URL"
                  >
                    <div className="relative h-3 w-3 flex items-center justify-center">
                      <Clipboard
                        className={`h-3 w-3 absolute transition-all duration-300 ${
                          copied === paste.id
                            ? "scale-0 opacity-0"
                            : "scale-100 opacity-100"
                        }`}
                      />
                      <Check
                        className={`h-3 w-3 absolute transition-all duration-300 ${
                          copied === paste.id
                            ? "scale-100 opacity-100"
                            : "scale-0 opacity-0"
                        }`}
                      />
                    </div>
                  </Button>
                </div>
              </div>

              {/* Metadata and author */}
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
                
                {paste.user && (
                  <span className="text-xs text-muted-foreground">
                    by {paste.user.name}
                  </span>
                )}
                
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(paste.createdAt), {
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
              </div>
            </div>
          </div>

          {/* Right section with stats */}
          <div className="flex items-center gap-2">
            {/* Views/Stats */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-muted transition-colors hover:bg-muted/80">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex items-center whitespace-nowrap text-xs text-muted-foreground">
                {formatViews(paste.views)}
                <span className="ml-1 hidden sm:inline-block">views</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}