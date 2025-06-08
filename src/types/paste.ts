import { z } from "zod";
import { SUPPORTED_LANGUAGES, PASTE_VISIBILITY } from "@/lib/constants";

export const createPasteSchema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().min(1, "Content is required"),
  language: z.enum(SUPPORTED_LANGUAGES).default("plain"),
  visibility: z.enum([
    PASTE_VISIBILITY.PUBLIC,
    PASTE_VISIBILITY.UNLISTED,
    PASTE_VISIBILITY.PRIVATE,
  ]).default(PASTE_VISIBILITY.PUBLIC),
  password: z.string().optional(),
  burnAfterRead: z.boolean().default(false),
  expiresIn: z.enum(["30m", "1h", "1d", "7d", "30d", "never"]).default("never"),
});

export const getPasteSchema = z.object({
  slug: z.string().min(1),
  password: z.string().optional(),
});

export const deletePasteSchema = z.object({
  id: z.string().min(1),
});

export type CreatePasteInput = z.infer<typeof createPasteSchema>;
export type GetPasteInput = z.infer<typeof getPasteSchema>;
export type DeletePasteInput = z.infer<typeof deletePasteSchema>;

export interface PasteResult {
  id: string;
  slug: string;
  title?: string;
  content: string;
  language: string;
  visibility: string;
  burnAfterRead: boolean;
  views: number;
  expiresAt?: Date;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePasteResult {
  success: boolean;
  paste?: {
    id: string;
    slug: string;
    url: string;
  };
  error?: string;
}

export interface GetPasteResult {
  success: boolean;
  paste?: PasteResult;
  error?: string;
  requiresPassword?: boolean;
}

export interface DeletePasteResult {
  success: boolean;
  error?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}