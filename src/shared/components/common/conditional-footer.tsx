"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on dashboard, auth routes, paste creation, and paste detail pages
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/login") || 
      pathname.startsWith("/register") || 
      pathname.startsWith("/sign-in") || 
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/new") ||
      pathname.startsWith("/p/")) {
    return null;
  }
  
  return <Footer />;
}