"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  useSession,
  signIn,
  signOut,
  signUp,
  useUser,
} = authClient;

export function useAuth() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  return {
    user,
    session,
    isLoading: isPending,
    isAuthenticated: !!user,
  };
}