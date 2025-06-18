import { AppProviders } from "@/components/common/app-providers";
import { ConditionalFooter } from "@/components/common/conditional-footer";
import { ConditionalHeader } from "@/components/common/conditional-header";
import { CommandPalette } from "@/shared/components/dupui/command-palette";
import { Toaster } from "@/shared/components/dupui/sonner";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Fast, secure, and simple pastebin service for sharing code and text snippets.",
  keywords: ["pastebin", "code sharing", "text sharing", "snippets"],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col overflow-x-hidden`}
      >
        <AppProviders>
          <ConditionalHeader />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
          <CommandPalette />
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
