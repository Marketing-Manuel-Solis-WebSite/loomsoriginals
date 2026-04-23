import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { EpisodeCard } from "./types";

type RawRow = {
  progress_seconds: number;
  completed: boolean;
  last_watched_at: string;
  episode: EpisodeCard & { is_published: boolean };
};

type RawFavorite = { series_id: string };

export async function getContinueWatching(
  userId: string,
  limit = 10
): Promise<(EpisodeCard & { progress_seconds: number; completed: boolean })[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("watch_history")
    .select(
      `progress_seconds, completed, last_watched_at,
       episode:episodes!inner (
         id, slug, series_id, season_id, episode_number,
         title_es, title_en, synopsis_es, synopsis_en,
         youtube_id, thumbnail_url, duration_seconds, published_at, tags, is_published
       )`
    )
    .eq("user_id", userId)
    .eq("completed", false)
    .eq("episode.is_published", true)
    .order("last_watched_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (data ?? []) as unknown as RawRow[];
  return rows
    .filter((r) => r.episode)
    .map((row) => ({
      ...row.episode,
      progress_seconds: row.progress_seconds,
      completed: row.completed,
    }));
}

export async function getFavoriteSeriesIds(userId: string): Promise<string[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("series_id")
    .eq("user_id", userId);
  if (error) throw error;
  const rows = (data ?? []) as unknown as RawFavorite[];
  return rows.map((r) => r.series_id);
}
