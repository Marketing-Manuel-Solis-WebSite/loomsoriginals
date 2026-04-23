import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Thumbnail } from "@/components/home/Thumbnail";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { FavoriteButton } from "@/components/episode/FavoriteButton";
import { getSeriesBySlug } from "@/lib/queries/getSeries";
import { SITE } from "@/lib/site";
import { formatDuration, youtubeThumbnailUrl } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug).catch(() => null);
  if (!series) return { title: "Serie" };
  const description =
    series.synopsis_es ??
    `Serie original de Loom Originals producida por el Bufete Manuel Solís.`;
  const url = `${SITE.url}/series/${series.slug}`;
  const image =
    series.backdrop_url ??
    (series.trailer_youtube_id ? youtubeThumbnailUrl(series.trailer_youtube_id) : "/og-default.jpg");
  return {
    title: series.title_es,
    description,
    alternates: {
      canonical: `/series/${series.slug}`,
      languages: {
        "es-US": `/series/${series.slug}`,
        "en-US": `/en/series/${series.slug}`,
      },
    },
    openGraph: {
      type: "video.tv_show",
      title: `${series.title_es} — Loom Originals`,
      description,
      url,
      siteName: SITE.name,
      images: [{ url: image, width: 1280, height: 720, alt: series.title_es }],
    },
    twitter: {
      card: "summary_large_image",
      title: series.title_es,
      description,
      images: [image],
    },
  };
}

export default async function SeriesPage({ params }: { params: Params }) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug).catch(() => null);
  if (!series) notFound();

  const firstSeason = series.seasons[0];
  const firstEpisode = firstSeason?.episodes?.[0];
  const totalEpisodes = series.seasons.reduce(
    (acc, s) => acc + (s.episodes?.length ?? 0),
    0
  );
  const backdrop =
    series.backdrop_url ??
    (series.trailer_youtube_id ? youtubeThumbnailUrl(series.trailer_youtube_id) : null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: series.title_es,
    alternateName: series.title_en ?? undefined,
    url: `${SITE.url}/series/${series.slug}`,
    description: series.synopsis_es ?? undefined,
    image: backdrop ?? undefined,
    datePublished: series.release_year ? `${series.release_year}-01-01` : undefined,
    numberOfSeasons: series.seasons.length,
    numberOfEpisodes: totalEpisodes,
    inLanguage: ["es", "en"],
    productionCompany: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.lawFirm.name,
      url: SITE.lawFirm.url,
    },
  } as const;

  return (
    <>
      <JsonLd data={jsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Series", url: `${SITE.url}/series` },
          { name: series.title_es, url: `${SITE.url}/series/${series.slug}` },
        ]}
      />

      <section className="relative min-h-[70dvh] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {backdrop ? (
            <Image
              src={backdrop}
              alt=""
              aria-hidden
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-70"
              unoptimized={backdrop.includes("ytimg.com")}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
          )}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 gradient-hero-fade" />
        <div aria-hidden className="pointer-events-none absolute inset-0 gradient-hero-side" />

        <Container size="xl" className="relative grid gap-10 pb-12 pt-32 md:grid-cols-[220px_1fr] md:gap-12 md:pt-40">
          <div className="hidden md:block">
            {series.poster_url ? (
              <Image
                src={series.poster_url}
                alt={`${series.title_es} poster`}
                width={240}
                height={360}
                className="rounded-2xl ring-1 ring-gold-500/20 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.6)]"
              />
            ) : null}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
              Serie original de Loom
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,5.5rem)] italic leading-[0.95] text-ivory-50 text-balance">
              {series.title_es}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory-100/80">
              {series.release_year ? (
                <span className="glass-flat rounded-full px-3 py-1">{series.release_year}</span>
              ) : null}
              <span className="glass-flat rounded-full px-3 py-1">
                {totalEpisodes} episodios
              </span>
              <span className="glass-flat rounded-full px-3 py-1">
                {series.seasons.length} temporada{series.seasons.length > 1 ? "s" : ""}
              </span>
            </div>
            {series.synopsis_es ? (
              <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-ivory-200/85 text-pretty">
                {series.synopsis_es}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {firstEpisode ? (
                <ButtonLink
                  href={`/series/${series.slug}/t${firstSeason.season_number}/${firstEpisode.slug}`}
                  variant="primary"
                  size="lg"
                >
                  <Play className="h-5 w-5" fill="currentColor" />
                  Reproducir T{firstSeason.season_number}:E{firstEpisode.episode_number}
                </ButtonLink>
              ) : null}
              <FavoriteButton seriesId={series.id} />
            </div>
          </div>
        </Container>
      </section>

      {series.seasons.map((season) => (
        <section key={season.id} className="py-12">
          <Container size="xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-3xl italic text-ivory-50">
                {season.title_es ?? `Temporada ${season.season_number}`}
              </h2>
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-500">
                {season.episodes?.length ?? 0} episodios
              </span>
            </div>
            <ul className="space-y-3">
              {(season.episodes ?? []).map((ep) => (
                <li key={ep.id}>
                  <Link
                    href={`/series/${series.slug}/t${season.season_number}/${ep.slug}`}
                    prefetch
                    className="group grid grid-cols-[100px_1fr] items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-white/[0.04] sm:grid-cols-[240px_auto_1fr_auto]"
                  >
                    <span className="hidden sm:block font-display text-5xl italic leading-none text-gold-500/40 group-hover:text-gold-500 transition-colors">
                      {String(ep.episode_number).padStart(2, "0")}
                    </span>
                    <Thumbnail
                      youtubeId={ep.youtube_id}
                      thumbnailUrl={ep.thumbnail_url}
                      alt={ep.title_es}
                      className="w-[100px] sm:w-[240px]"
                      sizes="240px"
                    />
                    <div className="min-w-0">
                      <h3 className="line-clamp-1 text-[17px] font-medium text-ivory-50 group-hover:text-gold-500 transition-colors">
                        {ep.title_es}
                      </h3>
                      {ep.synopsis_es ? (
                        <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-ivory-200/70">
                          {ep.synopsis_es}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-slate-400">
                        {ep.duration_seconds ? <span>{formatDuration(ep.duration_seconds)}</span> : null}
                        <span>T{season.season_number}:E{ep.episode_number}</span>
                      </div>
                    </div>
                    <ChevronRight className="hidden sm:block h-5 w-5 text-ivory-200/40 transition-all group-hover:text-gold-500 group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ))}
    </>
  );
}
