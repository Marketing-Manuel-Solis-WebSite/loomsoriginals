"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export type Row = {
  id: string;
  title_es: string;
  slug: string;
  episode_number: number;
  is_published: boolean;
  duration_seconds: number | null;
  published_at: string | null;
  youtube_id: string | null;
  series: { title_es: string; slug: string } | null;
  season: { season_number: number } | null;
};

export function EpisodesTable({
  episodes,
  seriesOptions,
}: {
  episodes: Row[];
  seriesOptions: [string, string][];
}) {
  const [q, setQ] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(0);
  const PER_PAGE = 50;

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return episodes.filter((ep) => {
      if (seriesFilter !== "all" && ep.series?.slug !== seriesFilter) return false;
      if (statusFilter === "published" && !ep.is_published) return false;
      if (statusFilter === "draft" && ep.is_published) return false;
      if (qLower) {
        const hay = `${ep.title_es} ${ep.series?.title_es ?? ""} ${ep.youtube_id ?? ""}`.toLowerCase();
        if (!hay.includes(qLower)) return false;
      }
      return true;
    });
  }, [episodes, q, seriesFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar por título, YouTube ID…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            className="h-10 w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm text-ink placeholder:text-gray-400 outline-none focus:border-gold-400"
          />
        </div>
        <select
          value={seriesFilter}
          onChange={(e) => {
            setSeriesFilter(e.target.value);
            setPage(0);
          }}
          className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm text-ink outline-none focus:border-gold-400"
        >
          <option value="all">Todas las series</option>
          {seriesOptions.map(([slug, title]) => (
            <option key={slug} value={slug}>
              {title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setPage(0);
          }}
          className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm text-ink outline-none focus:border-gold-400"
        >
          <option value="all">Todos</option>
          <option value="published">Publicados</option>
          <option value="draft">Borrador</option>
        </select>
        <span className="ml-auto text-xs text-gray-500">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-[11px] uppercase tracking-widest text-gold-700">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Serie</th>
              <th className="px-4 py-3">T:E</th>
              <th className="px-4 py-3">YT</th>
              <th className="px-4 py-3">Dur.</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((ep) => (
              <tr key={ep.id} className="border-t border-gray-100 hover:bg-paper">
                <td className="px-4 py-3 text-ink max-w-[380px] truncate" title={ep.title_es}>
                  {ep.title_es}
                </td>
                <td className="px-4 py-3 text-gray-600">{ep.series?.title_es ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-gold-700">
                  T{ep.season?.season_number ?? 1}:E{ep.episode_number}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                  {ep.youtube_id ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {ep.duration_seconds ? formatDuration(ep.duration_seconds) : "—"}
                </td>
                <td className="px-4 py-3">
                  {ep.is_published ? (
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-green-700 border border-green-200">
                      Publicado
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-gray-500 border border-gray-200">
                      Borrador
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/episodios/${ep.id}`}
                    className="text-ink hover:text-gold-700"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  Sin resultados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Página {safePage + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-ink hover:border-gold-400 disabled:opacity-40 disabled:hover:border-gray-200"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-ink hover:border-gold-400 disabled:opacity-40 disabled:hover:border-gray-200"
            >
              Siguiente →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
