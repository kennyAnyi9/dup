"use client";

import { formatDistanceToNow } from "date-fns";
import { CornerDownRight, Eye } from "lucide-react";
import { Badge } from "@/shared/components/dupui/badge";
import { getLanguageColors } from "@/shared/lib/language-colors";
import { cn } from "@/shared/lib/utils";

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
  return (
    <div className="group py-1 hover:bg-muted/40 transition-all duration-200 ease-in-out rounded px-1.5 hover:scale-[1.01] hover:shadow-sm font-mono w-full">
      {/* Link with arrow icon and timestamp */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 w-full items-center">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden max-w-[65%]">
          <CornerDownRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
          <a
            href={`/p/${paste.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            className="text-xs text-muted-foreground underline-offset-4 transition-all duration-200 hover:text-foreground hover:underline overflow-hidden text-ellipsis whitespace-nowrap"
            title={paste.title || `p/${paste.slug}`}
          >
            {paste.title || `p/${paste.slug}`}
          </a>
        </div>

        {/* Timestamp on the right */}
        <span className="text-[10px] text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80 whitespace-nowrap">
          {formatDistanceToNow(paste.createdAt, { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}