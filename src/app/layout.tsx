import { AuthProvider } from "@/features/auth/components/providers/auth-provider";
import { ConditionalFooter } from "@/components/common/conditional-footer";
import { ConditionalHeader } from "@/components/common/conditional-header";
import { PasteModalProvider } from "@/features/paste/components/providers/paste-modal-provider";
import { ThemeProvider } from "@/components/theme/provider";
import { CommandPalette } from "@/components/ui/command-palette";
import { Toaster } from "@/components/ui/sonner";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PasteModalProvider>
              <ConditionalHeader />

              <main className="flex-1">{children}</main>
              <ConditionalFooter />
              <CommandPalette />
              <Toaster />
            </PasteModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
