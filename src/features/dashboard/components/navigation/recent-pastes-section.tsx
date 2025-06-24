"use client";

import { Globe } from "lucide-react";
import { RecentPastesSectionProps } from "@/features/dashboard/types";
import { PublicPasteFeedCard } from "../ui/public-paste-feed-card";

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
      
      <div className="space-y-2">
        {recentPublicPastes.length > 0 ? (
          recentPublicPastes.map((paste) => (
            <PublicPasteFeedCard
              key={paste.id}
              paste={paste}
              onClick={onClose}
              compact={true}
            />
          ))
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-muted">
                <Globe className="h-8 w-8 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full animate-pulse shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground font-semibold">
                Waiting for activity
              </p>
              <p className="text-xs text-muted-foreground">
                Live public pastes will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}