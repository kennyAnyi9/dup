"use client";

import { AuthProvider } from "@/features/auth/components/providers/auth-provider";
import { PasteModalProvider } from "@/features/paste/components/providers/paste-modal-provider";
import { ThemeProvider } from "@/components/theme/provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <PasteModalProvider>
          {children}
        </PasteModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}