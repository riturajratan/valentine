# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Valentine Message Generator - A full-stack Next.js application that allows users to create shareable Valentine's Day message links with playful interactive animations. When recipients click "No," the button dodges the cursor while the "Yes" button grows larger. Clicking "Yes" triggers celebrations and sends email notifications to the sender.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v3
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Deployment**: Vercel

## Common Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run Next.js linting
```

## Architecture Overview

### Application Flow

1. **Link Generation Flow** (`/` → `/api/generate`)
   - User enters recipient name, sender email (and optional sender name) on homepage
   - POST to `/api/generate` creates database record with UUID
   - Returns shareable link: `/valentine?id={uuid}`

2. **Valentine Display Flow** (`/valentine?id={uuid}` → `/api/message` → `/api/click`)
   - Page loads and fetches message details via GET `/api/message?id={uuid}`
   - Interactive UI with animated buttons (moving "No" button, growing "Yes" button)
   - On "Yes" click: POST to `/api/click` which:
     - Updates database (`clicked: true`, `clicked_at`)
     - Records click in `clicks` table
     - Sends email notification via Resend

3. **Admin Flow** (`/admin/login` → `/admin`)
   - Password authentication (sessionStorage-based, password from `ADMIN_PASSWORD` env var)
   - Dashboard displays real-time analytics and all messages
   - Stats: total messages, total clicks, conversion rate, unique senders

### Database Schema (Supabase)

**messages table**:
- `id` (UUID, PK) - Message identifier used in shareable links
- `recipient_name` (TEXT) - Name displayed in Valentine message
- `sender_email` (TEXT) - Email to notify on "Yes" click
- `sender_name` (TEXT, nullable) - Optional sender identification
- `created_at` (TIMESTAMP) - Message creation time
- `clicked` (BOOLEAN) - Whether recipient clicked "Yes"
- `clicked_at` (TIMESTAMP, nullable) - When "Yes" was clicked

**clicks table**:
- `id` (UUID, PK)
- `message_id` (UUID, FK → messages.id)
- `recipient_name` (TEXT) - Denormalized for analytics
- `sender_email` (TEXT) - Denormalized for analytics
- `clicked_at` (TIMESTAMP) - Click timestamp

**Indexes**: Both tables have indexes on email, timestamps, and clicked status for performance.

**RLS Policies**: Public access enabled for all operations (read/write) since app uses Supabase anon key.

### Key Files and Responsibilities

**API Routes** (`app/api/*/route.ts`):
- `generate/route.ts` - Creates message record, returns UUID
- `message/route.ts` - Fetches message by ID for valentine page
- `click/route.ts` - Records click, updates message, sends email notification

**Pages** (`app/**/page.tsx`):
- `page.tsx` - Homepage with link generator form
- `valentine/page.tsx` - Interactive Valentine proposal page with animations
- `admin/login/page.tsx` - Simple password authentication
- `admin/page.tsx` - Dashboard with analytics and message table
- `donate/page.tsx` - Donation page with QR codes

**Utilities**:
- `lib/supabase.ts` - Supabase client initialization and TypeScript types

### Important Implementation Details

**Valentine Page Animations** (`app/valentine/page.tsx`):
- Button dodging logic uses `distance < 150px` threshold for mouse proximity detection
- "No" button repositions using `translate()` CSS with smooth cubic-bezier transitions
- "Yes" button scales up by 0.2 increments (max 2.5x) on each dodge attempt
- Max dodge attempts: 8 (after which "No" button fades to 30% opacity and disables)
- Celebration animations created via DOM manipulation:
  - `createHearts()` - 50 floating heart emojis
  - `createConfetti()` - 100 colored particles falling
  - `createFireworks()` - 10 radial burst effects

**Email Notifications**:
- Sent via Resend API using `onboarding@resend.dev` sender (free tier)
- Email template in `app/api/click/route.ts` (HTML string)
- Email failures logged but don't fail the request

**Admin Authentication**:
- Simple password check against `ADMIN_PASSWORD` environment variable
- Auth state stored in `sessionStorage` (client-side only, not secure for production)
- No JWT or server-side sessions

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
RESEND_API_KEY=                   # Resend API key for emails
ADMIN_PASSWORD=                   # Admin dashboard password
```

### Path Aliases

TypeScript configured with `@/*` alias mapping to project root (see `tsconfig.json`).

Example: `import { supabase } from '@/lib/supabase'`

### Styling Approach

- Tailwind CSS v3 for all styling (no custom CSS files except inline `<style jsx>` for animations)
- Animation keyframes defined inline in `app/valentine/page.tsx` using styled-jsx
- Gradients heavily used for visual appeal (pink/purple/red theme)
- Fully responsive with mobile-first approach

### Database Schema Setup

Run `supabase-schema.sql` in Supabase SQL Editor to create tables, indexes, and RLS policies. Schema includes optional test data (commented out).

### Client-Side State Management

No global state management library (Redux, Zustand, etc.). Component-local state with React hooks (`useState`, `useEffect`).

## Key Conventions

- Use `'use client'` directive for pages with interactivity or browser APIs
- Wrap `useSearchParams()` usage in `<Suspense>` boundary to prevent static generation issues
- Error handling: log to console, return user-friendly error messages
- Email sending errors are non-blocking (don't fail the request)
- All timestamps use ISO 8601 format from Supabase
