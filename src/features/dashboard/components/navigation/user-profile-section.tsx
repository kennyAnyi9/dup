"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/dupui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { signOut } from "@/hooks/use-auth";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { UserProfileSectionProps } from "@/features/dashboard/types";

export function UserProfileSection({ user, onClose }: UserProfileSectionProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getUserInitials = useMemo(() => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  }, [user.name, user.email]);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
      toast.success("Signed out successfully");
      onClose();
      router.push("/login");
    } catch (error) {
      toast.error("Failed to sign out");
      if (process.env.NODE_ENV === 'development') {
        console.error("Sign out error:", error);
      }
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
    <div className="shrink-0">
      <div className="p-4 rounded-lg bg-muted/30 border space-y-4 relative">
        {/* Theme Toggle - Top Right Corner */}
        <div className="absolute top-3 right-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            aria-label="Toggle theme"
          >
            <ThemeSwitch />
          </Button>
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-3 pr-10">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getUserInitials}
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
                onClick={onClose}
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
            onClick={onClose}
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
            aria-label={isSigningOut ? "Signing out, please wait" : "Sign out of account"}
            className="w-full justify-start p-2 h-auto font-medium text-red-600 hover:text-red-600 hover:bg-red-50 gap-2"
          >
            <LogOut className={`h-4 w-4 ${isSigningOut ? 'animate-spin' : ''}`} />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </div>
  );
}