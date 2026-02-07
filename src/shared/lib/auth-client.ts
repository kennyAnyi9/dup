import { createAuthClient } from "better-auth/react";

// Lazy initialization to prevent SSR localStorage access
let _authClient: ReturnType<typeof createAuthClient> | null = null;

function getAuthClient() {
  if (typeof window === "undefined") {
    // Return mock client during SSR to prevent localStorage errors
    return {
      useSession: () => ({ data: null, isPending: false, error: null }),
      signIn: async () => ({ data: null, error: null }),
      signOut: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
    } as unknown as ReturnType<typeof createAuthClient>;
  }

  if (!_authClient) {
    _authClient = createAuthClient({
      baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    });
  }
  return _authClient;
}

export const authClient = getAuthClient();

/**
 * Better Auth React Client
 *
 * Once you have created the client, you can use it to sign up, sign in, and perform other actions.
 * Some of the actions are reactive. The client uses nano-store to store the state and re-render
 * the components when the state changes.
 *
 * The client also uses better-fetch to make the requests. You can pass the fetch configuration to the client.
 *
 * @see https://www.better-auth.com/docs/authentication/client
 * @see https://www.better-auth.com/docs/concepts/client-side
 */
