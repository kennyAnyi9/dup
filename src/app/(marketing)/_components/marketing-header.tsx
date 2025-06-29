"use client";
import { AuthStatus } from "@/app/(marketing)/_components/auth-status";
import { Vertex } from "@/app/(marketing)/_components/vertex";
import { Logo } from "@/components/common/logo";
import Link from "next/link";

export function MarketingHeader() {
  return (
    <div className="w-full flex flex-row justify-between h-12 sm:h-18 border-b">
      <Vertex>
        <Link href="/" className="size-full flex justify-center items-center">
          <Logo priority />
        </Link>
      </Vertex>
      <header className="max-w-7xl"></header>
      <Vertex className="border-l">
        <AuthStatus />
      </Vertex>
    </div>
  );
}
