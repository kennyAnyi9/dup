"use client";

import { deletePaste } from "@/features/paste/actions/paste.actions";
import { Table, TableBody } from "@/shared/components/dupui/table";
import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { getBaseUrl } from "@/lib/utils/url";
import { updateQrCodeColors } from "../../actions/paste.actions";
import { PasteTableHeader } from "./table/paste-table-header";
import { PasteTableRow } from "./table/paste-table-row";
import { DeletePasteDialog } from "./table/delete-paste-dialog";
import { QRCodeDialog } from "../forms/dialogs/qr-code-dialog";

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
  isAuthenticated?: boolean;
}

export function PasteTable({
  pastes,
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
  isAuthenticated = true,
}: PasteTableProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState<{ id: string; slug: string; title: string | null; qrCodeColor?: string; qrCodeBackground?: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRowClick = useCallback((slug: string) => {
    router.push(`/p/${slug}`);
  }, [router]);

  const handleDelete = useCallback((pasteId: string) => {
    setShowDeleteDialog(pasteId);
  }, []);

  const handleShowQrCode = useCallback((paste: PasteTableProps["pastes"][0]) => {
    setShowQrCode({ 
      id: paste.id,
      slug: paste.slug, 
      title: paste.title,
      qrCodeColor: paste.qrCodeColor || undefined,
      qrCodeBackground: paste.qrCodeBackground || undefined
    });
  }, []);

  const handleQrColorChange = useCallback(async (foreground: string, background: string) => {
    if (!showQrCode) return;
    
    try {
      const result = await updateQrCodeColors({
        id: showQrCode.id,
        qrCodeColor: foreground,
        qrCodeBackground: background,
      });

      if (result.success) {
        toast.success("QR code colors updated!");
        router.refresh(); // Refresh to get updated data
      } else {
        toast.error(result.error || "Failed to update QR code colors");
      }
    } catch (error) {
      console.error("Failed to update QR code colors:", error);
      toast.error("Failed to update QR code colors");
    }
  }, [router, showQrCode]);

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
        <QRCodeDialog
          open={!!showQrCode}
          onOpenChange={(open) => !open && setShowQrCode(null)}
          url={`${getBaseUrl()}/p/${showQrCode.slug}`}
          initialColor={showQrCode.qrCodeColor || "#000000"}
          initialBackground={showQrCode.qrCodeBackground || "#ffffff"}
          onColorsChange={handleQrColorChange}
          isAuthenticated={isAuthenticated}
        />
      )}
    </>
  );
}