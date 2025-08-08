// Force dynamic rendering for settings page
export const dynamic = "force-dynamic";

import { getRecentPublicPastes } from "@/features/paste/actions/paste.actions";
import { PasteModalProvider } from "@/features/paste/components/providers/paste-modal-provider";
import { getCurrentUser } from "@/shared/lib/auth-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "../../_components/dashboard-header";
import { DashboardMainLayout } from "../../_components/dashboard-main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/dupui/card";

export const metadata: Metadata = {
  title: "Settings - Dup",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch recent public pastes for sidebar
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
          loadingFallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <p className="text-muted-foreground">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Additional settings and preferences will be available soon.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardMainLayout>
      </div>
    </PasteModalProvider>
  );
}