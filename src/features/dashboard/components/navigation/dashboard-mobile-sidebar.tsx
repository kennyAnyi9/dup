"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/dupui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/dupui/drawer";
import { ScrollArea } from "@/shared/components/dupui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { signOut } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Settings,
  Globe,
  Eye,
  Menu,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardMobileSidebarProps } from "@/features/dashboard/types";

export function DashboardMobileSidebar({ 
  recentPublicPastes = [], 
  totalPublicPastes = 0,
  user
}: DashboardMobileSidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  function getUserInitials(name?: string | null, email?: string): string {
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

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
      toast.success("Signed out successfully");
      setOpen(false);
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
      href: "/dashboard",
      label: "My Pastes",
      icon: FileText,
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-8 w-8 p-0"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90dvh] max-h-[90vh] w-full max-w-none mb-4">
        <DrawerHeader className="pb-4">
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        
        <ScrollArea className="h-full overflow-y-auto touch-pan-y overscroll-contain">
          <div className="flex flex-col px-4 pb-8 gap-6">
            {/* User Profile Section */}
            <div className="shrink-0">
              <div className="p-4 rounded-lg bg-muted/30 border space-y-4 relative">
                {/* Theme Toggle - Top Right Corner */}
                <div className="absolute top-3 right-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <ThemeSwitch />
                  </Button>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3 pr-10">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getUserInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Profile Navigation */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex flex-col items-center gap-1 p-3 rounded-md hover:bg-background/50 transition-colors text-center"
                      >
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Profile Actions */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  {/* Settings Link */}
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-background/50 transition-colors text-sm font-medium"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>

                  {/* Sign Out Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full justify-start p-2 h-auto font-medium text-red-600 hover:text-red-600 hover:bg-red-50 gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {isSigningOut ? "Signing out..." : "Sign out"}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Recent Public Pastes Feed */}
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
                      onClick={() => setOpen(false)}
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
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}