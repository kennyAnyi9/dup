// Force dynamic rendering for auth layout
export const dynamic = 'force-dynamic';

import { GridPattern } from "@/components/magicui/grid-pattern";
import { Logo } from "@/components/common/logo";
import { Card, CardContent } from "@/shared/components/dupui/card";
import { cn } from "@/shared/lib/utils";
import { getCurrentUser } from "@/shared/lib/auth-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Check if user is already authenticated
  const user = await getCurrentUser();
  
  if (user) {
    redirect("/dashboard");
  }
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
