"use client";

import { Button } from "@/shared/components/dupui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/dupui/form";
import { Input } from "@/shared/components/dupui/input";
import { ScrollArea } from "@/shared/components/dupui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/dupui/select";
import { Checkbox } from "@/shared/components/dupui/checkbox";
import { Textarea } from "@/shared/components/dupui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/dupui/card";
import { Separator } from "@/shared/components/dupui/separator";
import {
  PASTE_VISIBILITY,
  SUPPORTED_LANGUAGES,
} from "@/lib/constants";
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
import { CharacterCounter } from "../ui/character-counter";
import { TagsInput } from "../ui/tags-input";
import { usePasteForm } from "./hooks/use-paste-form";

interface PasteFormContentProps {
  form: ReturnType<typeof usePasteForm>["form"];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  urlAvailability: ReturnType<typeof usePasteForm>["urlAvailability"];
  charLimit: number | null;
  isEditing: boolean;
  isAuthenticated: boolean;
  watchedContent: string;
  watchedBurnAfterRead: boolean;
  isMobile?: boolean;
}

export function PasteFormContent({
  form,
  showPassword,
  setShowPassword,
  urlAvailability,
  charLimit,
  isEditing,
  isAuthenticated,
  watchedContent,
  watchedBurnAfterRead,
  isMobile = false,
}: PasteFormContentProps) {

  const contentAreaHeight = isMobile ? "h-32" : "h-52";
  const textareaMinHeight = isMobile ? "min-h-[120px]" : "min-h-[200px]";

  return (
    <>
      {/* Auth Notice */}
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mx-4 mt-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <Link href="/register" className="font-medium underline">
              Sign up
            </Link>{" "}
            for higher limits and private pastes.
          </p>
        </div>
      )}

      <Form {...form}>
        <div className="space-y-4 p-4">
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
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-4`}>
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
                    <ScrollArea className={`${contentAreaHeight} border rounded-md`}>
                      <Textarea
                        placeholder="Paste your content here..."
                        className={`${textareaMinHeight} border-0 resize-none focus-visible:ring-0 font-mono text-sm leading-relaxed`}
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
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'sm:grid-cols-3 gap-4'}`}>
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
                
                <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'sm:grid-cols-2 gap-4'}`}>
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

                  {/* Custom URL - Only for authenticated users when creating */}
                  {isAuthenticated && !isEditing && (
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
        </div>
      </Form>
    </>
  );
}