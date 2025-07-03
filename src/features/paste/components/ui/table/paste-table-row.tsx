"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { Badge } from "@/shared/components/dupui/badge";
import { Checkbox } from "@/shared/components/dupui/checkbox";
import { TableCell, TableRow } from "@/shared/components/dupui/table";
import { formatDistanceToNow } from "date-fns";
import { CornerDownRight, Tag } from "lucide-react";
import { PasteStatusBadge } from "./paste-status-badge";
import { PasteRowActions } from "./paste-row-actions";

interface PasteTableRowProps {
  paste: {
    id: string;
    slug: string;
    title: string | null;
    description: string | null;
    content: string;
    language: string;
    visibility: string;
    views: number;
    createdAt: Date;
    expiresAt: Date | null;
    burnAfterRead: boolean;
    burnAfterReadViews: number | null;
    qrCodeColor: string | null;
    qrCodeBackground: string | null;
    hasPassword: boolean;
    tags?: Array<{
      id: string;
      name: string;
      slug: string;
      color: string | null;
    }>;
    user?: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  };
  visibleColumns: {
    avatar: boolean;
    language: boolean;
    status: boolean;
    views: boolean;
    created: boolean;
  };
  isSelected: boolean;
  onSelect?: (pasteId: string, selected: boolean) => void;
  onRowClick: (slug: string) => void;
  onEdit?: (paste: PasteTableRowProps["paste"]) => void;
  onDelete: (pasteId: string) => void;
  onShowQrCode?: (paste: PasteTableRowProps["paste"]) => void;
  copied: string | null;
  setCopied: (id: string | null) => void;
}

export function PasteTableRow({
  paste,
  visibleColumns,
  isSelected,
  onSelect,
  onRowClick,
  onEdit,
  onDelete,
  onShowQrCode,
  copied,
  setCopied,
}: PasteTableRowProps) {
  const isExpired = paste.expiresAt && new Date() > paste.expiresAt;

  return (
    <TableRow
      key={paste.id}
      className={`cursor-pointer hover:bg-accent/50 transition-colors ${
        isExpired ? "opacity-60" : ""
      }`}
      onClick={() => onRowClick(paste.slug)}
    >
      <TableCell>
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => onSelect(paste.id, value === true)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select paste ${paste.title || paste.slug}`}
          />
        )}
      </TableCell>
      
      {visibleColumns.avatar && (
        <TableCell>
          {paste.user && (
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={paste.user.image || ""}
                alt={paste.user.name || "User"}
              />
              <AvatarFallback className="text-xs">
                {paste.user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          )}
        </TableCell>
      )}
      
      <TableCell className="min-w-0 max-w-xs">
        <div className="flex flex-col gap-1">
          <div className="font-medium text-sm truncate">
            {paste.title || (
              <span className="text-muted-foreground italic">
                Untitled paste
              </span>
            )}
          </div>
          {paste.description && (
            <div className="text-xs text-muted-foreground truncate">
              {paste.description}
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CornerDownRight className="h-3 w-3" />
            <span className="font-mono">{paste.slug}</span>
          </div>
          {paste.tags && paste.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <div className="flex gap-1 flex-wrap">
                {paste.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.name}
                    variant="secondary"
                    className="text-xs px-1 py-0 h-4"
                  >
                    {tag.name}
                  </Badge>
                ))}
                {paste.tags.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1 py-0 h-4"
                  >
                    +{paste.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </TableCell>
      
      {visibleColumns.language && (
        <TableCell>
          <Badge variant="outline" className="text-xs">
            {paste.language}
          </Badge>
        </TableCell>
      )}
      
      {visibleColumns.status && (
        <TableCell>
          <PasteStatusBadge
            visibility={paste.visibility}
            isExpired={!!isExpired}
            burnAfterRead={paste.burnAfterRead}
            hasPassword={paste.hasPassword}
          />
        </TableCell>
      )}
      
      {visibleColumns.views && (
        <TableCell>
          <span className="text-sm font-medium">{paste.views}</span>
        </TableCell>
      )}
      
      {visibleColumns.created && (
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(paste.createdAt, { addSuffix: true })}
          </span>
        </TableCell>
      )}
      
      <TableCell>
        <PasteRowActions
          paste={paste}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowQrCode={onShowQrCode}
          copied={copied}
          setCopied={setCopied}
        />
      </TableCell>
    </TableRow>
  );
}