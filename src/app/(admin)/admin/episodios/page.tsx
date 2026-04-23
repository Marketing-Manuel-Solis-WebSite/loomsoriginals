import Link from "next/link";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { formatDuration } from "@/lib/utils";

type Row = {
  id: string;
  title_es: string;
  slug: string;
  episode_number: number;
  is_published: boolean;
  duration_seconds: number | null;
  published_at: string | null;
  series: { title_es: string; slug: string } | null;
  season: { season_number: number } | null;
};

export default async function AdminEpisodiosPage() {
  const supabase = await getSupabaseServiceClient();
  const { data } = await supabase
    .from("episodes")
    .select(
      `id, title_es, slug, episode_number, is_published, duration_seconds, published_at,
       series:series(title_es, slug),
       season:seasons(season_number)`
    )
    .order("published_at", { ascending: false, nullsFirst: false });
  const episodes = (data ?? []) as unknown as Row[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
            Episodios
          </p>
          <h1 className="mt-2 font-display text-4xl italic text-ivory-50">
            Administrar episodios
          </h1>
        </div>
        <Link
          href="/admin/episodios/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          Nuevo episodio
        </Link>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-800 text-[11px] uppercase tracking-widest text-gold-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Serie</th>
              <th className="px-4 py-3">T:E</th>
              <th className="px-4 py-3">Duración</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {episodes.map((ep) => (
              <tr key={ep.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-ivory-50">{ep.title_es}</td>
                <td className="px-4 py-3 text-ivory-200/80">{ep.series?.title_es ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-gold-400">
                  T{ep.season?.season_number ?? 1}:E{ep.episode_number}
                </td>
                <td className="px-4 py-3 text-ivory-200/80">
                  {ep.duration_seconds ? formatDuration(ep.duration_seconds) : "—"}
                </td>
                <td className="px-4 py-3">
                  {ep.is_published ? (
                    <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-gold-400">
                      Publicado
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] uppercase tracking-widest text-ivory-200/60">
                      Borrador
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/episodios/${ep.id}`}
                    className="text-gold-500 hover:text-gold-400"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {episodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ivory-200/70">
                  Aún no hay episodios.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
