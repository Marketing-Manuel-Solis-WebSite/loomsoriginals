import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { AnalyticsCharts } from "./AnalyticsCharts";

function isoDaysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();
}

export default async function AnalyticsPage() {
  const supabase = await getSupabaseServiceClient();
  const since = isoDaysAgo(30);

  const { data: videoEvents } = await supabase
    .from("video_events")
    .select("event_type, created_at, episode_id")
    .gte("created_at", since);
  const { data: ctas } = await supabase
    .from("cta_clicks")
    .select("cta_type, created_at, destination_url")
    .gte("created_at", since);

  const { data: topEpisodes } = await supabase
    .from("episodes")
    .select("id, title_es")
    .eq("is_published", true);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Analíticas</p>
      <h1 className="mt-2 font-display text-4xl italic text-ivory-50">Métricas · últimos 30 días</h1>
      <AnalyticsCharts
        videoEvents={(videoEvents ?? []) as { event_type: string; created_at: string; episode_id: string }[]}
        ctas={(ctas ?? []) as { cta_type: string; created_at: string; destination_url: string | null }[]}
        episodes={(topEpisodes ?? []) as { id: string; title_es: string }[]}
      />
    </div>
  );
}
