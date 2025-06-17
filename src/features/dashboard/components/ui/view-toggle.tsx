"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

type ViewType = "table" | "card";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="hidden md:flex items-center rounded-md border border-border bg-background p-1">
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className="h-7 px-2"
        aria-pressed={view === "table"}
      >
        <Table className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Table</span>
      </Button>
      <Button
        variant={view === "card" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("card")}
        className="h-7 px-2"
        aria-pressed={view === "card"}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Cards</span>
      </Button>
    </div>
  );
}