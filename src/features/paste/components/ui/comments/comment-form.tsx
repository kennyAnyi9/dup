"use client";

import { Button } from "@/shared/components/dupui/button";
import { Textarea } from "@/shared/components/dupui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { createComment } from "@/features/paste/actions/comment.actions";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/shared/components/dupui/card";

interface CommentFormProps {
  pasteId: string;
  parentId?: string;
  onCommentAdded?: (comment?: unknown) => void;
  onCancel?: () => void;
  placeholder?: string;
  showCancel?: boolean;
}

export interface CommentFormRef {
  focus: () => void;
  setValue: (value: string) => void;
}

export const CommentForm = forwardRef<CommentFormRef, CommentFormProps>(
  ({ pasteId, parentId, onCommentAdded, onCancel, placeholder = "Write a comment...", showCancel = false }, ref) => {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pathname = usePathname();

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
      setValue: (value: string) => {
        setContent(value);
      },
    }));

    const handleSubmit = async () => {
      if (!content.trim()) {
        toast.error("Comment cannot be empty");
        return;
      }

      if (!user) {
        toast.error("Please sign in to comment");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await createComment({
          content: content.trim(),
          pasteId,
          parentId,
        });

        if (result.success) {
          setContent("");
          toast.success("Comment posted successfully!");
          onCommentAdded?.(result.comment);
        } else {
          toast.error(result.error || "Failed to post comment");
        }
      } catch (error) {
        console.error("Failed to submit comment:", error);
        toast.error("Failed to post comment");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };

    if (!user) {
      return (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in to join the conversation
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild size="sm">
                  <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/register?redirect=${encodeURIComponent(pathname)}`}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[100px] resize-none"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Press Cmd/Ctrl+Enter to post
          </div>
          <div className="flex gap-2">
            {showCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              size="sm"
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {parentId ? "Reply" : "Comment"}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

CommentForm.displayName = "CommentForm";