"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Plus,
  BarChart3,
  FileText,
  Home,
  Settings,
  Globe,
  Eye,
  Clock,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  stats: {
    totalPastes: number;
    totalViews: number;
  };
  recentPublicPastes: Array<{
    id: string;
    slug: string;
    title: string | null;
    language: string;
    views: number;
    createdAt: Date;
  }>;
}

export function Sidebar({ user, stats, recentPublicPastes }: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
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

  function getUserInitials(name?: string, email?: string): string {
    if (name) {
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  }

  return (
    <div className="w-80 border-r bg-muted/30">
      <div className="flex h-full flex-col">
        {/* User Info */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} alt={user.name || user.email} />
              <AvatarFallback>
                {getUserInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {user.name || "User"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold">{stats.totalPastes}</div>
                <p className="text-xs text-muted-foreground">Total Pastes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
          </div>

          {/* Create Paste Button */}
          <Button asChild className="w-full">
            <Link href="/" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Paste
            </Link>
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>

        <Separator />

        {/* Recent Public Pastes Feed */}
        <div className="p-4 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Recent Public Pastes</h3>
          </div>
          
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {recentPublicPastes.length > 0 ? (
                recentPublicPastes.map((paste) => (
                  <Card key={paste.id} className="p-3 hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <Link
                        href={`/${paste.slug}`}
                        className="block text-sm font-medium hover:underline line-clamp-1"
                      >
                        {paste.title || `Paste ${paste.slug}`}
                      </Link>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {paste.language}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {paste.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(paste.createdAt, { 
                            addSuffix: true 
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4">
                  <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No public pastes yet
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Powered by Dup</span>
          </div>
        </div>
      </div>
    </div>
  );
}