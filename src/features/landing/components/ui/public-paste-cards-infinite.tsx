"use client";

import { getPublicPastesPaginatedClient } from "@/features/paste/actions/paste.client-actions";
import { Button } from "@/shared/components/dupui/button";
import { Loader, RefreshCw, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PublicPasteCards, PublicPasteCardsSkeleton } from "./public-paste-cards";

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
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);
  const hasInitiallyLoaded = useRef(false);

  // Network-aware error messages
  const getErrorMessage = useCallback((error: string) => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return "You're offline. Check your internet connection and try again.";
    }
    if (error.includes('timeout') || error.includes('504') || error.includes('502')) {
      return "Request timed out. The server might be busy, please try again.";
    }
    if (error.includes('403') || error.includes('401')) {
      return "Access denied. Please check your permissions.";
    }
    if (error.includes('500')) {
      return "Server error occurred. Our team has been notified.";
    }
    return error;
  }, []);

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
        setHasEverLoaded(true);
      } else {
        setPagination((prev) => ({ ...prev, hasMore: false }));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load more pastes. Please try again.";
      setError(getErrorMessage(errorMessage));
      console.error("Error loading more pastes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, pagination.hasMore, getErrorMessage]);

  const refreshPastes = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await getPublicPastesPaginatedClient(1, pagination.limit);

      setPastes(result.pastes || []);
      setPagination(result.pagination);
      setHasEverLoaded(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to refresh pastes. Please try again.";
      setError(getErrorMessage(errorMessage));
      console.error("Error refreshing pastes:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [pagination.limit, getErrorMessage]);

  // Load initial data on component mount
  useEffect(() => {
    if (pastes.length === 0 && !hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      refreshPastes(true);
    }
  }, [pastes.length, refreshPastes]);

  // Determine what to render based on current state
  const renderContent = () => {
    // 1. Loading states - show skeleton
    if (isInitialLoading || (isLoading && pastes.length === 0)) {
      return <PublicPasteCardsSkeleton count={5} />;
    }

    // 2. Error state - show error (takes priority over everything else)
    if (error) {
      return (
        <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive font-medium">Something went wrong</p>
          </div>
          <p className="text-sm text-destructive/80 mb-3">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshPastes(false)}
            disabled={isLoading || isInitialLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Try Again
          </Button>
        </div>
      );
    }

    // 3. Empty state - only show if we successfully loaded but got no data
    if (pastes.length === 0 && hasEverLoaded) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No public pastes found.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshPastes(false)}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      );
    }

    // 4. Success state - show paste cards
    return (
      <PublicPasteCards
        pastes={pastes.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }))}
      />
    );
  };

  return (
    <div className="space-y-6" role="feed" aria-label="Recent public pastes" aria-live="polite" aria-busy={isLoading || isInitialLoading}>
      {/* Announce loading state changes for screen readers */}
      <div className="sr-only" aria-live="polite">
        {isInitialLoading && "Loading pastes..."}
        {isLoading && !isInitialLoading && "Loading more pastes..."}
        {error && `Error: ${error}`}
      </div>

      {/* Render main content based on current state */}
      {renderContent()}

      {/* Load More button - only show if we have pastes and more are available */}
      {pastes.length > 0 && pagination.hasMore && !error && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMorePastes}
            disabled={isLoading || isInitialLoading}
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
    </div>
  );
}
