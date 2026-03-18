"use client";

import { useTheme } from "next-themes";
import { ReactNode, useEffect, useRef } from "react";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const { setTheme, theme } = useTheme();
  const previousTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    previousTheme.current = theme;
    setTheme("dark");

    return () => {
      if (previousTheme.current) {
        setTheme(previousTheme.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-x-hidden">
      {children}
    </div>
  );
}
