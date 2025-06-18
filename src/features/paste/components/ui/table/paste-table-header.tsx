"use client";

import { Checkbox } from "@/shared/components/dupui/checkbox";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/dupui/table";

interface PasteTableHeaderProps {
  visibleColumns: {
    avatar: boolean;
    language: boolean;
    status: boolean;
    views: boolean;
    created: boolean;
  };
  onSelectAll?: (selected: boolean) => void;
  allSelected?: boolean;
}

export function PasteTableHeader({
  visibleColumns,
  onSelectAll,
  allSelected = false,
}: PasteTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className="w-12">
          {onSelectAll && (
            <Checkbox
              checked={allSelected}
              onCheckedChange={(value) => onSelectAll(value === true)}
              aria-label="Select all pastes"
            />
          )}
        </TableHead>
        {visibleColumns.avatar && (
          <TableHead className="w-10">Avatar</TableHead>
        )}
        <TableHead className="min-w-0 max-w-xs">Title</TableHead>
        {visibleColumns.language && <TableHead>Language</TableHead>}
        {visibleColumns.status && <TableHead>Status</TableHead>}
        {visibleColumns.views && <TableHead>Reads</TableHead>}
        {visibleColumns.created && <TableHead>Created</TableHead>}
        <TableHead className="w-12"></TableHead>
      </TableRow>
    </TableHeader>
  );
}