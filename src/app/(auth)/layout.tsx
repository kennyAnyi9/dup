import { GridPattern } from "@/components/magicui/grid-pattern";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
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
          <Image
            src="/dup-dark2.png"
            alt={APP_NAME}
            width={240}
            height={64}
            className="h-16 w-auto"
          />
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
