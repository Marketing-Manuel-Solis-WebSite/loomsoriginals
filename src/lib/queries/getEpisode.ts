import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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
