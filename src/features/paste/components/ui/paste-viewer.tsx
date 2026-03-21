"use client";

import { useState, useId } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/dupui/button";
import { Switch } from "@/shared/components/dupui/switch";
import { Label } from "@/shared/components/dupui/label";
import {
  Panel,
  PanelContent,
} from "@/shared/components/dupui/panel";
import {
  Clipboard,
  Check,
  Download,
  ExternalLink,
  Hash,
  QrCode,
  WrapText
} from "lucide-react";
import { toast } from "sonner";
import { useQrDownload } from "../../hooks/use-qr-download";

interface PasteViewerProps {
  content: string;
  language: string;
  title?: string;
  slug: string;
  qrCodeColor?: string | null;
  qrCodeBackground?: string | null;
}

export function PasteViewerActions({
  content,
  language,
  title,
  slug,
  qrCodeColor,
  qrCodeBackground,
  showLineNumbers,
  onShowLineNumbersChange,
  wrapText,
  onWrapTextChange,
}: {
  content: string;
  language: string;
  title?: string;
  slug: string;
  qrCodeColor?: string | null;
  qrCodeBackground?: string | null;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (v: boolean) => void;
  wrapText: boolean;
  onWrapTextChange: (v: boolean) => void;
}) {
  const id = useId();
  const [copied, setCopied] = useState(false);
  const { downloadQrCode, isGenerating } = useQrDownload();

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
    a.download = `${title || slug}.${getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  }

  function getFileExtension(): string {
    const extMap: Record<string, string> = {
      javascript: "js", typescript: "ts", python: "py", java: "java",
      cpp: "cpp", c: "c", csharp: "cs", php: "php", ruby: "rb",
      go: "go", rust: "rs", swift: "swift", kotlin: "kt",
      html: "html", css: "css", scss: "scss", json: "json",
      xml: "xml", yaml: "yml", markdown: "md", sql: "sql",
      bash: "sh", powershell: "ps1", dockerfile: "dockerfile",
    };
    return extMap[language] || "txt";
  }

  function openRawView() {
    window.open(`/api/raw/${slug}`, "_blank");
  }

  function handleQrDownload() {
    downloadQrCode(slug, title, qrCodeColor, qrCodeBackground);
  }

  return (
    <div className="border-t p-3 flex items-center justify-center gap-3 flex-wrap">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Switch
            id={`${id}-line-numbers`}
            checked={showLineNumbers}
            onCheckedChange={onShowLineNumbersChange}
          />
          <Label htmlFor={`${id}-line-numbers`} className="text-xs flex items-center gap-1 cursor-pointer">
            <Hash className="h-3 w-3" />
            Lines
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id={`${id}-wrap-text`}
            checked={wrapText}
            onCheckedChange={onWrapTextChange}
          />
          <Label htmlFor={`${id}-wrap-text`} className="text-xs flex items-center gap-1 cursor-pointer">
            <WrapText className="h-3 w-3" />
            Wrap
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-px bg-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-xs rounded-none"
        >
          <div className="relative h-3 w-3">
            <Clipboard className={`h-3 w-3 absolute transition-all duration-300 ${copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
            <Check className={`h-3 w-3 absolute transition-all duration-300 ${copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
          </div>
          <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={downloadPaste}
          className="text-xs rounded-none"
        >
          <Download className="h-3 w-3" />
          <span className="ml-1">Download</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleQrDownload}
          disabled={isGenerating}
          className="text-xs rounded-none"
        >
          {isGenerating ? (
            <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
          ) : (
            <QrCode className="h-3 w-3" />
          )}
          <span className="ml-1">{isGenerating ? "..." : "QR Code"}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={openRawView}
          className="text-xs rounded-none"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="ml-1">Raw</span>
        </Button>
      </div>
    </div>
  );
}

export function PasteViewerCode({
  content,
  language,
  showLineNumbers,
  wrapText,
}: {
  content: string;
  language: string;
  showLineNumbers: boolean;
  wrapText: boolean;
}) {
  const { theme } = useTheme();

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

  return (
    <Panel>
      <PanelContent className="p-0 max-h-[70vh] overflow-auto">
        <SyntaxHighlighter
          key={`${showLineNumbers}-${wrapText}`}
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
            background: "transparent",
            ...(wrapText ? { whiteSpace: "pre-wrap", wordBreak: "break-word" } : {}),
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
      </PanelContent>
    </Panel>
  );
}

// Full standalone PasteViewer (for any context that needs the complete view in one component)
export function PasteViewer({ content, language, title, slug, qrCodeColor, qrCodeBackground }: PasteViewerProps) {
  const id = useId();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapText, setWrapText] = useState(false);
  const { downloadQrCode, isGenerating } = useQrDownload();

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

  function getFileExtension(): string {
    const extMap: Record<string, string> = {
      javascript: "js", typescript: "ts", python: "py", java: "java",
      cpp: "cpp", c: "c", csharp: "cs", php: "php", ruby: "rb",
      go: "go", rust: "rs", swift: "swift", kotlin: "kt",
      html: "html", css: "css", scss: "scss", json: "json",
      xml: "xml", yaml: "yml", markdown: "md", sql: "sql",
      bash: "sh", powershell: "ps1", dockerfile: "dockerfile",
    };
    return extMap[language] || "txt";
  }

  function downloadPaste() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || slug}.${getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  }

  function openRawView() {
    window.open(`/api/raw/${slug}`, "_blank");
  }

  function handleQrDownload() {
    downloadQrCode(slug, title, qrCodeColor, qrCodeBackground);
  }

  function mapLanguage(lang: string): string {
    const languageMap: Record<string, string> = {
      plain: "text", csharp: "csharp", cpp: "cpp", javascript: "javascript",
      typescript: "typescript", python: "python", java: "java", c: "c",
      php: "php", ruby: "ruby", go: "go", rust: "rust", swift: "swift",
      kotlin: "kotlin", html: "markup", css: "css", scss: "scss", json: "json",
      xml: "markup", yaml: "yaml", markdown: "markdown", sql: "sql",
      bash: "bash", powershell: "powershell", dockerfile: "docker",
      nginx: "nginx", apache: "apacheconf",
    };
    return languageMap[lang] || "text";
  }

  return (
    <Panel>
      <PanelContent className="p-0">
        <div className="p-3 border-b flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Switch id={`${id}-line-numbers`} checked={showLineNumbers} onCheckedChange={setShowLineNumbers} />
              <Label htmlFor={`${id}-line-numbers`} className="text-xs flex items-center gap-1 cursor-pointer">
                <Hash className="h-3 w-3" /> Lines
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id={`${id}-wrap-text`} checked={wrapText} onCheckedChange={setWrapText} />
              <Label htmlFor={`${id}-wrap-text`} className="text-xs flex items-center gap-1 cursor-pointer">
                <WrapText className="h-3 w-3" /> Wrap
              </Label>
            </div>
          </div>
          <div className="flex items-center gap-px bg-border">
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-xs rounded-none">
              <Clipboard className="h-3 w-3" />
              <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadPaste} className="text-xs rounded-none">
              <Download className="h-3 w-3" />
              <span className="ml-1">Download</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleQrDownload} disabled={isGenerating} className="text-xs rounded-none">
              <QrCode className="h-3 w-3" />
              <span className="ml-1">QR</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={openRawView} className="text-xs rounded-none">
              <ExternalLink className="h-3 w-3" />
              <span className="ml-1">Raw</span>
            </Button>
          </div>
        </div>

        <SyntaxHighlighter
          key={`${showLineNumbers}-${wrapText}`}
          language={mapLanguage(language)}
          style={theme === "dark" ? oneDark : oneLight}
          showLineNumbers={showLineNumbers}
          wrapLines={wrapText}
          wrapLongLines={wrapText}
          customStyle={{
            margin: 0, padding: "1rem", fontSize: "0.875rem",
            lineHeight: "1.5", backgroundColor: "transparent",
          }}
          lineNumberStyle={{
            minWidth: "3em", paddingRight: "1em",
            color: theme === "dark" ? "#6b7280" : "#9ca3af",
            borderRight: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
            marginRight: "1em",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </PanelContent>
    </Panel>
  );
}
