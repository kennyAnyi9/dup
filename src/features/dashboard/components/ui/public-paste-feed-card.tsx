"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Eye } from "lucide-react";

interface PublicPaste {
  id: string;
  slug: string;
  title: string | null;
  language: string;
  views: number;
  createdAt: Date;
}

interface PublicPasteFeedCardProps {
  paste: PublicPaste;
  onClick?: () => void;
  compact?: boolean;
}

export function PublicPasteFeedCard({ paste, onClick, compact = false }: PublicPasteFeedCardProps) {
  const formatViews = (views: number) => {
    return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString();
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true }).replace(' ago', '');
  };

  if (compact) {
    // Compact version for mobile
    return (
      <Link 
        href={`/p/${paste.slug}`}
        onClick={onClick}
        className="block p-3 hover:bg-muted/50 transition-all duration-200 border-l-2 border-transparent hover:border-primary group rounded-r-md"
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-foreground font-medium truncate flex-1 mr-2 group-hover:text-primary transition-colors text-sm">
            {paste.title || `Untitled ${paste.language}`}
          </h4>
          <div className="text-xs text-muted-foreground font-mono shrink-0">
            {formatTime(paste.createdAt)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">
            {paste.language}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span className="text-xs font-medium">{formatViews(paste.views)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Full version for desktop sidebar
  return (
    <Link 
      href={`/p/${paste.slug}`}
      onClick={onClick}
      className="block group"
    >
      <div className="relative p-4 rounded-xl border border-border/40 bg-gradient-to-br from-background to-background/80 hover:from-accent/20 hover:to-accent/10 hover:border-border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        {/* Header with title and time */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {paste.title || `Untitled ${paste.language}`}
          </h4>
          <div className="text-[10px] text-muted-foreground font-mono shrink-0 mt-0.5 bg-muted/50 px-1.5 py-0.5 rounded">
            {formatTime(paste.createdAt)}
          </div>
        </div>
        
        {/* Language and stats */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-primary/15 to-primary/10 text-primary border border-primary/30">
            {paste.language}
          </span>
          
          <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
            <Eye className="h-3 w-3" />
            <span className="text-xs font-medium">
              {formatViews(paste.views)}
            </span>
          </div>
        </div>
        
        {/* Enhanced accent line with gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-l-xl" />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
      </div>
    </Link>
  );
}