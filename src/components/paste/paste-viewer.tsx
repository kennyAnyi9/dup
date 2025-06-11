"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Clipboard, 
  Check, 
  Download, 
  ExternalLink,
  Hash,
  WrapText
} from "lucide-react";
import { toast } from "sonner";

interface PasteViewerProps {
  content: string;
  language: string;
  title?: string;
  slug: string;
}

export function PasteViewer({ content, language, title, slug }: PasteViewerProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapText, setWrapText] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
      console.error("Copy failed:", error);
    }
  }

  function downloadPaste() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || slug}.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  }

  function getFileExtension(lang: string): string {
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
    return extensions[lang] || "txt";
  }

  function openRawView() {
    window.open(`/api/raw/${slug}`, "_blank");
  }

  // Map our language names to SyntaxHighlighter language names
  function mapLanguage(lang: string): string {
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

  const lineCount = content.split("\n").length;
  const charCount = content.length;
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {language}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {lineCount} lines • {charCount} characters • {wordCount} words
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Options */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Switch
                id="line-numbers"
                checked={showLineNumbers}
                onCheckedChange={setShowLineNumbers}
              />
              <Label htmlFor="line-numbers" className="text-xs flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Lines
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="wrap-text"
                checked={wrapText}
                onCheckedChange={setWrapText}
              />
              <Label htmlFor="wrap-text" className="text-xs flex items-center gap-1">
                <WrapText className="h-3 w-3" />
                Wrap
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="text-xs"
            >
              <div className="relative h-3 w-3">
                <Clipboard className={`h-3 w-3 absolute transition-all duration-300 ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
                <Check className={`h-3 w-3 absolute transition-all duration-300 ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
              </div>
              <span className="hidden sm:inline ml-1">
                {copied ? "Copied!" : "Copy"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadPaste}
              className="text-xs"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline ml-1">Download</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={openRawView}
              className="text-xs"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline ml-1">Raw</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        <div className="border rounded-lg overflow-hidden">
          <SyntaxHighlighter
            language={mapLanguage(language)}
            style={theme === "dark" ? oneDark : oneLight}
            showLineNumbers={showLineNumbers}
            wrapLines={wrapText}
            wrapLongLines={wrapText}
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.875rem",
              lineHeight: "1.5",
              backgroundColor: "transparent",
            }}
            lineNumberStyle={{
              minWidth: "3em",
              paddingRight: "1em",
              color: theme === "dark" ? "#6b7280" : "#9ca3af",
              borderRight: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
              marginRight: "1em",
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Use the controls above to customize the view • Copy, download, or view raw content
        </p>
      </div>
    </div>
  );
}