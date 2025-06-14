"use client";

import { createPaste } from "@/app/actions/paste";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import {
  CHAR_LIMIT_ANONYMOUS,
  CHAR_LIMIT_AUTHENTICATED,
  PASTE_VISIBILITY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  type PasteVisibility,
} from "@/lib/constants";
import { createPasteSchema, type CreatePasteInput } from "@/types/paste";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Check,
  Code,
  Eye,
  EyeOff,
  EyeOff as EyeOffIcon,
  Globe,
  Loader,
  Lock,
  Settings,
  Tag,
  Type,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CharacterCounter } from "./character-counter";
import { TagsInput } from "./tags-input";

interface PasteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
  editingPaste?: {
    id: string;
    title: string | null;
    description: string | null;
    content: string;
    language: string;
    visibility: string;
    tags?: Array<{ name: string }>;
  } | null;
}

export function PasteFormModal({
  open,
  onOpenChange,
  initialContent = "",
  editingPaste = null,
}: PasteFormModalProps) {
  const { isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [urlAvailability, setUrlAvailability] = useState<{
    isChecking: boolean;
    available: boolean | null;
    error?: string;
  }>({ isChecking: false, available: null });

  const charLimit = isAuthenticated
    ? CHAR_LIMIT_AUTHENTICATED
    : CHAR_LIMIT_ANONYMOUS;

  const form = useForm({
    resolver: zodResolver(createPasteSchema),
    defaultValues: {
      title: editingPaste?.title || "",
      description: editingPaste?.description || "",
      content: editingPaste?.content || initialContent,
      language: (editingPaste?.language as SupportedLanguage) || "plain",
      visibility: (editingPaste?.visibility as PasteVisibility) || PASTE_VISIBILITY.PUBLIC,
      password: "",
      customUrl: "",
      tags: editingPaste?.tags?.map(tag => tag.name) || [],
      burnAfterRead: false,
      burnAfterReadViews: 1,
      expiresIn: isAuthenticated ? "never" : "30m",
    },
  });

  const watchedContent = form.watch("content") || "";
  const watchedVisibility = form.watch("visibility") || PASTE_VISIBILITY.PUBLIC;
  const watchedBurnAfterRead = form.watch("burnAfterRead") || false;
  const watchedCustomUrl = form.watch("customUrl") || "";

  // Check URL availability with debouncing
  useEffect(() => {
    if (!isAuthenticated || !watchedCustomUrl.trim()) {
      setUrlAvailability({ isChecking: false, available: null });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setUrlAvailability({ isChecking: true, available: null });
      
      try {
        const response = await fetch("/api/check-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: watchedCustomUrl.trim() }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setUrlAvailability({
          isChecking: false,
          available: result.available,
          error: result.error,
        });
      } catch (error) {
        console.error("URL availability check failed:", error);
        setUrlAvailability({
          isChecking: false,
          available: false,
          error: "Failed to check URL availability",
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [watchedCustomUrl, isAuthenticated]);

  const onSubmit = (data: CreatePasteInput) => {
    startTransition(async () => {
      try {
        const result = await createPaste(data);

        if (result.success && result.paste) {
          const pasteUrl = `${window.location.origin}/p/${result.paste.slug}`;
          
          // Copy URL to clipboard
          try {
            await navigator.clipboard.writeText(pasteUrl);
            toast.success("Paste created successfully! URL copied to clipboard.");
          } catch {
            toast.success("Paste created successfully!");
          }
          
          onOpenChange(false);
          form.reset();
          
          // Don't redirect - let the table update instead
          // router.push(`/p/${result.paste.slug}`);
        } else {
          toast.error(result.error || "Failed to create paste");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Paste creation error:", error);
      }
    });
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case PASTE_VISIBILITY.PUBLIC:
        return <Globe className="h-3 w-3" />;
      case PASTE_VISIBILITY.UNLISTED:
        return <EyeOff className="h-3 w-3" />;
      case PASTE_VISIBILITY.PRIVATE:
        return <Lock className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full max-h-[85vh] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0 gap-0">
        <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b space-y-2">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Code className="h-4 w-4" />
            <span>{editingPaste ? "Edit Paste" : "Create Paste"}</span>
          </DialogTitle>
          {(!isAuthenticated || watchedBurnAfterRead) && (
            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <Globe className="h-2.5 w-2.5 mr-1" />
                  Guest Mode
                </Badge>
              )}
              {watchedBurnAfterRead && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  Burn After Read
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(85vh-120px)]">
          <div className="px-3 sm:px-4 py-3 space-y-4">
            {!isAuthenticated && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <Link href="/register" className="font-medium underline">
                    Sign up
                  </Link>{" "}
                  for higher limits and private pastes.
                </p>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Basic Information Section */}
                <div className="space-y-4">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Title (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Give your paste a descriptive title..."
                            className="h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description and Tags Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Description (optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of your paste..."
                              className="h-20 resize-none"
                              maxLength={500}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tags */}
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Tags (optional)
                          </FormLabel>
                          <FormControl>
                            <TagsInput
                              value={field.value || []}
                              onChange={field.onChange}
                              placeholder="Add tags to organize..."
                              maxTags={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Content */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Content
                          </FormLabel>
                          <CharacterCounter
                            current={watchedContent.length}
                            limit={charLimit}
                          />
                        </div>
                        <FormControl>
                          <ScrollArea className="h-52 border rounded-md">
                            <Textarea
                              placeholder="Paste your content here..."
                              className="min-h-[200px] border-0 resize-none focus-visible:ring-0 font-mono text-sm leading-relaxed"
                              {...field}
                            />
                          </ScrollArea>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Settings Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Language */}
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm flex items-center gap-1.5">
                              <Code className="h-3 w-3" />
                              Language
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                  <SelectItem key={lang} value={lang}>
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Visibility */}
                      <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm flex items-center gap-1.5">
                              <Eye className="h-3 w-3" />
                              Visibility
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={PASTE_VISIBILITY.PUBLIC}>
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3" />
                                    <span>Public</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value={PASTE_VISIBILITY.UNLISTED}>
                                  <div className="flex items-center gap-2">
                                    <EyeOff className="h-3 w-3" />
                                    <span>Unlisted</span>
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  value={PASTE_VISIBILITY.PRIVATE}
                                  disabled={!isAuthenticated}
                                >
                                  <div className="flex items-center gap-2">
                                    <Lock className="h-3 w-3" />
                                    <span>Private {!isAuthenticated && "⭐"}</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Expires */}
                      <FormField
                        control={form.control}
                        name="expiresIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              Expires
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="30m">30 minutes</SelectItem>
                                <SelectItem value="1h" disabled={!isAuthenticated}>
                                  1 hour {!isAuthenticated && "⭐"}
                                </SelectItem>
                                <SelectItem value="1d" disabled={!isAuthenticated}>
                                  1 day {!isAuthenticated && "⭐"}
                                </SelectItem>
                                <SelectItem value="7d" disabled={!isAuthenticated}>
                                  7 days {!isAuthenticated && "⭐"}
                                </SelectItem>
                                <SelectItem
                                  value="never"
                                  disabled={!isAuthenticated}
                                >
                                  Never {!isAuthenticated && "⭐"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Advanced Options */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Advanced Options</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Password Protection */}
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm flex items-center gap-1.5">
                                <Lock className="h-3 w-3" />
                                Password (optional)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Protect with password..."
                                    className="h-9 pr-8"
                                    {...field}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOffIcon className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Custom URL - Only for authenticated users */}
                        {isAuthenticated && (
                          <FormField
                            control={form.control}
                            name="customUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm flex items-center gap-1.5">
                                  <Type className="h-3 w-3" />
                                  Custom URL (optional)
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                      /p/
                                    </span>
                                    <Input
                                      placeholder="my-custom-url"
                                      className={`h-9 pl-8 pr-8 ${
                                        field.value && urlAvailability.available === false
                                          ? "border-destructive focus-visible:ring-destructive"
                                          : field.value && urlAvailability.available === true
                                          ? "border-green-500 focus-visible:ring-green-500"
                                          : ""
                                      }`}
                                      {...field}
                                    />
                                    {field.value && (
                                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        {urlAvailability.isChecking ? (
                                          <Loader className="h-3 w-3 animate-spin text-muted-foreground" />
                                        ) : urlAvailability.available === true ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : urlAvailability.available === false ? (
                                          <div className="h-3 w-3 rounded-full bg-destructive" />
                                        ) : null}
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                {field.value && urlAvailability.available === false && (
                                  <p className="text-xs text-destructive">
                                    {urlAvailability.error || "This URL is already taken"}
                                  </p>
                                )}
                                {field.value && urlAvailability.available === true && (
                                  <p className="text-xs text-green-600">
                                    URL is available
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Burn After Read - Enhanced */}
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="burnAfterRead"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm flex items-center gap-1.5">
                                  <Zap className="h-3 w-3" />
                                  Burn After Read
                                </FormLabel>
                                <div className="text-xs text-muted-foreground">
                                  Delete after specified views
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />

                        {watchedBurnAfterRead && (
                          <FormField
                            control={form.control}
                            name="burnAfterReadViews"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">
                                  Delete after how many views?
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="1"
                                    className="h-9"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </form>
            </Form>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="px-3 sm:px-4 py-3 border-t bg-background">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {getVisibilityIcon(watchedVisibility)}
              <span className="capitalize">{watchedVisibility}</span>
              {(form.watch("password") || "").length > 0 && (
                <>
                  <span>•</span>
                  <Lock className="h-2.5 w-2.5" />
                  <span>Protected</span>
                </>
              )}
              {watchedBurnAfterRead && (
                <>
                  <span>•</span>
                  <Zap className="h-2.5 w-2.5" />
                  <span>Burn</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-8 flex-1 sm:flex-none text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={
                  isPending ||
                  watchedContent.length === 0 ||
                  watchedContent.length > charLimit
                }
                className="h-8 flex-1 sm:flex-none text-sm"
              >
                {isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader className="h-3 w-3 animate-spin" />
                    <span>{editingPaste ? "Updating..." : "Creating..."}</span>
                  </div>
                ) : (
                  <span>{editingPaste ? "Update Paste" : "Create Paste"}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}