import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Season } from "@/lib/supabase/types";
import type { EpisodeCard, SeriesCard, SeriesDetail } from "./types";

export const getAllSeries = cache(async (): Promise<SeriesCard[]> => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("series")
    .select(
      "id, slug, title_es, title_en, synopsis_es, synopsis_en, poster_url, backdrop_url, trailer_youtube_id, release_year, is_featured, featured_order"
    )
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("release_year", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SeriesCard[];
});

type RawSeriesDetail = SeriesCard & {
  seasons?: (Season & { episodes?: EpisodeCard[] })[] | null;
};

export const getSeriesBySlug = cache(async (slug: string): Promise<SeriesDetail | null> => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("series")
    .select(
      `id, slug, title_es, title_en, synopsis_es, synopsis_en, poster_url, backdrop_url, trailer_youtube_id, release_year, is_featured, featured_order,
       seasons (
         id, series_id, season_number, title_es, title_en, created_at,
         episodes:episodes (
           id, slug, series_id, season_id, episode_number, title_es, title_en, synopsis_es, synopsis_en, youtube_id, thumbnail_url, duration_seconds, published_at, tags
         )
       )`
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const raw = data as unknown as RawSeriesDetail;
  const seasons = (raw.seasons ?? [])
    .map((s) => ({
      ...s,
      episodes: (s.episodes ?? []).slice().sort((a, b) => a.episode_number - b.episode_number),
    }))
    .sort((a, b) => a.season_number - b.season_number);
  return { ...raw, seasons } as SeriesDetail;
});
