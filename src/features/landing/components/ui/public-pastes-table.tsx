"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Clipboard, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface Paste {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  language: string;
  views: number;
  createdAt: Date;
  user: {
    name: string;
    image: string | null;
  } | null;
}

interface PublicPastesTableProps {
  pastes: Paste[];
}

export function PublicPastesTable({ pastes }: PublicPastesTableProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopyUrl(paste: Paste) {
    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const pasteUrl = `${window.location.origin}/p/${paste.slug}`;
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(paste.id);
      toast.success("URL copied to clipboard!");
      
      // Store timeout ID in ref for cleanup
      timeoutRef.current = setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
      console.error("Copy failed:", error);
    }
  }

  if (pastes.length === 0) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No public pastes yet. Be the first to share!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">Author</TableHead>
            <TableHead className="min-w-0 max-w-xs">Title</TableHead>
            <TableHead className="hidden sm:table-cell">Language</TableHead>
            <TableHead className="hidden md:table-cell">Views</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pastes.map((paste) => (
            <TableRow
              key={paste.id}
              className="hover:bg-accent/50 transition-colors"
            >
              <TableCell className="py-4">
                {paste.user && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={paste.user.image || undefined}
                      alt={paste.user.name}
                    />
                    <AvatarFallback className="text-xs bg-muted">
                      {paste.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </TableCell>
              <TableCell className="py-4 min-w-0 max-w-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <Link
                    href={`/p/${paste.slug}`}
                    className="font-medium text-sm hover:text-primary transition-colors block truncate"
                    title={paste.title || `Paste ${paste.slug}`}
                  >
                    {paste.title || `Paste ${paste.slug}`}
                  </Link>
                  {paste.user && (
                    <p className="text-xs text-muted-foreground truncate" title={paste.user.name}>
                      by {paste.user.name}
                    </p>
                  )}
                  {paste.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5" title={paste.description}>
                      {paste.description}
                    </p>
                  )}

                  {/* Mobile-only metadata */}
                  <div className="flex items-center gap-2 sm:hidden mt-1">
                    <Badge variant="outline" className="text-xs">
                      {paste.language}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {paste.views}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(paste.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 hidden sm:table-cell">
                <Badge variant="outline" className="text-xs">
                  {paste.language}
                </Badge>
              </TableCell>
              <TableCell className="py-4 hidden md:table-cell">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  {paste.views}
                </div>
              </TableCell>
              <TableCell className="py-4 hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(paste.createdAt, {
                    addSuffix: true,
                  })}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyUrl(paste)}
                  className="h-8 w-8 p-0"
                >
                  <Clipboard
                    className={`h-3.5 w-3.5 ${
                      copied === paste.id ? "text-green-600" : ""
                    }`}
                  />
                  <span className="sr-only">Copy URL</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
