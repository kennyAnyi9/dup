import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo at top center */}
      <div className="mb-8">
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
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}