-- Loom Originals — initial schema
-- Run order: 0001_init.sql → 0002_indexes.sql → seed.sql
-- ─────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────
-- Content tables
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.series (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  title_es             text not null,
  title_en             text,
  synopsis_es          text,
  synopsis_en          text,
  poster_url           text,
  backdrop_url         text,
  trailer_youtube_id   text,
  release_year         int,
  is_featured          boolean not null default false,
  featured_order       int,
  created_at           timestamptz not null default now()
);

create table if not exists public.seasons (
  id            uuid primary key default gen_random_uuid(),
  series_id     uuid not null references public.series(id) on delete cascade,
  season_number int not null,
  title_es      text,
  title_en      text,
  created_at    timestamptz not null default now(),
  unique (series_id, season_number)
);

create table if not exists public.episodes (
  id               uuid primary key default gen_random_uuid(),
  season_id        uuid not null references public.seasons(id) on delete cascade,
  series_id        uuid not null references public.series(id) on delete cascade,
  episode_number   int  not null,
  slug             text not null,
  title_es         text not null,
  title_en         text,
  synopsis_es      text,
  synopsis_en      text,
  youtube_id       text not null,
  thumbnail_url    text,
  duration_seconds int,
  transcript_es    text,
  transcript_en    text,
  published_at     timestamptz,
  is_published     boolean not null default false,
  tags             text[] not null default '{}',
  created_at       timestamptz not null default now(),
  unique (season_id, episode_number),
  unique (series_id, slug)
);

create table if not exists public.categories (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name_es        text not null,
  name_en        text,
  description_es text,
  description_en text
);

create table if not exists public.episode_categories (
  episode_id  uuid not null references public.episodes(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (episode_id, category_id)
);

-- ─────────────────────────────────────────────────────────────────────
-- User tables
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text,
  avatar_url         text,
  preferred_language text not null default 'es',
  created_at         timestamptz not null default now()
);

create table if not exists public.watch_history (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  episode_id       uuid not null references public.episodes(id) on delete cascade,
  progress_seconds int not null default 0,
  completed        boolean not null default false,
  last_watched_at  timestamptz not null default now(),
  unique (user_id, episode_id)
);

create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  series_id  uuid not null references public.series(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, series_id)
);

-- ─────────────────────────────────────────────────────────────────────
-- Analytics
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.video_events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  episode_id        uuid not null references public.episodes(id) on delete cascade,
  event_type        text not null check (event_type in ('play','pause','progress','complete','cta_click','youtube_redirect','share','favorite','unfavorite','seek')),
  progress_seconds  int,
  metadata          jsonb,
  created_at        timestamptz not null default now()
);

create table if not exists public.cta_clicks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  episode_id      uuid references public.episodes(id) on delete set null,
  cta_type        text not null check (cta_type in ('consultation','youtube','whatsapp','phone','subscribe','social')),
  destination_url text,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
-- Auto-create profile on signup
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'preferred_language', 'es')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────
alter table public.series             enable row level security;
alter table public.seasons            enable row level security;
alter table public.episodes           enable row level security;
alter table public.categories         enable row level security;
alter table public.episode_categories enable row level security;
alter table public.profiles           enable row level security;
alter table public.watch_history      enable row level security;
alter table public.favorites          enable row level security;
alter table public.video_events       enable row level security;
alter table public.cta_clicks         enable row level security;

-- Public content: readable by anyone for published rows
drop policy if exists "series readable" on public.series;
create policy "series readable" on public.series for select using (true);

drop policy if exists "seasons readable" on public.seasons;
create policy "seasons readable" on public.seasons for select using (true);

drop policy if exists "episodes readable" on public.episodes;
create policy "episodes readable" on public.episodes for select using (is_published = true);

drop policy if exists "categories readable" on public.categories;
create policy "categories readable" on public.categories for select using (true);

drop policy if exists "episode_categories readable" on public.episode_categories;
create policy "episode_categories readable" on public.episode_categories for select using (true);

-- Profiles: user sees/updates own row only
drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Watch history: user scoped
drop policy if exists "watch_history self all" on public.watch_history;
create policy "watch_history self all" on public.watch_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Favorites: user scoped
drop policy if exists "favorites self all" on public.favorites;
create policy "favorites self all" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Analytics: anon INSERT allowed, no SELECT except service role
drop policy if exists "video_events insert anon" on public.video_events;
create policy "video_events insert anon" on public.video_events
  for insert with check (true);

drop policy if exists "cta_clicks insert anon" on public.cta_clicks;
create policy "cta_clicks insert anon" on public.cta_clicks
  for insert with check (true);
