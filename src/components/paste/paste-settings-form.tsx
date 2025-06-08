"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Globe,
  EyeOff,
  Clock,
  Settings,
  Eye,
  Shield,
  AlertTriangle,
  Save,
} from "lucide-react";
import { toast } from "sonner";

const pasteSettingsSchema = z.object({
  visibility: z.enum(["public", "unlisted", "private"]),
  password: z.string().optional(),
  expiresIn: z.enum(["1h", "1d", "7d", "30d", "never", "remove"]),
});

type PasteSettingsInput = z.infer<typeof pasteSettingsSchema>;

interface PasteSettingsFormProps {
  paste: {
    id: string;
    slug: string;
    title?: string;
    visibility: string;
    expiresAt?: Date;
    hasPassword: boolean;
    burnAfterRead: boolean;
    userId?: string;
  };
  currentUser?: {
    id: string;
  };
  children: React.ReactNode;
}

// Mock update function - you'll need to implement this server action
async function updatePasteSettings(pasteId: string, settings: PasteSettingsInput) {
  // This should be implemented as a server action
  console.log("Updating paste settings:", pasteId, settings);
  return { success: true };
}

export function PasteSettingsForm({ paste, currentUser, children }: PasteSettingsFormProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [removePassword, setRemovePassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Check if user is the owner
  const isOwner = currentUser && paste.userId === currentUser.id;

  const form = useForm<PasteSettingsInput>({
    resolver: zodResolver(pasteSettingsSchema),
    defaultValues: {
      visibility: paste.visibility as "public" | "unlisted" | "private",
      password: "",
      expiresIn: paste.expiresAt ? "never" : "never", // Simplified for demo
    },
  });

  if (!isOwner) {
    return null; // Don't render for non-owners
  }

  function onSubmit(data: PasteSettingsInput) {
    startTransition(async () => {
      try {
        const result = await updatePasteSettings(paste.id, data);
        
        if (result.success) {
          toast.success("Settings updated successfully!");
          setOpen(false);
          // You might want to refresh the page or update the UI here
        } else {
          toast.error("Failed to update settings");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Settings update error:", error);
      }
    });
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "unlisted":
        return <EyeOff className="h-4 w-4" />;
      case "private":
        return <Lock className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "Public";
      case "unlisted":
        return "Unlisted";
      case "private":
        return "Private";
      default:
        return visibility;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paste Settings
          </DialogTitle>
          <DialogDescription>
            Update the settings for &quot;{paste.title || `Paste ${paste.slug}`}&quot;
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Current Status</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getVisibilityIcon(paste.visibility)}
                  {getVisibilityLabel(paste.visibility)}
                </Badge>
                
                {paste.hasPassword && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Password Protected
                  </Badge>
                )}
                
                {paste.burnAfterRead && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Burn After Read
                  </Badge>
                )}
                
                {paste.expiresAt && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expires {new Date(paste.expiresAt) > new Date() ? "in future" : "expired"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Visibility Settings */}
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
                      <SelectItem value="public">
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
                      <SelectItem value="unlisted">
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
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <div>
                            <div>Private</div>
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

            {/* Password Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Password Protection</FormLabel>
                {paste.hasPassword && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={removePassword}
                      onCheckedChange={setRemovePassword}
                    />
                    <span className="text-sm text-muted-foreground">Remove password</span>
                  </div>
                )}
              </div>
              
              {(!paste.hasPassword || removePassword) && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={removePassword ? "Leave empty to remove password" : "Set a new password..."}
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
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {paste.hasPassword && !removePassword ? 
                          "Current password will remain unchanged if left empty" :
                          "Enter a password to protect this paste"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {paste.hasPassword && !removePassword && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <Shield className="h-4 w-4 inline mr-2" />
                  This paste is currently password protected. Leave the password field empty to keep the current password.
                </div>
              )}
            </div>

            {/* Expiry Settings */}
            <FormField
              control={form.control}
              name="expiresIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expiry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paste.expiresAt && (
                        <SelectItem value="remove">Remove expiry</SelectItem>
                      )}
                      <SelectItem value="1h">1 hour from now</SelectItem>
                      <SelectItem value="1d">1 day from now</SelectItem>
                      <SelectItem value="7d">7 days from now</SelectItem>
                      <SelectItem value="30d">30 days from now</SelectItem>
                      <SelectItem value="never">Never expire</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {paste.expiresAt ? 
                      `Currently expires: ${new Date(paste.expiresAt).toLocaleString()}` :
                      "This paste does not currently expire"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Warning for Burn After Read */}
            {paste.burnAfterRead && (
              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Burn After Read Enabled</p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      This paste will be automatically deleted after viewing. This setting cannot be changed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}