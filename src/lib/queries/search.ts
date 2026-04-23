import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { EpisodeCard } from "./types";

export async function searchEpisodes(
  query: string,
  locale: "es" | "en" = "es",
  limit = 30
): Promise<EpisodeCard[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const supabase = await getSupabaseServerClient();
  const col = locale === "en" ? "title_en" : "title_es";
  const fallbackCol = locale === "en" ? "synopsis_en" : "synopsis_es";
  const likeValue = `%${trimmed.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;

  const { data, error } = await supabase
    .from("episodes")
    .select(
      "id, slug, series_id, season_id, episode_number, title_es, title_en, synopsis_es, synopsis_en, youtube_id, thumbnail_url, duration_seconds, published_at, tags"
    )
    .eq("is_published", true)
    .or(`${col}.ilike.${likeValue},${fallbackCol}.ilike.${likeValue}`)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
