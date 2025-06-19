"use client";

import { useState } from "react";
import { Button } from "@/shared/components/dupui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/dupui/drawer";
import { ScrollArea } from "@/shared/components/dupui/scroll-area";
import { Menu } from "lucide-react";
import { DashboardMobileSidebarProps } from "@/features/dashboard/types";
import { UserProfileSection } from "./user-profile-section";
import { RecentPastesSection } from "./recent-pastes-section";

export function DashboardMobileSidebar({ 
  recentPublicPastes = [], 
  totalPublicPastes = 0,
  user
}: DashboardMobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-8 w-8 p-0"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90dvh] max-h-[90vh] w-full max-w-none mb-4">
        <DrawerHeader className="pb-4">
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        
        <ScrollArea className="h-full overflow-y-auto touch-pan-y overscroll-contain">
          <div className="flex flex-col px-4 pb-8 gap-6">
            <UserProfileSection user={user} onClose={() => setOpen(false)} />
            <RecentPastesSection 
              recentPublicPastes={recentPublicPastes}
              totalPublicPastes={totalPublicPastes}
              onClose={() => setOpen(false)}
            />
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}