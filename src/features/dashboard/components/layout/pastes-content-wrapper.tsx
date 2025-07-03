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
} from "@/shared/components/dupui/alert-dialog";
import { usePasteModal } from "@/features/paste/components/providers/paste-modal-provider";
import { PasteTable } from "@/features/paste/components/ui/paste-table";
import { PasteCardsGrid } from "@/features/paste/components/ui/paste-cards-grid";
import { Button } from "@/shared/components/dupui/button";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ColumnToggle } from "../ui/column-toggle";
import { ViewToggle } from "../ui/view-toggle";
import { useViewPreference } from "../../hooks/use-view-preference";

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
  }>;
}

export function PastesContentWrapper({ pastes }: PastesContentWrapperProps) {
  const { openEditModal } = usePasteModal();
  const [isPending, startTransition] = useTransition();
  const [selectedPastes, setSelectedPastes] = useState(() => new Set<string>());
  const { view: currentView, setView: setCurrentView } = useViewPreference();
  const isMobile = useIsMobile();
  
  // Force table view on mobile devices
  const effectiveView = isMobile ? "table" : currentView;

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
    // Track user toggles but remove if returning to default state
    const currentValue = visibleColumns[key as keyof typeof visibleColumns];
    const defaultValue = !isMobile; // Default is visible on desktop, hidden on mobile
    
    if (!currentValue === defaultValue) {
      // User is returning to default state, remove from tracked toggles
      userToggledColumns.current.delete(key);
    } else {
      // User is changing from default, track this toggle
      userToggledColumns.current.add(key);
    }
    
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
        // TODO: For large selections (>50), consider using p-limit to throttle
        // concurrent requests or implement batch deletion API endpoint
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
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shrink-0 mb-2">
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

        {/* View Toggle and Column Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <ViewToggle view={effectiveView} onViewChange={setCurrentView} />
          {effectiveView === "table" && (
            <ColumnToggle columns={columns} onToggle={handleColumnToggle} />
          )}
        </div>
      </div>

      {/* Content Area - Table or Cards */}
      <div>
        {effectiveView === "table" ? (
          <PasteTable
            pastes={pastes}
            onEdit={handleEdit}
            visibleColumns={visibleColumns}
            selectedPastes={selectedPastes}
            onSelectPaste={handleSelectPaste}
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
          />
        ) : (
          <PasteCardsGrid
            pastes={pastes}
            onEdit={handleEdit}
            selectedPastes={selectedPastes}
            onSelectPaste={handleSelectPaste}
          />
        )}
      </div>
    </div>
  );
}