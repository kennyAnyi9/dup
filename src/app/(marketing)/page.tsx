"use client";
import { HomeClient } from "@/features/landing/components/sections/home-client";
import { PublicPasteCardsInfinite } from "@/features/landing/components/ui/public-paste-cards-infinite";
import { Button } from "@/shared/components/dupui/button";
import Image from "next/image";
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
  MessageSquare,
  QrCode,
  Search,
  Tags,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Glow } from "./_components/glow";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-0">
      {/* Hero Section */}
      <Glow>
        <Panel className="grid-section relative overflow-hidden border-none [.grid-section_~_&]:border-t-0">
          <div className="sm:py-20">
            <div className="relative mx-auto flex w-full max-w-4xl flex-col">
              <Link
                className="w-fit mb-5 relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm font-medium tracking-tigh"
                data-umami-event="View GitHub Repository"
                href="https://github.com/kennyAnyi9/dup"
                rel="noreferrer"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  className="size-3 sm:size-3.5"
                  fill="currentColor"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                </svg>
                <span className="font-commit-mono hidden sm:inline">
                  kennyAnyi9/dup
                </span>
              </Link>
              <h1 className="text-3xl tracking-tight font-roboto-mono">
                The last pastebin you&apos;ll ever need.
              </h1>
              <p className="font-roboto-mono mt-5 w-full pr-5 text-pretty tracking-tight text-base sm:text-lg md:text-xl text-muted-foreground text-left animate-slide-up-fade [--offset:10px] [animation-delay:200ms] [animation-duration:1s] [animation-fill-mode:both] motion-reduce:animate-fade-in">
                Create and edit pastes in seconds, lock them with encryption,
                control access and views, gain clear insights, and share using
                custom links or QR codes.
              </p>
              <div className="relative mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-up-fade [--offset:5px] [animation-delay:300ms] [animation-duration:1s] [animation-fill-mode:both] motion-reduce:animate-fade-in">
                <HomeClient />
              </div>
            </div>
          </div>
        </Panel>
      </Glow>

      {/* Dashboard image showcase */}

      <div className="relative w-full">
        <Image
          src={"/dashboard-dark.png"}
          width={1920}
          height={1080}
          alt="dashboard image"
          className="hidden dark:block w-full h-auto"
        />
        <Image
          src={"/dashboard-light.png"}
          width={1920}
          height={1080}
          alt="dashboard image"
          className="dark:hidden w-full h-auto"
        />
      </div>

      {/* Core Features Section */}
      <Panel className="overflow-hidden">
        <PanelHeader className="text-left">
          <PanelTitle>Features Like Never Before</PanelTitle>
        </PanelHeader>
        <PanelContent className="p-0">
          <div className="grid grid-cols-1 gap-px bg-border text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <Zap className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Burn after read</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Automatically delete pastes after they&apos;ve been viewed
                  once for maximum security and privacy.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <Lock className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Password protection</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Secure your sensitive pastes with password protection to
                  control who can access your content.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10 lg:-mr-px">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <FileText className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Syntax highlighting</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Beautiful syntax highlighting for over 100 programming
                  languages with automatic detection.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <Clock className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Custom expiry</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Set custom expiration times for your pastes from minutes to
                  never, giving you full control.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <BarChart3 className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Analytics</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Detailed analytics and insights to track your paste
                  performance and engagement metrics.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10 lg:-mr-px">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <Eye className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">View tracking</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Track how many times your pastes have been viewed with
                  detailed analytics and insights.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <QrCode className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">QR Code Sharing</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Generate and customize QR codes for easy sharing of your
                  pastes.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <Tags className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Tagging</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Organize your pastes with tags for easy categorization and
                  retrieval.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10 lg:-mr-px">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <MessageSquare className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Commenting</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Enable comments on your pastes to receive feedback and
                  collaborate.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <Search className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Full-Text Search</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Quickly find the pastes you need with powerful full-text
                  search.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <Users className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">User Accounts</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  Create an account to manage your pastes and unlock more
                  features.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 bg-background p-8 text-left lg:px-9 lg:py-10 lg:-mr-px">
              <div className="flex items-center justify-center size-9 rounded-xl border border-teal-400/30 bg-teal-400/10">
                <Globe className="size-4 shrink-0 text-teal-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium">Paste Management</h3>
              <div className="max-w-xs text-pretty text-muted-foreground sm:max-w-none">
                <p>
                  A dedicated dashboard to view, edit, and delete your pastes.
                </p>
              </div>
            </div>
          </div>
        </PanelContent>
      </Panel>
      <Pattern />

      {/* Recent Public Pastes */}
      <Panel>
        <PanelHeader className="text-left">
          <PanelTitle>
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
        <PanelHeader className="text-left">
          <div className="flex items-center justify-between">
            <PanelTitle>Unlock powerful features now</PanelTitle>
            <Link href="/register">
              <Button className="gap-2">
                Get Started
              </Button>
            </Link>
          </div>
        </PanelHeader>
          <PanelContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border text-sm">
              <div className="bg-background p-8 lg:px-9 lg:py-10">
                <h3 className="font-medium text-base mb-1">Anonymous User</h3>
                <p className="text-muted-foreground text-xs mb-5">No account required</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-muted-foreground/20 bg-muted-foreground/5">
                      <FileText className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <span className="text-muted-foreground">{PASTE_LIMITS.ANONYMOUS.CHARACTER_LIMIT}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-muted-foreground/20 bg-muted-foreground/5">
                      <Clock className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <span className="text-muted-foreground">{PASTE_LIMITS.ANONYMOUS.EXPIRY_TIME}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-muted-foreground/20 bg-muted-foreground/5">
                      <Globe className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <span className="text-muted-foreground">Public & unlisted pastes only</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-muted-foreground/20 bg-muted-foreground/5">
                      <Zap className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <span className="text-muted-foreground">{PASTE_LIMITS.ANONYMOUS.RATE_LIMIT}</span>
                  </div>
                </div>
              </div>

              <div className="bg-background p-8 lg:px-9 lg:py-10">
                <h3 className="font-medium text-base mb-1">Registered User</h3>
                <p className="text-teal-400 text-xs mb-5">Free forever</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-teal-400/30 bg-teal-400/10">
                      <FileText className="size-3.5 text-teal-400" strokeWidth={1.5} />
                    </div>
                    <span>{PASTE_LIMITS.AUTHENTICATED.CHARACTER_LIMIT}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-teal-400/30 bg-teal-400/10">
                      <Clock className="size-3.5 text-teal-400" strokeWidth={1.5} />
                    </div>
                    <span>{PASTE_LIMITS.AUTHENTICATED.EXPIRY_TIME}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-teal-400/30 bg-teal-400/10">
                      <Lock className="size-3.5 text-teal-400" strokeWidth={1.5} />
                    </div>
                    <span>Private pastes & password protection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-teal-400/30 bg-teal-400/10">
                      <Zap className="size-3.5 text-teal-400" strokeWidth={1.5} />
                    </div>
                    <span>{PASTE_LIMITS.AUTHENTICATED.RATE_LIMIT}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-xl border border-teal-400/30 bg-teal-400/10">
                      <FileText className="size-3.5 text-teal-400" strokeWidth={1.5} />
                    </div>
                    <span>Paste management dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </PanelContent>
      </Panel>
      <Pattern />
    </div>
  );
}
