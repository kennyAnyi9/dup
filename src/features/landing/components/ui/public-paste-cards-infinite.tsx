"use client";

import { getPublicPastesPaginatedClient } from "@/features/paste/actions/paste.client-actions";
import { Button } from "@/shared/components/dupui/button";
import { Loader, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PublicPasteCards } from "./public-paste-cards";

interface Paste {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  language: string;
  views: number;
  createdAt: string; // parse with new Date() where needed
  user: {
    name: string;
    image: string | null;
  } | null;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface PublicPasteCardsInfiniteProps {
  initialPastes?: Paste[];
  initialPagination?: PaginationInfo;
}

export function PublicPasteCardsInfinite({
  initialPastes = [],
  initialPagination,
}: PublicPasteCardsInfiniteProps) {
  const [pastes, setPastes] = useState<Paste[]>(initialPastes);
  const [pagination, setPagination] = useState<PaginationInfo>(
    initialPagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasMore: false,
    }
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitiallyLoaded = useRef(false);

  const loadMorePastes = useCallback(async () => {
    if (!pagination.hasMore) return;

    // Prevent race conditions by setting loading first
    setIsLoading(true);
    setError(null);

    try {
      const nextPage = pagination.page + 1;
      const result = await getPublicPastesPaginatedClient(
        nextPage,
        pagination.limit
      );

      if (result.pastes && result.pastes.length > 0) {
        setPastes((prev) => [...prev, ...result.pastes]);
        setPagination(result.pagination);
      } else {
        setPagination((prev) => ({ ...prev, hasMore: false }));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load more pastes. Please try again.";
      setError(errorMessage);
      console.error("Error loading more pastes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, pagination.hasMore]);

  const refreshPastes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPublicPastesPaginatedClient(1, pagination.limit);

      setPastes(result.pastes || []);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to refresh pastes. Please try again.";
      setError(errorMessage);
      console.error("Error refreshing pastes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  // Load initial data on component mount
  useEffect(() => {
    if (pastes.length === 0 && !hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      refreshPastes();
    }
  }, [refreshPastes]);

  return (
    <div className="space-y-6">
      <PublicPasteCards
        pastes={pastes.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }))}
      />

      {error && (
        <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPastes}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Try Again
          </Button>
        </div>
      )}

      {pagination.hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMorePastes}
            disabled={isLoading}
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${pastes.length} of ${pagination.total})`
            )}
          </Button>
        </div>
      )}

      {pastes.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No public pastes found.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPastes}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
