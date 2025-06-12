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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  CHAR_LIMIT_ANONYMOUS,
  CHAR_LIMIT_AUTHENTICATED,
  PASTE_VISIBILITY,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
import { createPasteSchema, type CreatePasteInput } from "@/types/paste";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Code,
  Eye,
  EyeOff,
  EyeOff as EyeOffIcon,
  Globe,
  Loader2,
  Lock,
  Send,
  Type,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CharacterCounter } from "./character-counter";

interface PasteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
}

export function PasteFormModal({
  open,
  onOpenChange,
  initialContent = "",
}: PasteFormModalProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const charLimit = isAuthenticated
    ? CHAR_LIMIT_AUTHENTICATED
    : CHAR_LIMIT_ANONYMOUS;

  const form = useForm({
    resolver: zodResolver(createPasteSchema),
    defaultValues: {
      title: "",
      content: initialContent,
      language: "plain",
      visibility: PASTE_VISIBILITY.PUBLIC,
      password: "",
      burnAfterRead: false,
      expiresIn: isAuthenticated ? "never" : "30m",
    },
  });

  const watchedContent = form.watch("content") || "";
  const watchedVisibility = form.watch("visibility") || PASTE_VISIBILITY.PUBLIC;
  const watchedBurnAfterRead = form.watch("burnAfterRead") || false;

  const onSubmit = (data: CreatePasteInput) => {
    startTransition(async () => {
      try {
        const result = await createPaste(data);

        if (result.success && result.paste) {
          toast.success("Paste created successfully!");
          onOpenChange(false);
          form.reset();
          router.push(`/p/${result.paste.slug}`);
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
      <DialogContent className="max-w-[90vw] w-full max-h-[85vh] sm:max-w-2xl lg:max-w-3xl p-0 gap-0">
        <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b">
          <DialogTitle className="flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>Create Paste</span>
            </div>
            <div className="flex items-center gap-1">
              {!isAuthenticated && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  <Globe className="h-2.5 w-2.5 mr-1" />
                  Guest
                </Badge>
              )}
              {watchedBurnAfterRead && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  Burn
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(85vh-120px)]">
          <div className="px-3 sm:px-4 py-3 space-y-3 sm:space-y-4">
            {!isAuthenticated && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-2.5">
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
                className="space-y-3 sm:space-y-4"
              >
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs flex items-center gap-1.5">
                        <Type className="h-3 w-3" />
                        Title (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Untitled paste"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content with Character Counter */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs flex items-center gap-1.5">
                          <Code className="h-3 w-3" />
                          Content
                        </FormLabel>
                        <CharacterCounter
                          current={watchedContent.length}
                          limit={charLimit}
                        />
                      </div>
                      <FormControl>
                        <ScrollArea className="h-48 sm:h-56 border rounded-md">
                          <Textarea
                            placeholder="Paste your content here..."
                            className="min-h-[180px] sm:min-h-[200px] border-0 resize-none focus-visible:ring-0 font-mono text-sm leading-relaxed"
                            {...field}
                          />
                        </ScrollArea>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Settings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs flex items-center gap-1.5">
                          <Code className="h-3 w-3" />
                          Language
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
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

                  <FormField
                    control={form.control}
                    name="expiresIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          Expires
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
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

                  {/* Visibility */}
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2 lg:col-span-1">
                        <FormLabel className="text-xs flex items-center gap-1.5">
                          <Eye className="h-3 w-3" />
                          Visibility
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-sm">
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
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password Protection */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs flex items-center gap-1.5">
                          <Lock className="h-3 w-3" />
                          Password (optional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Protect with password..."
                              className="h-8 pr-8 text-sm"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-8 w-8 hover:bg-transparent"
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

                  {/* Burn After Read - Compact Toggle */}
                  <FormField
                    control={form.control}
                    name="burnAfterRead"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-xs flex items-center gap-1.5">
                            <Zap className="h-3 w-3" />
                            Burn After Read
                          </FormLabel>
                          <div className="text-xs text-muted-foreground">
                            Delete after first view
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
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
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Send className="h-3 w-3" />
                    <span>Create Paste</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
