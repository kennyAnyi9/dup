"use client";

import { useState, useTransition } from "react";
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
import { createPaste } from "@/app/actions/paste";
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
  EyeOff as EyeOffIcon
} from "lucide-react";

interface PasteFormProps {
  className?: string;
}

export function PasteForm({ className }: PasteFormProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

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
      expiresIn: isAuthenticated ? "never" : "30m",
    },
  });

  const watchedContent = form.watch("content");
  const watchedVisibility = form.watch("visibility");
  const watchedBurnAfterRead = form.watch("burnAfterRead");
  const watchedExpiresIn = form.watch("expiresIn");

  function onSubmit(data: CreatePasteInput) {
    startTransition(async () => {
      try {
        const result = await createPaste(data);
        
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

            {/* Burn After Read */}
            <FormField
              control={form.control}
              name="burnAfterRead"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Burn After Read
                    </FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Paste will be deleted after the first view
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

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || watchedContent.length === 0 || watchedContent.length > charLimit}
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