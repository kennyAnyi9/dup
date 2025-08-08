import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/lib/auth-server";
import { getPasteAnalytics } from "@/shared/lib/analytics";
import { getRecentPublicPastes } from "@/features/paste/actions/paste.actions";
import { PasteAnalyticsDashboard } from "@/features/analytics/components/paste-analytics-dashboard";
import { PasteModalProvider } from "@/features/paste/components/providers/paste-modal-provider";
import { DashboardHeader } from "../../../_components/dashboard-header";
import { DashboardMainLayout } from "../../../_components/dashboard-main-layout";

interface PageProps {
  params: Promise<{
    pasteId: string;
  }>;
}

export default async function PasteAnalyticsPage({ params }: PageProps) {
  const { pasteId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  try {
    // Fetch analytics data and recent public pastes
    const [analytics, recentPublicPastesData] = await Promise.all([
      getPasteAnalytics(pasteId, user.id),
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
            <PasteAnalyticsDashboard analytics={analytics} />
          </DashboardMainLayout>
        </div>
      </PasteModalProvider>
    );
  } catch (error) {
    console.error("Error loading paste analytics:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { pasteId } = await params;
  
  try {
    const user = await getCurrentUser();
    if (!user) return { title: "Analytics - Dup" };
    
    const analytics = await getPasteAnalytics(pasteId, user.id);
    const title = analytics.paste.title || `Paste ${analytics.paste.slug}`;
    
    return {
      title: `${title} - Analytics - Dup`,
      description: `Analytics dashboard for ${title} with view statistics and insights.`,
    };
  } catch {
    return {
      title: "Paste Analytics - Dup",
    };
  }
}