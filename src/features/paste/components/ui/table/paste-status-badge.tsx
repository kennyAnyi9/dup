"use client";

import { Badge } from "@/shared/components/dupui/badge";
import { Globe, Lock, EyeOff, AlertTriangle, Clock, Shield } from "lucide-react";

interface PasteStatusBadgeProps {
  visibility: string;
  isExpired?: boolean;
  burnAfterRead?: boolean;
  hasPassword?: boolean;
}

export function PasteStatusBadge({ visibility, isExpired, burnAfterRead, hasPassword }: PasteStatusBadgeProps) {
  function getVisibilityInfo(visibility: string) {
    switch (visibility) {
      case "public":
        return {
          icon: <Globe className="h-3 w-3" />,
          label: "Public",
          className:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
          dotColor: "bg-green-500",
        };
      case "private":
        return {
          icon: <Lock className="h-3 w-3" />,
          label: "Private",
          className:
            "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
          dotColor: "bg-red-500",
        };
      case "unlisted":
        return {
          icon: <EyeOff className="h-3 w-3" />,
          label: "Unlisted",
          className:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/50",
          dotColor: "bg-yellow-500",
        };
      default:
        return {
          icon: <Globe className="h-3 w-3" />,
          label: "Public",
          className:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700/50",
          dotColor: "bg-green-500",
        };
    }
  }

  const visibilityInfo = getVisibilityInfo(visibility);

  if (isExpired) {
    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-600"
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        Expired
      </Badge>
    );
  }

  if (burnAfterRead) {
    return (
      <Badge
        variant="outline"
        className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700/50"
      >
        <Clock className="h-3 w-3 mr-1" />
        Burn after read
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Badge variant="outline" className={visibilityInfo.className}>
        {visibilityInfo.icon}
        <span className="ml-1">{visibilityInfo.label}</span>
      </Badge>
      {hasPassword && (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/50"
        >
          <Shield className="h-3 w-3" />
        </Badge>
      )}
    </div>
  );
}