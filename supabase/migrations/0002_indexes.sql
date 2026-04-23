-- Loom Originals — performance & search indexes

create index if not exists idx_episodes_series_season_number
  on public.episodes (series_id, season_id, episode_number);

create index if not exists idx_episodes_slug
  on public.episodes (slug);

create index if not exists idx_episodes_published_at
  on public.episodes (published_at desc)
  where is_published = true;

create index if not exists idx_series_featured_order
  on public.series (featured_order)
  where is_featured = true;

create index if not exists idx_watch_history_user_last
  on public.watch_history (user_id, last_watched_at desc);

create index if not exists idx_favorites_user
  on public.favorites (user_id, created_at desc);

create index if not exists idx_video_events_episode_created
  on public.video_events (episode_id, created_at desc);

create index if not exists idx_cta_clicks_created
  on public.cta_clicks (created_at desc);

-- Spanish full-text search on episodes
create index if not exists idx_episodes_fts_es
  on public.episodes
  using gin (to_tsvector('spanish',
    coalesce(title_es, '') || ' ' ||
    coalesce(synopsis_es, '') || ' ' ||
    coalesce(transcript_es, '')
  ));

-- English full-text search on episodes
create index if not exists idx_episodes_fts_en
  on public.episodes
  using gin (to_tsvector('english',
    coalesce(title_en, '') || ' ' ||
    coalesce(synopsis_en, '') || ' ' ||
    coalesce(transcript_en, '')
  ));

-- Tag search
create index if not exists idx_episodes_tags on public.episodes using gin (tags);
