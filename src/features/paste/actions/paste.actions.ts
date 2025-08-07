"use server";

import { eq, and, desc, count, sql, isNull, gt, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { paste, user, tag, pasteTag } from "@/db/schema";
import { getCurrentUser } from "@/shared/lib/auth-server";
import { checkRateLimit } from "@/shared/lib/rate-limit";
import { validatePasteContent } from "@/shared/lib/file-validation";
import { validateColorContrast } from "@/shared/lib/url-sanitization";
import {
  CHAR_LIMIT_ANONYMOUS,
  EXPIRY_ANONYMOUS,
  APP_URL,
} from "@/shared/lib/constants";
import {
  cached,
  CACHE_KEYS,
  CACHE_TTL,
  generateCacheKey,
  deleteFromCache,
} from "@/shared/lib/cache";
import {
  createPasteSchema,
  getPasteSchema,
  deletePasteSchema,
  checkUrlAvailabilitySchema,
  updateQrCodeColorsSchema,
  updatePasteSettingsSchema,
  updatePasteSchema,
  type CreatePasteResult,
  type GetPasteResult,
  type DeletePasteResult,
  type CheckUrlAvailabilityResult,
  type UpdateQrCodeColorsResult,
  type UpdatePasteSettingsResult,
  type UpdatePasteResult,
  type CreatePasteInput,
  type GetPasteInput,
  type DeletePasteInput,
  type CheckUrlAvailabilityInput,
  type UpdateQrCodeColorsInput,
  type UpdatePasteSettingsInput,
  type UpdatePasteInput,
} from "@/shared/types/paste";
import bcrypt from "bcryptjs";
import { fuzzySearch } from "@/shared/lib/search-utils";

/**
 * Atomically checks if current user can edit a paste
 * Combines authentication and ownership verification in a single operation
 */
export async function getPasteForEdit(input: GetPasteInput): Promise<GetPasteResult> {
  try {
    // Validate input
    const validatedInput = getPasteSchema.parse(input);
    
    // Get current user first
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Atomic query: find paste AND verify ownership in single operation
    const pasteData = await db
      .select()
      .from(paste)
      .where(
        and(
          eq(paste.slug, validatedInput.slug),
          eq(paste.isDeleted, false),
          eq(paste.userId, currentUser.id) // Ownership check in same query
        )
      )
      .limit(1);

    if (pasteData.length === 0) {
      return {
        success: false,
        error: "Paste not found or access denied",
      };
    }

    const foundPaste = pasteData[0];

    // Get paste tags
    const pasteTags = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
      })
      .from(tag)
      .innerJoin(pasteTag, eq(tag.id, pasteTag.tagId))
      .where(eq(pasteTag.pasteId, foundPaste.id));

    // Check if paste has expired
    if (foundPaste.expiresAt && new Date() > foundPaste.expiresAt) {
      return {
        success: false,
        error: "Paste has expired",
      };
    }

    return {
      success: true,
      paste: {
        id: foundPaste.id,
        slug: foundPaste.slug,
        title: foundPaste.title || undefined,
        description: foundPaste.description || undefined,
        content: foundPaste.content,
        language: foundPaste.language,
        visibility: foundPaste.visibility,
        userId: foundPaste.userId || undefined,
        burnAfterRead: foundPaste.burnAfterRead,
        burnAfterReadViews: foundPaste.burnAfterReadViews || undefined,
        views: foundPaste.views,
        expiresAt: foundPaste.expiresAt || undefined,
        qrCodeColor: foundPaste.qrCodeColor || undefined,
        qrCodeBackground: foundPaste.qrCodeBackground || undefined,
        createdAt: foundPaste.createdAt,
        updatedAt: foundPaste.updatedAt,
        hasPassword: !!foundPaste.password,
        tags: pasteTags,
      },
    };
  } catch (error) {
    console.error("Error in getPasteForEdit:", error);
    return {
      success: false,
      error: "Failed to retrieve paste for editing",
    };
  }
}

function generateSlug(): string {
  return nanoid(8); // 8 character URL-safe ID
}

/**
 * Generate a deterministic color for a tag based on its name
 * Uses hash-based selection from predefined palette for consistency
 */
function generateTagColor(tagName: string): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6366F1', // Indigo
  ];
  
  // Create hash from tag name for deterministic color selection
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = ((hash << 5) - hash + tagName.charCodeAt(i)) & 0xffffffff;
  }
  
  return colors[Math.abs(hash) % colors.length];
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

    // Validate content for security
    const contentValidation = validatePasteContent(validatedInput.content);
    if (!contentValidation.isValid) {
      return {
        success: false,
        error: contentValidation.error || "Invalid content",
      };
    }

    // Check character limits
    const charLimit = isAuthenticated ? null : CHAR_LIMIT_ANONYMOUS;
    if (charLimit && validatedInput.content.length > charLimit) {
      return {
        success: false,
        error: `Content exceeds ${charLimit} character limit (sign in for unlimited characters)`,
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

    // Atomic slug generation and paste creation
    const pasteId = nanoid();
    let createdPaste;
    
    if (validatedInput.customUrl && validatedInput.customUrl.trim()) {
      // Use custom URL - attempt direct insert
      const slug = validatedInput.customUrl.trim();
      
      try {
        const newPaste = await db
          .insert(paste)
          .values({
            id: pasteId,
            slug,
            title: validatedInput.title || null,
            description: validatedInput.description || null,
            content: validatedInput.content,
            language: validatedInput.language,
            visibility: validatedInput.visibility,
            password: hashedPassword,
            burnAfterRead: validatedInput.burnAfterRead,
            burnAfterReadViews: validatedInput.burnAfterRead ? (validatedInput.burnAfterReadViews || 1) : null,
            expiresAt,
            qrCodeColor: validatedInput.qrCodeColor,
            qrCodeBackground: validatedInput.qrCodeBackground,
            userId: user?.id || null,
          })
          .returning({
            id: paste.id,
            slug: paste.slug,
          });
        
        createdPaste = newPaste[0];
      } catch (error: unknown) {
        // Check if it's a unique constraint violation
        const err = error as { code?: string; message?: string };
        if (err.code === '23505' || err.message?.includes('duplicate') || err.message?.includes('unique')) {
          return {
            success: false,
            error: "Custom URL is already taken",
          };
        }
        throw error;
      }
    } else {
      // Generate unique slug with atomic insert retry
      const maxAttempts = 10;
      let attempt = 0;
      
      while (attempt < maxAttempts) {
        const slug = generateSlug();
        attempt++;
        
        try {
          const newPaste = await db
            .insert(paste)
            .values({
              id: pasteId,
              slug,
              title: validatedInput.title || null,
              description: validatedInput.description || null,
              content: validatedInput.content,
              language: validatedInput.language,
              visibility: validatedInput.visibility,
              password: hashedPassword,
              burnAfterRead: validatedInput.burnAfterRead,
              burnAfterReadViews: validatedInput.burnAfterRead ? (validatedInput.burnAfterReadViews || 1) : null,
              expiresAt,
              qrCodeColor: validatedInput.qrCodeColor,
              qrCodeBackground: validatedInput.qrCodeBackground,
              userId: user?.id || null,
            })
            .returning({
              id: paste.id,
              slug: paste.slug,
            });
          
          createdPaste = newPaste[0];
          break;
        } catch (error: unknown) {
          // Check if it's a unique constraint violation on slug
          const err = error as { code?: string; message?: string };
          if (err.code === '23505' || err.message?.includes('duplicate') || err.message?.includes('unique')) {
            if (attempt >= maxAttempts) {
              throw new Error("Failed to generate unique slug after multiple attempts");
            }
            // Continue to next attempt
            continue;
          }
          // Re-throw other errors
          throw error;
        }
      }
      
      if (!createdPaste) {
        throw new Error("Failed to create paste after multiple slug generation attempts");
      }
    }

    // createdPaste is already set above

    // Handle tags if provided
    if (validatedInput.tags && validatedInput.tags.length > 0) {
      // Process tags in batches for better performance
      const tagSlugs = validatedInput.tags.map(tagName => 
        tagName.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').trim()
      );

      // Find existing tags in a single query
      const existingTags = await db
        .select({ id: tag.id, slug: tag.slug })
        .from(tag)
        .where(inArray(tag.slug, tagSlugs));

      const existingTagMap = new Map(existingTags.map(t => [t.slug, t.id]));
      const tagsToCreate: Array<{ id: string; name: string; slug: string }> = [];
      const pasteTags: Array<{ pasteId: string; tagId: string }> = [];

      // Prepare new tags and relationships
      for (let i = 0; i < validatedInput.tags.length; i++) {
        const tagName = validatedInput.tags[i];
        const tagSlug = tagSlugs[i];
        
        let tagIdToUse = existingTagMap.get(tagSlug);
        
        if (!tagIdToUse) {
          // Tag doesn't exist, prepare to create it
          tagIdToUse = nanoid();
          tagsToCreate.push({
            id: tagIdToUse,
            name: tagName,
            slug: tagSlug,
          });
        }

        pasteTags.push({
          pasteId: pasteId,
          tagId: tagIdToUse,
        });
      }

      // Create new tags in batch if any
      if (tagsToCreate.length > 0) {
        await db.insert(tag).values(tagsToCreate);
      }

      // Create paste-tag relationships in batch
      if (pasteTags.length > 0) {
        await db.insert(pasteTag).values(pasteTags);
      }
    }

    const url = `${APP_URL}/${createdPaste.slug}`;

    revalidatePath("/dashboard");
    
    // Invalidate caches
    if (validatedInput.visibility === "public") {
      // Invalidate recent public pastes cache for all limits
      deleteFromCache(generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, "8"));
      deleteFromCache(generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, "10"));
      deleteFromCache(generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, "12"));
    }
    
    // Invalidate user stats cache
    if (user) {
      deleteFromCache(generateCacheKey(CACHE_KEYS.PASTE_COUNT, user.id));
    }

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

    // Get paste tags
    const pasteTags = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
      })
      .from(tag)
      .innerJoin(pasteTag, eq(tag.id, pasteTag.tagId))
      .where(eq(pasteTag.pasteId, foundPaste.id));

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
    let shouldDelete = false;
    
    if (shouldIncrementViews) {
      // Perform atomic update with conditional logic using SQL
      const updateResult = await db
        .update(paste)
        .set({
          views: sql`${paste.views} + 1`,
          isDeleted: sql`CASE 
            WHEN ${paste.burnAfterRead} = true AND (${paste.views} + 1) >= COALESCE(${paste.burnAfterReadViews}, 1) 
            THEN true 
            ELSE ${paste.isDeleted} 
          END`,
          updatedAt: new Date(),
        })
        .where(eq(paste.id, foundPaste.id))
        .returning({
          views: paste.views,
          isDeleted: paste.isDeleted,
        });

      // Get the actual updated values from the database
      if (updateResult.length > 0) {
        newViewCount = updateResult[0].views;
        shouldDelete = updateResult[0].isDeleted && !foundPaste.isDeleted; // Only true if it was just deleted
      }
    }

    // If paste was deleted due to burn after read, show special message
    if (shouldDelete) {
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
          hasPassword: !!foundPaste.password,
          qrCodeColor: foundPaste.qrCodeColor || undefined,
          qrCodeBackground: foundPaste.qrCodeBackground || undefined,
          createdAt: foundPaste.createdAt,
          updatedAt: foundPaste.updatedAt,
          tags: pasteTags,
        },
        burnedAfterRead: true,
      };
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
        hasPassword: !!foundPaste.password,
        qrCodeColor: foundPaste.qrCodeColor || undefined,
        qrCodeBackground: foundPaste.qrCodeBackground || undefined,
        createdAt: foundPaste.createdAt,
        updatedAt: foundPaste.updatedAt,
        tags: pasteTags,
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
      .select({ id: paste.id, userId: paste.userId, visibility: paste.visibility })
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
    
    // Invalidate caches
    if (foundPaste.visibility === "public") {
      // Invalidate recent public pastes cache
      deleteFromCache(generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, "8"));
      deleteFromCache(generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, "10"));
      deleteFromCache(generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, "12"));
    }
    
    // Invalidate user stats cache
    deleteFromCache(generateCacheKey(CACHE_KEYS.PASTE_COUNT, user.id));

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
  sort: "newest" | "oldest" | "views" | "relevance" = "newest"
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }

    // Build base where conditions (without search)
    let whereConditions = and(
      eq(paste.userId, user.id),
      eq(paste.isDeleted, false)
    );

    // Add filter condition
    if (filter && filter !== "all") {
      whereConditions = and(
        whereConditions,
        eq(paste.visibility, filter)
      );
    }

    // If search is provided, get all matching pastes first (for fuzzy search)
    // Otherwise use traditional pagination
    const shouldUseFuzzySearch = search && search.trim().length > 0;
    const searchLimit = shouldUseFuzzySearch ? 1000 : limit; // Get more for fuzzy search
    const searchOffset = shouldUseFuzzySearch ? 0 : (page - 1) * limit;

    // Get pastes from database
    const userPastes = await db
      .select({
        id: paste.id,
        slug: paste.slug,
        title: paste.title,
        description: paste.description,
        content: paste.content,
        language: paste.language,
        visibility: paste.visibility,
        views: paste.views,
        createdAt: paste.createdAt,
        expiresAt: paste.expiresAt,
        burnAfterRead: paste.burnAfterRead,
        burnAfterReadViews: paste.burnAfterReadViews,
        qrCodeColor: paste.qrCodeColor,
        qrCodeBackground: paste.qrCodeBackground,
        hasPassword: sql<boolean>`${paste.password} IS NOT NULL`,
      })
      .from(paste)
      .where(whereConditions)
      .orderBy(desc(paste.createdAt)) // Use default order for fuzzy search
      .limit(searchLimit)
      .offset(searchOffset);

    // Fetch tags for each paste in batch
    const pasteIds = userPastes.map(p => p.id);
    const allTags: Record<string, Array<{id: string; name: string; slug: string; color: string | null}>> = {};
    
    if (pasteIds.length > 0) {
      const tagsResult = await db
        .select({
          pasteId: pasteTag.pasteId,
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          color: tag.color,
        })
        .from(pasteTag)
        .innerJoin(tag, eq(pasteTag.tagId, tag.id))
        .where(inArray(pasteTag.pasteId, pasteIds));

      // Group tags by paste ID
      for (const tagData of tagsResult) {
        if (!allTags[tagData.pasteId]) {
          allTags[tagData.pasteId] = [];
        }
        allTags[tagData.pasteId].push({
          id: tagData.id,
          name: tagData.name,
          slug: tagData.slug,
          color: tagData.color,
        });
      }
    }

    // Combine pastes with their tags
    const pastesWithTags = userPastes.map(pasteItem => ({
      ...pasteItem,
      tags: allTags[pasteItem.id] || [],
    }));

    // Apply fuzzy search if search query is provided
    let finalPastes = pastesWithTags;
    let totalCount = pastesWithTags.length;
    
    if (shouldUseFuzzySearch) {
      const searchResults = fuzzySearch(pastesWithTags, search.trim(), {
        keys: [
          'title',
          'description', 
          'content',
          'language',
          'tags.name'
        ],
        weights: {
          title: 3,           // Highest weight for title matches
          'tags.name': 2.5,   // High weight for tag matches
          description: 2,      // Medium-high weight for description
          language: 1.5,       // Medium weight for language
          content: 1           // Lower weight for content (since it can be large)
        },
        threshold: 0.2,       // Lower threshold for more inclusive search
        maxResults: 1000,     // Get many results for pagination
        fuzzyThreshold: 0.5,  // Moderate fuzzy matching
        includeMatches: true
      });

      // Extract items and apply sorting
      const searchedPastes = searchResults.map(result => ({
        ...result.item,
        _searchScore: result.score,
        _searchMatches: result.matches
      }));

      totalCount = searchedPastes.length;

      // Apply sorting (relevance is default for search results)
      if (sort === "relevance" || !sort) {
        // Already sorted by relevance score
        finalPastes = searchedPastes;
      } else {
        // Apply other sorting methods
        switch (sort) {
          case "oldest":
            searchedPastes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
          case "views":
            searchedPastes.sort((a, b) => b.views - a.views);
            break;
          case "newest":
          default:
            searchedPastes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
        finalPastes = searchedPastes;
      }

      // Apply pagination to search results
      const startIndex = (page - 1) * limit;
      finalPastes = finalPastes.slice(startIndex, startIndex + limit);
    } else {
      // Get total count for regular pagination
      const totalResult = await db
        .select({ count: count() })
        .from(paste)
        .where(whereConditions);
      
      totalCount = totalResult[0]?.count || 0;

      // Apply sorting for non-search results
      switch (sort) {
        case "oldest":
          finalPastes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case "views":
          finalPastes.sort((a, b) => b.views - a.views);
          break;
        case "newest":
        case "relevance": // Relevance defaults to newest when not searching
        default:
          finalPastes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    // Add user information to each paste
    const pastesWithUser = finalPastes.map(paste => ({
      ...paste,
      user: {
        id: user.id,
        name: user.name,
        image: user.image || null,
      },
    }));

    return {
      pastes: pastesWithUser,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
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

    const cacheKey = generateCacheKey(CACHE_KEYS.PASTE_COUNT, user.id);
    
    return await cached(
      cacheKey,
      async () => {
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
      },
      { ttl: CACHE_TTL.PASTE_COUNT }
    );
  } catch (error) {
    console.error("Get user stats error:", error);
    return { totalPastes: 0, totalViews: 0 };
  }
}

export async function getRecentPublicPastes(limit: number = 10) {
  const cacheKey = generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, limit.toString());
  
  try {
    return await cached(
      cacheKey,
      async () => {
        // Get total count and recent pastes in parallel
        const [recentPastes, totalCountResult] = await Promise.all([
          db
            .select({
              id: paste.id,
              slug: paste.slug,
              title: paste.title,
              description: paste.description,
              language: paste.language,
              views: paste.views,
              createdAt: paste.createdAt,
              user: {
                id: user.id,
                name: user.name,
                image: user.image,
              },
            })
            .from(paste)
            .leftJoin(user, eq(paste.userId, user.id))
            .where(
              and(
                eq(paste.visibility, "public"),
                eq(paste.isDeleted, false),
                // Only show non-expired pastes
                or(
                  isNull(paste.expiresAt),
                  gt(paste.expiresAt, new Date())
                )
              )
            )
            .orderBy(desc(paste.createdAt))
            .limit(limit),
          
          db
            .select({ count: count() })
            .from(paste)
            .where(
              and(
                eq(paste.visibility, "public"),
                eq(paste.isDeleted, false),
                // Only show non-expired pastes
                or(
                  isNull(paste.expiresAt),
                  gt(paste.expiresAt, new Date())
                )
              )
            )
        ]);

        // Fetch tags for all pastes in a single query to avoid N+1 problem
        const pasteIds = recentPastes.map(p => p.id);
        const allTags = pasteIds.length > 0 ? await db
          .select({
            pasteId: pasteTag.pasteId,
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
          })
          .from(pasteTag)
          .innerJoin(tag, eq(pasteTag.tagId, tag.id))
          .where(inArray(pasteTag.pasteId, pasteIds)) : [];

        // Group tags by pasteId
        const tagsByPasteId = allTags.reduce((acc, tagItem) => {
          if (!acc[tagItem.pasteId]) {
            acc[tagItem.pasteId] = [];
          }
          acc[tagItem.pasteId].push({
            id: tagItem.id,
            name: tagItem.name,
            slug: tagItem.slug,
            color: tagItem.color,
          });
          return acc;
        }, {} as Record<string, Array<{ id: string; name: string; slug: string; color: string | null }>>);

        // Combine pastes with their tags
        const pastesWithTags = recentPastes.map(pasteItem => ({
          ...pasteItem,
          tags: tagsByPasteId[pasteItem.id] || [],
        }));

        return {
          pastes: pastesWithTags,
          total: totalCountResult[0]?.count || 0
        };
      },
      { ttl: CACHE_TTL.RECENT_PUBLIC_PASTES }
    );
  } catch (error) {
    console.error("Get recent public pastes error:", error);
    return { pastes: [], total: 0 };
  }
}

export async function getPublicPastesPaginated(page = 1, limit = 10) {
  // Ensure sane bounds: limit between 1 and 100, page at least 1
  limit = Math.min(Math.max(limit, 1), 100); // 1-100 hard limit
  page  = Math.max(page, 1);

  const offset = (page - 1) * limit;
  const cacheKey = generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, `page_${page}_limit_${limit}`);
  
  try {
    return await cached(
      cacheKey,
      async () => {
        // Get pastes and total count in parallel
        const [pastes, totalCountResult] = await Promise.all([
          db
            .select({
              id: paste.id,
              slug: paste.slug,
              title: paste.title,
              description: paste.description,
              language: paste.language,
              views: paste.views,
              createdAt: paste.createdAt,
              user: {
                id: user.id,
                name: user.name,
                image: user.image,
              },
            })
            .from(paste)
            .leftJoin(user, eq(paste.userId, user.id))
            .where(
              and(
                eq(paste.visibility, "public"),
                eq(paste.isDeleted, false),
                // Only show non-expired pastes
                or(
                  isNull(paste.expiresAt),
                  gt(paste.expiresAt, new Date())
                )
              )
            )
            .orderBy(desc(paste.createdAt))
            .limit(limit)
            .offset(offset),
          
          db
            .select({ count: count() })
            .from(paste)
            .where(
              and(
                eq(paste.visibility, "public"),
                eq(paste.isDeleted, false),
                // Only show non-expired pastes
                or(
                  isNull(paste.expiresAt),
                  gt(paste.expiresAt, new Date())
                )
              )
            )
        ]);

        // Fetch tags for all pastes in a single query to avoid N+1 problem
        const pasteIds = pastes.map(p => p.id);
        const allTags = pasteIds.length > 0 ? await db
          .select({
            pasteId: pasteTag.pasteId,
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
          })
          .from(pasteTag)
          .innerJoin(tag, eq(pasteTag.tagId, tag.id))
          .where(inArray(pasteTag.pasteId, pasteIds)) : [];

        // Group tags by pasteId
        const tagsByPasteId = allTags.reduce((acc, tagItem) => {
          if (!acc[tagItem.pasteId]) {
            acc[tagItem.pasteId] = [];
          }
          acc[tagItem.pasteId].push({
            id: tagItem.id,
            name: tagItem.name,
            slug: tagItem.slug,
            color: tagItem.color,
          });
          return acc;
        }, {} as Record<string, Array<{ id: string; name: string; slug: string; color: string | null }>>);

        // Combine pastes with their tags
        const pastesWithTags = pastes.map(pasteItem => ({
          ...pasteItem,
          tags: tagsByPasteId[pasteItem.id] || [],
        }));

        const total = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
          pastes: pastesWithTags,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore,
          }
        };
      },
      { ttl: CACHE_TTL.RECENT_PUBLIC_PASTES }
    );
  } catch (error) {
    console.error("Get paginated public pastes error:", error);
    return { 
      pastes: [], 
      pagination: { 
        page, 
        limit, 
        total: 0, 
        totalPages: 0, 
        hasMore: false 
      } 
    };
  }
}

export async function updatePasteSettings(input: UpdatePasteSettingsInput): Promise<UpdatePasteSettingsResult> {
  try {
    const validatedInput = updatePasteSettingsSchema.parse(input);
    
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, "update-paste");
    if (!rateLimit.success) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.reset! - Date.now()) / 1000)} seconds.`,
      };
    }

    // Find the paste and verify ownership
    const existingPaste = await db
      .select({
        id: paste.id,
        userId: paste.userId,
        password: paste.password,
        expiresAt: paste.expiresAt,
      })
      .from(paste)
      .where(
        and(
          eq(paste.id, validatedInput.id),
          eq(paste.isDeleted, false)
        )
      )
      .limit(1);

    if (existingPaste.length === 0) {
      return {
        success: false,
        error: "Paste not found",
      };
    }

    const foundPaste = existingPaste[0];

    // Verify ownership
    if (foundPaste.userId !== user.id) {
      return {
        success: false,
        error: "Permission denied",
      };
    }

    // Prepare update data
    const updateData: {
      updatedAt: Date;
      visibility?: string;
      password?: string | null;
      expiresAt?: Date | null;
    } = {
      updatedAt: new Date(),
    };

    // Handle visibility update
    if (validatedInput.visibility) {
      updateData.visibility = validatedInput.visibility;
    }

    // Handle password update
    if (validatedInput.removePassword) {
      updateData.password = null;
    } else if (validatedInput.password && validatedInput.password.trim() !== "") {
      // Hash the new password
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(validatedInput.password.trim(), saltRounds);
    }

    // Handle expiry update
    if (validatedInput.expiresIn) {
      if (validatedInput.expiresIn === "remove") {
        updateData.expiresAt = null;
      } else if (validatedInput.expiresIn === "never") {
        updateData.expiresAt = null;
      } else {
        // Calculate new expiry date
        const now = new Date();
        switch (validatedInput.expiresIn) {
          case "1h":
            updateData.expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
            break;
          case "1d":
            updateData.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
          case "7d":
            updateData.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            updateData.expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            break;
        }
      }
    }

    // Update the paste
    await db
      .update(paste)
      .set(updateData)
      .where(eq(paste.id, validatedInput.id));

    // Invalidate cache for user pastes
    const userPastesCacheKey = generateCacheKey(CACHE_KEYS.USER_PASTES, user.id);
    await deleteFromCache(userPastesCacheKey);

    // If visibility changed to public, invalidate recent public pastes cache
    if (validatedInput.visibility === "public") {
      const publicCacheKey = generateCacheKey(CACHE_KEYS.RECENT_PUBLIC_PASTES, "8");
      await deleteFromCache(publicCacheKey);
    }

    // Revalidate paths
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update paste settings error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update paste settings",
    };
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

export async function updatePaste(input: UpdatePasteInput): Promise<UpdatePasteResult> {
  try {
    // Validate input
    const validatedInput = updatePasteSchema.parse(input);
    
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(user.id, "update-paste");
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in a few minutes.`,
      };
    }

    // No character limits for authenticated users when editing

    // Find the paste and verify ownership
    const existingPaste = await db
      .select({
        id: paste.id,
        slug: paste.slug,
        userId: paste.userId,
        password: paste.password,
      })
      .from(paste)
      .where(
        and(
          eq(paste.id, validatedInput.id),
          eq(paste.isDeleted, false)
        )
      )
      .limit(1);

    if (existingPaste.length === 0) {
      return {
        success: false,
        error: "Paste not found",
      };
    }

    const targetPaste = existingPaste[0];

    // Verify ownership
    if (targetPaste.userId !== user.id) {
      return {
        success: false,
        error: "You can only edit your own pastes",
      };
    }

    // Handle password
    let hashedPassword: string | null = targetPaste.password;
    if (validatedInput.removePassword) {
      hashedPassword = null;
    } else if (validatedInput.password) {
      hashedPassword = await bcrypt.hash(validatedInput.password, 10);
    }

    // Handle expiry
    let expiresAt: Date | null = null;
    if (validatedInput.expiresIn && validatedInput.expiresIn !== "remove") {
      expiresAt = calculateExpiryDate(validatedInput.expiresIn, true);
    }

    // Update the paste
    const [updatedPaste] = await db
      .update(paste)
      .set({
        title: validatedInput.title || null,
        description: validatedInput.description || null,
        content: validatedInput.content,
        language: validatedInput.language,
        visibility: validatedInput.visibility,
        password: hashedPassword,
        burnAfterRead: validatedInput.burnAfterRead,
        burnAfterReadViews: validatedInput.burnAfterRead ? validatedInput.burnAfterReadViews || 1 : null,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(paste.id, validatedInput.id))
      .returning({
        id: paste.id,
        slug: paste.slug,
      });

    if (!updatedPaste) {
      return {
        success: false,
        error: "Failed to update paste",
      };
    }

    // Handle tags with optimized batch processing
    if (validatedInput.tags) {
      // Remove existing tags
      await db.delete(pasteTag).where(eq(pasteTag.pasteId, validatedInput.id));

      // Add new tags using batch processing to avoid N+1 queries
      if (validatedInput.tags.length > 0) {
        // Process tags in batches for better performance
        const tagSlugs = validatedInput.tags.map(tagName => 
          tagName.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').trim()
        );

        // Find existing tags in a single query
        const existingTags = await db
          .select({ id: tag.id, slug: tag.slug })
          .from(tag)
          .where(inArray(tag.slug, tagSlugs));

        const existingTagMap = new Map(existingTags.map(t => [t.slug, t.id]));
        const tagsToCreate: Array<{ 
          id: string; 
          name: string; 
          slug: string; 
          color: string;
          createdAt: Date;
          updatedAt: Date;
        }> = [];
        const pasteTags: Array<{ pasteId: string; tagId: string }> = [];

        // Prepare new tags and relationships
        for (let i = 0; i < validatedInput.tags.length; i++) {
          const tagName = validatedInput.tags[i];
          const tagSlug = tagSlugs[i];
          
          let tagIdToUse = existingTagMap.get(tagSlug);
          
          if (!tagIdToUse) {
            // Tag doesn't exist, prepare to create it
            tagIdToUse = nanoid();
            tagsToCreate.push({
              id: tagIdToUse,
              name: tagName,
              slug: tagSlug,
              color: generateTagColor(tagName),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }

          pasteTags.push({
            pasteId: validatedInput.id,
            tagId: tagIdToUse,
          });
        }

        // Create new tags in batch if any
        if (tagsToCreate.length > 0) {
          await db.insert(tag).values(tagsToCreate);
        }

        // Create paste-tag relationships in batch
        if (pasteTags.length > 0) {
          await db.insert(pasteTag).values(pasteTags);
        }
      }
    }

    // Clear cache for this paste
    await deleteFromCache(generateCacheKey(CACHE_KEYS.PASTE, updatedPaste.slug));
    
    // Clear user pastes cache
    await deleteFromCache(generateCacheKey(CACHE_KEYS.USER_PASTES, user.id));

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath(`/p/${updatedPaste.slug}`);

    return {
      success: true,
      paste: {
        id: updatedPaste.id,
        slug: updatedPaste.slug,
        url: `${APP_URL}/p/${updatedPaste.slug}`,
      },
    };
  } catch (error) {
    console.error("Update paste error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update paste",
    };
  }
}

export async function updateQrCodeColors(input: UpdateQrCodeColorsInput): Promise<UpdateQrCodeColorsResult> {
  try {
    // Validate input
    const validatedInput = updateQrCodeColorsSchema.parse(input);
    
    // Validate color contrast
    const contrastValidation = validateColorContrast(validatedInput.qrCodeColor, validatedInput.qrCodeBackground);
    if (!contrastValidation.isValid) {
      return {
        success: false,
        error: contrastValidation.error || "Invalid color combination",
      };
    }
    
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(user.id, "update-paste");
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in a few minutes.`,
      };
    }

    // Find the paste and verify ownership
    const existingPaste = await db
      .select({
        id: paste.id,
        userId: paste.userId,
      })
      .from(paste)
      .where(
        and(
          eq(paste.id, validatedInput.id),
          eq(paste.isDeleted, false)
        )
      )
      .limit(1);

    if (existingPaste.length === 0) {
      return {
        success: false,
        error: "Paste not found",
      };
    }

    const targetPaste = existingPaste[0];

    // Verify ownership
    if (targetPaste.userId !== user.id) {
      return {
        success: false,
        error: "You can only update your own pastes",
      };
    }

    // Update the QR code colors
    await db
      .update(paste)
      .set({
        qrCodeColor: validatedInput.qrCodeColor,
        qrCodeBackground: validatedInput.qrCodeBackground,
        updatedAt: new Date(),
      })
      .where(eq(paste.id, validatedInput.id));

    // Clear cache for user pastes
    await deleteFromCache(generateCacheKey(CACHE_KEYS.USER_PASTES, user.id));

    // Revalidate relevant paths
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update QR code colors error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update QR code colors",
    };
  }
}