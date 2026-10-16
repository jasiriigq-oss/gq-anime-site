-- =============================================================================
-- GQE anime — Supabase game backend
-- Replaces the old Colyseus server: game state lives in Postgres and is synced
-- to every client over Supabase Realtime. Payload (Turso) owns *content*;
-- this schema owns the *live game* (rooms, players, answers, chat, events).
--
-- Apply with:  supabase db push   (or run in the Supabase SQL editor)
-- =============================================================================

-- ---------- types ----------
create type public.game_role as enum ('admin', 'player', 'spectator');
create type public.game_room_state as enum ('lobby', 'in-progress', 'ended');
create type public.game_round_state as enum ('idle', 'question', 'reveal', 'leaderboard');

-- ---------- game_room ----------
-- One row per live game. `quiz_data` is a JSON snapshot of the quiz WITHOUT the
-- correct-answer flags (those live in game_answer_key, service-role only) so
-- anonymous players cannot read the answers.
create table public.game_room (
  id                    uuid primary key default gen_random_uuid(),
  code                  text not null unique,
  quiz_id               text,
  quiz_title            text,
  quiz_data             jsonb not null default '[]'::jsonb,
  state                 public.game_room_state not null default 'lobby',
  round                 integer not null default 0,
  round_state           public.game_round_state not null default 'idle',
  round_started_at      timestamptz,
  round_deadline        timestamptz,
  paused                boolean not null default false,
  revealed_correct_index integer,
  total_rounds          integer not null default 0,
  host_name             text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ---------- game_answer_key ----------
-- Correct answer per round. No SELECT policy for anon/authenticated — only the
-- service role (which bypasses RLS) can read it.
create table public.game_answer_key (
  room_id        uuid not null references public.game_room(id) on delete cascade,
  round          integer not null,
  correct_index  integer not null,
  primary key (room_id, round)
);

-- ---------- game_player ----------
create table public.game_player (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references public.game_room(id) on delete cascade,
  name          text not null,
  avatar        text,
  role          public.game_role not null default 'player',
  score         integer not null default 0,
  streak        integer not null default 0,
  eliminated    boolean not null default false,
  ready         boolean not null default false,
  answer_index  integer,
  answered_at   timestamptz,
  last_correct  boolean,
  created_at    timestamptz not null default now()
);

create index game_player_room_idx on public.game_player (room_id);

-- ---------- game_chat ----------
create table public.game_chat (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.game_room(id) on delete cascade,
  player_name  text,
  role         public.game_role,
  message      text not null,
  created_at   timestamptz not null default now()
);

create index game_chat_room_idx on public.game_chat (room_id, created_at);

-- ---------- game_event ----------
-- Admin feed + play summary log.
create table public.game_event (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.game_room(id) on delete cascade,
  kind        text not null default 'system',   -- 'system' | 'admin' | 'player'
  message     text not null,
  created_at  timestamptz not null default now()
);

create index game_event_room_idx on public.game_event (room_id, created_at);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger game_room_updated_at
  before update on public.game_room
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Realtime
-- =============================================================================
alter publication supabase_realtime add table public.game_room;
alter publication supabase_realtime add table public.game_player;
alter publication supabase_realtime add table public.game_chat;
alter publication supabase_realtime add table public.game_event;

-- =============================================================================
-- Row Level Security
-- A Kahoot-style game is anonymous by design: anyone with the join code can
-- read/write the live tables. We keep RLS enabled with permissive policies and
-- explicitly do NOT expose game_answer_key to anon/authenticated.
-- =============================================================================
alter table public.game_room enable row level security;
alter table public.game_answer_key enable row level security;
alter table public.game_player enable row level security;
alter table public.game_chat enable row level security;
alter table public.game_event enable row level security;

create policy "game_room_all" on public.game_room for all using (true) with check (true);
create policy "game_player_all" on public.game_player for all using (true) with check (true);
create policy "game_chat_all" on public.game_chat for all using (true) with check (true);
create policy "game_event_all" on public.game_event for all using (true) with check (true);
-- game_answer_key intentionally has no policy: anon/authenticated are denied;
-- the service role bypasses RLS and is the only reader.
