"use client";

import { ThemeSwitch } from "@/shared/components/theme/theme-switch";
import { Button } from "@/shared/components/dupui/button";
import { Panel } from "@/shared/components/dupui/panel";
import { useAuth } from "@/shared/hooks/use-auth";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { Asterisk } from "lucide-react";

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
      <div className="font-commit-mono max-w-4xl mx-auto bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <motion.div layout transition={{ duration: 0.3 }}>
          <Panel>
              <div className="pl-4">
                <div className="flex h-14 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center">
                  <Asterisk className="size-4" />[dup]
                  </Link>
                </div>

                <div className="flex items-center space-x-4 border-l h-full">
                

                  {isAuthenticated ? (  
                     <div className="h-full flex place-items-center ">
                      <Link href="/dashboard" className="w-44 p-5 hover:bg-accent">Dashboard</Link>
                    </div>
                  ) : (
                    <div className="flex items-center h-full">
                        <Link className="h-full border-r flex place-items-center hover:bg-accent w-44 p-5" href="/login">Login</Link>
                        <Link className="h-full flex place-items-center hover:bg-accent w-44 p-5" href="/register">Register</Link>   
                    </div>
                  )}
                </div>
              </div>
              </div>
          
          </Panel>
        </motion.div>
      </div>
    </header>
  );
}