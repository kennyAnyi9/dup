"use client";

import { useState } from "react";
import { PasteTable } from "@/components/shared/paste/paste-table";
import { usePasteModal } from "@/components/shared/paste/paste-modal-provider";
import { ColumnToggle } from "./column-toggle";

interface PastesContentWrapperProps {
  pastes: Array<{
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
  }>;
}

export function PastesContentWrapper({ pastes }: PastesContentWrapperProps) {
  const { openEditModal } = usePasteModal();
  
  const [visibleColumns, setVisibleColumns] = useState({
    avatar: true,
    language: true,
    status: true,
    views: true,
    created: true,
  });

  const handleEdit = (paste: PastesContentWrapperProps["pastes"][0]) => {
    openEditModal({
      id: paste.id,
      title: paste.title,
      description: paste.description,
      content: paste.content,
      language: paste.language,
      visibility: paste.visibility,
      tags: paste.tags?.map(tag => ({ name: tag.name })) || [],
    });
  };

  const handleColumnToggle = (key: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const columns = [
    { key: "avatar", label: "Avatar", visible: visibleColumns.avatar },
    { key: "language", label: "Language", visible: visibleColumns.language },
    { key: "status", label: "Status", visible: visibleColumns.status },
    { key: "views", label: "Views", visible: visibleColumns.views },
    { key: "created", label: "Created", visible: visibleColumns.created },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ColumnToggle columns={columns} onToggle={handleColumnToggle} />
      </div>
      <PasteTable 
        pastes={pastes}
        onEdit={handleEdit}
        visibleColumns={visibleColumns}
      />
    </div>
  );
}