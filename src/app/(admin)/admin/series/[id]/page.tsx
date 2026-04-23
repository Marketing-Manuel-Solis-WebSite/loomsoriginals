import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { SeriesForm } from "../../SeriesForm";
import { SeasonForm } from "../../SeasonForm";

type Params = Promise<{ id: string }>;

export default async function EditSeriesPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await getSupabaseServiceClient();
  const { data: series } = await supabase.from("series").select("*").eq("id", id).maybeSingle();
  if (!series) notFound();
  const { data: seasons } = await supabase
    .from("seasons")
    .select("id, season_number, title_es")
    .eq("series_id", id)
    .order("season_number", { ascending: true });

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Series</p>
      <h1 className="mt-2 font-display text-4xl italic text-ivory-50">{series.title_es}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <SeriesForm series={series} />
        <aside className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg italic text-ivory-50">Temporadas</h2>
          <ul className="mt-3 space-y-2">
            {(seasons ?? []).map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-ivory-100">
                  T{s.season_number} — {s.title_es ?? "Sin título"}
                </span>
                <span className="text-[11px] uppercase text-ivory-200/60">{s.id.slice(0, 6)}</span>
              </li>
            ))}
            {(!seasons || seasons.length === 0) && (
              <li className="text-sm text-ivory-200/70">
                Aún no hay temporadas. Agregue la primera abajo.
              </li>
            )}
          </ul>
          <SeasonForm
            seriesId={id}
            defaultSeasonNumber={(seasons?.length ?? 0) + 1}
          />
          <Link
            href="/admin/episodios/nuevo"
            className="mt-5 inline-block text-[12px] font-semibold uppercase tracking-widest text-gold-500 hover:text-gold-400"
          >
            Agregar un episodio →
          </Link>
        </aside>
      </div>
    </div>
  );
}
