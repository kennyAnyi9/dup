"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/shared/components/common/logo";
import { getUserInitials } from "@/shared/types/auth";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { Button } from "@/shared/components/dupui/button";
import { Badge } from "@/shared/components/dupui/badge";
import { Separator } from "@/shared/components/dupui/separator";
import { ScrollArea } from "@/shared/components/dupui/scroll-area";
import { SidebarNewPasteButton } from "./sidebar-new-paste-button";
import { signOut } from "@/shared/hooks/use-auth";
import { toast } from "sonner";
import {
  BarChart3,
  FileText,
  Home,
  Settings,
  Globe,
  Eye,
  Clock,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  stats: {
    totalPastes: number;
    totalViews: number;
  };
  recentPublicPastes: Array<{
    id: string;
    slug: string;
    title: string | null;
    description: string | null;
    language: string;
    views: number;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  }>;
}

export function Sidebar({ user, stats, recentPublicPastes }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  }

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


  return (
    <div className="w-80 border-r bg-muted/30">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="p-6 pb-0">
          <Link href="/" className="flex justify-center mb-6">
            <Logo 
              width={200}
              height={56}
              className="h-14 w-auto"
            />
          </Link>
        </div>

        {/* User Info */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
              <AvatarFallback>
                {getUserInitials(user)}
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
            <div className="p-3 rounded-md border border-border">
              <div className="text-2xl font-bold">{stats.totalPastes}</div>
              <p className="text-xs text-muted-foreground">Total Pastes</p>
            </div>
            <div className="p-3 rounded-md border border-border">
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>

          {/* Create Paste Button */}
          <SidebarNewPasteButton />
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
                  <div key={paste.id} className="p-3 rounded-md border border-border hover:bg-muted/50 transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        {paste.user && (
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={paste.user.image || undefined} alt={paste.user.name} />
                            <AvatarFallback className="text-xs bg-muted text-[10px]">
                              {paste.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/p/${paste.slug}`}
                            className="block text-sm font-medium hover:underline line-clamp-1"
                          >
                            {paste.title || `Paste ${paste.slug}`}
                          </Link>
                          {paste.user && (
                            <p className="text-xs text-muted-foreground">
                              by {paste.user.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {paste.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {paste.description}
                        </p>
                      )}
                      
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
                  </div>
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

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 border-red-200"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </div>
  );
}