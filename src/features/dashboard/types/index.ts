import type { User } from "@/shared/types/auth";
export type { User };

export interface RecentPublicPaste {
  id: string;
  slug: string;
  title: string | null;
  language: string;
  views: number;
  createdAt: Date;
}

// Mobile sidebar can function without paste data for basic user profile display
export interface DashboardMobileSidebarProps {
  recentPublicPastes?: RecentPublicPaste[];
  totalPublicPastes?: number;
  user: User;
}

// Header component requires paste data for complete dashboard functionality  
export interface DashboardHeaderProps {
  recentPublicPastes: RecentPublicPaste[];
  totalPublicPastes: number;
  user: User;
}

export interface UserProfileSectionProps {
  user: User;
  onClose: () => void;
}

export interface RecentPastesSectionProps {
  recentPublicPastes: RecentPublicPaste[];
  totalPublicPastes: number;
  onClose: () => void;
}
