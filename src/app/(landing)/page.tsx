import { WarpBackground } from "@/components/magicui/warp-background";
import { HomeClient } from "@/features/landing/components/sections/home-client";
import { PublicPasteCardsInfinite } from "@/features/landing/components/ui/public-paste-cards-infinite";
import { Badge } from "@/shared/components/dupui/badge";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  Pattern,
} from "@/shared/components/dupui/panel";
import { PASTE_LIMITS } from "@/shared/lib/paste-limits";
import {
  BarChart3,
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

export default function Home() {

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Hero Section */}
      <Panel className="grid-section relative overflow-hidden  [.grid-section_~_&]:border-t-0">
        <WarpBackground
          perspective={300}
          beamSize={10}
          beamsPerSide={3}
          gridColor="rgba(128, 128, 128, 0.15)"
          className="min-h-[400px] sm:min-h-[500px] oveflow-hidden border-t-0"
        >
          <div className="sm:py-20">
            <div className="relative mx-auto flex w-full max-w-none sm:max-w-4xl flex-col items-center  sm:px-8 lg:px-12 text-center">
              <Badge variant="secondary" className="mb-4 animate-slide-up-fade [--offset:30px] [animation-duration:1s] [animation-fill-mode:both] motion-reduce:animate-fade-in [animation-delay:50ms]">
                <Zap className="h-3 w-3 mr-1" />
                Beta
              </Badge>
              <h1 className="text-center text-3xl font-medium leading-tight max-w-lg sm:text-4xl md:text-5xl sm:leading-[1.15] animate-slide-up-fade [--offset:20px] [animation-duration:1s] [animation-fill-mode:both] motion-reduce:animate-fade-in [animation-delay:100ms]">
                The Pastebin Reimagined
              </h1>
              <p className="mt-5 w-full max-w-none sm:max-w-lg text-pretty text-base sm:text-lg md:text-xl text-muted-foreground text-center animate-slide-up-fade [--offset:10px] [animation-delay:200ms] [animation-duration:1s] [animation-fill-mode:both] motion-reduce:animate-fade-in">
                The modern pastebin for everyone. Beautiful syntax highlighting,
                powerful privacy controls, zero complexity.
              </p>
              <div className="relative mx-auto mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up-fade [--offset:5px] [animation-delay:300ms] [animation-duration:1s] [animation-fill-mode:both] motion-reduce:animate-fade-in">
                <HomeClient />
              </div>
            </div>
          </div>
        </WarpBackground>
        <div className="pointer-events-none absolute inset-0 dark:hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="size-full bg-[linear-gradient(90deg,#F4950C,#EB5C0C)] [mask-image:linear-gradient(transparent_25%,black)]"></div>
          </div>
        </div>
      </Panel>

      {/* Core Features Section */}
      <Panel>
        <PanelHeader>
          <PanelTitle>Core Features</PanelTitle>
        </PanelHeader>
        <PanelContent className="p-0 border-b">
          <div className="grid grid-cols-1 gap-px bg-border text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-start gap-2 bg-background p-8 text-left lg:px-9 lg:py-10">
              <Zap className="size-4 shrink-0 text-primary" />
              <h3 className="font-medium">Burn after read</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Automatically delete pastes after they&apos;ve been viewed
                  once for maximum security and privacy.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 bg-background p-8 text-left lg:px-9 lg:py-10">
              <Lock className="size-4 shrink-0 text-primary" />
              <h3 className="font-medium">Password protection</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Secure your sensitive pastes with password protection to
                  control who can access your content.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 bg-background p-8 text-left lg:px-9 lg:py-10">
              <FileText className="size-4 shrink-0 text-primary" />
              <h3 className="font-medium">Syntax highlighting</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Beautiful syntax highlighting for over 100 programming
                  languages with automatic detection.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 bg-background p-8 text-left lg:px-9 lg:py-10">
              <Clock className="size-4 shrink-0 text-primary" />
              <h3 className="font-medium">Custom expiry</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Set custom expiration times for your pastes from minutes to
                  never, giving you full control.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 bg-background p-8 text-left lg:px-9 lg:py-10">
              <BarChart3 className="size-4 shrink-0 text-primary" />
              <h3 className="font-medium">Analytics</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Detailed analytics and insights to track your paste
                  performance and engagement metrics.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 bg-background p-8 text-left lg:px-9 lg:py-10">
              <Eye className="size-4 shrink-0 text-primary" />
              <h3 className="font-medium">View tracking</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Track how many times your pastes have been viewed with
                  detailed analytics and insights.
                </p>
              </div>
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
          <PublicPasteCardsInfinite />
        </PanelContent>
      </Panel>
      <Pattern />

      {/* Pricing/Features Comparison */}
      <Panel>
        <PanelHeader>
          <div className="text-center">
            <PanelTitle className="">Why Sign Up?</PanelTitle>
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
