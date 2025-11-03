# BodyVerse Watch MVP

Prototype social-video web app where small groups of friends watch one-minute clips together while their Ready Player Me avatars react in real time.

## Features
- App Router landing page with Tailwind UI and marketing copy
- Discord OAuth login via NextAuth (Supabase-backed or JWT-only fallback)
- Watch dashboard with featured playlist cards and session detail page
- Supabase helpers for videos, realtime reactions, and friend syncing (auto-disabled when Supabase is offline)
- Zustand store + SessionPlayer component ready for realtime avatar reactions

## Stack
- Next.js 14 (App Router) + React + Tailwind CSS
- NextAuth with Discord OAuth2 provider
- Supabase (Auth, Postgres, Realtime)
- Ready Player Me & LiveKit placeholders for realtime avatar presence

## Getting Started
1. Copy `.env.example` to `.env.local` and fill in the required values.
   - Offline/demo mode: set `SUPABASE_ENABLED=false` and `NEXT_PUBLIC_SUPABASE_ENABLED=false` (default in the template) to bypass Supabase while keeping the UI functional with seeded data.
   - Connected mode: flip both flags to `true` and ensure Supabase environment variables are populated.
2. If Supabase is enabled, run the SQL in `supabase/schema.sql` (plus the NextAuth adapter schema) inside your project database.
3. Install dependencies and run the dev server:
   ```bash
   pnpm install
   pnpm dev
   ```
4. Visit `http://localhost:3000` to explore the landing page and `/login` to trigger Discord sign-in.

## Environment Variables

| Variable | Description |
| --- | --- |
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks (e.g. `http://localhost:3000`). |
| `NEXTAUTH_SECRET` | Random string for JWT encryption. |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Discord OAuth app credentials. |
| `SUPABASE_ENABLED` | `true` to use Supabase adapter/server helpers; `false` to run offline. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (required when `SUPABASE_ENABLED=true`). |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client credentials (set when online). |
| `NEXT_PUBLIC_SUPABASE_ENABLED` | Mirrors `SUPABASE_ENABLED` for client-side guards. |
| `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | Reserved for future LiveKit integration. |

## Next Steps
- [ ] Hook up Supabase storage or edge functions to ingest short-form clips with metadata.
- [ ] Build the friend sync UI in `/watch/friends` and wire `/api/discord/friends` to cron refresh logic.
- [ ] Add server actions /mutations for starting sessions, broadcasting events, and storing reaction history.
- [ ] Swap the placeholder `SessionPlayer` for a synced player powered by LiveKit or a custom WebRTC mesh.
