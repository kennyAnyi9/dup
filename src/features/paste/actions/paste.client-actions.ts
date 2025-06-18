"use client";

import { z } from 'zod';

// Define Zod schemas for runtime validation
const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  color: z.string().nullable(),
});

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
});

const PasteSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  language: z.string(),
  views: z.number(),
  createdAt: z.string(),
  user: UserSchema.nullable(),
  tags: z.array(TagSchema),
});

const PaginationInfoSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});

const PaginatedPastesResponseSchema = z.object({
  pastes: z.array(PasteSchema),
  pagination: PaginationInfoSchema,
});

// Export types for use in components
export type Paste = z.infer<typeof PasteSchema>;
export type PaginationInfo = z.infer<typeof PaginationInfoSchema>;
export type PaginatedPastesResponse = z.infer<typeof PaginatedPastesResponseSchema>;


export async function getPublicPastesPaginatedClient(
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedPastesResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    
    const response = await fetch(`/api/pastes/public?${params.toString()}`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Use Zod schema for comprehensive validation and parsing
    try {
      return PaginatedPastesResponseSchema.parse(data);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('API response validation failed:', validationError.errors);
        throw new Error('Invalid response structure from API');
      }
      throw validationError;
    }
  } catch (error) {
    // Log error for debugging but don't expose details to user
    console.error('Error fetching public pastes:', error);
    
    // Re-throw with user-friendly message for error boundaries
    throw new Error('Unable to load pastes. Please try again later.', { cause: error });
  }
}