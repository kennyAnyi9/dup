import { Globe, EyeOff, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface VisibilityInfo {
  icon: LucideIcon;
  label: string;
  className: string;
}

export function getVisibilityInfo(visibility: string): VisibilityInfo {
  switch (visibility) {
    case "public":
      return {
        icon: Globe,
        label: "Public",
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      };
    case "unlisted":
      return {
        icon: EyeOff,
        label: "Unlisted",
        className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      };
    case "private":
      return {
        icon: Lock,
        label: "Private",
        className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      };
    default:
      return {
        icon: Globe,
        label: visibility,
        className: "bg-muted text-muted-foreground border-border",
      };
  }
}

export function formatPasteDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "cs",
    php: "php",
    ruby: "rb",
    go: "go",
    rust: "rs",
    swift: "swift",
    kotlin: "kt",
    html: "html",
    css: "css",
    scss: "scss",
    json: "json",
    xml: "xml",
    yaml: "yml",
    markdown: "md",
    sql: "sql",
    bash: "sh",
    powershell: "ps1",
    dockerfile: "dockerfile",
    nginx: "conf",
    apache: "conf",
    plain: "txt",
  };
  return extensions[language] || "txt";
}

export function mapLanguageForHighlighter(lang: string): string {
  const languageMap: Record<string, string> = {
    plain: "text",
    csharp: "csharp",
    cpp: "cpp",
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    c: "c",
    php: "php",
    ruby: "ruby",
    go: "go",
    rust: "rust",
    swift: "swift",
    kotlin: "kotlin",
    html: "markup",
    css: "css",
    scss: "scss",
    json: "json",
    xml: "markup",
    yaml: "yaml",
    markdown: "markdown",
    sql: "sql",
    bash: "bash",
    powershell: "powershell",
    dockerfile: "docker",
    nginx: "nginx",
    apache: "apacheconf",
  };
  return languageMap[lang] || "text";
}