import * as React from "react";
import { Button } from "@/shared/components/dupui/button";
import { cn } from "@/shared/lib/utils";

interface IconButtonProps {
  onClick?: () => void;
  "aria-label": string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function IconButton({ 
  onClick, 
  "aria-label": ariaLabel, 
  className, 
  children,
  disabled
}: IconButtonProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      disabled={disabled}
      className={cn("h-8 w-8 p-0 rounded-full", className)}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
}