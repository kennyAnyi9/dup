import { 
  RATE_LIMIT_ANONYMOUS, 
  RATE_LIMIT_AUTHENTICATED 
} from "@/shared/lib/constants";

export async function checkRateLimit(
  userId: string | null,
  action: string = "paste"
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // Legacy compatibility - map old actions to new system
  const actionMap: Record<string, string> = {
    "paste": "PASTE_CREATE",
    "create-paste": "PASTE_CREATE", 
    "update-paste": "PASTE_UPDATE",
    "delete-paste": "PASTE_DELETE",
  };

  // Import advanced rate limiting (dynamic import to avoid circular deps)
  const { checkAdvancedRateLimit } = await import("./advanced-rate-limit");
  
  const mappedAction = actionMap[action] || "GENERAL_API";
  const result = await checkAdvancedRateLimit({
    userId,
    action: mappedAction as keyof typeof import("./advanced-rate-limit").RATE_LIMIT_CONFIGS,
  });
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function getRateLimitInfo(isAuthenticated: boolean) {
  return isAuthenticated ? RATE_LIMIT_AUTHENTICATED : RATE_LIMIT_ANONYMOUS;
}