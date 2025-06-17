"use client";

import { deletePaste } from "@/features/paste/actions/paste.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";
import { PasteTable } from "@/features/paste/components/ui/paste-table";
import { Button } from "@/shared/components/dupui/button";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ColumnToggle } from "../ui/column-toggle";

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
  const [isPending, startTransition] = useTransition();
  const [selectedPastes, setSelectedPastes] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const [visibleColumns, setVisibleColumns] = useState({
    avatar: true,
    language: true,
    status: true,
    views: true,
    created: true,
  });

  // Track user's manual column toggles to preserve them across viewport changes
  const userToggledColumns = useRef(new Set<string>());

  // Update column visibility based on screen size, preserving user choices
  useEffect(() => {
    setVisibleColumns((prev) => {
      const newColumns = { ...prev };
      
      if (isMobile) {
        // Hide columns on mobile, but preserve user's explicit choices
        Object.keys(newColumns).forEach((key) => {
          if (!userToggledColumns.current.has(key)) {
            newColumns[key as keyof typeof newColumns] = false;
          }
        });
      } else {
        // Show columns on desktop, but preserve user's explicit choices
        Object.keys(newColumns).forEach((key) => {
          if (!userToggledColumns.current.has(key)) {
            newColumns[key as keyof typeof newColumns] = true;
          }
        });
      }
      
      return newColumns;
    });
  }, [isMobile]);

  const handleEdit = (paste: PastesContentWrapperProps["pastes"][0]) => {
    openEditModal({
      id: paste.id,
      title: paste.title,
      description: paste.description,
      content: paste.content,
      language: paste.language,
      visibility: paste.visibility,
      burnAfterRead: paste.burnAfterRead,
      burnAfterReadViews: paste.burnAfterReadViews,
      expiresAt: paste.expiresAt,
      hasPassword: paste.hasPassword,
      tags: paste.tags?.map((tag) => ({ name: tag.name })) || [],
    });
  };

  const handleColumnToggle = (key: string) => {
    // Mark this column as user-toggled to preserve it across viewport changes
    userToggledColumns.current.add(key);
    
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleSelectPaste = (pasteId: string, selected: boolean) => {
    setSelectedPastes((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(pasteId);
      } else {
        newSet.delete(pasteId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedPastes(new Set(pastes.map((p) => p.id)));
    } else {
      setSelectedPastes(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPastes.size === 0) return;

    // Snapshot the count before starting the transition to avoid race conditions
    const count = selectedPastes.size;
    
    startTransition(async () => {
      try {
        const deletePromises = Array.from(selectedPastes).map((pasteId) => {
          return deletePaste({ id: pasteId });
        });

        await Promise.all(deletePromises);

        toast.success(
          `Successfully deleted ${count} paste${count > 1 ? "s" : ""}`
        );
        setSelectedPastes(new Set());
      } catch (error) {
        toast.error("Failed to delete pastes");
        console.error("Bulk delete error:", error);
      }
    });
  };

  const columns = [
    { key: "avatar", label: "Avatar", visible: visibleColumns.avatar },
    { key: "language", label: "Language", visible: visibleColumns.language },
    { key: "status", label: "Status", visible: visibleColumns.status },
    { key: "views", label: "Views", visible: visibleColumns.views },
    { key: "created", label: "Created", visible: visibleColumns.created },
  ];

  const allSelected =
    selectedPastes.size === pastes.length && pastes.length > 0;
  const someSelected = selectedPastes.size > 0;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shrink-0">
        {/* Bulk Actions */}
        {someSelected && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedPastes.size} selected
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  className="h-8"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Delete Selected</span>
                  <span className="sm:hidden">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Pastes</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedPastes.size} paste
                    {selectedPastes.size > 1 ? "s" : ""}? This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete {selectedPastes.size} Paste
                    {selectedPastes.size > 1 ? "s" : ""}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Column Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <ColumnToggle columns={columns} onToggle={handleColumnToggle} />
        </div>
      </div>

      {/* Responsive Table Layout with Horizontal Scroll */}
      <div className="flex-1 min-h-0 overflow-auto">
        <PasteTable
          pastes={pastes}
          onEdit={handleEdit}
          visibleColumns={visibleColumns}
          selectedPastes={selectedPastes}
          onSelectPaste={handleSelectPaste}
          onSelectAll={handleSelectAll}
          allSelected={allSelected}
        />
      </div>
    </div>
  );
}
