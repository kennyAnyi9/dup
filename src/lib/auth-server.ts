import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}