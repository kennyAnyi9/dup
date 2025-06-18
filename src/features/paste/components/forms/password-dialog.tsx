"use client";

import { useState, useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Button } from "@/shared/components/dupui/button";
import { Input } from "@/shared/components/dupui/input";
import { Label } from "@/shared/components/dupui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/dupui/dialog";
import { Alert, AlertDescription } from "@/shared/components/dupui/alert";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => void;
  title?: string;
  description?: string;
  error?: string;
  isLoading?: boolean;
}

export function PasswordDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  title = "Password Required",
  description = "This paste is password protected. Please enter the password to view its contents.",
  error, 
  isLoading 
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Clear local state when the dialog is closed
  useEffect(() => {
    if (!open) {
      setPassword("");
    }
  }, [open]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Enter',
      callback: (e) => {
        if (open && password.trim() && !isLoading) {
          e.preventDefault();
          onSubmit(password.trim());
        }
      },
      description: 'Submit password',
    },
  ]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password.trim());
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && password.trim() && !isLoading) {
      handleSubmit(e);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoFocus
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Verifying...
                </div>
              ) : (
                "Unlock Paste"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}