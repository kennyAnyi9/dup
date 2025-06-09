"use server";

import { eq, and, desc, count, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { paste } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  CHAR_LIMIT_ANONYMOUS,
  CHAR_LIMIT_AUTHENTICATED,
  EXPIRY_ANONYMOUS,
  APP_URL,
} from "@/lib/constants";
import {
  createPasteSchema,
  getPasteSchema,
  deletePasteSchema,
  checkUrlAvailabilitySchema,
  type CreatePasteResult,
  type GetPasteResult,
  type DeletePasteResult,
  type CheckUrlAvailabilityResult,
  type CreatePasteInput,
  type GetPasteInput,
  type DeletePasteInput,
  type CheckUrlAvailabilityInput,
} from "@/types/paste";
import bcrypt from "bcryptjs";

function generateSlug(): string {
  return nanoid(8); // 8 character URL-safe ID
}

function calculateExpiryDate(expiresIn: string, isAuthenticated: boolean): Date | null {
  if (expiresIn === "never") {
    return null;
  }

  const now = new Date();
  
  // Override expiry for unauthenticated users
  if (!isAuthenticated) {
    const duration = EXPIRY_ANONYMOUS === "30m" ? 30 * 60 * 1000 : 30 * 60 * 1000;
    return new Date(now.getTime() + duration);
  }

  switch (expiresIn) {
    case "30m":
      return new Date(now.getTime() + 30 * 60 * 1000);
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "1d":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export async function createPaste(input: CreatePasteInput): Promise<CreatePasteResult> {
  try {
    // Validate input
    const validatedInput = createPasteSchema.parse(input);
    
    // Get current user
    const user = await getCurrentUser();
    const isAuthenticated = !!user;

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(user?.id || null, "create-paste");
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in a few minutes.`,
      };
    }

    // Check character limits
    const charLimit = isAuthenticated ? CHAR_LIMIT_AUTHENTICATED : CHAR_LIMIT_ANONYMOUS;
    if (validatedInput.content.length > charLimit) {
      return {
        success: false,
        error: `Content exceeds ${charLimit} character limit ${isAuthenticated ? '' : '(sign in for higher limits)'}`,
      };
    }

    // Anonymous users can only create public/unlisted pastes
    if (!isAuthenticated && validatedInput.visibility === "private") {
      return {
        success: false,
        error: "Sign in to create private pastes",
      };
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (validatedInput.password) {
      hashedPassword = await bcrypt.hash(validatedInput.password, 10);
    }

    // Calculate expiry date
    const expiresAt = calculateExpiryDate(validatedInput.expiresIn, isAuthenticated);

    // Generate or validate slug
    let slug: string;
    
    if (validatedInput.customUrl && validatedInput.customUrl.trim()) {
      // Use custom URL if provided and not empty
      slug = validatedInput.customUrl.trim();
      
      // Check if custom slug already exists
      const existing = await db
        .select({ id: paste.id })
        .from(paste)
        .where(eq(paste.slug, slug))
        .limit(1);
      
      if (existing.length > 0) {
        return {
          success: false,
          error: "Custom URL is already taken",
        };
      }
    } else {
      // Generate unique slug
      let attempts = 0;
      do {
        slug = generateSlug();
        attempts++;
        
        // Check if slug already exists
        const existing = await db
          .select({ id: paste.id })
          .from(paste)
          .where(eq(paste.slug, slug))
          .limit(1);
        
        if (existing.length === 0) break;
        
        if (attempts > 10) {
          throw new Error("Failed to generate unique slug");
        }
      } while (true);
    }

    // Create paste
    const newPaste = await db
      .insert(paste)
      .values({
        id: nanoid(),
        slug,
        title: validatedInput.title || null,
        content: validatedInput.content,
        language: validatedInput.language,
        visibility: validatedInput.visibility,
        password: hashedPassword,
        burnAfterRead: validatedInput.burnAfterRead,
        burnAfterReadViews: validatedInput.burnAfterRead ? (validatedInput.burnAfterReadViews || 1) : null,
        expiresAt,
        userId: user?.id || null,
      })
      .returning({
        id: paste.id,
        slug: paste.slug,
      });

    const createdPaste = newPaste[0];
    const url = `${APP_URL}/${createdPaste.slug}`;

    revalidatePath("/dashboard");

    return {
      success: true,
      paste: {
        id: createdPaste.id,
        slug: createdPaste.slug,
        url,
      },
    };
  } catch (error) {
    console.error("Create paste error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create paste",
    };
  }
}

export async function getPaste(input: GetPasteInput): Promise<GetPasteResult> {
  try {
    // Validate input
    const validatedInput = getPasteSchema.parse(input);
    
    // Get current user
    const user = await getCurrentUser();

    // Find paste
    const pasteData = await db
      .select()
      .from(paste)
      .where(
        and(
          eq(paste.slug, validatedInput.slug),
          eq(paste.isDeleted, false)
        )
      )
      .limit(1);

    if (pasteData.length === 0) {
      return {
        success: false,
        error: "Paste not found",
      };
    }

    const foundPaste = pasteData[0];

    // Check if paste has expired
    if (foundPaste.expiresAt && new Date() > foundPaste.expiresAt) {
      return {
        success: false,
        error: "Paste has expired",
      };
    }

    // Check if user has permission to view private paste
    if (foundPaste.visibility === "private") {
      if (!user || foundPaste.userId !== user.id) {
        return {
          success: false,
          error: "Paste not found",
        };
      }
    }

    // Check password protection
    if (foundPaste.password) {
      if (!validatedInput.password) {
        return {
          success: false,
          requiresPassword: true,
          error: "This paste is password protected",
        };
      }

      const isValidPassword = await bcrypt.compare(validatedInput.password, foundPaste.password);
      if (!isValidPassword) {
        return {
          success: false,
          requiresPassword: true,
          error: "Incorrect password",
        };
      }
    }

    // Determine if we should increment view count (don't count owner's views)
    const shouldIncrementViews = !user || foundPaste.userId !== user.id;
    let newViewCount = foundPaste.views;
    
    if (shouldIncrementViews) {
      newViewCount = foundPaste.views + 1;
      
      // Handle burn after read before incrementing
      if (foundPaste.burnAfterRead) {
        const burnViews = foundPaste.burnAfterReadViews || 1;
        
        if (newViewCount >= burnViews) {
          // Delete the paste after this view
          await db
            .update(paste)
            .set({
              views: newViewCount,
              isDeleted: true,
              updatedAt: new Date(),
            })
            .where(eq(paste.id, foundPaste.id));
        } else {
          // Just increment view count
          await db
            .update(paste)
            .set({
              views: newViewCount,
              updatedAt: new Date(),
            })
            .where(eq(paste.id, foundPaste.id));
        }
      } else {
        // Regular view count increment
        await db
          .update(paste)
          .set({
            views: newViewCount,
            updatedAt: new Date(),
          })
          .where(eq(paste.id, foundPaste.id));
      }
    }

    return {
      success: true,
      paste: {
        id: foundPaste.id,
        slug: foundPaste.slug,
        title: foundPaste.title || undefined,
        content: foundPaste.content,
        language: foundPaste.language,
        visibility: foundPaste.visibility,
        burnAfterRead: foundPaste.burnAfterRead,
        burnAfterReadViews: foundPaste.burnAfterReadViews || undefined,
        views: newViewCount,
        expiresAt: foundPaste.expiresAt || undefined,
        userId: foundPaste.userId || undefined,
        createdAt: foundPaste.createdAt,
        updatedAt: foundPaste.updatedAt,
      },
    };
  } catch (error) {
    console.error("Get paste error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get paste",
    };
  }
}

export async function deletePaste(input: DeletePasteInput): Promise<DeletePasteResult> {
  try {
    // Validate input
    const validatedInput = deletePasteSchema.parse(input);
    
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(user.id, "delete-paste");
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: "Rate limit exceeded. Try again in a few minutes.",
      };
    }

    // Find paste and verify ownership
    const pasteData = await db
      .select({ id: paste.id, userId: paste.userId })
      .from(paste)
      .where(
        and(
          eq(paste.id, validatedInput.id),
          eq(paste.isDeleted, false)
        )
      )
      .limit(1);

    if (pasteData.length === 0) {
      return {
        success: false,
        error: "Paste not found",
      };
    }

    const foundPaste = pasteData[0];

    // Verify ownership
    if (foundPaste.userId !== user.id) {
      return {
        success: false,
        error: "You don't have permission to delete this paste",
      };
    }

    // Soft delete the paste
    await db
      .update(paste)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(eq(paste.id, validatedInput.id));

    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete paste error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete paste",
    };
  }
}

export async function getUserPastes(
  page: number = 1,
  limit: number = 10,
  search?: string,
  filter?: "all" | "public" | "private" | "unlisted",
  sort: "newest" | "oldest" | "views" = "newest"
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }

    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = and(
      eq(paste.userId, user.id),
      eq(paste.isDeleted, false)
    );

    // Add search condition
    if (search) {
      whereConditions = and(
        whereConditions,
        or(
          like(paste.title, `%${search}%`),
          like(paste.content, `%${search}%`)
        )
      );
    }

    // Add filter condition
    if (filter && filter !== "all") {
      whereConditions = and(
        whereConditions,
        eq(paste.visibility, filter)
      );
    }

    // Build order by
    let orderBy;
    switch (sort) {
      case "oldest":
        orderBy = paste.createdAt;
        break;
      case "views":
        orderBy = desc(paste.views);
        break;
      case "newest":
      default:
        orderBy = desc(paste.createdAt);
        break;
    }

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(paste)
      .where(whereConditions);
    
    const total = totalResult[0]?.count || 0;

    // Get paginated results
    const userPastes = await db
      .select({
        id: paste.id,
        slug: paste.slug,
        title: paste.title,
        content: paste.content,
        language: paste.language,
        visibility: paste.visibility,
        views: paste.views,
        createdAt: paste.createdAt,
        expiresAt: paste.expiresAt,
        burnAfterRead: paste.burnAfterRead,
        hasPassword: sql<boolean>`${paste.password} IS NOT NULL`,
      })
      .from(paste)
      .where(whereConditions)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      pastes: userPastes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Get user pastes error:", error);
    throw new Error("Failed to get user pastes");
  }
}

export async function getUserStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const statsResult = await db
      .select({
        totalPastes: count(),
        totalViews: sql<number>`COALESCE(SUM(${paste.views}), 0)`,
      })
      .from(paste)
      .where(
        and(
          eq(paste.userId, user.id),
          eq(paste.isDeleted, false)
        )
      );

    return statsResult[0] || { totalPastes: 0, totalViews: 0 };
  } catch (error) {
    console.error("Get user stats error:", error);
    return { totalPastes: 0, totalViews: 0 };
  }
}

export async function getRecentPublicPastes(limit: number = 10) {
  try {
    const recentPastes = await db
      .select({
        id: paste.id,
        slug: paste.slug,
        title: paste.title,
        language: paste.language,
        views: paste.views,
        createdAt: paste.createdAt,
      })
      .from(paste)
      .where(
        and(
          eq(paste.visibility, "public"),
          eq(paste.isDeleted, false),
          // Only show non-expired pastes
          paste.expiresAt === null || paste.expiresAt > new Date()
        )
      )
      .orderBy(paste.createdAt)
      .limit(limit);

    return recentPastes;
  } catch (error) {
    console.error("Get recent public pastes error:", error);
    return [];
  }
}

export async function checkUrlAvailability(input: CheckUrlAvailabilityInput): Promise<CheckUrlAvailabilityResult> {
  try {
    const validatedInput = checkUrlAvailabilitySchema.parse(input);
    
    // Check if URL is available
    const existingPaste = await db
      .select({ id: paste.id })
      .from(paste)
      .where(
        and(
          eq(paste.slug, validatedInput.url),
          eq(paste.isDeleted, false)
        )
      )
      .limit(1);

    return {
      available: existingPaste.length === 0,
    };
  } catch (error) {
    console.error("Check URL availability error:", error);
    return {
      available: false,
      error: error instanceof Error ? error.message : "Failed to check URL availability",
    };
  }
}