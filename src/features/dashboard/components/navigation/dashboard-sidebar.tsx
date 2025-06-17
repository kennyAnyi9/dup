"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  FileText,
  Settings,
  Globe,
  Eye,
} from "lucide-react";

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
}

export function DashboardSidebar({ recentPublicPastes = [], totalPublicPastes = 0 }: DashboardSidebarProps) {

  const navigationItems = [
    {
      href: "/dashboard",
      label: "My Pastes",
      icon: FileText,
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="basis-1/5 rounded-lg border border-border px-3 py-4 backdrop-blur-[2px] md:p-4 hidden max-h-full shrink-0 lg:block overflow-hidden">
      <div className="flex flex-col gap-12 h-full">
        <div className="grid gap-2">
          <p className="hidden px-3 font-medium text-foreground text-lg lg:block">Navigation</p>
          <ul className="grid gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <li key={item.href} className="w-full">
                  <Link
                    href={item.href}
                    className="group flex w-full items-center rounded-md px-3 py-1 transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        
        {/* Recent Public Pastes Feed */}
        <div className="hidden lg:block flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="font-medium text-sm text-foreground">Public Pastes</p>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {recentPublicPastes.length}/{totalPublicPastes}
            </div>
          </div>
          
          <ScrollArea className="h-full">
            <div className="space-y-0 font-mono text-xs">
              {recentPublicPastes.length > 0 ? (
                recentPublicPastes.map((paste, index) => (
                  <Link 
                    key={paste.id} 
                    href={`/p/${paste.slug}`} 
                    className="block py-3 px-2 hover:bg-muted/50 transition-all duration-200 border-l-2 border-transparent hover:border-primary group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-foreground font-medium truncate flex-1 mr-2 group-hover:text-primary transition-colors">
                        {paste.title || `untitled-${paste.slug.slice(-6)}`}
                      </div>
                      <div className="text-muted-foreground text-[10px] shrink-0">
                        {formatDistanceToNow(paste.createdAt, { addSuffix: true }).replace(' ago', '')}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide">
                          {paste.language}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-2.5 w-2.5" />
                        <span className="text-[10px] font-medium">{paste.views}</span>
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
                      <Globe className="h-6 w-6 text-muted-foreground" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-muted rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      Waiting for activity
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 font-mono">
                      No public pastes yet
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}