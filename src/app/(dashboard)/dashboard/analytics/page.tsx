// Force dynamic rendering for analytics page
export const dynamic = "force-dynamic";

import { getRecentPublicPastes } from "@/features/paste/actions/paste.actions";
import { PasteModalProvider } from "@/features/paste/components/providers/paste-modal-provider";
import { getCurrentUser } from "@/shared/lib/auth-server";
import { getUserAnalytics } from "@/shared/lib/analytics";
import { UserAnalyticsDashboard } from "@/features/analytics/components/user-analytics-dashboard";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "../../_components/dashboard-header";
import { DashboardMainLayout } from "../../_components/dashboard-main-layout";

export const metadata: Metadata = {
  title: "Analytics - Dup",
  description: "View analytics and insights for your pastes, including views, popular languages, and engagement metrics.",
};

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    // Fetch analytics data and recent public pastes
    const [analytics, recentPublicPastesData] = await Promise.all([
      getUserAnalytics(user.id),
      getRecentPublicPastes(5)
    ]);

    return (
      <PasteModalProvider>
        <div className="container relative mx-auto flex h-screen w-full flex-col items-center overflow-hidden border border-border rounded-lg m-4 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]">
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
            search=""
            filter=""
            sort=""
            loadingFallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                  Insights and statistics for your pastes
                </p>
              </div>
              <UserAnalyticsDashboard analytics={analytics} />
            </div>
          </DashboardMainLayout>
        </div>
      </PasteModalProvider>
    );
  } catch (error) {
    console.error("Error loading user analytics:", error);
    
    // Fetch recent public pastes for error state
    const recentPublicPastesData = await getRecentPublicPastes(5);
    
    return (
      <PasteModalProvider>
        <div className="container relative mx-auto flex h-screen w-full flex-col items-center overflow-hidden border border-border rounded-lg m-4 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]">
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
            search=""
            filter=""
            sort=""
            loadingFallback={<div />}
          >
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Analytics Unavailable</h1>
              <p className="text-muted-foreground">
                We&apos;re unable to load your analytics data right now. Please try again later.
              </p>
            </div>
          </DashboardMainLayout>
        </div>
      </PasteModalProvider>
    );
  }
}