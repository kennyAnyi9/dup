import { Badge } from "@/shared/components/dupui/badge";
import { Tag } from "lucide-react";

interface PasteCardTagsProps {
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
  }>;
}

export function PasteCardTags({ tags }: PasteCardTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-w-0 px-4">
      <div className="flex flex-wrap items-center gap-1 justify-center max-w-48">
        {tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="h-4 px-1.5 text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700/50"
          >
            <Tag className="h-2 w-2 mr-1" />
            {tag.name}
          </Badge>
        ))}
        {tags.length > 3 && (
          <Badge
            variant="outline"
            className="h-4 px-1.5 text-xs font-medium bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-600/50"
          >
            +{tags.length - 3}
          </Badge>
        )}
      </div>
    </div>
  );
}