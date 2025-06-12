import { getRecentPublicPastes } from "@/app/actions/paste";
import { WarpBackground } from "@/components/magicui/warp-background";
import { Badge } from "@/components/ui/badge";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  Pattern,
} from "@/components/ui/panel";
import { PASTE_LIMITS } from "@/lib/paste-limits";
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
import { HomeClient } from "./_components/home-client";

export default async function Home() {
  const recentPastesData = await getRecentPublicPastes(8);
  const recentPastes = recentPastesData.pastes;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Pattern />

      {/* Hero Section */}
      <Panel className="!border-x-0">
        <WarpBackground
          perspective={300}
          beamSize={10}
          beamsPerSide={3}
          gridColor="rgba(128, 128, 128, 0.15)"
          className="min-h-[400px]"
        >
          <PanelContent className="space-y-8 py-20">
            <div className="relative mx-auto flex rounded-md w-[500px] h-[420px] bg-background flex-col items-center justify-center text-center space-y-6 px-12">
              <div>
                <h1 className="text-center text-4xl font-medium sm:text-5xl sm:leading-[1.15] animate-slide-up-fade [--offset:20px] [animation-duration:1s] [animation-fill-mode:both] motion-reduce:animate-fade-in [animation-delay:100ms]">
                  The Pastebin Reimagined
                </h1>
                <p className="mt-5 text-pretty text-base text-muted-foreground text-center sm:text-xl animate-slide-up-fade [--offset:10px] [animation-delay:200ms] [animation-duration:1s] [animation-fill-mode:both] motion-reduce:animate-fade-in">
                  The modern pastebin for everyone. Beautiful syntax
                  highlighting, powerful privacy controls, zero complexity.
                </p>
              </div>
              <HomeClient />
            </div>
          </PanelContent>
        </WarpBackground>
      </Panel>
      <Pattern />

      {/* Key Features Section */}
      <Panel>
        <PanelHeader>
          <PanelTitle className="text-2xl text-center">
            Core Features
          </PanelTitle>
        </PanelHeader>
        <PanelContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-medium">Burn after read</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
              <Lock className="h-5 w-5 text-primary" />
              <span className="font-medium">Password protection</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">Syntax highlighting</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Custom expiry</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-medium">Rate limiting</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
              <Eye className="h-5 w-5 text-primary" />
              <span className="font-medium">View tracking</span>
            </div>
          </div>
        </PanelContent>
      </Panel>
      <Pattern />

      {/* Recent Public Pastes */}
      <Panel>
        <PanelHeader>
          <PanelTitle className="text-xl flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Recent Public Pastes
          </PanelTitle>
        </PanelHeader>
        <PanelContent>
          {recentPastes.length > 0 ? (
            <div className="grid gap-3">
              {recentPastes.map((paste) => (
                <div
                  key={paste.id}
                  className="grid grid-cols-4 gap-4 p-3 rounded-lg bg-accent hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <Link
                      href={`/${paste.slug}`}
                      className="font-medium text-primary hover:underline truncate block"
                    >
                      {paste.title || `Paste ${paste.slug}`}
                    </Link>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {paste.language}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      {paste.views}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(paste.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No public pastes yet. Be the first to share!
              </p>
            </div>
          )}
        </PanelContent>
      </Panel>
      <Pattern />

      {/* Pricing/Features Comparison */}
      <Panel>
        <PanelHeader>
          <div className="text-center">
            <PanelTitle className="text-2xl mb-2">Why Sign Up?</PanelTitle>
            <p className="text-muted-foreground">
              Unlock powerful features with a free account
            </p>
          </div>
        </PanelHeader>
        <PanelContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5" />
                <h3 className="font-semibold">Anonymous User</h3>
                <Badge variant="secondary">Free</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{PASTE_LIMITS.ANONYMOUS.CHARACTER_LIMIT}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{PASTE_LIMITS.ANONYMOUS.EXPIRY_TIME}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>Public & unlisted pastes only</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span>{PASTE_LIMITS.ANONYMOUS.RATE_LIMIT}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-primary/50 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Registered User</h3>
                <Badge>Free</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {PASTE_LIMITS.AUTHENTICATED.CHARACTER_LIMIT}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {PASTE_LIMITS.AUTHENTICATED.EXPIRY_TIME}
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
                  <span className="font-medium">
                    {PASTE_LIMITS.AUTHENTICATED.RATE_LIMIT}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    Paste management dashboard
                  </span>
                </div>
              </div>
            </div>
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
        </PanelContent>
      </Panel>
      <Pattern />
    </div>
  );
}
