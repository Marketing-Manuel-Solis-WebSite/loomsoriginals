"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function ensureAdmin() {
  if (!(await isAdminUser())) {
    throw new Error("unauthorized");
  }
}

const SeriesSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title_es: z.string().min(1).max(200),
  title_en: z.string().max(200).optional().or(z.literal("")),
  synopsis_es: z.string().max(5000).optional().or(z.literal("")),
  synopsis_en: z.string().max(5000).optional().or(z.literal("")),
  trailer_youtube_id: z.string().max(20).optional().or(z.literal("")),
  poster_url: z.string().url().max(500).optional().or(z.literal("")),
  backdrop_url: z.string().url().max(500).optional().or(z.literal("")),
  release_year: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
  is_featured: z.coerce.boolean().default(false),
  featured_order: z.coerce.number().int().optional().nullable(),
});

export async function upsertSeries(formData: FormData) {
  await ensureAdmin();
  const raw = Object.fromEntries(formData.entries());
  const payload = SeriesSchema.parse({ ...raw, is_featured: raw.is_featured === "on" });
  const supabase = await getSupabaseServiceClient();
  const slug = payload.slug || slugify(payload.title_es);
  const row = {
    slug,
    title_es: payload.title_es,
    title_en: payload.title_en || null,
    synopsis_es: payload.synopsis_es || null,
    synopsis_en: payload.synopsis_en || null,
    trailer_youtube_id: payload.trailer_youtube_id || null,
    poster_url: payload.poster_url || null,
    backdrop_url: payload.backdrop_url || null,
    release_year: payload.release_year ?? null,
    is_featured: payload.is_featured,
    featured_order: payload.featured_order ?? null,
  };
  if (payload.id) {
    const { error } = await supabase.from("series").update(row).eq("id", payload.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("series").insert(row);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/series");
  revalidatePath("/");
  revalidatePath(`/series/${slug}`);
}

const EpisodeSchema = z.object({
  id: z.string().uuid().optional(),
  series_id: z.string().uuid(),
  season_id: z.string().uuid(),
  episode_number: z.coerce.number().int().min(1).max(999),
  slug: z.string().min(1).max(120),
  title_es: z.string().min(1).max(200),
  title_en: z.string().max(200).optional().or(z.literal("")),
  synopsis_es: z.string().max(5000).optional().or(z.literal("")),
  synopsis_en: z.string().max(5000).optional().or(z.literal("")),
  youtube_id: z.string().min(1).max(20),
  duration_seconds: z.coerce.number().int().min(0).max(99999).optional().nullable(),
  transcript_es: z.string().optional().or(z.literal("")),
  transcript_en: z.string().optional().or(z.literal("")),
  thumbnail_url: z.string().url().max(500).optional().or(z.literal("")),
  is_published: z.coerce.boolean().default(false),
  published_at: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
});

export async function upsertEpisode(formData: FormData) {
  await ensureAdmin();
  const raw = Object.fromEntries(formData.entries());
  const payload = EpisodeSchema.parse({ ...raw, is_published: raw.is_published === "on" });
  const supabase = await getSupabaseServiceClient();
  const row = {
    series_id: payload.series_id,
    season_id: payload.season_id,
    episode_number: payload.episode_number,
    slug: payload.slug || slugify(payload.title_es),
    title_es: payload.title_es,
    title_en: payload.title_en || null,
    synopsis_es: payload.synopsis_es || null,
    synopsis_en: payload.synopsis_en || null,
    youtube_id: payload.youtube_id,
    duration_seconds: payload.duration_seconds ?? null,
    transcript_es: payload.transcript_es || null,
    transcript_en: payload.transcript_en || null,
    thumbnail_url: payload.thumbnail_url || null,
    is_published: payload.is_published,
    published_at: payload.published_at ? new Date(payload.published_at).toISOString() : null,
    tags: (payload.tags ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  if (payload.id) {
    const { error } = await supabase.from("episodes").update(row).eq("id", payload.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("episodes").insert(row);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/episodios");
  revalidatePath("/");
}

export async function deleteEpisode(id: string) {
  await ensureAdmin();
  const supabase = await getSupabaseServiceClient();
  const { error } = await supabase.from("episodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/episodios");
  revalidatePath("/");
}

const SeasonSchema = z.object({
  series_id: z.string().uuid(),
  season_number: z.coerce.number().int().min(1).max(50),
  title_es: z.string().max(200).optional().or(z.literal("")),
  title_en: z.string().max(200).optional().or(z.literal("")),
});

export async function createSeason(formData: FormData) {
  await ensureAdmin();
  const payload = SeasonSchema.parse(Object.fromEntries(formData.entries()));
  const supabase = await getSupabaseServiceClient();
  const { error } = await supabase.from("seasons").insert({
    series_id: payload.series_id,
    season_number: payload.season_number,
    title_es: payload.title_es || null,
    title_en: payload.title_en || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/series/${payload.series_id}`);
  revalidatePath("/admin/episodios/nuevo");
}
