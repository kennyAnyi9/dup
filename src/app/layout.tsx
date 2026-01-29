import { AppProviders } from "@/shared/components/common/app-providers";
import { ConditionalFooter } from "@/shared/components/common/conditional-footer";
import { ConditionalHeader } from "@/shared/components/common/conditional-header";
import { Toaster } from "@/shared/components/dupui/sonner";
import { APP_NAME } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";
import type { Metadata } from "next";
import LocalFont from "next/font/local";
import "./globals.css";

const commitMono = LocalFont({
  src: [
    {
      path: "../../public/fonts/CommitMono-400-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CommitMono-700-Regular.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/CommitMono-700-Italic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-commit-mono",
});

const calSans = LocalFont({
  src: [
    {
      path: "../../public/fonts/CalSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-calsans",
});

const inter = LocalFont({
  src: [
    {
      path: "../../public/fonts/Inter-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

const robotoMono = LocalFont({
  src: [
    {
      path: "../../public/fonts/RobotoMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/RobotoMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/RobotoMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-roboto-mono",
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
          commitMono.variable,
          calSans.variable,
          inter.variable,
          robotoMono.variable,
          "font-roboto-mono antialiased min-h-screen flex flex-col overflow-x-hidden"
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
