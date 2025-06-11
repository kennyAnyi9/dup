import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { getUserPastes, getUserStats, getRecentPublicPastes } from "@/app/actions/paste";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SearchFilters } from "@/components/dashboard/search-filters";
import { PasteCard } from "@/components/paste/paste-card";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { DashboardHeaderButton } from "@/components/dashboard/dashboard-header-button";
import { EmptyState } from "@/components/dashboard/dashboard-empty-states";
import { Card } from "@/components/ui/card";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Dashboard - Dup",
  description: "Manage your pastes and view analytics",
};

interface SearchParams {
  page?: string;
  search?: string;
  filter?: "all" | "public" | "private" | "unlisted";
  sort?: "newest" | "oldest" | "views";
}

interface DashboardPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Parse search params
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const filter = params.filter || "all";
  const sort = params.sort || "newest";

  return (
    <DashboardWrapper>
      <div className="flex h-screen">
        <Suspense fallback={<SidebarSkeleton />}>
          <DashboardSidebar user={user} />
        </Suspense>
        
        <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">My Pastes</h1>
                <p className="text-muted-foreground">
                  Manage and organize your code snippets
                </p>
              </div>
              <DashboardHeaderButton />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="space-y-6">
              {/* Search and Filters */}
              <SearchFilters
                defaultSearch={search}
                defaultFilter={filter}
                defaultSort={sort}
              />

              {/* Content */}
              <Suspense fallback={<PastesLoading />}>
                <PastesContent
                  page={page}
                  search={search}
                  filter={filter}
                  sort={sort}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
    </DashboardWrapper>
  );
}

async function DashboardSidebar({ user }: { user: { id: string; name?: string | null; email: string; image?: string | null } }) {
  const [stats, recentPublicPastes] = await Promise.all([
    getUserStats(),
    getRecentPublicPastes(5),
  ]);

  return (
    <Sidebar 
      user={user} 
      stats={stats || { totalPastes: 0, totalViews: 0 }} 
      recentPublicPastes={recentPublicPastes} 
    />
  );
}

async function PastesContent({
  page,
  search,
  filter,
  sort,
}: {
  page: number;
  search: string;
  filter: "all" | "public" | "private" | "unlisted";
  sort: "newest" | "oldest" | "views";
}) {
  const result = await getUserPastes(page, 12, search, filter, sort);
  const { pastes, pagination } = result;

  if (pastes.length === 0) {
    return <EmptyState hasSearch={!!search || filter !== "all"} />;
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {pastes.length} of {pagination.total} pastes
          {search && ` for "${search}"`}
          {filter !== "all" && ` (${filter})`}
        </div>
      </div>

      {/* Pastes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pastes.map((paste) => (
          <PasteCard 
            key={paste.id} 
            paste={paste}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationComponent pagination={pagination} />
      )}
    </div>
  );
}

function PaginationComponent({ 
  pagination 
}: { 
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
}) {
  const { page, totalPages, hasNext, hasPrev } = pagination;
  
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show
    
    if (totalPages <= showPages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (page <= 3) {
        // Show first few pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Show last few pages
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={hasPrev ? `?page=${page - 1}` : undefined}
            className={!hasPrev ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {pageNumbers.map((pageNum, index) => (
          <PaginationItem key={index}>
            {pageNum === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink 
                href={`?page=${pageNum}`}
                isActive={pageNum === page}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            href={hasNext ? `?page=${page + 1}` : undefined}
            className={!hasNext ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}


function SidebarSkeleton() {
  return (
    <div className="w-80 border-r bg-muted/30 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-muted animate-pulse rounded" />
          <div className="h-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

function PastesLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}