"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type EpisodeHit = {
  id: string;
  title: string;
  href: string;
  episodeNumber: number;
  seasonNumber: number;
  thumbnail: string | null;
};

type SeriesHit = {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  backdrop: string | null;
};

export function NavSearch({ tone: _tone = "dark" }: { tone?: "dark" | "light" }) {
  void _tone;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [episodes, setEpisodes] = useState<EpisodeHit[]>([]);
  const [series, setSeries] = useState<SeriesHit[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Focus input when expanding.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Click outside to close (only when query is empty).
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const wrap = wrapperRef.current;
      if (!wrap) return;
      if (!wrap.contains(e.target as Node)) {
        if (!query) setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, query]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Debounced fetch on query change.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (!query.trim()) return;

    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { episodes: EpisodeHit[]; series: SeriesHit[] };
        setEpisodes(data.episodes ?? []);
        setSeries(data.series ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn("search error", err);
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const onClose = () => {
    setOpen(false);
    setQuery("");
  };

  const hasResults = episodes.length > 0 || series.length > 0;
  const dropdownVisible = open && query.trim().length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <form
        onSubmit={onSubmit}
        className={cn(
          "flex items-center transition-all duration-500 ease-apple",
          open
            ? "w-[260px] sm:w-[340px] lg:w-[420px] rounded-full border glass-strong pl-4 pr-1.5"
            : "w-10",
          open ? "border-white/15" : "border-transparent"
        )}
      >
        {open ? (
          <>
            <Search className="h-[18px] w-[18px] shrink-0 text-white/60" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar series, casos, temas…"
              aria-label="Buscar"
              className="ml-2.5 flex-1 bg-transparent text-[14px] font-medium text-white placeholder:text-white/50 outline-none"
              autoComplete="off"
            />
            {loading ? (
              <Loader2 className="mr-1 h-4 w-4 shrink-0 animate-spin text-gold-300" />
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar buscador"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buscar"
            className="grid h-10 w-10 place-items-center rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        )}
      </form>

      {/* Results dropdown */}
      {dropdownVisible ? (
        <div
          role="listbox"
          aria-label="Resultados de búsqueda"
          className="absolute right-0 top-[calc(100%+10px)] w-[min(92vw,520px)] origin-top-right overflow-hidden rounded-2xl glass-strong shadow-2xl animate-fade-down"
        >
          {loading && !hasResults ? (
            <div className="grid place-items-center py-10 text-[12px] uppercase tracking-[0.22em] text-white/50">
              <Loader2 className="h-5 w-5 animate-spin text-gold-300" />
            </div>
          ) : !hasResults ? (
            <div className="px-5 py-8 text-center">
              <p className="font-display text-lg italic text-white">Sin resultados</p>
              <p className="mt-1 text-[13px] text-white/60">
                Intente con: reunificación, asilo, I-130, VAWA…
              </p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {series.length ? (
                <div>
                  <p className="px-5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-700">
                    Series
                  </p>
                  <ul className="px-2 pb-2">
                    {series.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/series/${s.slug}`}
                          onClick={onClose}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                        >
                          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                            {s.backdrop ? (
                              <Image
                                src={s.backdrop}
                                alt=""
                                fill
                                sizes="80px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                unoptimized={s.backdrop.includes("ytimg.com")}
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display italic text-white text-[15px]">
                              {s.title}
                            </p>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                              Serie {s.year ? `· ${s.year}` : ""}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {episodes.length ? (
                <div className="border-t border-white/8">
                  <p className="px-5 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-700">
                    Episodios
                  </p>
                  <ul className="px-2 pb-2">
                    {episodes.map((ep) => (
                      <li key={ep.id}>
                        <Link
                          href={ep.href}
                          onClick={onClose}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                        >
                          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                            {ep.thumbnail ? (
                              <Image
                                src={ep.thumbnail}
                                alt=""
                                fill
                                sizes="80px"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                unoptimized={ep.thumbnail.includes("ytimg.com")}
                              />
                            ) : null}
                            <span className="absolute left-1 top-1 rounded bg-ink/85 px-1.5 py-0.5 text-[9px] font-mono text-white">
                              T{ep.seasonNumber}E{ep.episodeNumber}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[14px] font-medium leading-snug text-white">
                              {ep.title}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="border-t border-white/8 px-5 py-3">
                <Link
                  href={`/buscar?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.18em] text-white hover:text-gold-700 transition-colors"
                >
                  Ver todos los resultados
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
