"use client";

import { Button } from "@/shared/components/dupui/button";
import { MousePointerClick } from "lucide-react";
import Link from "next/link";

export function HomeClient() {
  return (
    <div className="font-commit-mono flex flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto">
      <Button
        variant="outline"
        onClick={() => document.getElementById('try-it-out')?.scrollIntoView({ behavior: 'smooth' })}
        className="rounded-none w-fit sm:w-auto cursor-pointer px-7 py-5 transition-colors hover:bg-accent"
      >
        Try it out
      </Button>

      <Button asChild variant={"ghost"} className="w-fit sm:w-auto rounded-none px-7 py-5 transition-colors hover:bg-accent">
        <Link href="/register" className="flex items-center justify-center gap-2">Get Started<MousePointerClick className="size-5 stroke-1 mt-1"/></Link>
      </Button>
    </div>
  );
}
