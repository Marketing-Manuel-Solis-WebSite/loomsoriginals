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

      <section className="relative bg-paper overflow-hidden">
        {backdrop ? (
          <>
            <div className="absolute inset-0 -z-10">
              <Image
                src={backdrop}
                alt=""
                aria-hidden
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-30"
                unoptimized={backdrop.includes("ytimg.com")}
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/85 to-white"
            />
          </>
        ) : null}

        <Container size="xl" className="relative grid gap-10 pb-14 pt-28 md:grid-cols-[240px_1fr] md:gap-14 md:pt-36">
          <div className="hidden md:block">
            {series.poster_url ? (
              <Image
                src={series.poster_url}
                alt={`${series.title_es} poster`}
                width={240}
                height={360}
                className="rounded-2xl ring-1 ring-gray-200 shadow-lg"
              />
            ) : backdrop ? (
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl ring-1 ring-gray-200 shadow-lg">
                <Image
                  src={backdrop}
                  alt={series.title_es}
                  fill
                  sizes="240px"
                  className="object-cover"
                  unoptimized={backdrop.includes("ytimg.com")}
                />
              </div>
            ) : null}
          </div>
          <div className="animate-blur-in">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
              <span className="h-px w-8 bg-gold-500" />
              Serie original de Loom
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,7vw,5.5rem)] italic leading-[0.98] text-ink text-balance">
              {series.title_es}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              {series.release_year ? (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5">
                  {series.release_year}
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5">
                {totalEpisodes} episodios
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5">
                {series.seasons.length} temporada{series.seasons.length > 1 ? "s" : ""}
              </span>
            </div>
            {series.synopsis_es ? (
              <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-gray-700 text-pretty">
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
        <section key={season.id} className="py-14">
          <Container size="xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-3xl italic text-ink">
                {season.title_es ?? `Temporada ${season.season_number}`}
              </h2>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-700">
                {season.episodes?.length ?? 0} episodios
              </span>
            </div>
            <ul className="space-y-3">
              {(season.episodes ?? []).map((ep) => (
                <li key={ep.id}>
                  <Link
                    href={`/series/${series.slug}/t${season.season_number}/${ep.slug}`}
                    prefetch
                    className="group grid grid-cols-[100px_1fr] items-center gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-paper sm:grid-cols-[auto_240px_1fr_auto] sm:gap-5"
                  >
                    <span className="hidden sm:block w-10 font-display text-5xl italic leading-none text-gray-300 group-hover:text-gold-500 transition-colors">
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
                      <h3 className="line-clamp-1 text-[17px] font-medium text-ink group-hover:text-gold-700 transition-colors">
                        {ep.title_es}
                      </h3>
                      {ep.synopsis_es ? (
                        <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-gray-600">
                          {ep.synopsis_es}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-gray-500">
                        {ep.duration_seconds ? <span>{formatDuration(ep.duration_seconds)}</span> : null}
                        <span>T{season.season_number}:E{ep.episode_number}</span>
                      </div>
                    </div>
                    <ChevronRight className="hidden sm:block h-5 w-5 text-gray-300 transition-all group-hover:text-gold-700 group-hover:translate-x-1" />
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
