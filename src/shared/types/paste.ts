import { z } from "zod";
import { SUPPORTED_LANGUAGES, PASTE_VISIBILITY } from "@/shared/lib/constants";

export const createPasteSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  language: z.enum(SUPPORTED_LANGUAGES).default("plain"),
  visibility: z.enum([
    PASTE_VISIBILITY.PUBLIC,
    PASTE_VISIBILITY.UNLISTED,
    PASTE_VISIBILITY.PRIVATE,
  ]).default(PASTE_VISIBILITY.PUBLIC),
  password: z.string().optional(),
  burnAfterRead: z.boolean().default(false),
  burnAfterReadViews: z.number().min(1).max(100).optional(),
  customUrl: z.string().optional()
    .refine((val) => !val || val.length >= 3, {
      message: "Custom link must be at least 3 characters long"
    })
    .refine((val) => !val || val.length <= 50, {
      message: "Custom link must be 50 characters or less"
    })
    .refine((val) => !val || !val.includes(' '), {
      message: "Custom link cannot contain spaces"
    })
    .refine((val) => !val || /^[a-zA-Z0-9-_]+$/.test(val), {
      message: "Custom link can only contain letters, numbers, hyphens (-), and underscores (_)"
    }),
  tags: z.array(z.string().min(1).max(20)).max(5).optional(),
  expiresIn: z.enum(["30m", "1h", "1d", "7d", "30d", "never"]).default("never"),
  qrCodeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#000000"),
  qrCodeBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#ffffff"),
}).refine((data) => {
  // If burnAfterReadViews is defined, burnAfterRead must be true
  if (data.burnAfterReadViews !== undefined && !data.burnAfterRead) {
    return false;
  }
  return true;
}, {
  message: "burnAfterReadViews can only be set when burnAfterRead is true",
  path: ["burnAfterReadViews"],
});

export const getPasteSchema = z.object({
  slug: z.string().min(1),
  password: z.string().optional(),
});

export const deletePasteSchema = z.object({
  id: z.string().min(1),
});

export const checkUrlAvailabilitySchema = z.object({
  url: z.string().min(3).max(50),
});

export const updateQrCodeColorsSchema = z.object({
  id: z.string().min(1),
  qrCodeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  qrCodeBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const updatePasteSettingsSchema = z.object({
  id: z.string().min(1),
  visibility: z.enum([
    PASTE_VISIBILITY.PUBLIC,
    PASTE_VISIBILITY.UNLISTED,
    PASTE_VISIBILITY.PRIVATE,
  ]).optional(),
  password: z.string().optional(),
  removePassword: z.boolean().default(false),
  expiresIn: z.enum(["1h", "1d", "7d", "30d", "never", "remove"]).optional(),
}).refine((data) => {
  // If removePassword is true, password must be undefined
  if (data.removePassword && data.password !== undefined) {
    return false;
  }
  return true;
}, {
  message: "Cannot set password and removePassword at the same time",
  path: ["password"],
});

export const updatePasteSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  language: z.enum(SUPPORTED_LANGUAGES).default("plain"),
  visibility: z.enum([
    PASTE_VISIBILITY.PUBLIC,
    PASTE_VISIBILITY.UNLISTED,
    PASTE_VISIBILITY.PRIVATE,
  ]).default(PASTE_VISIBILITY.PUBLIC),
  password: z.string().optional(),
  removePassword: z.boolean().default(false),
  burnAfterRead: z.boolean().default(false),
  burnAfterReadViews: z.number().min(1).max(100).optional(),
  tags: z.array(z.string().min(1).max(20)).max(5).optional(),
  expiresIn: z.enum(["1h", "1d", "7d", "30d", "never", "remove"]).optional(),
  qrCodeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  qrCodeBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
}).refine((data) => {
  // If burnAfterReadViews is defined, burnAfterRead must be true
  if (data.burnAfterReadViews !== undefined && !data.burnAfterRead) {
    return false;
  }
  return true;
}, {
  message: "burnAfterReadViews can only be set when burnAfterRead is true",
  path: ["burnAfterReadViews"],
});

export type CreatePasteInput = z.infer<typeof createPasteSchema>;
export type GetPasteInput = z.infer<typeof getPasteSchema>;
export type DeletePasteInput = z.infer<typeof deletePasteSchema>;
export type CheckUrlAvailabilityInput = z.infer<typeof checkUrlAvailabilitySchema>;
export type UpdateQrCodeColorsInput = z.infer<typeof updateQrCodeColorsSchema>;
export type UpdatePasteSettingsInput = z.infer<typeof updatePasteSettingsSchema>;
export type UpdatePasteInput = z.infer<typeof updatePasteSchema>;

export interface PasteResult {
  id: string;
  slug: string;
  title?: string;
  description?: string;
  content: string;
  language: string;
  visibility: string;
  burnAfterRead: boolean;
  burnAfterReadViews?: number;
  views: number;
  expiresAt?: Date;
  userId?: string;
  hasPassword: boolean;
  qrCodeColor?: string;
  qrCodeBackground?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
  }>;
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
  burnedAfterRead?: boolean;
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

export interface CheckUrlAvailabilityResult {
  available: boolean;
  error?: string;
}

export interface UpdateQrCodeColorsResult {
  success: boolean;
  error?: string;
}

export interface UpdatePasteSettingsResult {
  success: boolean;
  error?: string;
}

export interface UpdatePasteResult {
  success: boolean;
  paste?: {
    id: string;
    slug: string;
    url: string;
  };
  error?: string;
}