import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your pastes",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Pastes</h1>
        <p className="text-muted-foreground">Manage and organize your code snippets</p>
      </div>
      
      <div className="bg-muted/50 p-8 rounded-lg text-center">
        <p className="text-muted-foreground">Dashboard content will be implemented here</p>
      </div>
    </div>
  );
}