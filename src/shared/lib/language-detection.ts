import { type SupportedLanguage } from "@/shared/lib/constants";

interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
}

// File extension to language mapping
const EXTENSION_MAP: Record<string, SupportedLanguage> = {
  // JavaScript/TypeScript
  ".js": "javascript",
  ".jsx": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".mjs": "javascript",
  ".cjs": "javascript",

  // Web Technologies
  ".html": "html",
  ".htm": "html",
  ".css": "css",
  ".scss": "scss",

  // Python
  ".py": "python",
  ".pyx": "python",
  ".pyw": "python",

  // Java
  ".java": "java",
  ".class": "java",

  // C/C++
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".cxx": "cpp",
  ".cc": "cpp",
  ".hpp": "cpp",
  ".hxx": "cpp",

  // C#
  ".cs": "csharp",

  // PHP
  ".php": "php",
  ".phtml": "php",

  // Ruby
  ".rb": "ruby",
  ".ruby": "ruby",

  // Go
  ".go": "go",

  // Rust
  ".rs": "rust",

  // Swift
  ".swift": "swift",

  // Kotlin
  ".kt": "kotlin",
  ".kts": "kotlin",

  // Shell Scripts
  ".sh": "bash",
  ".bash": "bash",
  ".zsh": "bash",
  ".fish": "bash",

  // PowerShell
  ".ps1": "powershell",
  ".psm1": "powershell",

  // Markup/Data
  ".xml": "xml",
  ".json": "json",
  ".yaml": "yaml",
  ".yml": "yaml",

  // SQL
  ".sql": "sql",

  // Markdown
  ".md": "markdown",
  ".markdown": "markdown",

  // Docker
  ".dockerfile": "dockerfile",

  // Config files (treat as plain text for unsupported formats)
  ".toml": "plain",
  ".ini": "plain",
  ".cfg": "plain",
  ".conf": "plain",

  // Plain text
  ".txt": "plain",
  ".text": "plain",
};

// Content-based detection patterns
const CONTENT_PATTERNS: Array<{
  pattern: RegExp;
  language: SupportedLanguage;
  confidence: number;
}> = [
  // Shebang patterns
  { pattern: /^#!/, language: "bash", confidence: 0.9 },
  { pattern: /^#!.*python/i, language: "python", confidence: 0.95 },
  { pattern: /^#!.*node/i, language: "javascript", confidence: 0.95 },
  { pattern: /^#!.*ruby/i, language: "ruby", confidence: 0.95 },
  { pattern: /^#!.*php/i, language: "php", confidence: 0.95 },

  // HTML doctype
  { pattern: /<!DOCTYPE html/i, language: "html", confidence: 0.9 },
  { pattern: /<html/i, language: "html", confidence: 0.8 },

  // XML declaration
  { pattern: /^<\?xml/i, language: "xml", confidence: 0.9 },

  // JSON structure
  { pattern: /^\s*[\{\[]/, language: "json", confidence: 0.7 },

  // YAML front matter
  { pattern: /^---\n/, language: "yaml", confidence: 0.8 },

  // JavaScript/TypeScript patterns
  { pattern: /\bfunction\s+\w+\s*\(/, language: "javascript", confidence: 0.6 },
  { pattern: /\bconst\s+\w+\s*=/, language: "javascript", confidence: 0.5 },
  { pattern: /\blet\s+\w+\s*=/, language: "javascript", confidence: 0.5 },
  { pattern: /\bimport\s+.*from\s+['"]/, language: "javascript", confidence: 0.6 },
  { pattern: /\bexport\s+(default\s+)?/, language: "javascript", confidence: 0.6 },

  // TypeScript specific
  { pattern: /:\s*(string|number|boolean|object)\s*[;,=]/, language: "typescript", confidence: 0.7 },
  { pattern: /\binterface\s+\w+/, language: "typescript", confidence: 0.8 },
  { pattern: /\btype\s+\w+\s*=/, language: "typescript", confidence: 0.7 },

  // Python patterns
  { pattern: /\bdef\s+\w+\s*\(/, language: "python", confidence: 0.7 },
  { pattern: /\bclass\s+\w+(\(.*\))?:/, language: "python", confidence: 0.8 },
  { pattern: /\bimport\s+\w+/, language: "python", confidence: 0.6 },
  { pattern: /\bfrom\s+\w+\s+import/, language: "python", confidence: 0.7 },

  // Java patterns
  { pattern: /\bpublic\s+class\s+\w+/, language: "java", confidence: 0.8 },
  { pattern: /\bpublic\s+static\s+void\s+main/, language: "java", confidence: 0.9 },
  { pattern: /\bpackage\s+[\w.]+;/, language: "java", confidence: 0.8 },

  // C/C++ patterns
  { pattern: /#include\s*<.*>/, language: "c", confidence: 0.7 },
  { pattern: /\bint\s+main\s*\(/, language: "c", confidence: 0.8 },
  { pattern: /\bstd::\w+/, language: "cpp", confidence: 0.7 },
  { pattern: /#include\s*<iostream>/, language: "cpp", confidence: 0.8 },

  // CSS patterns
  { pattern: /\w+\s*{\s*[\w-]+:/, language: "css", confidence: 0.7 },
  { pattern: /@media\s*\(/, language: "css", confidence: 0.8 },

  // SQL patterns
  { pattern: /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i, language: "sql", confidence: 0.7 },

  // PHP patterns
  { pattern: /<\?php/, language: "php", confidence: 0.9 },
  { pattern: /\$\w+\s*=/, language: "php", confidence: 0.6 },

  // Ruby patterns
  { pattern: /\bdef\s+\w+/, language: "ruby", confidence: 0.6 },
  { pattern: /\bclass\s+\w+(<\s*\w+)?/, language: "ruby", confidence: 0.7 },
  { pattern: /\bend\b/, language: "ruby", confidence: 0.5 },

  // Go patterns
  { pattern: /\bpackage\s+\w+/, language: "go", confidence: 0.7 },
  { pattern: /\bfunc\s+\w+\s*\(/, language: "go", confidence: 0.7 },

  // Rust patterns
  { pattern: /\bfn\s+\w+\s*\(/, language: "rust", confidence: 0.7 },
  { pattern: /\blet\s+mut\s+\w+/, language: "rust", confidence: 0.8 },

  // Shell script patterns
  { pattern: /\becho\s+/, language: "bash", confidence: 0.5 },
  { pattern: /\bif\s+\[\s+.*\s+\]/, language: "bash", confidence: 0.6 },
];

/**
 * Detect the programming language of a file based on filename and content
 */
export function detectLanguage(filename: string, content: string): LanguageDetectionResult {
  let bestGuess: LanguageDetectionResult = { language: "plain", confidence: 0 };

  // First, try file extension detection
  const extension = getFileExtension(filename);
  if (extension && EXTENSION_MAP[extension]) {
    bestGuess = { language: EXTENSION_MAP[extension], confidence: 0.8 };
  }

  // Special filename patterns
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename === "dockerfile" || lowerFilename.endsWith(".dockerfile")) {
    bestGuess = { language: "dockerfile", confidence: 0.9 };
  } else if (lowerFilename === "makefile" || lowerFilename.startsWith("makefile")) {
    bestGuess = { language: "plain", confidence: 0.9 };
  } else if (lowerFilename.startsWith(".env") || lowerFilename === "env") {
    bestGuess = { language: "bash", confidence: 0.7 };
  } else if (lowerFilename === ".gitignore" || lowerFilename === "gitignore") {
    bestGuess = { language: "plain", confidence: 0.8 };
  }

  // Content-based detection (can override extension detection if confidence is higher)
  for (const { pattern, language, confidence } of CONTENT_PATTERNS) {
    if (pattern.test(content)) {
      if (confidence > bestGuess.confidence) {
        bestGuess = { language, confidence };
      }
    }
  }

  return bestGuess;
}

/**
 * Get file extension from filename (including the dot)
 */
function getFileExtension(filename: string): string | null {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return null;
  }
  return filename.substring(lastDotIndex).toLowerCase();
}

/**
 * Get a human-readable language name
 */
export function getLanguageDisplayName(language: SupportedLanguage): string {
  const displayNames: Record<SupportedLanguage, string> = {
    plain: "Plain Text",
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    php: "PHP",
    ruby: "Ruby",
    go: "Go",
    rust: "Rust",
    swift: "Swift",
    kotlin: "Kotlin",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    xml: "XML",
    json: "JSON",
    yaml: "YAML",
    sql: "SQL",
    bash: "Bash",
    powershell: "PowerShell",
    dockerfile: "Dockerfile",
    markdown: "Markdown",
  };

  return displayNames[language] || language;
}