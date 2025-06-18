"use client";

import { Button } from "@/shared/components/dupui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      // Don't trigger if user is typing in an input, textarea, or contenteditable element
      const target = event.target as HTMLElement;
      const isInputActive =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true" ||
          target.closest('[contenteditable="true"]'));

      if (isInputActive) {
        return;
      }

      if (event.key === "L" || event.key === "l") {
        event.preventDefault();
        setTheme("light");
      } else if (event.key === "D" || event.key === "d") {
        event.preventDefault();
        setTheme("dark");
      }
    }

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [setTheme]);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      variant="theme"
      size="icon"
      onClick={toggleTheme}
      title="Toggle theme (L for light, D for dark)"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
