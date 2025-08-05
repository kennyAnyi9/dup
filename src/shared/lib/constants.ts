// Character limits
export const CHAR_LIMIT_ANONYMOUS = 5000;
export const CHAR_LIMIT_AUTHENTICATED = null; // No limit for authenticated users

// Expiry times
export const EXPIRY_ANONYMOUS = "30m";
export const EXPIRY_AUTHENTICATED = "7d";

// Rate limits (requests per window)
export const RATE_LIMIT_ANONYMOUS = {
  requests: 5,
  window: "1m", // 5 requests per minute
} as const;

export const RATE_LIMIT_AUTHENTICATED = {
  requests: 20,
  window: "1m", // 20 requests per minute
} as const;

// App constants
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "dup";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Paste visibility options
export const PASTE_VISIBILITY = {
  PUBLIC: "public",
  UNLISTED: "unlisted",
  PRIVATE: "private",
} as const;

// Supported languages for syntax highlighting
export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "html",
  "css",
  "scss",
  "json",
  "xml",
  "yaml",
  "markdown",
  "sql",
  "bash",
  "powershell",
  "dockerfile",
  "plain",
] as const;

export type PasteVisibility =
  (typeof PASTE_VISIBILITY)[keyof typeof PASTE_VISIBILITY];
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
