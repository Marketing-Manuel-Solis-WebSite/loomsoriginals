import type { Metadata } from "next";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EpisodeCard } from "@/components/home/EpisodeCard";
import { searchEpisodes } from "@/lib/queries/search";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Buscar — Looms Originals",
  description:
    "Encuentre episodios de Looms Originals por tema, caso migratorio o palabras clave.",
  alternates: { canonical: "/buscar" },
};

const SUGGESTIONS = [
  { label: "Reunificación familiar", code: "I-130" },
  { label: "Asilo político", code: "VAWA · TPS" },
  { label: "I-130 hermanos", code: "F2B" },
  { label: "VAWA", code: "Protección" },
  { label: "H-1B rechazada", code: "H-1B" },
  { label: "Cancelación de remoción", code: "240A" },
  { label: "Examen de ciudadanía", code: "N-400" },
  { label: "Petición abandonada", code: "USCIS" },
];

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const episodes = query
    ? await searchEpisodes(query, "es", 40).catch(() => [])
    : [];

  const series = await getAllSeries().catch(() => []);
  const seriesBySlug = Object.fromEntries(series.map((s) => [s.id, s.slug]));
  const seasonById: Record<string, number> = {};
  if (episodes.length) {
    await Promise.all(
      series.map(async (s) => {
        const detail = await getSeriesBySlug(s.slug).catch(() => null);
        if (!detail) return;
        for (const season of detail.seasons) {
          for (const ep of season.episodes ?? []) {
            seasonById[ep.id] = season.season_number;
          }
        }
      })
    );
  }

  return (
    <>
      <WebPageJsonLd
        url={`${SITE.url}/buscar`}
        name="Buscar — Looms Originals"
        description="Buscador editorial. Encuentre episodios por tema, código de visa o nombre de caso."
        type={query ? "SearchResultsPage" : "WebPage"}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Buscar", url: `${SITE.url}/buscar` },
        ]}
      />

      {/* ─── Editorial hero ─── */}
      <section className="relative overflow-hidden bg-paper pt-32 pb-20 md:pt-40 md:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <Container size="xl" className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700 animate-fade">
            <SearchIcon className="h-3.5 w-3.5" />
            Buscador editorial
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,8vw,6.5rem)] italic leading-[0.95] tracking-[-0.02em] text-white text-balance animate-hero-rise">
            Buscar <span className="text-gold-gradient">historias.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-[1.7] text-gray-600 text-pretty">
            Escriba un tema, un código de visa o el nombre de un caso. Nuestro archivo está
            indexado por título y sinopsis.
          </p>

          {/* Search form */}
          <form
            role="search"
            action="/buscar"
            method="get"
            className="mt-10 flex w-full max-w-2xl items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm transition-all focus-within:border-gold-400 focus-within:shadow-md"
          >
            <SearchIcon className="h-5 w-5 shrink-0 text-gold-600" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={query}
              autoComplete="off"
              placeholder="Buscar casos, temas, abogados…"
              aria-label="Buscar en Looms Originals"
              className="flex-1 bg-transparent text-[16px] font-medium text-white placeholder:text-gray-400 outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-ink px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-gray-800 transition-colors"
            >
              Buscar
            </button>
          </form>
        </Container>
      </section>

      {/* ─── Results or suggestions ─── */}
      <section className="bg-paper pb-28">
        <Container size="xl">
          {query ? (
            <div aria-live="polite">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                {episodes.length} resultado{episodes.length === 1 ? "" : "s"} para
                <span className="ml-1 font-display italic normal-case text-white">
                  &ldquo;{query}&rdquo;
                </span>
              </p>

              {episodes.length ? (
                <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {episodes.map((ep) => {
                    const seriesSlug =
                      seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis";
                    const seasonNumber = seasonById[ep.id] ?? 1;
                    return (
                      <EpisodeCard
                        key={ep.id}
                        episode={ep}
                        seriesSlug={seriesSlug}
                        seasonNumber={seasonNumber}
                        size="lg"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="mt-12 rounded-3xl glass-card px-8 py-12 text-center shadow-sm">
                  <p className="font-display text-3xl italic text-white">Sin resultados.</p>
                  <p className="mt-3 text-[15px] text-gray-600">
                    No encontramos episodios que coincidan con su búsqueda. Pruebe con otra
                    palabra clave.
                  </p>
                  <ul className="mt-8 flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.slice(0, 5).map((s) => (
                      <li key={s.label}>
                        <a
                          href={`/buscar?q=${encodeURIComponent(s.label)}`}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-paper px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:border-gold-400 hover:text-gold-700"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid items-end gap-6 md:grid-cols-[1fr_auto] md:gap-12 mb-10">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                  <span className="h-px w-8 bg-gold-500" />
                  Búsquedas frecuentes
                </p>
                <p className="text-[14px] text-gray-500 md:text-right">
                  Empiece por un tema o un código.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {SUGGESTIONS.map((s, i) => (
                  <a
                    key={s.label}
                    href={`/buscar?q=${encodeURIComponent(s.label)}`}
                    className="group relative overflow-hidden rounded-2xl glass-card px-6 py-5 transition-all duration-500 ease-apple hover:-translate-y-1 hover:ring-gold-400/60 hover:shadow-md"
                  >
                    <span className="absolute right-5 top-5 font-display text-xl italic leading-none text-gray-300 group-hover:text-gold-500 transition-colors">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-700">
                      {s.code}
                    </p>
                    <p className="mt-3 font-display text-[20px] italic leading-tight text-white">
                      {s.label}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white group-hover:text-gold-700 transition-colors">
                      Buscar
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-400 ease-apple group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  );
}
