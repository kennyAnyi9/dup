"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/dupui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/dupui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { ThemeSwitch } from "@/shared/components/theme/theme-switch";
import { signOut } from "@/shared/hooks/use-auth";
import { Settings, LogOut, Palette } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/features/dashboard/types";
import { getUserInitials } from "@/shared/types/auth";

interface DashboardProfileDropdownProps {
  user: User;
}

export function DashboardProfileDropdown({ user }: DashboardProfileDropdownProps) {
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


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
            <AvatarFallback>
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name || "User"}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="text-sm">Theme</span>
          </div>
          <ThemeSwitch />
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}