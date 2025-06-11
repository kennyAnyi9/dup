"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on dashboard and auth routes
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/login") || 
      pathname.startsWith("/register") || 
      pathname.startsWith("/sign-in") || 
      pathname.startsWith("/sign-up")) {
    return null;
  }
  
  return <Footer />;
}