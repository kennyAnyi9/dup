"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PasteViewer } from "./paste-viewer";
import { 
  Copy, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Shield,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface PastePreviewModalProps {
  paste: {
    id: string;
    slug: string;
    title: string | null;
    description: string | null;
    content: string;
    language: string;
    visibility: "public" | "private" | "unlisted";
    views: number;
    createdAt: Date;
    expiresAt: Date | null;
    burnAfterRead: boolean;
    hasPassword: boolean;
    user: {
      id: string;
      name: string;
      image: string | null;
    } | null;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: (pasteId: string) => void;
}

export function PastePreviewModal({ 
  paste, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete 
}: PastePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!paste) return null;

  const handleCopyUrl = async () => {
    try {
      const pasteUrl = `${window.location.origin}/p/${paste.slug}`;
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(true);
      toast.success("URL copied to clipboard!");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleViewPaste = () => {
    window.open(`/p/${paste.slug}`, '_blank');
  };

  const getVisibilityBadge = () => {
    switch (paste.visibility) {
      case "private":
        return <Badge variant="secondary" className="text-xs"><Shield className="h-3 w-3 mr-1" />Private</Badge>;
      case "unlisted":
        return <Badge variant="outline" className="text-xs"><Eye className="h-3 w-3 mr-1" />Unlisted</Badge>;
      default:
        return <Badge variant="default" className="text-xs"><Eye className="h-3 w-3 mr-1" />Public</Badge>;
    }
  };

  const isExpired = paste.expiresAt && new Date() > paste.expiresAt;

  const HeaderContent = () => (
    <div className="space-y-4">
      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold leading-tight truncate">
            {paste.title || `Paste ${paste.slug}`}
          </h2>
          {paste.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {paste.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="text-xs h-8"
          >
            <Copy className="h-3 w-3 mr-1" />
            {copied ? "Copied!" : "Copy URL"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewPaste}
            className="text-xs h-8"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="text-xs h-8"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(paste.id)}
              className="text-xs h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {paste.user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={paste.user.image || undefined} alt={paste.user.name} />
              <AvatarFallback className="text-xs">
                {paste.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{paste.user.name}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{formatDistanceToNow(paste.createdAt, { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3 flex-shrink-0" />
          <span>{paste.views} views</span>
        </div>
        {paste.expiresAt && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">Expires {formatDistanceToNow(paste.expiresAt, { addSuffix: true })}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {paste.language}
        </Badge>
        {getVisibilityBadge()}
        {paste.hasPassword && (
          <Badge variant="secondary" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Password Protected
          </Badge>
        )}
        {paste.burnAfterRead && (
          <Badge variant="destructive" className="text-xs">
            Burn After Read
          </Badge>
        )}
        {isExpired && (
          <Badge variant="destructive" className="text-xs">
            Expired
          </Badge>
        )}
        {paste.tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="text-xs"
            style={{ borderColor: tag.color, color: tag.color }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );

  const ContentArea = () => (
    <div className="flex-1 min-h-0">
      <div className="h-full w-full overflow-auto rounded-lg border">
        <PasteViewer
          content={paste.content}
          language={paste.language}
          showHeader={false}
          className="min-h-full"
        />
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-[90vw] w-full max-h-[85vh] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0 flex flex-col"
          showCloseButton={true}
        >
          {/* Header - Fixed with padding for close button */}
          <div className="flex-shrink-0 p-6 pr-12 border-b bg-background">
            <HeaderContent />
          </div>
          
          {/* Content - Scrollable */}
          <div className="flex-1 min-h-0 p-6">
            <ContentArea />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[95vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b bg-background">
          <HeaderContent />
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 min-h-0 p-4">
          <ContentArea />
        </div>
      </DrawerContent>
    </Drawer>
  );
}