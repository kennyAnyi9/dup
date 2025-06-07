# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun run dev --turbopack` - Start development server with Turbopack
- `bun run build` - Build production application
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Architecture Overview

This is a Next.js 15 application using the App Router with shadcn/ui components and Tailwind CSS.

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with shadcn/ui component library
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Package Manager**: Bun (based on bun.lock presence)

### Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/ui/` - shadcn/ui components (35+ pre-built components)
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging
- `src/hooks/` - Custom React hooks
- `@/` path alias maps to `src/`

### Component Architecture

- Uses shadcn/ui "new-york" style with CSS variables
- Components are built on Radix UI primitives
- Styling uses Tailwind with `clsx` and `tailwind-merge` via `cn()` utility
- Theme support via next-themes package

### constraints

- Use function declarations for React components and not arrow functions
