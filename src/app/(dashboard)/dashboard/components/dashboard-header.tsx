import { Logo } from "@/shared/components/common/logo";
import { DashboardHeaderButton } from "@/features/dashboard/components/ui/dashboard-header-button";
import { DashboardMobileSidebar } from "@/features/dashboard/components/navigation/dashboard-mobile-sidebar";
import { DashboardHeaderProps } from "@/features/dashboard/types";
import Link from "next/link";

export function DashboardHeader({
  recentPublicPastes,
  totalPublicPastes,
  user,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-2 z-50 w-full">
      <div className="w-full rounded-lg border border-border bg-background/70 px-4 py-2 backdrop-blur-lg">
        <div className="flex w-full items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <DashboardMobileSidebar
              recentPublicPastes={recentPublicPastes}
              totalPublicPastes={totalPublicPastes}
              user={user}
            />
            <Link className="shrink-0" href="/">
              <Logo width={240} height={64} className="h-16 w-auto" />
            </Link>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-slash -rotate-12 mr-0.5 ml-2.5 h-4 w-4 text-muted-foreground hidden sm:block"
            >
              <path d="M22 2 2 22"></path>
            </svg>
            <div className="w-20 sm:w-40 hidden sm:block">
              <span className="truncate text-sm font-medium">
                My Pastes
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <DashboardHeaderButton />
          </div>
        </div>
      </div>
    </header>
  );
}