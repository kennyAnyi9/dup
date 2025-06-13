"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DashboardSidebar } from "./dashboard-sidebar";
import { Menu } from "lucide-react";

interface DashboardMobileSidebarProps {
  recentPublicPastes?: Array<{
    id: string;
    slug: string;
    title: string | null;
    language: string;
    views: number;
    createdAt: Date;
  }>;
  totalPublicPastes?: number;
}

export function DashboardMobileSidebar({ 
  recentPublicPastes = [], 
  totalPublicPastes = 0 
}: DashboardMobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-[280px] sm:w-[350px]">
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <DashboardSidebar 
            recentPublicPastes={recentPublicPastes}
            totalPublicPastes={totalPublicPastes}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}