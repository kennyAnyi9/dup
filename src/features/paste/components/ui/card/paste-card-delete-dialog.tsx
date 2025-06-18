import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/dupui/alert-dialog";
import { AlertTriangle, Loader } from "lucide-react";

interface PasteCardDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function PasteCardDeleteDialog({
  open,
  onOpenChange,
  displayTitle,
  isDeleting,
  onConfirm,
}: PasteCardDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Paste
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;
            {displayTitle}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <Loader className="h-3 w-3 animate-spin" />
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}