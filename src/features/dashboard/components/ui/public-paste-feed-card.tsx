"use client";

import { formatDistanceToNow } from "date-fns";
import { Eye, ArrowUpRight } from "lucide-react";

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
      <a 
        href={`/p/${paste.slug}`}
        target="_blank"
        rel="noopener noreferrer"
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
      </a>
    );
  }

  // Full version for desktop sidebar
  return (
    <a 
      href={`/p/${paste.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="block group"
    >
      <div className="relative p-3 rounded-lg border border-border/30 bg-background/50 hover:bg-accent/30 hover:border-border transition-all duration-200">
        {/* Header with title and views */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate leading-snug flex-1 min-w-0">
            {paste.title || `Untitled ${paste.language}`}
          </h4>
          <div className="flex items-center gap-1 text-muted-foreground shrink-0 mt-0.5">
            <Eye className="h-3 w-3" />
            <span className="text-xs font-medium">
              {formatViews(paste.views)}
            </span>
          </div>
        </div>
        
        {/* Bottom row with time and link */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground font-mono">
            {formatTime(paste.createdAt)}
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
            <ArrowUpRight className="h-3 w-3" />
            <span className="text-xs font-medium font-mono">
              /{paste.slug}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}