"use client";

import { Button } from "@/shared/components/dupui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/dupui/avatar";
import { useAuth } from "@/shared/hooks/use-auth";
import { deleteComment, toggleCommentLike, updateComment } from "@/features/paste/actions/comment.actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { 
  Heart, 
  Reply, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Loader2,
  Check,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/dupui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/dupui/alert-dialog";
import { Textarea } from "@/shared/components/dupui/textarea";
import { CommentForm } from "./comment-form";
import type { Comment } from "@/shared/types/comment";

interface CommentItemProps {
  comment: Comment;
  onCommentUpdated?: () => void;
  onCommentLikeToggle?: (commentId: string, liked: boolean, newLikeCount: number) => void;
  onCommentContentUpdate?: (commentId: string, newContent: string) => void;
  level?: number;
}

export function CommentItem({ comment, onCommentUpdated, onCommentLikeToggle, onCommentContentUpdate, level = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Local state for optimistic updates
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(comment.likeCount);
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(comment.isLikedByUser || false);
  const [optimisticContent, setOptimisticContent] = useState(comment.content);

  const isOwner = user && comment.author && comment.author.id === user.id;

  // Sync optimistic state when comment prop changes
  useEffect(() => {
    setOptimisticLikeCount(comment.likeCount);
    setOptimisticIsLiked(comment.isLikedByUser || false);
    setOptimisticContent(comment.content);
    setEditContent(comment.content);
  }, [comment.likeCount, comment.isLikedByUser, comment.content]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like comments");
      return;
    }

    // Store original values for potential reversion
    const originalIsLiked = optimisticIsLiked;
    const originalLikeCount = optimisticLikeCount;
    
    // Optimistic update
    const newIsLiked = !originalIsLiked;
    const newLikeCount = newIsLiked 
      ? originalLikeCount + 1 
      : Math.max(originalLikeCount - 1, 0);
    
    setOptimisticIsLiked(newIsLiked);
    setOptimisticLikeCount(newLikeCount);
    
    // Notify parent component for optimistic update
    onCommentLikeToggle?.(comment.id, newIsLiked, newLikeCount);

    try {
      const result = await toggleCommentLike(comment.id);
      if (!result.success) {
        // Revert optimistic update on failure using original values
        setOptimisticIsLiked(originalIsLiked);
        setOptimisticLikeCount(originalLikeCount);
        onCommentLikeToggle?.(comment.id, originalIsLiked, originalLikeCount);
        toast.error(result.error || "Failed to toggle like");
      }
    } catch (error) {
      // Revert optimistic update on error using original values
      setOptimisticIsLiked(originalIsLiked);
      setOptimisticLikeCount(originalLikeCount);
      onCommentLikeToggle?.(comment.id, originalIsLiked, originalLikeCount);
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to toggle like:", error);
      }
      toast.error("Failed to toggle like");
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    // Optimistic update
    const newContent = editContent.trim();
    setOptimisticContent(newContent);
    setIsEditing(false);
    onCommentContentUpdate?.(comment.id, newContent);

    try {
      const result = await updateComment({
        id: comment.id,
        content: newContent,
      });

      if (result.success) {
        toast.success("Comment updated successfully!");
      } else {
        // Revert optimistic update on failure
        setOptimisticContent(comment.content);
        onCommentContentUpdate?.(comment.id, comment.content);
        toast.error(result.error || "Failed to update comment");
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticContent(comment.content);
      onCommentContentUpdate?.(comment.id, comment.content);
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to update comment:", error);
      }
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setShowDeleteDialog(false);
    try {
      const result = await deleteComment(comment.id);
      if (result.success) {
        toast.success("Comment deleted successfully!");
        onCommentUpdated?.();
      } else {
        toast.error(result.error || "Failed to delete comment");
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to delete comment:", error);
      }
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    onCommentUpdated?.();
  };

  const maxNestingLevel = 3;
  const shouldNest = level < maxNestingLevel;

  return (
    <div className={`space-y-3 ${level > 0 ? 'relative ml-4 sm:ml-6 lg:ml-8' : ''}`}>
      {level > 0 && (
        <>
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40"></div>
          {/* Curved connector at top */}
          <div className="absolute left-0 top-4 w-4 h-4">
            <svg 
              viewBox="0 0 16 16" 
              className="w-4 h-4 text-border/40"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M0 0v8a4 4 0 0 0 4 4h8" strokeLinecap="round" />
            </svg>
          </div>
        </>
      )}
      <div className={`space-y-3 ${level > 0 ? 'pl-6' : ''}`}>
        <div className="flex items-start gap-2 sm:gap-3 min-w-0">
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
            <AvatarImage src={comment.author?.image || undefined} />
            <AvatarFallback className="text-xs">
              {comment.author?.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
              <span className="font-medium text-xs sm:text-sm truncate">{comment.author?.name || "Unknown User"}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">·</span>
              <span className="text-xs text-muted-foreground truncate">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                <>
                  <span className="text-xs text-muted-foreground hidden sm:inline">·</span>
                  <span className="text-xs text-muted-foreground italic">edited</span>
                </>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] text-sm w-full"
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={!editContent.trim()}
                    className="h-7 px-2 text-xs gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(optimisticContent);
                    }}
                    className="h-7 px-2 text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap break-words [overflow-wrap:anywhere] break-all">
                {optimisticContent}
              </p>
            )}

            <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-6 sm:h-7 px-1 sm:px-2 text-xs gap-1 min-w-0 ${
                  optimisticIsLiked ? 'text-red-600 hover:text-red-700' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`h-3 w-3 ${optimisticIsLiked ? 'fill-current' : ''}`} />
                {optimisticLikeCount > 0 && <span className="text-xs">{optimisticLikeCount}</span>}
              </Button>

              {level < maxNestingLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-6 sm:h-7 px-1 sm:px-2 text-xs gap-1 text-muted-foreground min-w-0"
                >
                  <Reply className="h-3 w-3" />
                  <span className="hidden sm:inline">Reply</span>
                </Button>
              )}

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      className="text-xs gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="text-xs gap-2 text-red-600 focus:text-red-600"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {showReplyForm && (
          <div className="ml-4 sm:ml-8 lg:ml-11">
            <CommentForm
              pasteId={comment.pasteId}
              parentId={comment.id}
              onCommentAdded={handleReplyAdded}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${comment.author?.name || "this comment"}...`}
              showCancel
            />
          </div>
        )}
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={`${shouldNest ? 'space-y-3' : 'space-y-3 ml-0'} overflow-hidden`}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onCommentUpdated={onCommentUpdated}
              onCommentLikeToggle={onCommentLikeToggle}
              onCommentContentUpdate={onCommentContentUpdate}
              level={shouldNest ? level + 1 : level}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}