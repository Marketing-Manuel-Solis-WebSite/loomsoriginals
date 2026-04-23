import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";
import type { EpisodeCard, CategoryWithEpisodes } from "./types";

export const getAllCategories = cache(async (): Promise<Category[]> => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name_es", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Category | null;
});

type RawCategoryRow = { episode: EpisodeCard & { is_published: boolean }; category: { slug: string } };

export const getEpisodesByCategory = cache(
  async (categorySlug: string, limit = 24): Promise<EpisodeCard[]> => {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("episode_categories")
      .select(
        `episode:episodes!inner (
           id, slug, series_id, season_id, episode_number,
           title_es, title_en, synopsis_es, synopsis_en,
           youtube_id, thumbnail_url, duration_seconds, published_at, tags, is_published
         ),
         category:categories!inner ( slug )`
      )
      .eq("category.slug", categorySlug)
      .eq("episode.is_published", true)
      .limit(limit);
    if (error) throw error;
    const rows = (data ?? []) as unknown as RawCategoryRow[];
    return rows
      .map((row) => row.episode)
      .filter((e): e is EpisodeCard & { is_published: boolean } => Boolean(e))
      .sort((a, b) => {
        const at = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bt = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bt - at;
      });
  }
);

export const getCategoriesWithEpisodes = cache(
  async (perCategory = 8): Promise<CategoryWithEpisodes[]> => {
    const categories = await getAllCategories();
    const results = await Promise.all(
      categories.slice(0, 6).map(async (cat) => {
        const eps = await getEpisodesByCategory(cat.slug, perCategory);
        return {
          ...cat,
          episodes: eps.map((e) => ({
            ...e,
            series: { slug: "", title_es: "", title_en: null },
          })),
        };
      })
    );
    return results.filter((c) => c.episodes.length > 0) as CategoryWithEpisodes[];
  }
);
