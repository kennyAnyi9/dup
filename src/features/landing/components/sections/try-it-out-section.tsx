"use client";

import { useState, useEffect, useRef } from "react";
import { createPaste } from "@/features/paste/actions/paste.actions";
import {
  SUPPORTED_LANGUAGES,
  CHAR_LIMIT_ANONYMOUS,
  PASTE_VISIBILITY,
  APP_URL,
} from "@/shared/lib/constants";
import type { SupportedLanguage } from "@/shared/lib/constants";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "@/shared/components/dupui/panel";
import { Button } from "@/shared/components/dupui/button";
import { Badge } from "@/shared/components/dupui/badge";
import { Combobox } from "@/shared/components/dupui/combobox";
import { useAuth } from "@/shared/hooks/use-auth";
import {
  Copy,
  Check,
  ExternalLink,
  Loader2,
  FileText,
  Globe,
  EyeOff,
  Lock,
  LockKeyhole,
  Link2,
  Flame,
  ClockFading,
  Tags,
  QrCode,
  Upload,
  Eye,
} from "lucide-react";
import QRCodeStyling from "qr-code-styling";

const languageOptions = SUPPORTED_LANGUAGES.map((lang) => ({
  value: lang,
  label: lang.charAt(0).toUpperCase() + lang.slice(1),
  icon: <FileText className="h-4 w-4" />,
}));

const BURN_PRESETS = [
  { value: 1, label: "1 view" },
  { value: 3, label: "3 views" },
  { value: 5, label: "5 views" },
  { value: 10, label: "10 views" },
];

const QR_COLOR_PRESETS = [
  { name: "Classic", foreground: "#000000", background: "#ffffff" },
  { name: "Blue", foreground: "#1e40af", background: "#dbeafe" },
  { name: "Forest", foreground: "#166534", background: "#dcfce7" },
  { name: "Sunset", foreground: "#dc2626", background: "#fef2f2" },
  { name: "Purple", foreground: "#7c3aed", background: "#f3e8ff" },
  { name: "Dark", foreground: "#ffffff", background: "#1f2937" },
];

const comboboxCellClass =
  "h-auto rounded-none border-0 bg-background dark:bg-background px-4 py-3 text-sm font-commit-mono hover:bg-accent transition-colors focus-visible:ring-0 focus-visible:border-0";

function GuestBadge() {
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-1.5 py-0 rounded-none ml-auto shrink-0"
    >
      Sign in
    </Badge>
  );
}

export function TryItOutSection() {
  const { isAuthenticated, isLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>("plain");
  const [visibility, setVisibility] = useState<
    "public" | "unlisted" | "private"
  >("public");
  const [expiresIn, setExpiresIn] = useState<string>("30m");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [burnViews, setBurnViews] = useState(1);
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBackground, setQrBackground] = useState("#ffffff");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    slug: string;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const qrContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibilityOptions = [
    {
      value: PASTE_VISIBILITY.PUBLIC,
      label: "Public",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      value: PASTE_VISIBILITY.UNLISTED,
      label: "Unlisted",
      icon: <EyeOff className="h-4 w-4" />,
    },
    {
      value: PASTE_VISIBILITY.PRIVATE,
      label: "Private",
      icon: <Lock className="h-4 w-4" />,
      disabled: !isAuthenticated && !isLoading,
    },
  ];

  const expirationOptions = [
    {
      value: "30m",
      label: "30 minutes",
      icon: <ClockFading className="h-4 w-4" />,
    },
    {
      value: "1h",
      label: "1 hour",
      icon: <ClockFading className="h-4 w-4" />,
      disabled: !isAuthenticated && !isLoading,
    },
    {
      value: "1d",
      label: "1 day",
      icon: <ClockFading className="h-4 w-4" />,
      disabled: !isAuthenticated && !isLoading,
    },
    {
      value: "7d",
      label: "7 days",
      icon: <ClockFading className="h-4 w-4" />,
      disabled: !isAuthenticated && !isLoading,
    },
    {
      value: "30d",
      label: "30 days",
      icon: <ClockFading className="h-4 w-4" />,
      disabled: !isAuthenticated && !isLoading,
    },
    {
      value: "never",
      label: "Never",
      icon: <ClockFading className="h-4 w-4" />,
      disabled: !isAuthenticated && !isLoading,
    },
  ];

  const charLimit =
    isAuthenticated || isLoading ? null : CHAR_LIMIT_ANONYMOUS;
  const guestLocked = !isAuthenticated && !isLoading;

  // QR code rendering
  useEffect(() => {
    const container = qrContainerRef.current;
    if (!container) return;

    const qr = new QRCodeStyling({
      width: 140,
      height: 140,
      type: "svg",
      data: customUrl
        ? `${APP_URL}/p/${customUrl}`
        : `${APP_URL}/p/preview`,
      image: "/qr-avatar.png",
      dotsOptions: { color: qrColor, type: "square" },
      backgroundOptions: { color: qrBackground },
      imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.4 },
      cornersSquareOptions: { type: "square", color: qrColor },
      cornersDotOptions: { type: "square", color: qrColor },
    });

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    qr.append(container);

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [qrColor, qrBackground, customUrl]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setContent(text);

        // Auto-fill title from filename
        const nameParts = file.name.split(".");
        if (nameParts.length > 1) {
          nameParts.pop();
        }
        setTitle(nameParts.join("."));

        // Auto-detect language from extension
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const extMap: Record<string, SupportedLanguage> = {
          js: "javascript", ts: "typescript", py: "python", java: "java",
          cpp: "cpp", c: "c", cs: "csharp", php: "php", rb: "ruby",
          go: "go", rs: "rust", swift: "swift", kt: "kotlin",
          html: "html", css: "css", scss: "scss", json: "json",
          xml: "xml", yml: "yaml", yaml: "yaml", md: "markdown",
          sql: "sql", sh: "bash", ps1: "powershell", dockerfile: "dockerfile",
          conf: "nginx", txt: "plain",
        };
        if (extMap[ext]) {
          setLanguage(extMap[ext]);
        }
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag.length <= 20 && /^[a-zA-Z0-9\-_\s]+$/.test(tag) && !tags.includes(tag) && tags.length < 5) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  async function handleCreate() {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const parsedTags = tags.slice(0, 5);

    try {
      const res = await createPaste({
        title: title || undefined,
        description: description || undefined,
        content,
        language,
        visibility,
        password: password || undefined,
        customUrl: customUrl || undefined,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        burnAfterRead,
        burnAfterReadViews: burnAfterRead ? burnViews : undefined,
        qrCodeColor: qrColor,
        qrCodeBackground: qrBackground,
        expiresIn: expiresIn as
          | "30m"
          | "1h"
          | "1d"
          | "7d"
          | "30d"
          | "never",
      });

      if (res.success && res.paste) {
        setResult({ slug: res.paste.slug, url: res.paste.url });
        setContent("");
        setTitle("");
        setDescription("");
        setPassword("");
        setCustomUrl("");
        setTags([]);
        setTagInput("");
        setBurnAfterRead(false);
      } else {
        setError(res.error || "Failed to create paste");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(`${APP_URL}/${result.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Panel id="try-it-out">
      <PanelHeader className="text-left">
        <PanelTitle>Try it out</PanelTitle>
        <p className="text-sm text-muted-foreground">
          {guestLocked
            ? "Create a paste as a guest — sign in to unlock all features."
            : "Create a paste with full access to all features."}
        </p>
      </PanelHeader>
      <PanelContent className="p-0">
        <div className="grid grid-cols-10 gap-px bg-border">
          {/* Row 1: Title (4 cols) | Description (6 cols) */}
          <div className="col-span-4 bg-background">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              maxLength={100}
              className="w-full h-full bg-transparent px-4 py-3 font-commit-mono text-sm focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="col-span-6 bg-background">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comment"
              maxLength={500}
              rows={1}
              className="w-full h-full bg-transparent px-4 py-3 font-commit-mono text-sm resize-none focus:outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Row 2: Upload | Password | Language | Visibility | Expiry (5 cells, each 2 cols) */}
          <button
            type="button"
            onClick={() => !guestLocked && fileInputRef.current?.click()}
            className={`col-span-2 bg-background px-4 py-3 flex items-center gap-2 hover:bg-accent transition-colors whitespace-nowrap ${
              guestLocked
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-muted-foreground cursor-pointer"
            }`}
            disabled={guestLocked}
          >
            <Upload className="size-4 shrink-0" strokeWidth={1.5} />
            <span className="font-commit-mono text-sm">Upload</span>
            {guestLocked && <GuestBadge />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="text/*,.js,.ts,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.html,.css,.scss,.json,.xml,.yml,.yaml,.md,.sql,.sh,.ps1,.dockerfile,.conf,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            className={`col-span-2 bg-background px-4 py-3 flex items-center gap-2 hover:bg-accent transition-colors whitespace-nowrap ${
              guestLocked
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-foreground"
            }`}
          >
            <LockKeyhole className="size-4 shrink-0" strokeWidth={1.5} />
            {guestLocked ? (
              <>
                <span className="font-commit-mono text-sm">Encrypt</span>
                <GuestBadge />
              </>
            ) : (
              <div className="flex-1 flex items-center gap-1 min-w-0">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="****"
                  className="flex-1 min-w-0 bg-transparent font-commit-mono text-sm focus:outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          <Combobox
            options={languageOptions}
            value={language}
            onValueChange={(val) => setLanguage(val as SupportedLanguage)}
            placeholder={
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Language</span>
              </div>
            }
            searchPlaceholder="Search language..."
            className={`col-span-2 ${comboboxCellClass}`}
          />

          <Combobox
            options={visibilityOptions}
            value={visibility}
            onValueChange={(val) =>
              setVisibility(val as "public" | "unlisted" | "private")
            }
            placeholder={
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Visibility</span>
              </div>
            }
            className={`col-span-2 ${comboboxCellClass}`}
          />

          <Combobox
            options={expirationOptions}
            value={expiresIn}
            onValueChange={(val) => setExpiresIn(val)}
            placeholder={
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClockFading className="h-4 w-4" />
                <span>Expires</span>
              </div>
            }
            className={`col-span-2 ${comboboxCellClass}`}
          />

          {/* Row 4: Tags (5 cols) | Custom URL (5 cols) */}
          <div
            className={`col-span-5 bg-background px-4 py-3 flex items-center gap-2 transition-colors flex-wrap ${
              guestLocked
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-foreground"
            }`}
          >
            <Tags className="size-4 shrink-0" strokeWidth={1.5} />
            {guestLocked ? (
              <>
                <span className="font-commit-mono text-sm whitespace-nowrap">Tags</span>
                <GuestBadge />
              </>
            ) : (
              <>
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-none font-commit-mono text-xs px-1.5 py-0 gap-1 shrink-0"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive ml-0.5"
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
                {tags.length < 5 && (
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? "Tags" : ""}
                    className="flex-1 min-w-[60px] bg-transparent font-commit-mono text-sm focus:outline-none placeholder:text-muted-foreground"
                  />
                )}
              </>
            )}
          </div>

          <div
            className={`col-span-5 bg-background px-4 py-3 flex items-center gap-2 hover:bg-accent transition-colors whitespace-nowrap ${
              guestLocked
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-foreground"
            }`}
          >
            <Link2 className="size-4 shrink-0" strokeWidth={1.5} />
            {guestLocked ? (
              <>
                <span className="font-commit-mono text-sm">Custom link</span>
                <GuestBadge />
              </>
            ) : (
              <div className="flex-1 flex items-center gap-1 min-w-0">
                <span className="text-muted-foreground font-commit-mono text-sm shrink-0">
                  {APP_URL.replace(/\/+$/, "")}/
                </span>
                <input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="customize"
                  maxLength={50}
                  className="flex-1 min-w-0 bg-transparent font-commit-mono text-sm focus:outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}
          </div>

          {/* Paste area (full width) */}
          <div className="col-span-10 bg-background relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              maxLength={charLimit ?? undefined}
              className="w-full min-h-[240px] bg-transparent p-4 font-commit-mono text-sm resize-y focus:outline-none placeholder:text-muted-foreground"
            />
            <span className="absolute bottom-2 right-3 text-xs text-muted-foreground font-commit-mono">
              {charLimit
                ? `${content.length}/${charLimit}`
                : `${content.length} chars`}
            </span>
          </div>

          {/* QR preview (3 cols, 2 rows) | QR options (3 cols, 2 rows) | Burn (4 cols) + Create (4 cols) */}
          <div className="col-span-3 row-span-2 bg-background p-4 flex items-center justify-center">
            <div ref={qrContainerRef} className="flex items-center justify-center" />
          </div>

          <div className="col-span-3 row-span-2 bg-background p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <QrCode className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <span className="font-commit-mono text-xs text-muted-foreground">QR Colors</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QR_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    if (guestLocked) return;
                    setQrColor(preset.foreground);
                    setQrBackground(preset.background);
                  }}
                  disabled={guestLocked}
                  className={`size-7 border transition-all ${
                    qrColor === preset.foreground && qrBackground === preset.background
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border hover:border-foreground/50"
                  } ${guestLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ backgroundColor: preset.foreground }}
                  title={preset.name}
                />
              ))}
            </div>
            {!guestLocked && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="size-7 cursor-pointer border border-border"
                />
                <input
                  type="color"
                  value={qrBackground}
                  onChange={(e) => setQrBackground(e.target.value)}
                  className="size-7 cursor-pointer border border-border"
                />
                <span className="font-commit-mono text-xs text-muted-foreground">Custom</span>
              </div>
            )}
            {guestLocked && (
              <span className="font-commit-mono text-xs text-muted-foreground/50">
                Sign in to customize
              </span>
            )}
          </div>

          {/* Burn after read options */}
          <div
            className={`col-span-4 bg-background p-4 flex flex-col gap-3 ${
              guestLocked ? "text-muted-foreground/50" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Flame
                className={`size-4 shrink-0 ${burnAfterRead ? "text-destructive" : ""}`}
                strokeWidth={1.5}
              />
              <span className="font-commit-mono text-sm">Burn after read</span>
              {guestLocked && <GuestBadge />}
            </div>
            {!guestLocked && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setBurnAfterRead(false)}
                  className={`px-2.5 py-1 border font-commit-mono text-xs transition-all ${
                    !burnAfterRead
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  Off
                </button>
                {BURN_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setBurnAfterRead(true);
                      setBurnViews(preset.value);
                    }}
                    className={`px-2.5 py-1 border font-commit-mono text-xs transition-all ${
                      burnAfterRead && burnViews === preset.value
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border hover:border-foreground/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Paste button */}
          <button
            onClick={handleCreate}
            disabled={!content.trim() || isSubmitting}
            className="col-span-4 bg-white text-black px-4 py-3 font-commit-mono text-sm text-center hover:bg-white/90 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin mx-auto" />
            ) : (
              "Create Paste"
            )}
          </button>
        </div>

        {/* Success bar */}
        {result && (
          <div className="flex items-center gap-2 border-t border-border bg-background p-3">
            <span className="font-commit-mono text-sm text-teal-400 truncate flex-1">
              {APP_URL}/{result.slug}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="rounded-none shrink-0"
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-none shrink-0"
            >
              <a href={`/${result.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          </div>
        )}

        {/* Error bar */}
        {error && (
          <div className="border-t border-border bg-background p-3">
            <span className="font-commit-mono text-sm text-destructive">
              {error}
            </span>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
