"use client";

import { Button } from "@/shared/components/dupui/button";
import Link from "next/link";

export function HomeClient() {
  return (
    <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto">
      <Button
        variant="secondary"
        asChild
        className="w-fit sm:w-auto cursor-pointer px-7 py-5"
      >
        <Link href="/new">Try it out</Link>
      </Button>

      <Button asChild className="w-fit sm:w-auto ">
        <Link href="/register">Get Started</Link>
      </Button>
    </div>
  );
}
