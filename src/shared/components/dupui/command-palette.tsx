"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/dupui/command";
import { useKeyboardShortcuts, getModifierKey } from "@/hooks/use-keyboard-shortcuts";
import {
  Plus,
  Search,
  Home,
  User,
  Settings,
  FileText,
  BarChart3,
  LogIn,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
  group?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setTheme } = useTheme();

  useKeyboardShortcuts([
    {
      key: 'k',
      metaKey: true,
      callback: () => setOpen(true),
      description: 'Open command palette',
    },
    {
      key: 'k',
      ctrlKey: true,
      callback: () => setOpen(true),
      description: 'Open command palette',
    },
    {
      key: 'Escape',
      callback: () => setOpen(false),
      description: 'Close command palette',
    },
  ]);

  const commands: Command[] = [
    // Navigation
    {
      id: 'home',
      label: 'Go to Home',
      description: 'Return to the main page',
      icon: <Home className="h-4 w-4" />,
      action: () => router.push('/'),
      keywords: ['home', 'main', 'index'],
      group: 'Navigation',
    },
    {
      id: 'new-paste',
      label: 'Create New Paste',
      description: 'Create a new code snippet',
      icon: <Plus className="h-4 w-4" />,
      action: () => router.push('/'),
      keywords: ['new', 'create', 'paste', 'snippet'],
      group: 'Actions',
    },
    
    // Authenticated user commands
    ...(isAuthenticated ? [
      {
        id: 'dashboard',
        label: 'My Pastes',
        description: 'View your paste dashboard',
        icon: <FileText className="h-4 w-4" />,
        action: () => router.push('/dashboard'),
        keywords: ['dashboard', 'pastes', 'my'],
        group: 'Navigation',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        description: 'View paste analytics',
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => router.push('/dashboard/analytics'),
        keywords: ['analytics', 'stats', 'views'],
        group: 'Navigation',
      },
      {
        id: 'settings',
        label: 'Settings',
        description: 'Account settings',
        icon: <Settings className="h-4 w-4" />,
        action: () => router.push('/dashboard/settings'),
        keywords: ['settings', 'account', 'profile'],
        group: 'Navigation',
      },
    ] : [
      {
        id: 'login',
        label: 'Sign In',
        description: 'Sign in to your account',
        icon: <LogIn className="h-4 w-4" />,
        action: () => router.push('/login'),
        keywords: ['login', 'signin', 'auth'],
        group: 'Authentication',
      },
      {
        id: 'register',
        label: 'Sign Up',
        description: 'Create a new account',
        icon: <User className="h-4 w-4" />,
        action: () => router.push('/register'),
        keywords: ['register', 'signup', 'account'],
        group: 'Authentication',
      },
    ]),

    // Theme commands
    {
      id: 'theme-light',
      label: 'Light Theme',
      description: 'Switch to light mode',
      icon: <Sun className="h-4 w-4" />,
      action: () => setTheme('light'),
      keywords: ['theme', 'light', 'bright'],
      group: 'Appearance',
    },
    {
      id: 'theme-dark',
      label: 'Dark Theme',
      description: 'Switch to dark mode',
      icon: <Moon className="h-4 w-4" />,
      action: () => setTheme('dark'),
      keywords: ['theme', 'dark', 'night'],
      group: 'Appearance',
    },
    {
      id: 'theme-system',
      label: 'System Theme',
      description: 'Use system theme preference',
      icon: <Monitor className="h-4 w-4" />,
      action: () => setTheme('system'),
      keywords: ['theme', 'system', 'auto'],
      group: 'Appearance',
    },

    // Search
    {
      id: 'search',
      label: 'Search Pastes',
      description: 'Search through your pastes',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        if (isAuthenticated) {
          router.push('/dashboard?search=');
        } else {
          router.push('/');
        }
      },
      keywords: ['search', 'find', 'filter'],
      group: 'Actions',
    },
  ];

  const groupedCommands = commands.reduce((acc, command) => {
    const group = command.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {Object.entries(groupedCommands).map(([group, groupCommands], index) => (
          <div key={group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {groupCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => {
                    command.action();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5"
                >
                  {command.icon}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{command.label}</div>
                    {command.description && (
                      <div className="text-xs text-muted-foreground">
                        {command.description}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
        
        <CommandSeparator />
        <CommandGroup heading="Shortcuts">
          <CommandItem className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
            <span>Open command palette</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              {getModifierKey()}K
            </kbd>
          </CommandItem>
          <CommandItem className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
            <span>Submit paste form</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              {getModifierKey()}↵
            </kbd>
          </CommandItem>
          <CommandItem className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
            <span>Close dialogs</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              Esc
            </kbd>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}