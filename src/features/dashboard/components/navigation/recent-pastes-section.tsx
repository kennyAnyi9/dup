"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Globe,
  Eye,
} from "lucide-react";
import { RecentPastesSectionProps } from "@/features/dashboard/types";

export function RecentPastesSection({ 
  recentPublicPastes, 
  totalPublicPastes, 
  onClose 
}: RecentPastesSectionProps) {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="font-medium text-sm text-foreground">Recent Public Pastes</p>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {recentPublicPastes.length}/{totalPublicPastes}
        </div>
      </div>
      
      <div className="space-y-0">
        {recentPublicPastes.length > 0 ? (
          recentPublicPastes.map((paste, index) => (
            <Link 
              key={paste.id} 
              href={`/p/${paste.slug}`}
              onClick={onClose}
              className="block py-3 px-3 hover:bg-muted/50 transition-all duration-200 border-l-2 border-transparent hover:border-primary group rounded-r-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-foreground font-medium truncate flex-1 mr-2 group-hover:text-primary transition-colors text-sm">
                  {paste.title || `untitled-${paste.slug.slice(-6)}`}
                </div>
                <div className="text-muted-foreground text-xs shrink-0">
                  {formatDistanceToNow(paste.createdAt, { addSuffix: true }).replace(' ago', '')}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                    {paste.language}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span className="text-xs font-medium">{paste.views}</span>
                </div>
              </div>
              
              {index < recentPublicPastes.length - 1 && (
                <div className="mt-3 border-b border-border" />
              )}
            </Link>
          ))
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <Globe className="h-8 w-8 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-muted rounded-full animate-ping" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                Waiting for activity
              </p>
              <p className="text-xs text-muted-foreground/70">
                No public pastes yet
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}