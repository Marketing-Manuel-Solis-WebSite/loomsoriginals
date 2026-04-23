import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    title: `${cat.name_es} — Loom Originals`,
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
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.1),transparent_60%)]"
        />
        <Container size="xl" className="relative pt-32 pb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
            Categoría
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5.5rem)] italic leading-[0.95] text-ivory-50 text-balance">
            {cat.name_es}
          </h1>
          {cat.description_es ? (
            <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-ivory-200/85 text-pretty">
              {cat.description_es}
            </p>
          ) : null}
        </Container>
      </section>
      <Container size="xl" className="pb-24">
        {episodes.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <p className="mt-12 text-ivory-200/70">
            Aún no hay episodios publicados en esta categoría.
          </p>
        )}
      </Container>
    </>
  );
}
