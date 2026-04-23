import Link from "next/link";
import { getAllSeries } from "@/lib/queries/getSeries";
import { ChevronRight, Plus } from "lucide-react";

export default async function AdminSeriesPage() {
  const series = await getAllSeries().catch(() => []);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Series</p>
          <h1 className="mt-2 font-display text-4xl italic text-ivory-50">Administrar series</h1>
        </div>
        <Link
          href="/admin/series/nueva"
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          Nueva serie
        </Link>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-800 text-[11px] uppercase tracking-widest text-gold-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Destacada</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-ivory-50">{s.title_es}</td>
                <td className="px-4 py-3 font-mono text-gold-400">{s.slug}</td>
                <td className="px-4 py-3 text-ivory-200/80">{s.release_year ?? "—"}</td>
                <td className="px-4 py-3">
                  {s.is_featured ? (
                    <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-gold-400">
                      Sí
                    </span>
                  ) : (
                    <span className="text-ivory-200/60">no</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/series/${s.id}`}
                    className="inline-flex items-center gap-1 text-gold-500 hover:text-gold-400"
                  >
                    Abrir
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {series.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ivory-200/70">
                  No hay series registradas todavía.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
