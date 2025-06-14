"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on dashboard, auth routes, and paste detail pages
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/login") || 
      pathname.startsWith("/register") || 
      pathname.startsWith("/sign-in") || 
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/p/")) {
    return null;
  }
  
  return <Header />;
}