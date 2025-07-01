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
      className="w-full flex items-center justify-between"
    >
      <span>Create New Paste</span>
      <kbd aria-hidden className="inline-flex h-4 select-none items-center gap-1 rounded border bg-muted border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        N
      </kbd>
    </Button>
  );
}
