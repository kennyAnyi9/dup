"use client";

import { APP_NAME } from "@/lib/constants";
import { useTheme } from "next-themes";
import Image from "next/image";
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
  priority = false,
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
        src="/dup-dark.png"
        alt={APP_NAME}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? "/dup-dark.png" : "/dup-light.png";

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
