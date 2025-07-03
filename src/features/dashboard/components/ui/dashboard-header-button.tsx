"use client";

import { Button } from "@/shared/components/dupui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function DashboardHeaderButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push('/new')} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      New Paste
    </Button>
  );
}