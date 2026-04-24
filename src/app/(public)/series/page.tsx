import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SeriesCard } from "@/components/home/SeriesCard";
import { getAllSeries } from "@/lib/queries/getSeries";
import { BreadcrumbJsonLd, CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Todas las series — Loom Originals",
  description:
    "Explore todas las series producidas por Loom Originals. Historias reales de familias migrantes en Estados Unidos, contadas por el Bufete Manuel Solís.",
  alternates: { canonical: "/series" },
  openGraph: {
    title: "Todas las series — Loom Originals",
    description: "Todas las series de Loom Originals en un solo lugar.",
    url: `${SITE.url}/series`,
    type: "website",
  },
};

export default async function SeriesIndexPage() {
  const series = await getAllSeries().catch(() => []);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Series", url: `${SITE.url}/series` },
        ]}
      />
      <CollectionPageJsonLd
        name="Todas las series — Loom Originals"
        description="Catálogo de series de Loom Originals."
        url={`${SITE.url}/series`}
        items={series.map((s) => ({
          name: s.title_es,
          url: `${SITE.url}/series/${s.slug}`,
        }))}
      />
      <Container size="xl" className="pt-28 pb-24">
        <header className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
            <span className="h-px w-8 bg-gold-500" />
            Biblioteca Loom
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] italic leading-none text-ink text-balance">
            Todas las series
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-gray-600 text-pretty sm:text-[17px]">
            Cada serie es una mirada distinta al sistema migratorio estadounidense, siempre desde
            las voces de las familias que lo viven.
          </p>
        </header>
        {series.length ? (
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3">
            {series.map((s) => (
              <SeriesCard key={s.id} series={s} variant="backdrop" fullWidth />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-gray-500">La biblioteca aparecerá aquí cuando se cargue el catálogo.</p>
        )}
      </Container>
    </>
  );
}
