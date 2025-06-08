"use client";

import { useAuth } from "@/hooks/use-auth";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { Plus } from "lucide-react";

export function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {APP_NAME[0].toUpperCase()}
                </span>
              </div>
              <span className="font-bold text-xl">{APP_NAME}</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    My Pastes
                  </Link>
                  <Link 
                    href="/new" 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    New Paste
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeSwitch />
            
            {isAuthenticated ? (
              <>
                <Button asChild size="sm" className="hidden sm:flex">
                  <Link href="/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Paste
                  </Link>
                </Button>
                
                <UserDropdown />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}