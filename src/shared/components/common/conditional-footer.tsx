"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname() ?? "";
  
  // Hide footer on dashboard, auth routes, and paste detail pages
  const hiddenRoots = ["/dashboard", "/login", "/register", "/sign-in", "/sign-up", "/p/"];
  if (hiddenRoots.some((root) => pathname.startsWith(root))) {
    return null;
  }
  
  return <Footer />;
}