import "server-only";
import { cache } from "react";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import type { Category, Episode, Series, Season } from "@/lib/supabase/types";
import type { EpisodeCard, EpisodeDetail } from "./types";

type RawEpisodeDetail = Episode & {
  series: Series;
  season: Season;
  categories?: { category: Category }[] | null;
};

export const getEpisodeBySlug = cache(
  async (seriesSlug: string, episodeSlug: string): Promise<EpisodeDetail | null> => {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("episodes")
      .select(
        `*,
         series:series!inner ( id, slug, title_es, title_en, synopsis_es, synopsis_en, poster_url, backdrop_url, trailer_youtube_id, release_year, is_featured, featured_order, created_at ),
         season:seasons!inner ( id, series_id, season_number, title_es, title_en, created_at ),
         categories:episode_categories ( category:categories ( id, slug, name_es, name_en, description_es, description_en ) )`
      )
      .eq("slug", episodeSlug)
      .eq("series.slug", seriesSlug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const raw = data as unknown as RawEpisodeDetail;
    const categories = (raw.categories ?? [])
      .map((row) => row.category)
      .filter((c): c is Category => Boolean(c));
    return { ...raw, categories } as EpisodeDetail;
  }
);

export const getLatestEpisodes = cache(async (limit = 10): Promise<EpisodeCard[]> => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("episodes")
    .select(
      "id, slug, series_id, season_id, episode_number, title_es, title_en, synopsis_es, synopsis_en, youtube_id, thumbnail_url, duration_seconds, published_at, tags"
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as EpisodeCard[];
});

export const getRelatedEpisodes = cache(
  async (seriesId: string, excludeEpisodeId: string, limit = 8): Promise<EpisodeCard[]> => {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("episodes")
      .select(
        "id, slug, series_id, season_id, episode_number, title_es, title_en, synopsis_es, synopsis_en, youtube_id, thumbnail_url, duration_seconds, published_at, tags"
      )
      .eq("series_id", seriesId)
      .eq("is_published", true)
      .neq("id", excludeEpisodeId)
      .order("episode_number", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as EpisodeCard[];
  }
);

/**
 * Mapa episode.id → season_number para TODOS los episodios publicados, en UNA
 * sola query (en vez del N+1 de llamar getSeriesBySlug por cada serie).
 */
export const getEpisodeSeasonMap = cache(async (): Promise<Record<string, number>> => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("episodes")
    .select("id, season:seasons!inner ( season_number )")
    .eq("is_published", true);
  if (error) throw error;
  const map: Record<string, number> = {};
  for (const row of (data ?? []) as unknown as {
    id: string;
    season: { season_number: number } | null;
  }[]) {
    if (row.season?.season_number != null) map[row.id] = row.season.season_number;
  }
  return map;
});

const EPISODE_CARD_COLUMNS =
  "id, slug, series_id, season_id, episode_number, title_es, title_en, synopsis_es, synopsis_en, youtube_id, thumbnail_url, duration_seconds, published_at, tags";

/**
 * Top 10: ranking por número de eventos 'play' (video_events) si hay datos —
 * leído con el service client porque la RLS bloquea SELECT a anon en analytics.
 * Si no hay datos (o no hay service key), cae a los 10 publicados más recientes.
 */
export const getTop10Episodes = cache(async (): Promise<EpisodeCard[]> => {
  let rankedIds: string[] = [];
  try {
    const svc = await getSupabaseServiceClient();
    const { data } = await svc.from("video_events").select("episode_id").eq("event_type", "play");
    const events = (data ?? []) as { episode_id: string }[];
    if (events.length) {
      const counts = new Map<string, number>();
      for (const e of events) counts.set(e.episode_id, (counts.get(e.episode_id) ?? 0) + 1);
      rankedIds = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);
    }
  } catch {
    // sin service key o sin datos de analítica → fallback por fecha
  }

  const supabase = await getSupabaseServerClient();
  if (rankedIds.length) {
    const { data, error } = await supabase
      .from("episodes")
      .select(EPISODE_CARD_COLUMNS)
      .in("id", rankedIds)
      .eq("is_published", true);
    if (error) throw error;
    const order = new Map(rankedIds.map((id, i) => [id, i]));
    return ((data ?? []) as EpisodeCard[]).sort(
      (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99)
    );
  }

  const { data, error } = await supabase
    .from("episodes")
    .select(EPISODE_CARD_COLUMNS)
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as EpisodeCard[];
});
