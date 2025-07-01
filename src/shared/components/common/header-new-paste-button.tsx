"use client";

import { Button } from "@/shared/components/dupui/button";
import { useRouter } from "next/navigation";

export function HeaderNewPasteButton() {
  const router = useRouter();

  return (
    <Button
      size="sm"
      className="hidden sm:flex gap-2"
      onClick={() => router.push('/new')}
    >
      New Paste
    </Button>
  );
}
