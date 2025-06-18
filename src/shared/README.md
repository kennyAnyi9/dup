# Shared Directory

This directory contains truly shared code that can be used across multiple features.

## Structure

```
shared/
├── components/          # Shared UI components
│   ├── dupui/          # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components (header, footer)
│   └── common/         # Common business components
├── hooks/              # Generic hooks
├── lib/                # Shared utilities and configurations
└── types/              # Global type definitions
```

## Import Guidelines

### ✅ Good Practice
```tsx
// Import from shared index files
import { Button, Input, Card } from '@/shared/components/ui'
import { useMediaQuery, useMobile } from '@/shared/hooks'
import { cn, formatDate } from '@/shared/lib'
```

### 🔄 Available Components

#### UI Components (`/components/ui`)
All shadcn/ui components + custom shared UI components

#### Common Components (`/components/common`)
- Logo
- Theme Provider
- Loading states
- Error boundaries

#### Hooks (`/hooks`)
- `useMediaQuery` - Responsive design hook
- `useMobile` - Mobile detection hook

#### Utilities (`/lib`)
- `utils.ts` - Common utility functions
- `constants.ts` - Application constants
- `cache.ts` - Caching utilities
- `auth-*.ts` - Authentication utilities

## Rules

1. **No feature-specific logic** should be in shared
2. **No business logic** - only pure utilities and UI
3. **Stable API** - changes here affect all features
4. **Well tested** - shared code should be thoroughly tested