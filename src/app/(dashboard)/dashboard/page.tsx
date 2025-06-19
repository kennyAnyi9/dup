// Force dynamic rendering for dashboard page
export const dynamic = 'force-dynamic';

import { getRecentPublicPastes } from "@/features/paste/actions/paste.actions";
import { PasteModalProvider } from "@/features/paste/components/providers/paste-modal-provider";
import { getCurrentUser } from "@/shared/lib/auth-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardMainLayout } from "./components/dashboard-main-layout";
import { PastesContent } from "./components/pastes-content";
import { DashboardLoading } from "./components/dashboard-loading";

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

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
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
    <PasteModalProvider>
      <div className="container relative mx-auto flex h-screen w-full flex-col items-center gap-6 p-4 overflow-hidden">
        {/* Header */}
        <DashboardHeader
          recentPublicPastes={recentPublicPastesData.pastes}
          totalPublicPastes={recentPublicPastesData.total}
          user={user}
        />

        {/* Main Content */}
        <DashboardMainLayout
          recentPublicPastes={recentPublicPastesData.pastes}
          totalPublicPastes={recentPublicPastesData.total}
          user={user}
          search={search}
          filter={filter}
          sort={sort}
          loadingFallback={<DashboardLoading />}
        >
          <PastesContent
            page={page}
            search={search}
            filter={filter}
            sort={sort}
          />
        </DashboardMainLayout>
      </div>
    </PasteModalProvider>
  );
}