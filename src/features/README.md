# Features Directory

This directory contains feature-based organization for the application's business logic.

## Structure

Each feature follows this structure:
```
feature-name/
├── components/          # UI components specific to this feature
│   ├── ui/             # Pure UI components
│   ├── forms/          # Form components
│   ├── composite/      # Complex composed components
│   └── providers/      # Context providers
├── hooks/              # Custom hooks for this feature
├── lib/                # Utilities and helpers
├── actions/            # Server actions (Next.js)
├── types/              # TypeScript types
└── index.ts            # Public API exports
```

## Features

### 🔐 Auth (`/auth`)
- Authentication and authorization logic
- Login/register forms
- User management components
- Auth providers and hooks

### 📄 Paste (`/paste`)
- Paste creation, editing, viewing
- Syntax highlighting
- Password protection
- File management

### 📊 Dashboard (`/dashboard`)
- User dashboard components
- Analytics and statistics
- Navigation and layout

### 🏠 Landing (`/landing`)
- Marketing pages
- Public-facing components
- Homepage sections

## Import Guidelines

### ✅ Allowed Imports
```tsx
// Features can import from shared
import { Button } from '@/shared/components/ui'
import { useMediaQuery } from '@/shared/hooks'

// Features can import from other features (carefully)
import { useAuth } from '@/features/auth/hooks'
```

### ❌ Avoid
```tsx
// Don't import directly from src/components
import { Button } from '@/components/ui/button' // ❌

// Don't create circular dependencies between features
```

## Migration Status

- ✅ Phase 1: Directory structure created
- 🔄 Phase 2: Migrate paste feature components
- ⏳ Phase 3: Migrate auth and dashboard features
- ⏳ Phase 4: Update all import paths