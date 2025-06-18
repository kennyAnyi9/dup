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

export interface PaginatedPastesError {
  error: string;
  pastes: never[];
  pagination: PaginationInfo;
}

export type PaginatedPastesResult = PaginatedPastesResponse | PaginatedPastesError;


export async function getPublicPastesPaginatedClient(
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedPastesResult> {
  try {
    const response = await fetch(`/api/pastes/public?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.pastes || !Array.isArray(data.pastes) || !data.pagination) {
      throw new Error('Invalid response structure from API');
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