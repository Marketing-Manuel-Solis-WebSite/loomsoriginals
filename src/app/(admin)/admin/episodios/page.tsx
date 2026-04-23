import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { EpisodesTable, type Row } from "./EpisodesTable";

export default async function AdminEpisodiosPage() {
  const supabase = await getSupabaseServiceClient();
  const { data } = await supabase
    .from("episodes")
    .select(
      `id, title_es, slug, episode_number, is_published, duration_seconds, published_at, youtube_id,
       series:series(title_es, slug),
       season:seasons(season_number)`
    )
    .order("published_at", { ascending: false, nullsFirst: false });
  const episodes = (data ?? []) as unknown as Row[];

  const seriesOptions = Array.from(
    new Map(
      episodes
        .map((e) => e.series)
        .filter((s): s is NonNullable<Row["series"]> => !!s)
        .map((s) => [s.slug, s.title_es])
    ).entries()
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
            Episodios
          </p>
          <h1 className="mt-2 font-display text-4xl italic text-ink">Administrar episodios</h1>
          <p className="mt-2 text-sm text-gray-500">{episodes.length} en total</p>
        </div>
        <Link
          href="/admin/episodios/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo episodio
        </Link>
      </div>
      <EpisodesTable episodes={episodes} seriesOptions={seriesOptions} />
    </div>
  );
}
