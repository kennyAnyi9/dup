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
    <div className="flex flex-col h-full">
      {/* Pastes Cards */}
      <div className="flex-1 min-h-0">
        <PastesContentWrapper pastes={pastes} />
      </div>

      {/* Pagination - Compact badge-like style, sticky at bottom */}
      {pagination.totalPages > 1 && (
        <div className="sticky bottom-2 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="pointer-events-auto bg-background/80 backdrop-blur-md border border-border rounded-xl px-4 py-2 shadow-lg">
            <DashboardPagination pagination={pagination} />
          </div>
        </div>
      )}
    </div>
  );
}