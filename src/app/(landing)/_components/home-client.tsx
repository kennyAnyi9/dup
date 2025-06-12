"use client";

import { usePasteModal } from "@/components/shared/paste/paste-modal-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HomeClient() {
  const { openModal } = usePasteModal();

  return (
    <div className="flex gap-4 justify-center">
      <Button onClick={() => openModal("")}>Try it out</Button>

      <Button variant="outline" asChild>
        <Link href="/register">Get Started</Link>
      </Button>
    </div>
  );
}
