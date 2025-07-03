"use client";

import { PasteCardView } from "./paste-card-view";

interface PasteCardsGridProps {
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
  onEdit?: (paste: PasteCardsGridProps["pastes"][0]) => void;
  selectedPastes?: Set<string>;
  onSelectPaste?: (pasteId: string, selected: boolean) => void;
}

export function PasteCardsGrid({
  pastes,
  onEdit,
  selectedPastes,
  onSelectPaste,
}: PasteCardsGridProps) {
  if (pastes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground">
          <svg
            className="mx-auto h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-sm font-medium">No pastes found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first paste to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* TODO: Consider implementing list virtualization (react-window/react-virtualized) 
          for better performance with large datasets (100+ pastes) */}
      {pastes.map((paste) => (
        <PasteCardView
          key={paste.id}
          paste={paste}
          onEdit={onEdit}
          isSelected={selectedPastes?.has(paste.id)}
          onSelect={onSelectPaste}
        />
      ))}
    </div>
  );
}
