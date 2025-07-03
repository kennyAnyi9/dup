"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/dupui/button";
import { useCallback } from "react";

export function SidebarNewPasteButton() {
  const router = useRouter();

  const handleClick = useCallback(() => router.push('/new'), [router]);

  return (
    <Button
      onClick={handleClick}
      className="w-full"
    >
      Create New Paste
    </Button>
  );
}
