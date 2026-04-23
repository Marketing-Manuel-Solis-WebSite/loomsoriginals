import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SeriesCard } from "@/components/home/SeriesCard";
import { getAllSeries } from "@/lib/queries/getSeries";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Todas las series — Loom Originals",
  description:
    "Explore todas las series producidas por Loom Originals. Historias reales de familias migrantes en Estados Unidos, contadas por el Bufete Manuel Solís.",
  alternates: { canonical: "/series" },
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
      <Container size="xl" className="pt-28 pb-24">
        <header className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
            Biblioteca Loom
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] italic leading-none text-ivory-50 text-balance">
            Todas las series
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-ivory-200/85 text-pretty sm:text-[17px]">
            Cada serie es una mirada distinta al sistema migratorio estadounidense, siempre desde
            las voces de las familias que lo viven.
          </p>
        </header>
        {series.length ? (
          <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {series.map((s) => (
              <SeriesCard key={s.id} series={s} variant="poster" />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-ivory-200/70">La biblioteca aparecerá aquí cuando se cargue el catálogo.</p>
        )}
      </Container>
    </>
  );
}
