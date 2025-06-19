export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}

export interface RecentPublicPaste {
  id: string;
  slug: string;
  title: string | null;
  language: string;
  views: number;
  createdAt: Date;
}

export interface DashboardMobileSidebarProps {
  recentPublicPastes?: RecentPublicPaste[];
  totalPublicPastes?: number;
  user: User;
}

export interface DashboardHeaderProps {
  recentPublicPastes: RecentPublicPaste[];
  totalPublicPastes: number;
  user: User;
}
