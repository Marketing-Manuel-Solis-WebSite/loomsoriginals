import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SeriesCard } from "./types";

export const getFeaturedSeries = cache(async (limit = 3): Promise<SeriesCard[]> => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("series")
    .select(
      "id, slug, title_es, title_en, synopsis_es, synopsis_en, poster_url, backdrop_url, trailer_youtube_id, release_year, is_featured, featured_order"
    )
    .eq("is_featured", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
});
