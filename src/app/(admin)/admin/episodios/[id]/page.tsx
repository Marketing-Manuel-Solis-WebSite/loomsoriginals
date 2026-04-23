import { notFound } from "next/navigation";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { EpisodeForm } from "../../EpisodeForm";

type Params = Promise<{ id: string }>;

export default async function EditEpisodePage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await getSupabaseServiceClient();
  const { data: episode } = await supabase.from("episodes").select("*").eq("id", id).maybeSingle();
  if (!episode) notFound();
  const [seriesResult, seasonsResult] = await Promise.all([
    supabase.from("series").select("id, title_es").order("title_es"),
    supabase.from("seasons").select("id, series_id, season_number, title_es").order("season_number"),
  ]);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
        Episodio — T{episode.episode_number}
      </p>
      <h1 className="mt-2 font-display text-4xl italic text-ivory-50">{episode.title_es}</h1>
      <div className="mt-8 max-w-3xl">
        <EpisodeForm
          episode={episode}
          series={seriesResult.data ?? []}
          seasons={seasonsResult.data ?? []}
        />
      </div>
    </div>
  );
}
