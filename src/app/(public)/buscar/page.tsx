import type { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EpisodeCard } from "@/components/home/EpisodeCard";
import { searchEpisodes } from "@/lib/queries/search";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Buscar — Loom Originals",
  description: "Encuentre episodios de Loom Originals por tema, caso migratorio o palabras clave.",
  alternates: { canonical: "/buscar" },
};

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const episodes = query ? await searchEpisodes(query, "es", 40).catch(() => []) : [];

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
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Buscar", url: `${SITE.url}/buscar` },
        ]}
      />
      <Container size="lg" className="pt-32 pb-24">
        <h1 className="text-center font-display text-[clamp(2.25rem,5vw,3.75rem)] italic leading-none text-ivory-50">
          Buscar historias
        </h1>
        <form
          role="search"
          action="/buscar"
          method="get"
          className="glass-strong mx-auto mt-10 flex max-w-3xl items-center gap-3 rounded-full px-5 py-3"
        >
          <SearchIcon className="h-5 w-5 text-gold-500" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoComplete="off"
            placeholder="Buscar casos, temas, abogados…"
            aria-label="Buscar en Loom Originals"
            className="flex-1 bg-transparent text-[17px] font-display italic text-ivory-50 placeholder:text-ivory-200/50 outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400 transition-colors"
          >
            Buscar
          </button>
        </form>

        {query ? (
          <section aria-live="polite" className="mt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-500">
              {episodes.length} resultado{episodes.length === 1 ? "" : "s"} para “{query}”
            </p>
            {episodes.length ? (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {episodes.map((ep) => {
                  const seriesSlug = seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis";
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
              <p className="mt-8 text-ivory-200/70">
                Sin resultados. Intente con otra palabra: reunificación, asilo, I-130, VAWA, H-1B…
              </p>
            )}
          </section>
        ) : (
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Reunificación familiar",
              "Asilo por violencia",
              "I-130 hermanos",
              "VAWA",
              "H-1B rechazada",
              "Cancelación de remoción",
              "Ciudadanía examen",
              "Petición abandonada",
            ].map((s) => (
              <a
                key={s}
                href={`/buscar?q=${encodeURIComponent(s)}`}
                className="glass block rounded-2xl px-5 py-4 text-ivory-100 hover:border-gold-500/40 hover:text-gold-400 transition-colors"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-500">
                  Ejemplo
                </span>
                <span className="mt-1 block font-display text-lg italic">{s}</span>
              </a>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
