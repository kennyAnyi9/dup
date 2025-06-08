"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PasteViewer } from "@/components/paste/paste-viewer";
import { PasswordDialog } from "@/components/paste/password-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPaste } from "@/app/actions/paste";
import { useAuth } from "@/hooks/use-auth";
import { 
  Calendar, 
  Eye, 
  Lock, 
  Globe, 
  EyeOff, 
  Clock,
  User,
  Zap,
  AlertTriangle,
  FileX,
  Shield
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import type { PasteResult } from "@/types/paste";

export default function PastePage() {
  const params = useParams();
  const { user } = useAuth();
  const slug = params.slug as string;
  
  const [paste, setPaste] = useState<PasteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadPaste();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadPaste(password?: string) {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getPaste({ slug, password });
      
      if (result.success && result.paste) {
        setPaste(result.paste);
        setShowPasswordDialog(false);
        setPasswordError(null);
      } else if (result.requiresPassword) {
        setShowPasswordDialog(true);
        setPasswordError(result.error || null);
      } else {
        setError(result.error || "Paste not found");
      }
    } catch (error) {
      console.error("Failed to load paste:", error);
      setError("Failed to load paste");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(password: string) {
    setPasswordLoading(true);
    setPasswordError(null);
    
    try {
      const result = await getPaste({ slug, password });
      
      if (result.success && result.paste) {
        setPaste(result.paste);
        setShowPasswordDialog(false);
        toast.success("Paste unlocked successfully!");
      } else {
        setPasswordError(result.error || "Invalid password");
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      setPasswordError("Failed to verify password");
    } finally {
      setPasswordLoading(false);
    }
  }

  function getVisibilityIcon(visibility: string) {
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
  }

  function getVisibilityLabel(visibility: string) {
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
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            {error.includes("not found") ? (
              <FileX className="h-16 w-16 text-muted-foreground mx-auto" />
            ) : error.includes("expired") ? (
              <Clock className="h-16 w-16 text-muted-foreground mx-auto" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
            )}
            <h1 className="text-2xl font-bold">
              {error.includes("not found") && "Paste Not Found"}
              {error.includes("expired") && "Paste Expired"}
              {!error.includes("not found") && !error.includes("expired") && "Error"}
            </h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          
          <div className="space-y-4">
            {error.includes("not found") && (
              <p className="text-sm text-muted-foreground">
                This paste may have been deleted, expired, or the URL might be incorrect.
              </p>
            )}
            {error.includes("expired") && (
              <p className="text-sm text-muted-foreground">
                This paste has reached its expiry time and is no longer available.
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link href="/">Create New Paste</Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Password dialog
  if (showPasswordDialog) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <Shield className="h-16 w-16 text-primary mx-auto" />
              <h1 className="text-2xl font-bold">Password Protected</h1>
              <p className="text-muted-foreground">
                This paste is protected with a password. Enter the correct password to view its contents.
              </p>
            </div>
          </div>
        </div>
        
        <PasswordDialog
          open={showPasswordDialog}
          onSubmit={handlePasswordSubmit}
          error={passwordError || undefined}
          isLoading={passwordLoading}
        />
      </>
    );
  }

  // Main paste view
  if (!paste) {
    return null;
  }

  const isOwner = user && paste.userId === user.id;
  const createdDate = new Date(paste.createdAt);
  const expiryDate = paste.expiresAt ? new Date(paste.expiresAt) : null;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  {paste.title || `Paste ${paste.slug}`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(createdDate, { addSuffix: true })} • 
                  {paste.views} {paste.views === 1 ? "view" : "views"}
                </p>
              </div>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    Your paste
                  </Badge>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(createdDate, "PPP 'at' p")}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{paste.views} views</span>
              </div>

              <div className="flex items-center gap-1">
                {getVisibilityIcon(paste.visibility)}
                <span>{getVisibilityLabel(paste.visibility)}</span>
              </div>

              {expiryDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Expires {formatDistanceToNow(expiryDate, { addSuffix: true })}
                  </span>
                </div>
              )}

              {paste.burnAfterRead && (
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">
                    Burn after read
                  </span>
                </div>
              )}
            </div>

            {paste.burnAfterRead && !isOwner && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <Zap className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      This paste will be permanently deleted after you view it.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Paste Content */}
          <PasteViewer
            content={paste.content}
            language={paste.language}
            title={paste.title}
            slug={paste.slug}
          />
        </div>
      </div>
    </>
  );
}