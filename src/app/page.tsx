import { getRecentPublicPastes } from "@/app/actions/paste";
import { HomeClient } from "@/components/home/home-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Eye,
  FileText,
  Globe,
  Lock,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface RecentPaste {
  id: string;
  slug: string;
  title: string | null;
  language: string;
  views: number;
  createdAt: Date;
}

export default async function Home() {
  const recentPastes = await getRecentPublicPastes(8);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - CTA Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Section */}
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Share Code & Text Instantly
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Fast, secure, and simple pastebin service. Share your code
              snippets, configuration files, or any text with the world or keep
              them private.
            </p>
          </div>

          {/* CTA Card */}
          <HomeClient />

          {/* Features Comparison */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Why Sign Up?</h2>
              <p className="text-muted-foreground">
                Unlock powerful features with a free account
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Anonymous Features */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <h3 className="font-semibold">Anonymous User</h3>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>500 character limit</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>30 minute expiry</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Public & unlisted pastes only</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>5 pastes per minute</span>
                  </div>
                </CardContent>
              </Card>

              {/* Authenticated Features */}
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Registered User</h3>
                    <Badge>Free</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">5,000 character limit</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      Up to 30 days or never expire
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      Private pastes & password protection
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">20 pastes per minute</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      Paste management dashboard
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Shield className="h-4 w-4" />
                Create Free Account
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar - Recent Public Pastes */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Public Pastes
            </h2>

            {recentPastes.length > 0 ? (
              <div className="space-y-3">
                {recentPastes.map((paste) => (
                  <Card
                    key={paste.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/${paste.slug}`}
                            className="font-medium text-primary hover:underline truncate"
                          >
                            {paste.title || `Paste ${paste.slug}`}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {paste.language}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {formatDistanceToNow(paste.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{paste.views}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No public pastes yet. Be the first to share!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Quick Stats */}
          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Burn after read</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Password protection</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Syntax highlighting</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Custom expiry times</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Rate limiting protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
