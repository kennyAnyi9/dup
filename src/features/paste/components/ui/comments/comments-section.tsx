"use client";

import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/shared/components/dupui/panel";
import { cn } from "@/shared/lib/utils";
import { getComments, getCommentCount } from "@/features/paste/actions/comment.actions";
import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { CommentForm, CommentFormRef } from "./comment-form";
import { CommentItem } from "./comment-item";
import { Skeleton } from "@/shared/components/dupui/skeleton";
import { MessageCircle } from "lucide-react";
import type { Comment } from "@/shared/types/comment";

// Type guard for validating new comment data
function isValidNewComment(value: unknown): value is {
  id: string;
  parentId?: string;
  userId: string;
  content: string;
  pasteId: string;
} {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.pasteId === 'string' &&
    (obj.parentId === undefined || typeof obj.parentId === 'string')
  );
}

interface CommentsSectionProps {
  pasteId: string;
  onCommentCountChange?: (count: number) => void;
  className?: string;
}

export interface CommentsSectionRef {
  scrollToComments: () => void;
  focusCommentForm: () => void;
  refreshComments: () => void;
}

export const CommentsSection = forwardRef<CommentsSectionRef, CommentsSectionProps>(
  ({ pasteId, onCommentCountChange, className }, ref) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const commentFormRef = useRef<CommentFormRef>(null);

    useImperativeHandle(ref, () => ({
      scrollToComments: () => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      },
      focusCommentForm: () => {
        commentFormRef.current?.focus();
      },
      refreshComments: () => {
        loadComments();
      },
    }));

    const loadComments = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getComments(pasteId);

        if (result.success && result.comments) {
          setComments(result.comments as Comment[]);
        } else {
          setError(result.error || "Failed to load comments");
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    }, [pasteId]);

    useEffect(() => {
      loadComments();
    }, [pasteId, loadComments]);

    const handleCommentUpdate = () => {
      loadComments();
      updateCommentCountFromServer();
    };

    const handleCommentLikeToggle = (commentId: string, liked: boolean, newLikeCount: number) => {
      setComments(prevComments =>
        updateCommentInTree(prevComments, commentId, { isLikedByUser: liked, likeCount: newLikeCount })
      );
    };

    const handleCommentContentUpdate = (commentId: string, newContent: string) => {
      setComments(prevComments =>
        updateCommentInTree(prevComments, commentId, { content: newContent })
      );
    };

    const handleCommentAdded = (newComment: unknown) => {
      if (!isValidNewComment(newComment)) {
        loadComments();
        updateCommentCountFromServer();
        return;
      }

      if (newComment.parentId) {
        loadComments();
        updateCommentCountFromServer();
      } else {
        const optimisticComment: Comment = {
          ...newComment,
          parentId: newComment.parentId || null,
          author: { id: newComment.userId, name: "You", image: null },
          replies: [],
          isLikedByUser: false,
          likeCount: 0,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setComments(prev => [optimisticComment, ...prev]);
        updateCommentCountFromServer();
        setTimeout(() => loadComments(), 1000);
      }
    };

    const updateCommentCountFromServer = async () => {
      try {
        const result = await getCommentCount(pasteId);
        if (result.success && typeof result.count === 'number') {
          onCommentCountChange?.(result.count);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Failed to update comment count:", error);
        }
      }
    };

    const updateCommentInTree = (comments: Comment[], commentId: string, updates: Partial<Comment>): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, ...updates };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentInTree(comment.replies, commentId, updates)
          };
        }
        return comment;
      });
    };

    return (
      <div ref={sectionRef} id="comments-section" className={cn("w-full overflow-hidden", className)}>
        <Panel className="border-t-0">
          <PanelHeader className="text-left">
            <PanelTitle className="flex items-center gap-2 text-lg mb-0">
              <MessageCircle className="h-5 w-5" />
              Comments
            </PanelTitle>
          </PanelHeader>
          <PanelContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
            {/* Comment Form */}
            <CommentForm
              ref={commentFormRef}
              pasteId={pasteId}
              onCommentAdded={handleCommentAdded}
            />

            <div className="border-t border-border" />

            {/* Comments List */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onCommentUpdated={handleCommentUpdate}
                    onCommentLikeToggle={handleCommentLikeToggle}
                    onCommentContentUpdate={handleCommentContentUpdate}
                  />
                ))}
              </div>
            )}
          </PanelContent>
        </Panel>
      </div>
    );
  }
);

CommentsSection.displayName = "CommentsSection";
