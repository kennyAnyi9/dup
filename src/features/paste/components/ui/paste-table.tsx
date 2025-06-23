"use client";

import { deletePaste } from "@/features/paste/actions/paste.actions";
import { Table, TableBody } from "@/shared/components/dupui/table";
import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { PasteTableHeader } from "./table/paste-table-header";
import { PasteTableRow } from "./table/paste-table-row";
import { DeletePasteDialog } from "./table/delete-paste-dialog";
import { QRCodeModal } from "./qr-code-modal";

interface PasteTableProps {
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
  onEdit?: (paste: PasteTableProps["pastes"][0]) => void;
  visibleColumns?: {
    avatar: boolean;
    language: boolean;
    status: boolean;
    views: boolean;
    created: boolean;
  };
  selectedPastes?: Set<string>;
  onSelectPaste?: (pasteId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  allSelected?: boolean;
}

export function PasteTable({
  pastes,
  onEdit,
  visibleColumns = {
    avatar: true,
    language: true,
    status: true,
    views: true,
    created: true,
  },
  selectedPastes = new Set(),
  onSelectPaste,
  onSelectAll,
  allSelected = false,
}: PasteTableProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState<{ slug: string; title: string | null } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRowClick = useCallback((slug: string) => {
    router.push(`/p/${slug}`);
  }, [router]);

  const handleDelete = useCallback((pasteId: string) => {
    setShowDeleteDialog(pasteId);
  }, []);

  const handleShowQrCode = useCallback((paste: PasteTableProps["pastes"][0]) => {
    setShowQrCode({ slug: paste.slug, title: paste.title });
  }, []);

  const confirmDelete = useCallback(() => {
    if (!showDeleteDialog) return;

    const pasteToDelete = pastes.find(p => p.id === showDeleteDialog);
    if (!pasteToDelete) return;

    startTransition(async () => {
      try {
        const result = await deletePaste({ id: showDeleteDialog });
        if (result.success) {
          toast.success("Paste deleted successfully");
          setShowDeleteDialog(null);
        } else {
          toast.error(result.error || "Failed to delete paste");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the paste");
        console.error("Delete error:", error);
      }
    });
  }, [showDeleteDialog, pastes]);

  const pasteToDelete = pastes.find(p => p.id === showDeleteDialog);

  if (pastes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No pastes found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-background">
        <Table>
          <PasteTableHeader
            visibleColumns={visibleColumns}
            onSelectAll={onSelectAll}
            allSelected={allSelected}
          />
          <TableBody>
            {pastes.map((paste) => (
              <PasteTableRow
                key={paste.id}
                paste={paste}
                visibleColumns={visibleColumns}
                isSelected={selectedPastes.has(paste.id)}
                onSelect={onSelectPaste}
                onRowClick={handleRowClick}
                onEdit={onEdit}
                onDelete={handleDelete}
                onShowQrCode={handleShowQrCode}
                copied={copied}
                setCopied={setCopied}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <DeletePasteDialog
        open={!!showDeleteDialog}
        onOpenChange={(open) => !open && setShowDeleteDialog(null)}
        pasteTitle={pasteToDelete?.title || undefined}
        pasteSlug={pasteToDelete?.slug}
        isPending={isPending}
        onConfirm={confirmDelete}
      />

      {showQrCode && (
        <QRCodeModal
          open={!!showQrCode}
          onOpenChange={(open) => !open && setShowQrCode(null)}
          paste={showQrCode}
        />
      )}
    </>
  );
}