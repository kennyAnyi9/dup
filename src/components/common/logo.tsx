"use client";

import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ 
  width = 240, 
  height = 64, 
  className = "h-16 w-auto",
  priority = false 
}: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a default logo during SSR to avoid hydration mismatch
    return (
      <Image
        src="/dup-dark2.png"
        alt={APP_NAME}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? "/du-light.png" : "/dup-dark2.png";

  return (
    <Image
      src={logoSrc}
      alt={APP_NAME}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}