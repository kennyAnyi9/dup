"use server";

import { db } from "@/db";
import { comment, commentLike, user } from "@/db/schema";
import { getCurrentUser } from "@/shared/lib/auth-server";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
  pasteId: z.string(),
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
});

export async function createComment(data: z.infer<typeof createCommentSchema>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const validatedData = createCommentSchema.parse(data);

    const newComment = {
      id: nanoid(),
      content: validatedData.content,
      pasteId: validatedData.pasteId,
      userId: user.id,
      parentId: validatedData.parentId || null,
    };

    await db.insert(comment).values(newComment);

    revalidatePath(`/paste/${validatedData.pasteId}`);
    revalidatePath(`/p/${validatedData.pasteId}`);

    return { success: true, comment: newComment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function updateComment(data: z.infer<typeof updateCommentSchema>) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const validatedData = updateCommentSchema.parse(data);

    // Check if user owns the comment
    const existingComment = await db
      .select()
      .from(comment)
      .where(eq(comment.id, validatedData.id))
      .limit(1);

    if (!existingComment.length || existingComment[0].userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(comment)
      .set({
        content: validatedData.content,
        updatedAt: new Date(),
      })
      .where(eq(comment.id, validatedData.id));

    revalidatePath(`/paste/${existingComment[0].pasteId}`);
    revalidatePath(`/p/${existingComment[0].pasteId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update comment:", error);
    return { success: false, error: "Failed to update comment" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user owns the comment
    const existingComment = await db
      .select()
      .from(comment)
      .where(eq(comment.id, commentId))
      .limit(1);

    if (!existingComment.length || existingComment[0].userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(comment)
      .set({
        isDeleted: true,
        content: "[deleted]",
        updatedAt: new Date(),
      })
      .where(eq(comment.id, commentId));

    revalidatePath(`/paste/${existingComment[0].pasteId}`);
    revalidatePath(`/p/${existingComment[0].pasteId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

export async function toggleCommentLike(commentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const userId = user.id;

    // Check if user already liked this comment
    const existingLike = await db
      .select()
      .from(commentLike)
      .where(and(eq(commentLike.commentId, commentId), eq(commentLike.userId, userId)))
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike - remove the like
      await db
        .delete(commentLike)
        .where(and(eq(commentLike.commentId, commentId), eq(commentLike.userId, userId)));

      // Decrement like count
      await db
        .update(comment)
        .set({ likeCount: sql`${comment.likeCount} - 1` })
        .where(eq(comment.id, commentId));

      return { success: true, liked: false };
    } else {
      // Like - add the like
      await db.insert(commentLike).values({
        commentId,
        userId,
      });

      // Increment like count
      await db
        .update(comment)
        .set({ likeCount: sql`${comment.likeCount} + 1` })
        .where(eq(comment.id, commentId));

      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Failed to toggle comment like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function getComments(pasteId: string) {
  try {
    const currentUser = await getCurrentUser();
    const userId = currentUser?.id;

    // Get all comments for the paste with author info and like status
    const comments = await db
      .select({
        id: comment.id,
        content: comment.content,
        pasteId: comment.pasteId,
        parentId: comment.parentId,
        likeCount: comment.likeCount,
        isDeleted: comment.isDeleted,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        isLikedByUser: userId
          ? sql<boolean>`EXISTS(
              SELECT 1 FROM ${commentLike} 
              WHERE ${commentLike.commentId} = ${comment.id} 
              AND ${commentLike.userId} = ${userId}
            )`
          : sql<boolean>`false`,
      })
      .from(comment)
      .leftJoin(user, eq(comment.userId, user.id))
      .where(and(eq(comment.pasteId, pasteId), eq(comment.isDeleted, false)))
      .orderBy(desc(comment.createdAt));

    // Organize comments into a tree structure
    const commentMap = new Map();
    const rootComments: typeof comments = [];

    // First pass: create comment objects
    comments.forEach((c) => {
      const commentObj = {
        ...c,
        replies: [],
      };
      commentMap.set(c.id, commentObj);

      if (!c.parentId) {
        rootComments.push(commentObj);
      }
    });

    // Second pass: organize replies
    comments.forEach((c) => {
      if (c.parentId && commentMap.has(c.parentId)) {
        const parent = commentMap.get(c.parentId);
        const child = commentMap.get(c.id);
        parent.replies.push(child);
      }
    });

    return { success: true, comments: rootComments };
  } catch (error) {
    console.error("Failed to get comments:", error);
    return { success: false, error: "Failed to load comments" };
  }
}

export async function getCommentCount(pasteId: string) {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(comment)
      .where(and(eq(comment.pasteId, pasteId), eq(comment.isDeleted, false)));

    return { success: true, count: result[0]?.count || 0 };
  } catch (error) {
    console.error("Failed to get comment count:", error);
    // Return 0 count on error to prevent UI issues
    return { success: true, count: 0 };
  }
}