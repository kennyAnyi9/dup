"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on dashboard and auth routes
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/login") || 
      pathname.startsWith("/register") || 
      pathname.startsWith("/sign-in") || 
      pathname.startsWith("/sign-up")) {
    return null;
  }
  
  return <Header />;
}