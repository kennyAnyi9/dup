"use client";

import { ThemeSwitch } from "@/components/theme/theme-switch";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { useAuth } from "@/hooks/use-auth";
import { APP_NAME } from "@/lib/constants";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
              className={`w-full overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
                isScrolled
                  ? "mt-2 bg-background border rounded-2xl"
                  : "rounded-none"
              }`}
              layout
              transition={{ duration: 0.3 }}
            >
              <div className="px-4">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center">
                      <Image
                        src="/dup-dark2.png"
                        alt={APP_NAME}
                        width={240}
                        height={64}
                        className="h-16 w-auto"
                      />
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                      <Link
                        href="/"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Home
                      </Link>
                      {isAuthenticated && (
                        <>
                          <Link
                            href="/dashboard"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            My Pastes
                          </Link>
                          <Link
                            href="/new"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            New Paste
                          </Link>
                        </>
                      )}
                    </nav>
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
