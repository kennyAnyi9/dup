"use client";

import { NewPasteButton } from "@/features/dashboard/components/ui/new-paste-button";
import { DashboardMobileSidebar } from "@/features/dashboard/components/navigation/dashboard-mobile-sidebar";
import { DashboardHeaderProps } from "@/features/dashboard/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Asterisk, BarChart3, FileText, Settings } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function DashboardHeader({
  recentPublicPastes,
  totalPublicPastes,
  user,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/dashboard/pastes",
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
    <header className="z-50 w-full border-b border-border">
      <div className="w-full bg-background/70 px-4 py-2 backdrop-blur-lg">
        <div className="flex w-full items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <DashboardMobileSidebar
              recentPublicPastes={recentPublicPastes}
              totalPublicPastes={totalPublicPastes}
              user={user}
            />
            <Link className="shrink-0 flex items-center gap-1" href="/">
              <Asterisk className="size-4" />[dup]
            </Link>
            
            {/* Navigation tabs - hidden on mobile */}
            <div className="hidden lg:flex items-center ml-6">
              <nav className="flex items-center space-x-1 border ">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 text-sm  transition-all duration-200",
                        isActive
                          ?"bg-muted"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <NewPasteButton />
          </div>
        </div>
      </div>
    </header>
  );
}