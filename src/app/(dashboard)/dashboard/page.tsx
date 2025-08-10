import { getCurrentUser } from "@/shared/lib/auth-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Redirect to pastes by default
  redirect("/dashboard/pastes");
}
