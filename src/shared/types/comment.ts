export interface Comment {
  id: string;
  content: string;
  pasteId: string;
  parentId: string | null;
  likeCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  isLikedByUser?: boolean;
  replies: Comment[];
}

export interface CommentFormData {
  content: string;
  pasteId: string;
  parentId?: string;
}

export interface CommentActionResult {
  success: boolean;
  error?: string;
  comment?: Comment;
  liked?: boolean;
}

export interface CommentCountResult {
  success: boolean;
  error?: string;
  count?: number;
}

export interface CommentsResult {
  success: boolean;
  error?: string;
  comments?: Comment[];
}