import { DashboardSidebar } from "@/features/dashboard/components/navigation/dashboard-sidebar";
import { SearchFilters } from "@/features/dashboard/components/ui/search-filters";
import { Suspense, ReactNode } from "react";
import { User } from "better-auth";

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
  return (
    <main className="z-10 flex w-full flex-1 flex-col items-start overflow-hidden min-w-0">
      <div className="flex w-full flex-1 flex-col lg:flex-row overflow-hidden min-w-0">
        {/* Main Content Area */}
        <div className="flex-1 lg:basis-4/5 backdrop-blur-[2px] relative overflow-hidden min-w-0">
          <div className="h-full overflow-auto px-3 py-4 md:p-6">
            <div className="flex flex-col gap-3">
              {/* Search and Filters */}
              <SearchFilters
                defaultSearch={search}
                defaultFilter={filter}
                defaultSort={sort}
              />

              {/* Content */}
              <div>
                <Suspense fallback={loadingFallback}>
                  {children}
                </Suspense>
              </div>
            </div>
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