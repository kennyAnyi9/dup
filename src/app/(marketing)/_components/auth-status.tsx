import { useAuth } from "@/shared/hooks/use-auth";
import Link from "next/link";

export function AuthStatus() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated ? (
        <Link
          href="/dashboard"
          className="size-full flex justify-center items-center hover:bg-accent"
        >
          <span className="text-xs md:text-lg">Dashboard</span>
        </Link>
      ) : (
        <Link
          href="/login"
          className="size-full flex justify-center items-center bg-black dark:bg-white  hover:bg-black/80 dark:hover:bg-primary"
        >
          <span className="text-xs md:text-base text-primary-foreground">
            Get Started
          </span>
        </Link>
      )}
    </>
  );
}
