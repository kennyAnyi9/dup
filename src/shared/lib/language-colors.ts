/**
 * Language color mappings based on popular programming language colors
 * Used for visual coding in the UI
 */

export interface LanguageColorScheme {
  border: string;
  background: string;
  text: string;
  badge: string;
}

export const languageColors: Record<string, LanguageColorScheme> = {
  // JavaScript ecosystem
  javascript: {
    border: "border-l-yellow-400",
    background: "bg-yellow-400/10",
    text: "text-yellow-600",
    badge: "bg-yellow-400/20 text-yellow-700 border-yellow-400/30",
  },
  typescript: {
    border: "border-l-blue-500",
    background: "bg-blue-500/10",
    text: "text-blue-600",
    badge: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  },
  jsx: {
    border: "border-l-cyan-400",
    background: "bg-cyan-400/10",
    text: "text-cyan-600",
    badge: "bg-cyan-400/20 text-cyan-700 border-cyan-400/30",
  },
  tsx: {
    border: "border-l-blue-400",
    background: "bg-blue-400/10",
    text: "text-blue-600",
    badge: "bg-blue-400/20 text-blue-700 border-blue-400/30",
  },

  // Python
  python: {
    border: "border-l-blue-600",
    background: "bg-blue-600/10",
    text: "text-blue-700",
    badge: "bg-blue-600/20 text-blue-800 border-blue-600/30",
  },

  // Java ecosystem
  java: {
    border: "border-l-red-500",
    background: "bg-red-500/10",
    text: "text-red-600",
    badge: "bg-red-500/20 text-red-700 border-red-500/30",
  },
  kotlin: {
    border: "border-l-purple-500",
    background: "bg-purple-500/10",
    text: "text-purple-600",
    badge: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  },

  // C family
  c: {
    border: "border-l-gray-600",
    background: "bg-gray-600/10",
    text: "text-gray-700",
    badge: "bg-gray-600/20 text-gray-800 border-gray-600/30",
  },
  cpp: {
    border: "border-l-pink-500",
    background: "bg-pink-500/10",
    text: "text-pink-600",
    badge: "bg-pink-500/20 text-pink-700 border-pink-500/30",
  },
  csharp: {
    border: "border-l-purple-600",
    background: "bg-purple-600/10",
    text: "text-purple-700",
    badge: "bg-purple-600/20 text-purple-800 border-purple-600/30",
  },

  // Ruby
  ruby: {
    border: "border-l-red-600",
    background: "bg-red-600/10",
    text: "text-red-700",
    badge: "bg-red-600/20 text-red-800 border-red-600/30",
  },

  // Go
  go: {
    border: "border-l-cyan-500",
    background: "bg-cyan-500/10",
    text: "text-cyan-600",
    badge: "bg-cyan-500/20 text-cyan-700 border-cyan-500/30",
  },

  // Rust
  rust: {
    border: "border-l-orange-600",
    background: "bg-orange-600/10",
    text: "text-orange-700",
    badge: "bg-orange-600/20 text-orange-800 border-orange-600/30",
  },

  // PHP
  php: {
    border: "border-l-indigo-500",
    background: "bg-indigo-500/10",
    text: "text-indigo-600",
    badge: "bg-indigo-500/20 text-indigo-700 border-indigo-500/30",
  },

  // Swift
  swift: {
    border: "border-l-orange-500",
    background: "bg-orange-500/10",
    text: "text-orange-600",
    badge: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  },

  // Markup and styling
  html: {
    border: "border-l-orange-400",
    background: "bg-orange-400/10",
    text: "text-orange-600",
    badge: "bg-orange-400/20 text-orange-700 border-orange-400/30",
  },
  css: {
    border: "border-l-blue-400",
    background: "bg-blue-400/10",
    text: "text-blue-600",
    badge: "bg-blue-400/20 text-blue-700 border-blue-400/30",
  },
  scss: {
    border: "border-l-pink-400",
    background: "bg-pink-400/10",
    text: "text-pink-600",
    badge: "bg-pink-400/20 text-pink-700 border-pink-400/30",
  },

  // Shell
  bash: {
    border: "border-l-green-600",
    background: "bg-green-600/10",
    text: "text-green-700",
    badge: "bg-green-600/20 text-green-800 border-green-600/30",
  },
  shell: {
    border: "border-l-green-600",
    background: "bg-green-600/10",
    text: "text-green-700",
    badge: "bg-green-600/20 text-green-800 border-green-600/30",
  },

  // Data formats
  json: {
    border: "border-l-yellow-500",
    background: "bg-yellow-500/10",
    text: "text-yellow-600",
    badge: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  },
  yaml: {
    border: "border-l-red-400",
    background: "bg-red-400/10",
    text: "text-red-600",
    badge: "bg-red-400/20 text-red-700 border-red-400/30",
  },
  xml: {
    border: "border-l-green-500",
    background: "bg-green-500/10",
    text: "text-green-600",
    badge: "bg-green-500/20 text-green-700 border-green-500/30",
  },

  // Markdown
  markdown: {
    border: "border-l-gray-500",
    background: "bg-gray-500/10",
    text: "text-gray-600",
    badge: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  },

  // SQL
  sql: {
    border: "border-l-teal-500",
    background: "bg-teal-500/10",
    text: "text-teal-600",
    badge: "bg-teal-500/20 text-teal-700 border-teal-500/30",
  },
};

// Default color scheme for unknown languages
export const defaultLanguageColor: LanguageColorScheme = {
  border: "border-l-slate-400",
  background: "bg-slate-400/10",
  text: "text-slate-600",
  badge: "bg-slate-400/20 text-slate-700 border-slate-400/30",
};

/**
 * Get color scheme for a given language
 * @param language - Programming language name (case-insensitive)
 * @returns Color scheme object with Tailwind classes
 */
export function getLanguageColors(language: string): LanguageColorScheme {
  const normalizedLanguage = language.toLowerCase().trim();
  return languageColors[normalizedLanguage] || defaultLanguageColor;
}

/**
 * Check if a language has a defined color scheme
 */
export function hasLanguageColors(language: string): boolean {
  const normalizedLanguage = language.toLowerCase().trim();
  return normalizedLanguage in languageColors;
}
