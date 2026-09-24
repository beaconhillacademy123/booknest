# M King Reads

M King Reads is a free, mobile-first digital reading platform built with Next.js and Supabase. It is designed to make discovering, reading, saving and returning to books simple.

**Live app:** https://mkingreads.vercel.app

## What is already built

### Discovery & catalogue
- Live book catalogue powered by Supabase
- 16 genre categories
- Search by title, author and description
- Genre-specific browsing
- Book detail pages
- Featured and African Literature sections
- Related-book recommendations
- Reader book suggestions with an admin approval workflow

### Accounts & personal library
- Sign up and login
- Password reset flow
- My Library
- Save/unsave books
- Reading progress
- Completed-book tracking
- Continue Reading
- Resume reading from saved chapter
- Account/profile page
- Bookmarks with saved reading position

### Reading experience
- Internal M King Reads reader
- Chapter navigation
- Scrollable table of contents
- Current-chapter highlighting
- Previous/Next navigation
- Font-size controls
- Light, sepia and dark reading themes
- Persistent reading position
- Completion state when a book is finished
- Share a book or the current chapter
- Fallback reader for supported Gutenberg HTML books
- Image handling for externally sourced Gutenberg content

### PWA & mobile
- Installable Progressive Web App
- Android-friendly install prompt
- App icons and manifest
- Service-worker caching
- Offline status indicator
- Offline app-shell fallback
- Responsive mobile-first interface

### Catalogue administration
- Admin membership controlled through Supabase
- Review pending reader suggestions
- Assign a genre
- Optional cover URL
- Approve and add books to the public catalogue
- Reject suggestions

## Important content/licensing note

M King Reads can link to or display books only where the applicable source and redistribution rights permit it. A book being public domain in the United States does **not** automatically mean it is public domain in Nigeria. Catalogue additions should therefore be checked for Nigerian/local copyright status before redistribution.

## Technology

- Next.js
- React
- TypeScript
- Supabase
- Vercel
- Progressive Web App APIs
- Lucide React icons

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable/anon key.
3. Run `npm install`.
4. Run `npm run dev`.

Never put a Supabase secret/service-role key in browser code or in a `NEXT_PUBLIC_*` variable.

## Project structure

- `app/` — pages, reader, account flows and UI
- `app/components/` — reusable client components
- `app/read/[id]/` — internal reading experience
- `app/book/[id]/` — book detail pages
- `app/library/` — personal library
- `app/bookmarks/` — saved reading positions
- `app/profile/` — account dashboard
- `app/admin/` — catalogue management
- `app/login/` — authentication and password recovery
- `app/reset-password/` — password update flow
- `lib/` — Supabase/database helpers
- `public/` — PWA manifest, service worker and icons

## Deployment

The production deployment is connected to the GitHub `main` branch. Changes committed to `main` are intended to trigger the Vercel deployment.

## Backup

The older deployment URL is retained separately while M King Reads is being established:
https://booknest-rose.vercel.app
