import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Play, ArrowUpRight, Library, Star, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ContentRail } from "@/components/home/ContentRail";
import { Top10Card } from "@/components/home/Top10Card";
import { EpisodeCard } from "@/components/home/EpisodeCard";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { getLatestEpisodes } from "@/lib/queries/getEpisode";
import { BreadcrumbJsonLd, CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";
import { youtubeThumbnailUrl, withUtm } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Todas las series — Looms Originals",
  description:
    "Explore todas las series producidas por Looms Originals. Historias reales de familias migrantes en Estados Unidos, contadas por Law Offices of Manuel Solís.",
  alternates: { canonical: "/series" },
  openGraph: {
    title: "Todas las series — Looms Originals",
    description: "Todas las series de Looms Originals en un solo lugar.",
    url: `${SITE.url}/series`,
    type: "website",
  },
};

type DetailedSeries = Awaited<ReturnType<typeof getAllSeries>>[number] & {
  meta: {
    seasons: number;
    episodes: number;
    firstEpHref: string | null;
    totalDurationSec: number;
    flatEpisodes: Awaited<ReturnType<typeof getLatestEpisodes>>;
    seasonByEpisodeId: Record<string, number>;
  };
};

export default async function SeriesIndexPage() {
  const [series, latest] = await Promise.all([
    getAllSeries().catch(() => []),
    getLatestEpisodes(10).catch(() => []),
  ]);

  const detailed: DetailedSeries[] = await Promise.all(
    series.map(async (s) => {
      const detail = await getSeriesBySlug(s.slug).catch(() => null);
      const seasons = detail?.seasons ?? [];
      const seasonsCount = seasons.length;
      const flatEpisodes = seasons.flatMap((season) => season.episodes ?? []);
      const episodesCount = flatEpisodes.length;
      const totalDurationSec = flatEpisodes.reduce(
        (acc, ep) => acc + (ep.duration_seconds ?? 0),
        0
      );
      const seasonByEpisodeId: Record<string, number> = {};
      for (const season of seasons) {
        for (const ep of season.episodes ?? []) {
          seasonByEpisodeId[ep.id] = season.season_number;
        }
      }
      const firstSeason = seasons[0];
      const firstEp = firstSeason?.episodes?.[0];
      return {
        ...s,
        meta: {
          seasons: seasonsCount,
          episodes: episodesCount,
          totalDurationSec,
          flatEpisodes,
          seasonByEpisodeId,
          firstEpHref:
            firstSeason && firstEp
              ? `/series/${s.slug}/t${firstSeason.season_number}/${firstEp.slug}`
              : null,
        },
      };
    })
  );

  // Build a global seriesSlug lookup (used by Top 10)
  const seriesBySlug = Object.fromEntries(series.map((s) => [s.id, s.slug]));
  const globalSeasonById: Record<string, number> = {};
  for (const d of detailed) {
    for (const [id, n] of Object.entries(d.meta.seasonByEpisodeId)) {
      globalSeasonById[id] = n;
    }
  }

  const featured = detailed.find((s) => s.is_featured) ?? detailed[0] ?? null;
  const others = detailed.filter((s) => s.id !== featured?.id);

  const totalEpisodes = detailed.reduce((acc, s) => acc + s.meta.episodes, 0);
  const totalHours = Math.round(
    detailed.reduce((acc, s) => acc + s.meta.totalDurationSec, 0) / 3600
  );
  const totalSeasons = detailed.reduce((acc, s) => acc + s.meta.seasons, 0);

  const featuredBackdrop = featured
    ? featured.backdrop_url ??
      (featured.trailer_youtube_id
        ? youtubeThumbnailUrl(featured.trailer_youtube_id, "maxres")
        : null)
    : null;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Series", url: `${SITE.url}/series` },
        ]}
      />
      <CollectionPageJsonLd
        name="Todas las series — Looms Originals"
        description="Catálogo completo de series de Looms Originals."
        url={`${SITE.url}/series`}
        items={detailed.map((s) => ({
          name: s.title_es,
          url: `${SITE.url}/series/${s.slug}`,
        }))}
      />

      {/* ─── Netflix billboard hero — full-bleed backdrop, bottom-anchored text ─── */}
      {featured ? (
        <section className="relative isolate flex min-h-[88dvh] overflow-hidden bg-ink text-white">
          {/* Full-bleed backdrop */}
          {featuredBackdrop ? (
            <div className="absolute inset-0 -z-10">
              <Image
                src={featuredBackdrop}
                alt=""
                aria-hidden
                fill
                priority
                fetchPriority="high"
                sizes="100vw"
                className="object-cover object-center scale-[1.02] animate-hero-zoom"
                unoptimized={featuredBackdrop.includes("ytimg.com")}
              />
              {/* Bottom-up gradient — heavy at bottom for text legibility */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 via-25% to-transparent"
              />
              {/* Left-to-right gradient — fade right side */}
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

          {/* Top edge: catalog meta strip */}
          <div className="absolute inset-x-0 top-0 z-20 pt-24 md:pt-28">
            <Container size="xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
                <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-gold-300">
                  <Library className="h-3.5 w-3.5" />
                  Biblioteca Looms
                </p>
                <p className="hidden md:inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
                  {detailed.length} serie{detailed.length === 1 ? "" : "s"} · {totalEpisodes}{" "}
                  episodios · ~{totalHours}h
                </p>
                <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink shadow-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
                  Top 1 · Esta semana
                </span>
              </div>
            </Container>
          </div>

          {/* Bottom-anchored content — Netflix billboard style */}
          <Container size="xl" className="relative z-10 mt-auto pb-16 pt-40 md:pb-24 md:pt-48">
            <div className="max-w-2xl animate-hero-rise">
              <p className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gold-400/20 ring-1 ring-gold-400/40">
                  <Star className="h-3 w-3 text-gold-300" fill="currentColor" />
                </span>
                Serie destacada
              </p>

              <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7.5rem)] italic leading-[0.88] tracking-[-0.025em] text-white text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
                {featured.title_es}
              </h1>

              {featured.synopsis_es ? (
                <p className="mt-6 max-w-xl text-[16.5px] leading-[1.65] text-white/90 line-clamp-3 text-pretty drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                  {featured.synopsis_es}
                </p>
              ) : null}

              {/* Inline meta — single row, no pills, just dots */}
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] font-medium text-white/85">
                {featured.release_year ? (
                  <span>{featured.release_year}</span>
                ) : null}
                {featured.release_year ? <span aria-hidden className="text-white/30">·</span> : null}
                {featured.meta.seasons > 0 ? (
                  <span>
                    {featured.meta.seasons} temporada{featured.meta.seasons !== 1 ? "s" : ""}
                  </span>
                ) : null}
                {featured.meta.seasons > 0 && featured.meta.episodes > 0 ? (
                  <span aria-hidden className="text-white/30">·</span>
                ) : null}
                {featured.meta.episodes > 0 ? (
                  <span>{featured.meta.episodes} episodios</span>
                ) : null}
                <span aria-hidden className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                  HD
                </span>
                <span aria-hidden className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1 text-gold-300">
                  <Star className="h-3 w-3" fill="currentColor" /> Caso real verificado
                </span>
              </div>

              {/* Big CTAs — Netflix style: white play + glass info */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink
                  href={featured.meta.firstEpHref ?? `/series/${featured.slug}`}
                  size="lg"
                  className="bg-white text-ink hover:bg-white/90 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
                >
                  <Play className="h-5 w-5" fill="currentColor" />
                  {featured.meta.firstEpHref ? "Reproducir" : "Ver la serie"}
                </ButtonLink>
                <ButtonLink
                  href={`/series/${featured.slug}`}
                  size="lg"
                  className="bg-white/15 backdrop-blur-md text-ink border border-white/25 hover:bg-white/25 hover:border-white/50"
                >
                  <Heart className="h-4 w-4" />
                  Más información
                </ButtonLink>
              </div>
            </div>
          </Container>

          {/* Bottom edge fade into next section */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-paper/0"
          />
        </section>
      ) : null}

      {/* ─── Top 10 rail (Netflix-style — numeral on the left of the tile) ─── */}
      {latest.length ? (
        <section className="relative bg-paper py-14">
          <div className="mx-auto max-w-[1440px] flex items-end justify-between gap-6 px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72 mb-8">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
                <span className="h-px w-8 bg-gold-500" />
                Top 10 · Recién estrenados
              </p>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] italic leading-tight text-white">
                Lo más visto esta semana
              </h2>
            </div>
            <p className="hidden md:block text-[13px] text-gray-500 max-w-xs text-right">
              Episodios destacados por la audiencia editorial.
            </p>
          </div>
          <div className="no-scrollbar flex items-end gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory px-8 sm:gap-3 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72 pb-6">
            {latest.slice(0, 10).map((ep, i) => (
              <Top10Card
                key={ep.id}
                episode={ep}
                rank={i + 1}
                seriesSlug={seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis"}
                seasonNumber={globalSeasonById[ep.id] ?? 1}
                priority={i < 2}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ─── Catalog stats strip ─── */}
      {detailed.length ? (
        <section className="bg-paper border-y border-gray-200">
          <Container size="xl" className="py-10">
            <div className="grid gap-8 sm:grid-cols-3 sm:gap-4">
              <BigStat label="Series originales" value={detailed.length} />
              <BigStat label="Episodios disponibles" value={totalEpisodes} />
              <BigStat
                label="Horas de archivo"
                value={`${totalHours}+`}
                hint={`${totalSeasons} temporada${totalSeasons !== 1 ? "s" : ""}`}
              />
            </div>
          </Container>
        </section>
      ) : null}

      {/* ─── Per-series rails (each series = one ContentRail) ─── */}
      <section className="bg-paper py-14">
        {detailed.length ? (
          <div className="space-y-12">
            {/* Featured series first, then the rest */}
            {[featured, ...others].filter((s): s is DetailedSeries => Boolean(s)).map((s, i) => {
              if (!s.meta.flatEpisodes.length) {
                return <SeriesTeaser key={s.id} series={s} index={i + 1} />;
              }
              const eyebrowParts = [
                s.is_featured ? "Serie destacada" : "Serie original",
                `${s.meta.episodes} episodios`,
                s.release_year ? String(s.release_year) : null,
              ].filter(Boolean);
              return (
                <ContentRail
                  key={s.id}
                  title={s.title_es}
                  eyebrow={eyebrowParts.join(" · ")}
                  railNumber={String(i + 1).padStart(2, "0")}
                  seeAllHref={`/series/${s.slug}`}
                  seeAllLabel="Ver detalle"
                >
                  {s.meta.flatEpisodes.map((ep, idx) => (
                    <EpisodeCard
                      key={ep.id}
                      episode={ep}
                      seriesSlug={s.slug}
                      seasonNumber={s.meta.seasonByEpisodeId[ep.id] ?? 1}
                      priority={i === 0 && idx < 2}
                    />
                  ))}
                </ContentRail>
              );
            })}
          </div>
        ) : (
          <Container size="xl">
            <div className="rounded-3xl glass-card px-8 py-16 text-center shadow-sm">
              <p className="font-display text-3xl italic text-white">El catálogo aparecerá aquí</p>
              <p className="mt-3 max-w-md mx-auto text-[15px] text-gray-600">
                Las series y episodios se cargarán cuando se conecte la base de datos.
              </p>
            </div>
          </Container>
        )}
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="relative bg-paper py-24 border-t border-gray-200">
        <Container size="xl">
          <div className="relative overflow-hidden rounded-[32px] glass-premium ring-gold-inset px-8 py-14 sm:px-14 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-200/70 blur-3xl"
            />
            <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-16">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
                  <span className="h-px w-10 bg-gold-500" />
                  ¿Tiene una historia?
                </p>
                <h3 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.5rem)] italic text-white leading-[1] text-balance">
                  Documentamos casos reales con consentimiento, contexto y cuidado.
                </h3>
                <p className="mt-5 max-w-xl text-[15.5px] leading-[1.7] text-gray-600 text-pretty">
                  Si vivió un proceso migratorio que cree que merece ser contado, escríbanos.
                  Evaluamos cada caso con discreción antes de considerar producir un episodio.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <ButtonLink href="/contacto" variant="primary" size="lg">
                    Compartir mi historia
                    <ArrowUpRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink
                    href={withUtm(SITE.lawFirm.consultationUrl, {
                      source: "looms",
                      medium: "series-bottom",
                      campaign: "consulta",
                    })}
                    variant="ghost"
                    size="lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hablar con un abogado
                  </ButtonLink>
                </div>
              </div>
              <ul className="space-y-4 text-[14.5px] text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>
                    <strong className="text-white">Confidencial.</strong> Toda conversación queda
                    bajo NDA si así lo prefiere.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>
                    <strong className="text-white">Editorial, no publicidad.</strong> Las historias
                    se cuentan con rigor periodístico.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>
                    <strong className="text-white">Su voz, su versión.</strong> Cada familia revisa
                    el corte final antes de la publicación.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function BigStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="text-center">
      <p className="font-display text-[clamp(2rem,4vw,3.5rem)] italic leading-none text-white">
        {value}
      </p>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-700">
        {label}
      </p>
      {hint ? <p className="mt-1 text-[12px] text-gray-500">{hint}</p> : null}
    </div>
  );
}

function SeriesTeaser({
  series,
  index,
}: {
  series: DetailedSeries;
  index: number;
}) {
  const backdrop =
    series.backdrop_url ??
    (series.trailer_youtube_id ? youtubeThumbnailUrl(series.trailer_youtube_id, "maxres") : null);
  return (
    <Container size="xl">
      <Link
        href={`/series/${series.slug}`}
        className="group relative block overflow-hidden rounded-[28px] bg-paper ring-1 ring-white/10 transition-all duration-500 ease-apple hover:-translate-y-1 hover:ring-gold-400/60 hover:shadow-[0_30px_60px_-25px_rgba(9,9,11,0.25)]"
      >
        <div className="grid md:grid-cols-[1.4fr_1fr]">
          <div className="relative aspect-video md:aspect-auto bg-gray-100">
            {backdrop ? (
              <Image
                src={backdrop}
                alt={series.title_es}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-apple group-hover:scale-[1.04]"
                unoptimized={backdrop.includes("ytimg.com")}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-cream via-paper to-parchment" />
            )}
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-700 shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              Próximamente · {String(index).padStart(2, "0")}
            </span>
          </div>
          <div className="relative flex flex-col justify-center gap-4 p-8 sm:p-10">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-gold-700">
              Serie original
            </p>
            <h3 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] italic leading-tight text-white">
              {series.title_es}
            </h3>
            {series.synopsis_es ? (
              <p className="text-[14.5px] leading-[1.65] text-gray-600 text-pretty line-clamp-3">
                {series.synopsis_es}
              </p>
            ) : null}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white group-hover:text-gold-700 transition-colors">
              Ver detalle
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-400 ease-apple group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </Container>
  );
}
