// Force dynamic rendering for auth layout
export const dynamic = 'force-dynamic';

import { GridPattern } from "@/components/magicui/grid-pattern";
import { Logo } from "@/components/common/logo";
import { Card, CardContent } from "@/shared/components/dupui/card";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  // Let client-side logic handle redirects to preserve URL parameters
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        className={cn(
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] opacity-50 dark:opacity-25"
        )}
      />

      {/* Logo at top center */}
      <div className="mb-8 relative z-10">
        <Link href="/" className="flex justify-center">
          <Logo />
        </Link>
      </div>

      {/* Auth content */}
      <div className="w-full max-w-md relative z-10">
        <Card className="border-border/60 backdrop-blur-sm bg-background/95">
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
