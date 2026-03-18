"use client";

import { Card, CardContent } from "@/shared/components/dupui/card";
import Link from "next/link";
import { ReactNode, Suspense, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Glow } from "@/app/(marketing)/_components/glow";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
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
    <Glow className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Auth content */}
      <div className="w-full max-w-md relative z-10">
        <Card className="border-border/60 backdrop-blur-sm bg-background/95 rounded-2xl">
          <CardContent className="p-6">
            <Link
              href="/"
              className="flex justify-center items-center gap-2 text-xl font-semibold mb-6"
            >
              [dup]
            </Link>
            <Suspense>{children}</Suspense>
          </CardContent>
        </Card>
      </div>
    </Glow>
  );
}
