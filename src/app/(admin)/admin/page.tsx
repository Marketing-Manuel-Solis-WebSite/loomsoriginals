import { getSupabaseServiceClient } from "@/lib/supabase/server";

async function counts() {
  try {
    const supabase = await getSupabaseServiceClient();
    const sinceISO = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const [videos, ctas, eps, series] = await Promise.all([
      supabase.from("video_events").select("id", { count: "exact", head: true }).gte("created_at", sinceISO),
      supabase.from("cta_clicks").select("id", { count: "exact", head: true }).gte("created_at", sinceISO),
      supabase.from("episodes").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("series").select("id", { count: "exact", head: true }),
    ]);
    return {
      videos: videos.count ?? 0,
      ctas: ctas.count ?? 0,
      eps: eps.count ?? 0,
      series: series.count ?? 0,
    };
  } catch {
    return { videos: 0, ctas: 0, eps: 0, series: 0 };
  }
}

export default async function AdminHome() {
  const c = await counts();
  const cards = [
    { label: "Series publicadas", value: c.series },
    { label: "Episodios publicados", value: c.eps },
    { label: "Eventos de video · 7 días", value: c.videos },
    { label: "Clics a consulta · 7 días", value: c.ctas },
  ];
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Resumen</p>
      <h1 className="mt-2 font-display text-4xl italic text-ivory-50">Panel de admin</h1>
      <p className="mt-3 text-sm text-ivory-200/70">
        Visión rápida de los últimos 7 días. Para más detalle, vea la sección Analíticas.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ivory-200/70">
              {card.label}
            </p>
            <p className="mt-3 font-display text-4xl italic text-ivory-50">{card.value.toLocaleString("es-MX")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
