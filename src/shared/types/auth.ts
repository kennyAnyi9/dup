// Authentication and user-related type definitions

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

// Session-related types
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

// Auth utility types
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// OAuth provider types
export type OAuthProvider = "github" | "google";

// User utility function
export function getUserInitials(user: User): string {
  // Validate input
  if (!user?.email || !user?.name) {
    return "?";
  }

  if (user.name.trim()) {
    return user.name
      .trim()
      .split(" ")
      .filter(part => part.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  
  // Fallback to email if no name
  return user.email[0].toUpperCase();
}