"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CharacterCounter } from "./character-counter";
import { useAuth } from "@/hooks/use-auth";
import { createPaste, checkUrlAvailability } from "@/app/actions/paste";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { createPasteSchema, type CreatePasteInput } from "@/types/paste";
import {
  CHAR_LIMIT_ANONYMOUS,
  CHAR_LIMIT_AUTHENTICATED,
  SUPPORTED_LANGUAGES,
  PASTE_VISIBILITY,
} from "@/lib/constants";
import { toast } from "sonner";
import { 
  Lock, 
  Globe, 
  EyeOff, 
  Clock, 
  Zap,
  Eye,
  EyeOff as EyeOffIcon,
  Check,
  X,
  Loader2,
  Link as LinkIcon,
  AlertTriangle
} from "lucide-react";

interface PasteFormProps {
  className?: string;
}

// Simple debounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function PasteForm({ className }: PasteFormProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [urlCheckStatus, setUrlCheckStatus] = useState<"idle" | "checking" | "available" | "taken" | "error">("idle");
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const [burnAfterReadViews, setBurnAfterReadViews] = useState<number | "custom">(1);
  const [customBurnViews, setCustomBurnViews] = useState(1);
  
  const debouncedCustomUrl = useDebounce(customUrl, 500);

  const charLimit = isAuthenticated ? CHAR_LIMIT_AUTHENTICATED : CHAR_LIMIT_ANONYMOUS;
  
  const form = useForm<CreatePasteInput>({
    resolver: zodResolver(createPasteSchema),
    defaultValues: {
      title: "",
      content: "",
      language: "plain",
      visibility: PASTE_VISIBILITY.PUBLIC,
      password: "",
      burnAfterRead: false,
      burnAfterReadViews: 1,
      customUrl: "",
      expiresIn: isAuthenticated ? "never" : "30m",
    },
  });

  const watchedContent = form.watch("content");
  const watchedVisibility = form.watch("visibility");
  const watchedBurnAfterRead = form.watch("burnAfterRead");
  const watchedExpiresIn = form.watch("expiresIn");
  
  // URL availability checking
  useEffect(() => {
    if (showCustomUrl && debouncedCustomUrl.trim().length >= 3) {
      setUrlCheckStatus("checking");
      checkUrlAvailability({ url: debouncedCustomUrl.trim() })
        .then((result) => {
          setUrlCheckStatus(result.available ? "available" : "taken");
        })
        .catch(() => {
          setUrlCheckStatus("error");
        });
    } else {
      setUrlCheckStatus("idle");
    }
  }, [debouncedCustomUrl, showCustomUrl]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Enter',
      metaKey: true,
      callback: (e) => {
        e.preventDefault();
        if (!isPending && watchedContent.length > 0 && watchedContent.length <= charLimit && !(showCustomUrl && customUrl.trim() && urlCheckStatus === "taken")) {
          form.handleSubmit(onSubmit)();
        }
      },
      description: 'Submit paste form',
    },
    {
      key: 'Enter',
      ctrlKey: true,
      callback: (e) => {
        e.preventDefault();
        if (!isPending && watchedContent.length > 0 && watchedContent.length <= charLimit && !(showCustomUrl && customUrl.trim() && urlCheckStatus === "taken")) {
          form.handleSubmit(onSubmit)();
        }
      },
      description: 'Submit paste form',
    },
  ]);

  function onSubmit(data: CreatePasteInput) {
    startTransition(async () => {
      try {
        // Prepare data with custom URL and burn after read views
        const submitData = {
          ...data,
          customUrl: showCustomUrl && customUrl.trim().length >= 3 ? customUrl.trim() : undefined,
          burnAfterReadViews: data.burnAfterRead ? (burnAfterReadViews === "custom" ? customBurnViews : burnAfterReadViews as number) : undefined,
        };
        
        const result = await createPaste(submitData);
        
        if (result.success && result.paste) {
          toast.success("Paste created successfully!");
          router.push(`/${result.paste.slug}`);
        } else {
          toast.error(result.error || "Failed to create paste");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Paste creation error:", error);
      }
    });
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case PASTE_VISIBILITY.PUBLIC:
        return <Globe className="h-4 w-4" />;
      case PASTE_VISIBILITY.UNLISTED:
        return <EyeOff className="h-4 w-4" />;
      case PASTE_VISIBILITY.PRIVATE:
        return <Lock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getExpiryLabel = (expiresIn: string) => {
    switch (expiresIn) {
      case "30m": return "30 minutes";
      case "1h": return "1 hour";
      case "1d": return "1 day";
      case "7d": return "7 days";
      case "30d": return "30 days";
      case "never": return "Never";
      default: return expiresIn;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with auth status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Paste</h2>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Badge variant="secondary" className="text-xs">
                Anonymous
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {getExpiryLabel(watchedExpiresIn)}
            </Badge>
            {watchedBurnAfterRead && (
              <Badge variant="destructive" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Burn after read
              </Badge>
            )}
          </div>
        </div>
        
        {!isAuthenticated && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <Link href="/register" className="font-medium underline">
                Sign up
              </Link>{" "}
              for higher limits, private pastes, and longer expiry times.
            </p>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title (optional) */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Give your paste a title..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Content</FormLabel>
                  <CharacterCounter
                    current={watchedContent.length}
                    limit={charLimit}
                  />
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Paste your content here..."
                    className="min-h-[300px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Language and Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
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

            {/* Expiry */}
            <FormField
              control={form.control}
              name="expiresIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires In</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expiry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="30m">30 minutes</SelectItem>
                      <SelectItem value="1h" disabled={!isAuthenticated}>
                        1 hour {!isAuthenticated && "(Sign in)"}
                      </SelectItem>
                      <SelectItem value="1d" disabled={!isAuthenticated}>
                        1 day {!isAuthenticated && "(Sign in)"}
                      </SelectItem>
                      <SelectItem value="7d" disabled={!isAuthenticated}>
                        7 days {!isAuthenticated && "(Sign in)"}
                      </SelectItem>
                      <SelectItem value="30d" disabled={!isAuthenticated}>
                        30 days {!isAuthenticated && "(Sign in)"}
                      </SelectItem>
                      <SelectItem value="never" disabled={!isAuthenticated}>
                        Never {!isAuthenticated && "(Sign in)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Visibility and Privacy Settings */}
          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <h3 className="font-medium flex items-center gap-2">
              {getVisibilityIcon(watchedVisibility)}
              Privacy & Visibility
            </h3>

            {/* Visibility */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PASTE_VISIBILITY.PUBLIC}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <div>
                            <div>Public</div>
                            <div className="text-xs text-muted-foreground">
                              Visible to everyone
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value={PASTE_VISIBILITY.UNLISTED}>
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4" />
                          <div>
                            <div>Unlisted</div>
                            <div className="text-xs text-muted-foreground">
                              Only accessible via link
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value={PASTE_VISIBILITY.PRIVATE} 
                        disabled={!isAuthenticated}
                      >
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <div>
                            <div>Private {!isAuthenticated && "(Sign in required)"}</div>
                            <div className="text-xs text-muted-foreground">
                              Only you can access
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Protection */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Protection (optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Set a password to protect this paste..."
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom URL */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Custom URL (optional)
                </Label>
                <Switch
                  checked={showCustomUrl}
                  onCheckedChange={(checked) => {
                    setShowCustomUrl(checked);
                    if (!checked) {
                      setCustomUrl("");
                      setUrlCheckStatus("idle");
                      form.setValue("customUrl", "");
                    }
                  }}
                />
              </div>
              
              {showCustomUrl && (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="my-custom-url (3-50 characters)"
                      value={customUrl}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9-_]/g, '');
                        setCustomUrl(value);
                        form.setValue("customUrl", value);
                      }}
                      className={`pr-10 ${
                        customUrl.length > 0 && customUrl.length < 3 ? "border-yellow-500" :
                        urlCheckStatus === "available" ? "border-green-500" :
                        urlCheckStatus === "taken" ? "border-red-500" : ""
                      }`}
                      maxLength={50}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {urlCheckStatus === "checking" && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {urlCheckStatus === "available" && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                      {urlCheckStatus === "taken" && (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Your paste will be available at: {typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com'}/{customUrl || "your-url"}
                  </div>
                  {customUrl.length > 0 && customUrl.length < 3 && (
                    <div className="text-xs text-yellow-600">
                      URL must be at least 3 characters long
                    </div>
                  )}
                  {urlCheckStatus === "taken" && (
                    <div className="text-xs text-red-600">
                      This URL is already taken. Try another one.
                    </div>
                  )}
                  {urlCheckStatus === "available" && customUrl.length >= 3 && (
                    <div className="text-xs text-green-600">
                      ✓ This URL is available
                    </div>
                  )}
                  {urlCheckStatus === "error" && (
                    <div className="text-xs text-red-600">
                      Error checking URL availability. Please try again.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Burn After Read */}
            <FormField
              control={form.control}
              name="burnAfterRead"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Burn After Read
                      </FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Paste will be deleted after specified views
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  
                  {field.value && (
                    <div className="mt-3 p-3 border rounded-lg bg-muted/30">
                      <Label className="text-sm font-medium">Delete after views:</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3].map((num) => (
                            <Button
                              key={num}
                              type="button"
                              variant={burnAfterReadViews === num ? "default" : "outline"}
                              size="sm"
                              onClick={() => setBurnAfterReadViews(num)}
                            >
                              {num} view{num > 1 ? 's' : ''}
                            </Button>
                          ))}
                          <Button
                            type="button"
                            variant={burnAfterReadViews === "custom" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBurnAfterReadViews("custom")}
                          >
                            Custom
                          </Button>
                        </div>
                        
                        {burnAfterReadViews === "custom" && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={customBurnViews}
                              onChange={(e) => setCustomBurnViews(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">views</span>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          This action cannot be undone. The paste will be permanently deleted.
                        </div>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || watchedContent.length === 0 || watchedContent.length > charLimit || (showCustomUrl && customUrl.trim() && urlCheckStatus === "taken")}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating Paste...
              </div>
            ) : (
              "Create Paste"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}