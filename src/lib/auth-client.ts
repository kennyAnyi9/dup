import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/*
Once you have created the client, you can use it to sign up, sign in, and perform other actions. Some of the actions are reactive. The client uses nano-store to store the state and re-render the components when the state changes.

The client also uses better-fetch to make the requests. You can pass the fetch configuration to the client.
*/
