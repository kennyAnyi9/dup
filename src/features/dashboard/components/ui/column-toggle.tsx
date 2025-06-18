"use client";

import { Button } from "@/shared/components/dupui/button";
import { Checkbox } from "@/shared/components/dupui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/dupui/dropdown-menu";
import { Columns } from "lucide-react";

interface ColumnToggleProps {
  columns: Array<{
    key: string;
    label: string;
    visible: boolean;
  }>;
  onToggle: (key: string) => void;
}

export function ColumnToggle({ columns, onToggle }: ColumnToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Columns className="h-4 w-4" />
          <span className="sr-only">Toggle columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex items-center space-x-2 px-2 py-1.5 hover:bg-muted cursor-pointer"
            onClick={() => onToggle(column.key)}
          >
            <Checkbox
              checked={column.visible}
              onCheckedChange={() => onToggle(column.key)}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
              {column.label}
            </label>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}