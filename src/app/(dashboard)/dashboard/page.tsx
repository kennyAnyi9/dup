import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import { getUserPastes, getRecentPublicPastes } from "@/app/actions/paste";
import { SearchFilters } from "../_components/search-filters";
import { PasteTable } from "@/components/shared/paste/paste-table";
import { DashboardHeaderButton } from "../_components/dashboard-header-button";
import { EmptyState } from "../_components/dashboard-empty-states";
import { DashboardSidebar } from "../_components/dashboard-sidebar";
import { DashboardProfileDropdown } from "../_components/dashboard-profile-dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import Image from "next/image";

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

  // Fetch recent public pastes for sidebar
  const recentPublicPastesData = await getRecentPublicPastes(5);

  return (
    <div className="container relative mx-auto flex h-screen w-full flex-col items-center gap-6 p-4 overflow-hidden">
      {/* Header */}
      <header className="sticky top-2 z-50 w-full border-border">
        <div className="w-full rounded-lg border border-border md:p-6 bg-background/70 px-3 py-3 backdrop-blur-lg md:px-6 md:py-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <Link className="shrink-0" href="/">
                <Image alt="Dup" width={40} height={40} className="rounded-lg border border-border" src="/dup-dark2.png" />
              </Link>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-slash -rotate-12 mr-0.5 ml-2.5 h-4 w-4 text-muted-foreground">
                <path d="M22 2 2 22"></path>
              </svg>
              <div className="w-40">
                <span className="truncate text-sm font-medium">{user.name || user.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DashboardProfileDropdown user={user} />
            </div>
          </div>
          
          {/* Sub Navigation */}
          <div className="-mb-3">
            <nav className="flex items-center overflow-x-auto">
              <ul className="flex flex-row">
                <li className="flex shrink-0 list-none border-primary border-b-2">
                  <span className="rounded-md font-medium text-sm hover:text-primary text-primary px-4 pt-2 pb-3 relative">
                    My Pastes
                  </span>
                </li>
                <li className="flex shrink-0 list-none border-transparent border-b-2">
                  <Link className="rounded-md font-medium text-muted-foreground text-sm hover:text-primary px-4 pt-2 pb-3 relative" href="/dashboard/analytics">
                    Analytics
                  </Link>
                </li>
                <li className="flex shrink-0 list-none border-transparent border-b-2">
                  <Link className="rounded-md font-medium text-muted-foreground text-sm hover:text-primary px-4 pt-2 pb-3 relative" href="/dashboard/settings">
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="z-10 flex w-full flex-1 flex-col items-start overflow-hidden min-w-0">
        <div className="flex w-full flex-1 flex-col gap-4 lg:flex-row lg:gap-6 overflow-hidden min-w-0">
          {/* Sidebar */}
          <DashboardSidebar recentPublicPastes={recentPublicPastesData.pastes} totalPublicPastes={recentPublicPastesData.total} />
          
          {/* Main Content Area */}
          <div className="basis-4/5 rounded-lg border border-border px-3 py-4 backdrop-blur-[2px] md:p-6 relative overflow-hidden min-w-0">
            <div className="flex flex-col gap-3 h-full">
              {/* Page Header */}
              <div className="col-span-full flex items-start justify-between gap-1">
                <div className="flex min-w-0 flex-col gap-1">
                  <h1 className="font-cal text-3xl">My Pastes</h1>
                  <p className="text-muted-foreground">Manage and organize your code snippets.</p>
                </div>
                <DashboardHeaderButton />
              </div>

              {/* Search and Filters */}
              <SearchFilters
                defaultSearch={search}
                defaultFilter={filter}
                defaultSort={sort}
              />

              {/* Content */}
              <div className="flex-1 overflow-hidden">
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
      </main>
    </div>
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
  const result = await getUserPastes(page, 10, search, filter, sort);
  const { pastes, pagination } = result;

  if (pastes.length === 0) {
    return <EmptyState hasSearch={!!search || filter !== "all"} />;
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground shrink-0">
        <div>
          Showing {pastes.length} of {pagination.total} pastes
          {search && ` for "${search}"`}
          {filter !== "all" && ` (${filter})`}
        </div>
      </div>

      {/* Pastes Table */}
      <div className="flex-1 overflow-auto">
        <PasteTable pastes={pastes} />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="shrink-0 pt-2 border-t border-border">
          <PaginationComponent pagination={pagination} />
        </div>
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
    const showPages = 7; // Number of page buttons to show
    
    if (totalPages <= showPages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (page <= 3) {
        // Show first few pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push("...");
          pages.push(totalPages);
        }
      } else if (page >= totalPages - 2) {
        // Show last few pages
        pages.push(1);
        if (totalPages > 6) {
          pages.push("...");
        }
        for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
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



function PastesLoading() {
  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="h-4 bg-muted animate-pulse rounded w-48 shrink-0" />
      <div className="flex-1 overflow-hidden">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-20" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-16" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-12" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-12" />
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-muted animate-pulse rounded w-16" />
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted animate-pulse rounded w-32" />
                      <div className="h-3 bg-muted animate-pulse rounded w-20" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-8" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-12" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}