"use client";

import { Button } from "@/shared/components/dupui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

interface NewPasteButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  fullWidth?: boolean;
}

export function NewPasteButton({
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false
}: NewPasteButtonProps) {
  return (
    <Link href="/new">
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", fullWidth && "w-full", className)}
      >
        <FileText className="h-4 w-4" />
        New Paste
      </Button>
    </Link>
  );
}
