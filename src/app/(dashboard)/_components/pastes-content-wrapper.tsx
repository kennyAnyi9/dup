"use client";

import { useState, useTransition, useEffect } from "react";
import { PasteTable } from "@/components/shared/paste/paste-table";
import { usePasteModal } from "@/components/shared/paste/paste-modal-provider";
import { ColumnToggle } from "./column-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePaste } from "@/app/actions/paste";

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

  // Update column visibility based on screen size
  useEffect(() => {
    if (isMobile) {
      // Hide all columns on mobile by default
      setVisibleColumns({
        avatar: false,
        language: false,
        status: false,
        views: false,
        created: false,
      });
    } else {
      // Show all columns on desktop by default
      setVisibleColumns({
        avatar: true,
        language: true,
        status: true,
        views: true,
        created: true,
      });
    }
  }, [isMobile]);

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

  const handleSelectPaste = (pasteId: string, selected: boolean) => {
    setSelectedPastes(prev => {
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
      setSelectedPastes(new Set(pastes.map(p => p.id)));
    } else {
      setSelectedPastes(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPastes.size === 0) return;

    startTransition(async () => {
      try {
        const deletePromises = Array.from(selectedPastes).map(pasteId => {
          return deletePaste({ id: pasteId });
        });

        await Promise.all(deletePromises);
        
        toast.success(`Successfully deleted ${selectedPastes.size} paste${selectedPastes.size > 1 ? 's' : ''}`);
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

  const allSelected = selectedPastes.size === pastes.length && pastes.length > 0;
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
                    Are you sure you want to delete {selectedPastes.size} paste{selectedPastes.size > 1 ? 's' : ''}? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete {selectedPastes.size} Paste{selectedPastes.size > 1 ? 's' : ''}
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