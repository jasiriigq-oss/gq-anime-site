# GQE anime — Anime Quiz Game

A Kahoot-style anime quiz platform. Rebuilt from the Colyseus proof-of-concept with a
**Supabase Realtime** game backend and **Payload CMS on Turso** for content.

## Stack

| Concern | Technology |
| --- | --- |
| Content CMS | **Payload CMS 3** (collections, admin panel, auth) |
| Content DB | **Supabase Postgres** (`@payloadcms/db-postgres`) |
| File storage | **Supabase Storage** via the S3-compatible endpoint (`@payloadcms/storage-s3`) |
| Live game backend | **Supabase Postgres + Realtime** (`postgres_changes`) — replaces Colyseus |
| Web framework | **Next.js 16** (App Router, React 19, Server Actions) |
| Styling | **Tailwind CSS v4** + a small custom design system (`src/app/globals.css`) |
| Validation | **Zod v4** (`src/lib/validation.ts`) used on every form |

## Architecture

```
Browser ──► Next.js (App Router)
              │  server components + server actions
              ├─► Payload local API ──► Turso (libSQL)   ← content: quizzes, users, pages, media
              └─► Supabase (service role) ──► Postgres   ← live game: rooms, players, chat, events
Browser ──► Supabase Realtime  ◄── postgres_changes ──┘ (subscriptions)
```

- **Payload on Supabase Postgres** is the source of truth for *content*: quizzes (with nested
  questions and answers), users, static pages (markdown), media.
- **Supabase** is the source of truth for the *live game*: lobbies, players, answers,
  scores, chat and the admin event feed. Every client subscribes to the four game tables and
  re-renders from `postgres_changes` — there is no game server to run.
- **Server actions** (`src/app/game-actions.ts`) are the only writers of authoritative game
  state. They run with the Supabase **service role** key so RLS never blocks scoring.
- The correct answer for each round is stored in a **service-role-only table**
  (`game_answer_key`); the public `game_room.quiz_data` snapshot omits it, so players cannot
  read the answers.

### Game flow

1. Host opens a quiz → **Host Multi-Player** → `createRoom` makes a `game_room` (6-char code),
   the answer key, and an admin player row.
2. Players open `/join`, enter the code + nickname + avatar → `joinRoom` inserts a `game_player`.
   Spectators join the same way with the spectator role.
3. Host presses **Start Game** → `startGame` sets `round=0, round_state=question` and a
   `round_deadline`. All clients count down locally from `round_deadline`.
4. Players answer → `submitAnswer` sets `answer_index`. When the timer expires (or the host
   force-skips) `revealRound` scores every player, sets `revealed_correct_index`, and — in
   **Challenge Mode** — eliminates wrong answers.
5. `nextRound` advances (or `endGame` at the last round) → the results/podium screen.
6. The host has pause/resume, force-skip, remove-player, end-early and announcement controls
   plus a live admin feed; players and spectators get a chat panel.

## Roles

The same `/play/[code]` route renders three different UIs from `?mode=`:
`admin` (lobby code + QR, start/round controls, admin feed), `player` (answer buttons,
timer, score, chat), `spectator` (watch question, reveal and leaderboard, chat only).

## Setup

```bash
bun install

# 1. Content DB — Supabase Postgres (same project as the live game)
#    .env: DATABASE_URL=postgresql://postgres.<ref>:<pw>@aws-1-<region>.pooler.supabase.com:6543/postgres
bun run migrate        # creates/updates the Payload schema

# 2. Live-game tables — apply supabase/schema.sql (game_room, game_player, game_chat, …)

bun run generate:importmap
bun run generate:types
bun run dev        # http://localhost:3000   (admin at /admin)
```

### Environment variables

Copied from the proof-of-concept `.env`. Required: `DATABASE_URL`, `PAYLOAD_SECRET`,
`SUPABASE_URL` + `SUPABASE_SECRET_KEY` (service role) and
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon, for Realtime),
plus the `S3_*` values for Supabase Storage and `SMTP_*` for password-reset email.

## Routes

| Route | Description |
| --- | --- |
| `/` | Home — hero + recently added & popular quiz carousels |
| `/search` | Search with series / type / difficulty filters |
| `/quiz/[slug]` | Quiz detail — solo play, host, join, leaderboard, related |
| `/create` | Quiz creator (validated form) |
| `/join` | Join a game by code (player or spectator) |
| `/play/[code]` | Live game (admin / player / spectator) |
| `/play/solo/[slug]` | Single-player run |
| `/profile` | Profile, stats, badges, created quizzes |
| `/[slug]` | Markdown content pages (terms, privacy, …) |
| `/admin` | Payload admin panel |

## Notes

- Content now lives in the **Supabase Postgres** database (the same project that will host the
  live-game tables). The previous SQLite/Turso data was migrated in with
  `src/scripts/transfer-data.ts`; a full dump of the pre-migration Postgres is kept in
  `backup/supabase-old/` and the old SQLite in `backup/local-sqlite/`.
- Images/videos/sounds are `upload` fields pointing at `media` (Supabase Storage). The quiz
  creator stores text quizzes; media can be attached in the Payload admin.
- Every form (login, signup, reset, join, chat, announcement, quiz creator) is validated with
  Zod on the client and re-validated server-side in its action.
