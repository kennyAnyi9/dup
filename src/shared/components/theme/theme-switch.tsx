"use client";

import { Button } from "@/shared/components/dupui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSwitch() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    const current = resolvedTheme ?? theme;
    setTheme(current === "dark" ? "light" : "dark");
  }

  return (
    <Button
      variant="theme"
      size="icon"
      onClick={toggleTheme}
      title="Toggle theme"
      type="button"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
