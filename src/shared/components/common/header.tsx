"use client";

import { ThemeSwitch } from "@/shared/components/theme/theme-switch";
import { Button } from "@/shared/components/dupui/button";
import { Panel } from "@/shared/components/dupui/panel";
import { useAuth } from "@/shared/hooks/use-auth";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

export function Header() {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="max-w-4xl mx-auto px-4 ">
        <motion.div layout transition={{ duration: 0.3 }}>
          <Panel className="p-1">
            <motion.nav
              className={`w-full overflow-x-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
                isScrolled
                  ? "mt-2 bg-background border rounded-2xl"
                  : "rounded-none"
              }`}
              layout
              transition={{ duration: 0.3 }}
            >
              <div className="px-4">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center">
                      <Logo priority />
                    </Link>
                  </div>

                  <div className="flex items-center space-x-4">
                    <ThemeSwitch />

                    {isAuthenticated ? (
                      <Button variant="outline" size={"sm"} asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size={"sm"} asChild>
                          <Link href="/login">Sign In</Link>
                        </Button>
                        <Button asChild size={"sm"}>
                          <Link href="/register">Sign Up</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.nav>
          </Panel>
        </motion.div>
      </div>
    </header>
  );
}