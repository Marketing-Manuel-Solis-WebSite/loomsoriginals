import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { EpisodeForm } from "../../EpisodeForm";

export default async function NewEpisodePage() {
  const supabase = await getSupabaseServiceClient();
  const [seriesResult, seasonsResult] = await Promise.all([
    supabase.from("series").select("id, title_es").order("title_es"),
    supabase.from("seasons").select("id, series_id, season_number, title_es").order("season_number"),
  ]);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Episodios</p>
      <h1 className="mt-2 font-display text-4xl italic text-ivory-50">Nuevo episodio</h1>
      <div className="mt-8 max-w-3xl">
        <EpisodeForm
          series={seriesResult.data ?? []}
          seasons={seasonsResult.data ?? []}
        />
      </div>
    </div>
  );
}
