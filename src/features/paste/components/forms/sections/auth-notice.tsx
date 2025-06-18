import Link from "next/link";

interface AuthNoticeProps {
  isAuthenticated: boolean;
}

export function AuthNotice({ isAuthenticated }: AuthNoticeProps) {
  if (isAuthenticated) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mx-4 mt-4">
      <p className="text-xs text-blue-800 dark:text-blue-200">
        <Link href="/register" className="font-medium underline">
          Sign up
        </Link>{" "}
        for higher limits and private pastes.
      </p>
    </div>
  );
}