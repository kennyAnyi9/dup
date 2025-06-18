"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCopyUrl } from "../../hooks/use-copy-url";
import { usePasteActions } from "../../hooks/use-paste-actions";
import { PasteCardHeader } from "./card/paste-card-header";
import { PasteCardContent } from "./card/paste-card-content";
import { PasteCardTags } from "./card/paste-card-tags";
import { PasteCardActions } from "./card/paste-card-actions";
import { PasteCardDeleteDialog } from "./card/paste-card-delete-dialog";

interface PasteCardViewProps {
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
  onEdit?: (paste: PasteCardViewProps["paste"]) => void;
  isSelected?: boolean;
  onSelect?: (pasteId: string, selected: boolean) => void;
}

export function PasteCardView({
  paste,
  onEdit,
  isSelected,
  onSelect,
}: PasteCardViewProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { copied, copyUrl } = useCopyUrl();
  const { isDeleting, handleDelete } = usePasteActions();

  const isExpired = !!(paste.expiresAt && new Date() > paste.expiresAt);
  const displayTitle = paste.title || `Untitled ${paste.language}`;

  const handleCopyUrl = () => copyUrl(paste.slug);

  const handleDeletePaste = async () => {
    await handleDelete(paste.id);
    setShowDeleteDialog(false);
    router.refresh();
  };

  const handleEditPaste = () => {
    if (onEdit) {
      onEdit(paste);
    }
  };

  return (
    <>
      <div
        className={`relative flex items-stretch justify-between gap-2 rounded-xl border border-border bg-background p-3 max-w-full transition-all duration-200 hover:bg-accent/50 ${
          isExpired ? "opacity-60" : ""
        } ${
          isSelected
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
            : ""
        }`}
      >
        {/* Left section with avatar, title, and metadata */}
        <div className="flex min-w-0 items-center gap-x-3 flex-1">
          {/* Avatar/User */}
          <PasteCardHeader user={paste.user} />

          {/* Title and metadata */}
          <PasteCardContent
            paste={paste}
            displayTitle={displayTitle}
            isExpired={isExpired}
            copied={copied}
            onCopyUrl={handleCopyUrl}
          />
        </div>

        {/* Center section with tags */}
        <PasteCardTags tags={paste.tags} />

        {/* Far right section with stats and menu */}
        <PasteCardActions
          paste={paste}
          copied={copied}
          isSelected={isSelected}
          onSelect={onSelect}
          onCopyUrl={handleCopyUrl}
          onEditPaste={handleEditPaste}
          onDeletePaste={() => setShowDeleteDialog(true)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <PasteCardDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        displayTitle={displayTitle}
        isDeleting={isDeleting(paste.id)}
        onConfirm={handleDeletePaste}
      />
    </>
  );
}