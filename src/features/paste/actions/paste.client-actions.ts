"use client";

interface Paste {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  language: string;
  views: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  tags: Array<{
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

export interface PaginatedPastesResponse {
  pastes: Paste[];
  pagination: PaginationInfo;
}


export async function getPublicPastesPaginatedClient(
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedPastesResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await fetch(`/api/pastes/public?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Comprehensive response validation
    if (
      !Array.isArray(data.pastes) ||
      !data.pagination ||
      typeof data.pagination?.page !== 'number' ||
      typeof data.pagination?.limit !== 'number' ||
      typeof data.pagination?.total !== 'number' ||
      typeof data.pagination?.totalPages !== 'number' ||
      typeof data.pagination?.hasMore !== 'boolean'
    ) {
      throw new Error('Invalid response structure from API');
    }

    // Validate individual paste structure
    for (const paste of data.pastes) {
      if (
        typeof paste.id !== 'string' ||
        typeof paste.slug !== 'string' ||
        typeof paste.language !== 'string' ||
        typeof paste.views !== 'number' ||
        typeof paste.createdAt !== 'string' ||
        !Array.isArray(paste.tags)
      ) {
        throw new Error('Invalid paste structure in API response');
      }
    }

    return data as PaginatedPastesResponse;
  } catch (error) {
    // Log error for debugging but don't expose details to user
    console.error('Error fetching public pastes:', error);
    
    // Re-throw with user-friendly message for error boundaries
    const userError = new Error('Unable to load pastes. Please try again later.');
    userError.cause = error;
    throw userError;
  }
}