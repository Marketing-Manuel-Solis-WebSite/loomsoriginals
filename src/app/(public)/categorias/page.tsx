import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Users,
  Shield,
  Briefcase,
  Award,
  Scale,
  Film,
  Library,
  Play,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ContentRail } from "@/components/home/ContentRail";
import { EpisodeCard } from "@/components/home/EpisodeCard";
import { Top10Card } from "@/components/home/Top10Card";
import { getCategoriesWithEpisodes } from "@/lib/queries/getCategories";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { getLatestEpisodes } from "@/lib/queries/getEpisode";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";
import { youtubeThumbnailUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Categorías — Looms Originals",
  description:
    "Historias migrantes organizadas por categoría: reunificación familiar, asilo, visas de trabajo, ciudadanía, deportación y casos reales.",
  alternates: { canonical: "/categorias" },
  openGraph: {
    title: "Categorías — Looms Originals",
    description: "Navegue el archivo editorial por tipo de caso migratorio.",
    url: `${SITE.url}/categorias`,
    type: "website",
  },
};

const ICON_BY_SLUG: Record<string, typeof Users> = {
  "reunificacion-familiar": Users,
  asilo: Shield,
  "visas-de-trabajo": Briefcase,
  ciudadania: Award,
  deportacion: Scale,
  "casos-reales": Film,
};

export default async function CategoriasPage() {
  const [categoriesWith, allSeries, latest] = await Promise.all([
    getCategoriesWithEpisodes(12).catch(() => []),
    getAllSeries().catch(() => []),
    getLatestEpisodes(10).catch(() => []),
  ]);

  // Build seriesSlug + seasonNumber lookup tables (same pattern as HomePage)
  const seriesBySlug = Object.fromEntries(allSeries.map((s) => [s.id, s.slug]));
  const seasonNumberById: Record<string, number> = {};
  await Promise.all(
    allSeries.map(async (s) => {
      const detail = await getSeriesBySlug(s.slug).catch(() => null);
      if (!detail) return;
      for (const season of detail.seasons) {
        for (const ep of season.episodes ?? []) {
          seasonNumberById[ep.id] = season.season_number;
        }
      }
    })
  );

  const featured = categoriesWith[0] ?? null;
  const featuredCover =
    featured?.episodes[0]?.thumbnail_url ??
    (featured?.episodes[0]?.youtube_id
      ? youtubeThumbnailUrl(featured.episodes[0].youtube_id, "maxres")
      : null);

  return (
    <>
      <WebPageJsonLd
        url={`${SITE.url}/categorias`}
        name="Categorías — Looms Originals"
        description="Navegue el archivo editorial por tipo de caso migratorio."
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Categorías", url: `${SITE.url}/categorias` },
        ]}
      />

      {/* ─── Netflix billboard hero — full-bleed backdrop, video-centric ─── */}
      <section className="relative isolate flex min-h-[88dvh] overflow-hidden bg-ink text-white">
        {featuredCover ? (
          <div className="absolute inset-0 -z-10">
            <Image
              src={featuredCover}
              alt=""
              aria-hidden
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-center scale-[1.02] animate-hero-zoom"
              unoptimized={featuredCover.includes("ytimg.com")}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 via-25% to-transparent"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-br from-ink via-gray-900 to-ink"
          />
        )}

        {/* Top edge: navigation strip */}
        <div className="absolute inset-x-0 top-0 z-20 pt-24 md:pt-28">
          <Container size="xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
              <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-gold-300">
                <Library className="h-3.5 w-3.5" />
                Navegación editorial
              </p>
              <p className="hidden md:inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
                {categoriesWith.length} categorías ·{" "}
                {categoriesWith.reduce((acc, c) => acc + c.episodes.length, 0)} episodios
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
                Sala destacada
              </span>
            </div>
          </Container>
        </div>

        {/* Bottom-anchored content */}
        <Container size="xl" className="relative z-10 mt-auto pb-16 pt-40 md:pb-24 md:pt-48">
          <div className="max-w-2xl animate-hero-rise">
            <p className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-gold-400/20 ring-1 ring-gold-400/40">
                <Library className="h-3 w-3 text-gold-300" />
              </span>
              {featured ? "Categoría destacada" : "Navegación editorial"}
            </p>

            <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7.5rem)] italic leading-[0.88] tracking-[-0.025em] text-white text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
              {featured ? featured.name_es : "Seis caminos, una misión."}
            </h1>

            <p className="mt-6 max-w-xl text-[16.5px] leading-[1.65] text-white/90 line-clamp-3 text-pretty drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              {featured?.description_es ??
                "Testimonios organizados por el tipo de caso migratorio que afrontaron las familias. Cada categoría es una sala con su propio archivo — historias verificadas, casos reales, voces propias."}
            </p>

            {/* Inline meta */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] font-medium text-white/85">
              {featured ? (
                <>
                  <span>{featured.episodes.length} episodios</span>
                  <span aria-hidden className="text-white/30">·</span>
                </>
              ) : null}
              <span>{categoriesWith.length} categorías</span>
              <span aria-hidden className="text-white/30">·</span>
              <span className="inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                ES · EN
              </span>
              <span aria-hidden className="text-white/30">·</span>
              <span className="inline-flex items-center gap-1 text-gold-300">
                <Library className="h-3 w-3" />
                Casos reales verificados
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                href={featured ? `/categorias/${featured.slug}` : "/series"}
                size="lg"
                className="bg-white text-ink hover:bg-white/90 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
              >
                <Play className="h-5 w-5" fill="currentColor" />
                {featured ? `Explorar ${featured.name_es}` : "Ver el catálogo"}
              </ButtonLink>
              <ButtonLink
                href="/series"
                size="lg"
                className="bg-white/15 backdrop-blur-md text-ink border border-white/25 hover:bg-white/25 hover:border-white/50"
              >
                Todas las series
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Top picks rail (Netflix Top 10 treatment) ─── */}
      {latest.length ? (
        <section className="relative bg-paper py-14">
          <div className="mx-auto max-w-[1440px] flex items-end justify-between gap-6 px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72 mb-8">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
                <span className="h-px w-8 bg-gold-500" />
                Top 10 · Esta semana
              </p>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] italic leading-tight text-white">
                Lo más visto
              </h2>
            </div>
            <p className="hidden md:block text-[13px] text-gray-500 max-w-xs text-right">
              Episodios destacados por la audiencia editorial de esta semana.
            </p>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-8 sm:gap-4 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72 pb-6">
            {latest.slice(0, 10).map((ep, i) => (
              <Top10Card
                key={ep.id}
                episode={ep}
                rank={i + 1}
                seriesSlug={seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis"}
                seasonNumber={seasonNumberById[ep.id] ?? 1}
                priority={i < 2}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ─── Per-category rails (each category = one Netflix row) ─── */}
      <section className="bg-paper pb-20">
        {categoriesWith.length ? (
          <div className="space-y-14">
            {categoriesWith.map((c, i) => {
              const Icon = ICON_BY_SLUG[c.slug] ?? Library;
              return (
                <div key={c.id} className="relative">
                  {/* Header with icon + count */}
                  <div className="mx-auto mb-6 flex max-w-[1440px] items-end justify-between gap-6 px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl glass-card text-gold-700 shadow-sm transition-transform duration-500 ease-apple hover:rotate-[-4deg] hover:scale-105">
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <div>
                        <p className="mb-1 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                          Categoría {String(i + 1).padStart(2, "0")} · {c.episodes.length} episodios
                        </p>
                        <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] italic leading-tight text-white">
                          {c.name_es}
                        </h2>
                      </div>
                    </div>
                    <Link
                      href={`/categorias/${c.slug}`}
                      className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white hover:text-gold-700 transition-colors whitespace-nowrap"
                    >
                      Explorar archivo
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Description (only if present) */}
                  {c.description_es ? (
                    <div className="mx-auto max-w-[1440px] px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72 mb-5">
                      <p className="max-w-2xl text-[14px] leading-relaxed text-gray-600 text-pretty">
                        {c.description_es}
                      </p>
                    </div>
                  ) : null}

                  {/* Episode rail */}
                  <ContentRail
                    title=""
                    seeAllHref={`/categorias/${c.slug}`}
                    seeAllLabel="Ver todo"
                  >
                    {c.episodes.map((ep) => (
                      <EpisodeCard
                        key={ep.id}
                        episode={ep}
                        seriesSlug={seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis"}
                        seasonNumber={seasonNumberById[ep.id] ?? 1}
                      />
                    ))}
                  </ContentRail>
                </div>
              );
            })}
          </div>
        ) : (
          <Container size="xl">
            <div className="mt-12 rounded-3xl glass-card px-8 py-16 text-center shadow-sm">
              <p className="font-display text-3xl italic text-white">
                El catálogo aparecerá aquí
              </p>
              <p className="mt-3 max-w-md mx-auto text-[15px] text-gray-600">
                Las categorías y los episodios se cargarán cuando se conecte la base de datos.
              </p>
            </div>
          </Container>
        )}
      </section>

      {/* ─── Editorial pull quote ─── */}
      <section className="relative overflow-hidden bg-paper py-24 border-t border-gray-200">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-1/4 h-[420px] w-[640px] rounded-full bg-gold-100/50 blur-[140px]"
        />
        <Container size="xl">
          <figure className="mx-auto max-w-4xl text-center relative">
            <span className="font-display text-[6rem] italic leading-none text-gold-400 select-none">
              &ldquo;
            </span>
            <blockquote className="-mt-6 font-display text-[clamp(1.5rem,3vw,2.5rem)] italic leading-[1.3] text-white text-balance">
              No archivamos casos. Archivamos personas que confiaron su historia para que otros
              encuentren la suya.
            </blockquote>
            <figcaption className="mt-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
              Manifiesto editorial · Looms
            </figcaption>
          </figure>
        </Container>
      </section>
    </>
  );
}
