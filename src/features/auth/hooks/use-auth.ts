"use client";

import { authClient } from "../lib/auth-client";

export const {
  useSession,
  signIn,
  signOut,
  signUp,
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