import { AppProviders } from "@/shared/components/common/app-providers";
import { ConditionalFooter } from "@/shared/components/common/conditional-footer";
import { ConditionalHeader } from "@/shared/components/common/conditional-header";
import { Toaster } from "@/shared/components/dupui/sonner";
import { APP_NAME } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
        className={cn(
          inter.className,
          " antialiased min-h-screen flex flex-col overflow-x-hidden"
        )}
      >
        <AppProviders>
          <ConditionalHeader />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />

          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
