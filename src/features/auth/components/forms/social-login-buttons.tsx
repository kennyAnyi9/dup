"use client";

import { Button } from "@/shared/components/dupui/button";
import { authClient } from "@/shared/lib/auth-client";
import { Chrome, Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { getValidatedRedirectUrl } from "@/shared/lib/auth-utils";

interface SocialLoginButtonsProps {
  className?: string;
}

export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectUrl = getValidatedRedirectUrl(searchParams);

  async function handleGoogleSignIn() {
    try {
      setGoogleLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectUrl,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to sign in with Google";
      toast.error(message);
      console.error("Google sign in error:", error);
      setGoogleLoading(false);
    }
  }

  async function handleGithubSignIn() {
    try {
      setGithubLoading(true);
      await authClient.signIn.social({
        provider: "github",
        callbackURL: redirectUrl,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to sign in with GitHub";
      toast.error(message);
      console.error("GitHub sign in error:", error);
      setGithubLoading(false);
    }
  }

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || githubLoading}
        className="w-full"
      >
        {googleLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Chrome className="h-4 w-4" />
        )}
        <span className="ml-2">Google</span>
      </Button>

      <Button
        variant="outline"
        onClick={handleGithubSignIn}
        disabled={googleLoading || githubLoading}
        className="w-full"
      >
        {githubLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Github className="h-4 w-4" />
        )}
        <span className="ml-2">GitHub</span>
      </Button>
    </div>
  );
}
