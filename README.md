# M King Reads V2

M King Reads is a free digital library prototype powered by Next.js and Supabase.

## Current features
- Live genre catalogue from Supabase
- Live book catalogue from Supabase
- Search by title, author or description
- Genre pages
- Book detail pages
- Legitimate source links for reading/downloading
- Responsive mobile-first library UI

## Local setup
1. Copy `.env.example` to `.env.local`.
2. Add your Supabase project URL and **publishable** key.
3. Run `npm install`.
4. Run `npm run dev`.

Do not put a Supabase secret/service-role key in the browser or in `NEXT_PUBLIC_*` variables.

## Next build steps
1. Supabase Auth (sign up/login)
2. My Library save/unsave
3. Reading progress and bookmarks
4. Internal reader for books whose redistribution rights are verified for the target country
5. Admin catalogue/import tools
