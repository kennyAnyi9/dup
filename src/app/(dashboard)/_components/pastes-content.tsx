import { getUserPastes } from "@/features/paste/actions/paste.actions";
import { EmptyState } from "@/features/dashboard/components/ui/dashboard-empty-states";
import { PastesContentWrapper } from "@/features/dashboard/components/layout/pastes-content-wrapper";
import { DashboardPagination } from "./dashboard-pagination";

interface PastesContentProps {
  page: number;
  search: string;
  filter: "all" | "public" | "private" | "unlisted";
  sort: "newest" | "oldest" | "views" | "relevance";
}

export async function PastesContent({
  page,
  search,
  filter,
  sort,
}: PastesContentProps) {
  const result = await getUserPastes(page, 10, search, filter, sort);
  const { pastes, pagination } = result;

  if (pastes.length === 0) {
    return <EmptyState hasSearch={!!search || filter !== "all"} />;
  }

  return (
    <div className="flex flex-col h-full space-y-2">
      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground shrink-0">
        <div>
          Showing {pastes.length} of {pagination.total} pastes
          {search && ` for "${search}"`}
          {filter !== "all" && ` (${filter})`}
        </div>
      </div>

      {/* Pastes Table */}
      <div className="flex-1 min-h-0">
        <PastesContentWrapper pastes={pastes} />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="shrink-0 pt-2 border-t border-border">
          <DashboardPagination pagination={pagination} />
        </div>
      )}
    </div>
  );
}