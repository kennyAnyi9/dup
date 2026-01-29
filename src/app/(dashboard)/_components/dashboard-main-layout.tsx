"use client";

import { DashboardSidebar } from "@/features/dashboard/components/navigation/dashboard-sidebar";
import { SearchFilters } from "@/features/dashboard/components/ui/search-filters";
import { NewPasteButton } from "@/features/dashboard/components/ui/new-paste-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { Button } from "@/shared/components/dupui/button";
import { Suspense, ReactNode } from "react";
import { User } from "better-auth";
import { usePathname } from "next/navigation";
import { FolderPlus } from "lucide-react";

interface DashboardMainLayoutProps {
  recentPublicPastes: Array<{
    id: string;
    slug: string;
    title: string | null;
    language: string;
    views: number;
    createdAt: Date;
  }>;
  totalPublicPastes: number;
  user: User;
  search: string;
  filter: string;
  sort: string;
  children: ReactNode;
  loadingFallback: ReactNode;
}

export function DashboardMainLayout({
  recentPublicPastes,
  totalPublicPastes,
  user,
  search,
  filter,
  sort,
  children,
  loadingFallback,
}: DashboardMainLayoutProps) {
  const pathname = usePathname();
  const showSearchFilters = pathname?.includes('/pastes');

  return (
    <main className="z-10 flex w-full flex-1 flex-col items-start overflow-hidden min-w-0">
      <div className="flex w-full flex-1 flex-col lg:flex-row overflow-hidden min-w-0">
        {/* Main Content Area */}
        <div className="flex-1 lg:basis-[70%] backdrop-blur-[2px] relative overflow-hidden min-w-0">
          <div className="h-full overflow-auto px-3 py-4 md:p-6">
            {/* Page Title - Only show for pastes page */}
            {showSearchFilters && (
              <div className="mt-8 mb-6 flex items-center justify-between">
                <h1 className="text-xl font-commit-mono">
                  Pastes
                </h1>
                <NewPasteButton />
              </div>
            )}

            {/* Filters - Only show for pastes page */}
            {showSearchFilters ? (
              <SearchFilters
                defaultSearch={search}
                defaultFilter={filter}
                defaultSort={sort}
              >
                <Suspense fallback={loadingFallback}>
                  {children}
                </Suspense>
              </SearchFilters>
            ) : (
              <Suspense fallback={loadingFallback}>
                {children}
              </Suspense>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <DashboardSidebar
          recentPublicPastes={recentPublicPastes}
          totalPublicPastes={totalPublicPastes}
          user={user}
        />
      </div>
    </main>
  );
}