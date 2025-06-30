// Authentication and user-related type definitions

export interface User {
  id: string;
  name?: string | null;
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
  if (user.name) {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  
  // Fallback to email if no name
  return user.email[0].toUpperCase();
}