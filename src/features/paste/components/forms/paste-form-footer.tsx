"use client";

import { Button } from "@/shared/components/dupui/button";
import { Lock, Loader, Zap, Globe, EyeOff } from "lucide-react";
import { PASTE_VISIBILITY } from "@/lib/constants";
interface PasteFormFooterProps {
  form: {
    watch: (name: string) => unknown;
  };
  isPending: boolean;
  isEditing: boolean;
  watchedVisibility: string;
  watchedBurnAfterRead: boolean;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  onCancel: () => void;
  isMobile?: boolean;
}

export function PasteFormFooter({
  form,
  isPending,
  isEditing,
  watchedVisibility,
  watchedBurnAfterRead,
  onSubmit,
  isSubmitDisabled,
  onCancel,
  isMobile = false,
}: PasteFormFooterProps) {
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case PASTE_VISIBILITY.PUBLIC:
        return <Globe className="h-2.5 w-2.5" />;
      case PASTE_VISIBILITY.UNLISTED:
        return <EyeOff className="h-2.5 w-2.5" />;
      case PASTE_VISIBILITY.PRIVATE:
        return <Lock className="h-2.5 w-2.5" />;
      default:
        return <Globe className="h-2.5 w-2.5" />;
    }
  };

  return (
    <div className={`${isMobile ? 'px-3 py-2' : 'px-3 sm:px-4 py-3'} border-t bg-background shrink-0`}>
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-col sm:flex-row'} items-start sm:items-center justify-between gap-3`}>
        <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isMobile ? 'hidden' : ''}`}>
          {getVisibilityIcon(watchedVisibility)}
          <span className="capitalize">{watchedVisibility}</span>
          {((form.watch("password") as string) || "").length > 0 && (
            <>
              <span>•</span>
              <Lock className="h-2.5 w-2.5" />
              <span>Protected</span>
            </>
          )}
          {watchedBurnAfterRead && (
            <>
              <span>•</span>
              <Zap className="h-2.5 w-2.5" />
              <span>Burn</span>
            </>
          )}
        </div>

        <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'w-full sm:w-auto'}`}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className={`${isMobile ? 'h-7 flex-1 text-xs' : 'h-8 flex-1 sm:flex-none text-sm'}`}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className={`${isMobile ? 'h-7 flex-1 text-xs' : 'h-8 flex-1 sm:flex-none text-sm'}`}
          >
            {isPending ? (
              <div className="flex items-center gap-1.5">
                <Loader className="h-3 w-3 animate-spin" />
                <span>{isEditing ? "Updating..." : "Creating..."}</span>
              </div>
            ) : (
              <span>{isEditing ? "Update Paste" : "Create Paste"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}