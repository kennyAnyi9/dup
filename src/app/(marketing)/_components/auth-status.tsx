import { useAuth } from "@/shared/hooks/use-auth";
import Link from "next/link";

export function AuthStatus() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated ? (
        <Link
          href="/dashboard"
          className="size-full flex justify-center items-center hover:bg-accent transition-colors text-xs md:text-lg"
        >
          Dashboard
        </Link>
      ) : (
        <Link
          href="/login"
          className="size-full flex justify-center items-center bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/90 transition-colors text-xs md:text-base text-primary-foreground"
        >
          Get Started
        </Link>
      )}
    </>
  );
}
