"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function ConditionalHeader() {
  const pathname = usePathname() ?? "";
  
  // Hide header on dashboard, auth routes, and paste detail pages
  const hiddenRoots = ["/dashboard", "/login", "/register", "/sign-in", "/sign-up", "/p/"];
  if (hiddenRoots.some((root) => pathname.startsWith(root))) {
    return null;
  }
  
  return <Header />;
}