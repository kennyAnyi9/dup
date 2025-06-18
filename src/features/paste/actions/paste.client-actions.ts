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
  views: z.number().int().nonnegative(),
  createdAt: z.string().datetime({ offset: true }),
  user: UserSchema.nullable(),
  tags: z.array(TagSchema),
});

const PaginationInfoSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

const PaginatedPastesResponseSchema = z.object({
  pastes: z.array(PasteSchema),
  pagination: PaginationInfoSchema,
});

// Parameter validation schema
const ParamsSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
});

// Export types for use in components
export type Paste = z.infer<typeof PasteSchema>;
export type PaginationInfo = z.infer<typeof PaginationInfoSchema>;
export type PaginatedPastesResponse = z.infer<typeof PaginatedPastesResponseSchema>;

export async function getPublicPastesPaginatedClient(
  page = 1,
  limit = 10,
): Promise<PaginatedPastesResponse> {
  // Validate parameters before building query string
  ParamsSchema.parse({ page, limit });
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let response: Response;
    try {
      response = await fetch(`/api/pastes/public?${params.toString()}`, {
        method: 'GET',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
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
    // Feature detection for Error cause (Node ≥ 16.9 / modern browsers)
    const userError = new Error('Unable to load pastes. Please try again later.');
    if ('cause' in Error.prototype) {
      throw new Error('Unable to load pastes. Please try again later.', { cause: error });
    } else {
      userError.cause = error;
      throw userError;
    }
  }
}