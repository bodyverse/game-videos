-- Enable extensions required for UUID generation.
create extension if not exists "uuid-ossp";

-- Videos curated for shared sessions.
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  playback_url text not null,
  duration_seconds smallint not null,
  thumbnail_url text,
  tags text[],
  is_featured boolean default true,
  created_at timestamptz default timezone('utc', now())
);

-- Sessions represent a single synced watch party.
create table if not exists public.video_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_uid uuid references auth.users(id) on delete cascade,
  video_id uuid references public.videos(id) on delete set null,
  status text default 'pending',
  started_at timestamptz default timezone('utc', now())
);

-- Users currently inside a watch session.
create table if not exists public.session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.video_sessions(id) on delete cascade,
  user_uid uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default timezone('utc', now()),
  last_seen_at timestamptz
);

-- Fine-grained session events for auditing and playback sync.
create table if not exists public.session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.video_sessions(id) on delete cascade,
  actor_uid uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz default timezone('utc', now())
);

-- Cached Discord profile data tied to Supabase auth user.
create table if not exists public.discord_profiles (
  user_uid uuid primary key references auth.users(id) on delete cascade,
  discord_id text not null,
  username text not null,
  global_name text,
  avatar text,
  synced_at timestamptz default timezone('utc', now())
);

-- Flattened friend list for quick lookups.
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_uid uuid references auth.users(id) on delete cascade,
  friend_discord_id text not null,
  friend_username text not null,
  friend_avatar text,
  created_at timestamptz default timezone('utc', now())
);

alter table public.friendships add constraint friendships_unique unique (user_uid, friend_discord_id);

-- Row level security policies.
alter table public.video_sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.session_events enable row level security;
alter table public.discord_profiles enable row level security;
alter table public.friendships enable row level security;

create policy "Users can view their sessions"
  on public.video_sessions
  for select
  using (owner_uid = auth.uid());

create policy "Users can insert their sessions"
  on public.video_sessions
  for insert
  with check (owner_uid = auth.uid());

create policy "Users update their sessions"
  on public.video_sessions
  for update
  using (owner_uid = auth.uid());

create policy "Participants view session roster"
  on public.session_participants
  for select
  using (user_uid = auth.uid());

create policy "Participants join sessions"
  on public.session_participants
  for insert
  with check (user_uid = auth.uid());

create policy "Participants update presence"
  on public.session_participants
  for update
  using (user_uid = auth.uid());

create policy "View own session events"
  on public.session_events
  for select
  using (actor_uid = auth.uid());

create policy "Log session events"
  on public.session_events
  for insert
  with check (actor_uid = auth.uid());

create policy "User reads own Discord profile"
  on public.discord_profiles
  for select
  using (user_uid = auth.uid());

create policy "User upserts own Discord profile"
  on public.discord_profiles
  for insert
  with check (user_uid = auth.uid());

create policy "User updates own Discord profile"
  on public.discord_profiles
  for update
  using (user_uid = auth.uid());

create policy "User reads their friendships"
  on public.friendships
  for select
  using (user_uid = auth.uid());

create policy "User upserts friendships"
  on public.friendships
  for insert
  with check (user_uid = auth.uid());

create policy "User updates friendships"
  on public.friendships
  for update
  using (user_uid = auth.uid());

create index if not exists idx_video_sessions_owner on public.video_sessions (owner_uid);
create index if not exists idx_session_participants_session on public.session_participants (session_id);
create index if not exists idx_session_events_session on public.session_events (session_id);
create index if not exists idx_friendships_user on public.friendships (user_uid);
