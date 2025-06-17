"use client";

import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HomeClient() {
  const { openModal } = usePasteModal();

  return (
    <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto">
      <Button
        variant="secondary"
        onClick={() => openModal("")}
        className="w-fit sm:w-auto cursor-pointer px-7 py-5"
      >
        Try it out
      </Button>

      <Button asChild className="w-fit sm:w-auto ">
        <Link href="/register">Get Started</Link>
      </Button>
    </div>
  );
}
