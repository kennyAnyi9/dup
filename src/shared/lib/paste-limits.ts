import {
  CHAR_LIMIT_ANONYMOUS,
  CHAR_LIMIT_AUTHENTICATED,
  EXPIRY_ANONYMOUS,
  EXPIRY_AUTHENTICATED,
  RATE_LIMIT_ANONYMOUS,
  RATE_LIMIT_AUTHENTICATED,
} from "./constants";

// Helper function to format character limits for display
function formatCharacterLimit(limit: number | null): string {
  if (limit === null) {
    return "No character limit";
  }
  if (limit >= 1000) {
    return `${(limit / 1000).toLocaleString()}K character limit`;
  }
  return `${limit.toLocaleString()} character limit`;
}

// Helper function to format expiry time for display  
function formatExpiryTime(expiry: string): string {
  switch (expiry) {
    case "30m":
      return "30 minute expiry";
    case "1h":
      return "1 hour expiry";
    case "1d":
      return "1 day expiry";
    case "7d":
      return "7 day expiry";
    case "30d":
      return "30 day expiry";
    default:
      return expiry;
  }
}

// Helper function to format rate limits for display
function formatRateLimit(rateLimit: { requests: number; window: string }): string {
  const { requests, window } = rateLimit;
  switch (window) {
    case "1m":
      return `${requests} pastes per minute`;
    case "1h":
      return `${requests} pastes per hour`;
    case "1d":
      return `${requests} pastes per day`;
    default:
      return `${requests} pastes per ${window}`;
  }
}

// Structured constants for landing page display
export const PASTE_LIMITS = {
  ANONYMOUS: {
    CHARACTER_LIMIT: formatCharacterLimit(CHAR_LIMIT_ANONYMOUS),
    EXPIRY_TIME: formatExpiryTime(EXPIRY_ANONYMOUS),
    RATE_LIMIT: formatRateLimit(RATE_LIMIT_ANONYMOUS),
    RAW_VALUES: {
      CHARACTER_LIMIT: CHAR_LIMIT_ANONYMOUS,
      EXPIRY_TIME: EXPIRY_ANONYMOUS,
      RATE_LIMIT: RATE_LIMIT_ANONYMOUS,
    },
  },
  AUTHENTICATED: {
    CHARACTER_LIMIT: formatCharacterLimit(CHAR_LIMIT_AUTHENTICATED),
    EXPIRY_TIME: "Up to 30 days or never expire",
    RATE_LIMIT: formatRateLimit(RATE_LIMIT_AUTHENTICATED),
    RAW_VALUES: {
      CHARACTER_LIMIT: CHAR_LIMIT_AUTHENTICATED,
      EXPIRY_TIME: EXPIRY_AUTHENTICATED,
      RATE_LIMIT: RATE_LIMIT_AUTHENTICATED,
    },
  },
} as const;