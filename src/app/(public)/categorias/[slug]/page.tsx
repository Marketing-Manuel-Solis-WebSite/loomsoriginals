import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Library } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EpisodeCard } from "@/components/home/EpisodeCard";
import { getCategoryBySlug, getEpisodesByCategory } from "@/lib/queries/getCategories";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug).catch(() => null);
  if (!cat) return { title: "Categoría" };
  return {
    title: `${cat.name_es} — Looms Originals`,
    description: cat.description_es ?? undefined,
    alternates: { canonical: `/categorias/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug).catch(() => null);
  if (!cat) notFound();
  const episodes = await getEpisodesByCategory(cat.slug, 48).catch(() => []);
  const series = await getAllSeries().catch(() => []);
  const seriesBySlug = Object.fromEntries(series.map((s) => [s.id, s.slug]));

  const seasonById: Record<string, number> = {};
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

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Categorías", url: `${SITE.url}/categorias` },
          { name: cat.name_es, url: `${SITE.url}/categorias/${cat.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-paper pt-32 pb-16 md:pt-40 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <Container size="xl" className="relative">
          <Link
            href="/categorias"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500 hover:text-gold-700 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Categorías
          </Link>
          <p className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <Library className="h-3.5 w-3.5" />
            Categoría · {episodes.length} episodio{episodes.length === 1 ? "" : "s"}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5.5rem)] italic leading-[0.95] tracking-[-0.018em] text-white text-balance">
            {cat.name_es}
          </h1>
          {cat.description_es ? (
            <p className="mt-5 max-w-2xl text-[16.5px] leading-[1.7] text-gray-600 text-pretty">
              {cat.description_es}
            </p>
          ) : null}
        </Container>
      </section>

      {/* Episodes grid */}
      <section className="bg-paper pb-28">
        <Container size="xl">
          {episodes.length ? (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.map((ep) => {
                const seriesSlug = seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis";
                const seasonNumber = seasonById[ep.id] ?? 1;
                return (
                  <div key={ep.id} className="w-full">
                    <EpisodeCard
                      episode={ep}
                      seriesSlug={seriesSlug}
                      seasonNumber={seasonNumber}
                      size="lg"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl glass-card px-8 py-16 text-center shadow-sm">
              <p className="font-display text-3xl italic text-white">Sin episodios</p>
              <p className="mt-3 text-[15px] text-gray-600">
                Aún no hay episodios publicados en esta categoría.
              </p>
              <Link
                href="/categorias"
                className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white hover:text-gold-700 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Volver a categorías
              </Link>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
