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
import { PasteCardsGrid } from "@/features/paste/components/ui/paste-cards-grid";
import { Button } from "@/shared/components/dupui/button";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useFilterLoading } from "../ui/search-filters";
import { PasteCardSkeleton } from "@/app/(dashboard)/_components/dashboard-loading";

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
  searchTerm?: string;
}

export function PastesContentWrapper({ pastes }: PastesContentWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPastes, setSelectedPastes] = useState(() => new Set<string>());
  const isFilterLoading = useFilterLoading();

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

  const someSelected = selectedPastes.size > 0;

  // Show skeleton when filter is loading
  if (isFilterLoading) {
    return (
      <div className="h-full flex flex-col space-y-2">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PasteCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

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

      </div>

      {/* Content Area - Cards Only */}
      <div>
        <PasteCardsGrid
          pastes={pastes}
          selectedPastes={selectedPastes}
          onSelectPaste={handleSelectPaste}
        />
      </div>
    </div>
  );
}