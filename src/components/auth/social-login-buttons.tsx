"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/hooks/use-auth";
import { Github, Chrome } from "lucide-react";
import { toast } from "sonner";

interface SocialLoginButtonsProps {
  className?: string;
}

export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  async function handleGoogleSignIn() {
    try {
      setGoogleLoading(true);
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      
      if (result.error) {
        toast.error(result.error.message || "Failed to sign in with Google");
        return;
      }
      
      // Social sign-in usually redirects automatically, but just in case
      if (result.data) {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to sign in with Google");
      console.error("Google sign in error:", error);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGithubSignIn() {
    try {
      setGithubLoading(true);
      const result = await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
      
      if (result.error) {
        toast.error(result.error.message || "Failed to sign in with GitHub");
        return;
      }
      
      // Social sign-in usually redirects automatically, but just in case
      if (result.data) {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to sign in with GitHub");
      console.error("GitHub sign in error:", error);
    } finally {
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