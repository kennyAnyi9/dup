"use client";

import { ScrollArea } from "@/shared/components/dupui/scroll-area";
import { DashboardProfileDropdown } from "../ui/dashboard-profile-dropdown";
import { PublicPasteFeedCard } from "../ui/public-paste-feed-card";
import { PublicPasteFeedSkeleton } from "../ui/public-paste-feed-skeleton";
import { Globe } from "lucide-react";
import { User } from "better-auth";

interface DashboardSidebarProps {
  recentPublicPastes?: Array<{
    id: string;
    slug: string;
    title: string | null;
    language: string;
    views: number;
    createdAt: Date;
  }>;
  totalPublicPastes?: number;
  user?: User;
  isLoading?: boolean;
}

export function DashboardSidebar({ recentPublicPastes = [], totalPublicPastes = 0, user, isLoading = false }: DashboardSidebarProps) {
  return (
    <div className="basis-1/5 rounded-lg border border-border px-3 py-4 backdrop-blur-[2px] md:p-4 hidden max-h-full shrink-0 lg:block overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Public Pastes Feed - Now takes full height */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm" />
              <p className="font-semibold text-base text-foreground">Recent Public Pastes</p>
            </div>
            <div className="px-2 py-1 text-xs text-muted-foreground font-mono bg-muted/50 rounded-md border border-border/50">
              {recentPublicPastes.length}/{totalPublicPastes}
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100%-4rem)]">
            {isLoading ? (
              <PublicPasteFeedSkeleton count={5} compact={false} />
            ) : (
              <div className="space-y-3">
                {recentPublicPastes.length > 0 ? (
                  recentPublicPastes.map((paste) => (
                    <PublicPasteFeedCard
                      key={paste.id}
                      paste={paste}
                      compact={false}
                    />
                  ))
              ) : (
                <div className="text-center py-16 space-y-6">
                  <div className="flex justify-center">
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-muted">
                      <Globe className="h-10 w-10 text-muted-foreground" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full animate-pulse shadow-sm" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-base text-foreground font-semibold">
                      Waiting for activity
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Live public pastes will<br />appear here in real-time
                    </p>
                  </div>
                </div>
              )}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* User Profile at bottom */}
        {user && (
          <div className="mt-auto pt-6 border-t border-border">
            <DashboardProfileDropdown user={user} />
          </div>
        )}
      </div>
    </div>
  );
}