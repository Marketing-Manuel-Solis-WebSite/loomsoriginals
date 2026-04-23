import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { Transcript } from "@/components/episode/Transcript";
import { EpisodeCta } from "@/components/episode/EpisodeCta";
import { EpisodeCard } from "@/components/home/EpisodeCard";
import { ContentRail } from "@/components/home/ContentRail";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getEpisodeBySlug, getRelatedEpisodes } from "@/lib/queries/getEpisode";
import { getSeriesBySlug } from "@/lib/queries/getSeries";
import { SITE } from "@/lib/site";
import { absoluteUrl, formatDuration, formatDurationISO, youtubeThumbnailUrl } from "@/lib/utils";

type Params = Promise<{ slug: string; season: string; episodeSlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, episodeSlug } = await params;
  const ep = await getEpisodeBySlug(slug, episodeSlug).catch(() => null);
  if (!ep) return { title: "Episodio" };
  const title = `${ep.title_es}`;
  const description = ep.synopsis_es ?? `Episodio de ${ep.series.title_es}`;
  const ogImage = `/api/og/${ep.id}`;
  const canonical = `/series/${slug}/t${ep.season.season_number}/${ep.slug}`;
  const embedUrl = `${SITE.url}/embed/${ep.id}`;
  const keywords = (ep.tags ?? []).concat([
    ep.series.title_es,
    "inmigración",
    "Manuel Solís",
    "residencia permanente",
    "reunificación familiar",
  ]);
  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "video.episode",
      title: `${title} — ${ep.series.title_es}`,
      description,
      url: `${SITE.url}${canonical}`,
      siteName: SITE.name,
      locale: "es_US",
      videos: [
        {
          url: `https://www.youtube.com/watch?v=${ep.youtube_id}`,
          type: "text/html",
          width: 1280,
          height: 720,
        },
      ],
      images: [{ url: ogImage, width: 1200, height: 630, alt: ep.title_es }],
    },
    twitter: {
      card: "player",
      title,
      description,
      site: "@loomoriginals",
      images: [ogImage],
      players: [
        {
          playerUrl: embedUrl,
          streamUrl: `https://www.youtube.com/watch?v=${ep.youtube_id}`,
          width: 1280,
          height: 720,
        },
      ],
    },
    other: {
      "video:duration": String(ep.duration_seconds ?? ""),
      "video:release_date": ep.published_at ?? "",
      "video:series": ep.series.title_es,
      "article:published_time": ep.published_at ?? "",
      "article:author": SITE.lawFirm.name,
      "article:publisher": SITE.social.facebook,
    },
  };
}

export default async function EpisodePage({ params }: { params: Params }) {
  const { slug, episodeSlug } = await params;
  const ep = await getEpisodeBySlug(slug, episodeSlug).catch(() => null);
  if (!ep) notFound();

  const [seriesDetail, related] = await Promise.all([
    getSeriesBySlug(slug),
    getRelatedEpisodes(ep.series_id, ep.id, 10),
  ]);

  const allEpisodesInSeason = seriesDetail?.seasons
    .find((s) => s.season_number === ep.season.season_number)
    ?.episodes ?? [];
  const nextEp = allEpisodesInSeason.find((e) => e.episode_number === ep.episode_number + 1);

  const canonical = `/series/${slug}/t${ep.season.season_number}/${ep.slug}`;

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: ep.title_es,
    description: ep.synopsis_es ?? undefined,
    thumbnailUrl: [
      ep.thumbnail_url ??
        (ep.youtube_id ? youtubeThumbnailUrl(ep.youtube_id) : undefined),
    ].filter(Boolean),
    uploadDate: ep.published_at ?? undefined,
    duration: formatDurationISO(ep.duration_seconds),
    contentUrl: `https://www.youtube.com/watch?v=${ep.youtube_id}`,
    embedUrl: `https://www.youtube.com/embed/${ep.youtube_id}`,
    inLanguage: "es",
    transcript: ep.transcript_es ?? undefined,
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    isPartOf: {
      "@type": "TVSeries",
      name: ep.series.title_es,
      url: `${SITE.url}/series/${ep.series.slug}`,
    },
    regionsAllowed: "US",
    genre: "Documentary",
    keywords: (ep.tags ?? []).join(", "),
  } as const;

  const episodeJsonLd = {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: ep.title_es,
    episodeNumber: ep.episode_number,
    seasonNumber: ep.season.season_number,
    url: absoluteUrl(canonical),
    datePublished: ep.published_at ?? undefined,
    inLanguage: "es",
    partOfSeason: {
      "@type": "TVSeason",
      seasonNumber: ep.season.season_number,
    },
    partOfSeries: {
      "@type": "TVSeries",
      name: ep.series.title_es,
      url: `${SITE.url}/series/${ep.series.slug}`,
    },
    video: videoJsonLd,
  } as const;

  const primaryCategorySlug = ep.categories?.[0]?.slug ?? null;

  return (
    <>
      <JsonLd data={[videoJsonLd, episodeJsonLd]} />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Series", url: `${SITE.url}/series` },
          { name: ep.series.title_es, url: `${SITE.url}/series/${ep.series.slug}` },
          { name: ep.title_es, url: `${SITE.url}${canonical}` },
        ]}
      />

      <article className="pt-24 pb-20">
        <Container size="lg">
          <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.18em] text-gray-500">
            <Link href="/series" className="hover:text-ink">Series</Link>
            <span aria-hidden>·</span>
            <Link href={`/series/${ep.series.slug}`} className="hover:text-ink">
              {ep.series.title_es}
            </Link>
            <span aria-hidden>·</span>
            <span className="text-ink">T{ep.season.season_number}·E{ep.episode_number}</span>
          </nav>

          <VideoPlayer
            youtubeId={ep.youtube_id}
            episodeId={ep.id}
            episodeTitle={ep.title_es}
            episodeNumberLabel={`Temporada ${ep.season.season_number} — Episodio ${ep.episode_number}`}
            nextEpisode={
              nextEp
                ? {
                    title: nextEp.title_es,
                    href: `/series/${ep.series.slug}/t${ep.season.season_number}/${nextEp.slug}`,
                    thumbnailUrl: nextEp.thumbnail_url,
                    youtubeId: nextEp.youtube_id,
                  }
                : null
            }
          />

          <header className="mt-10">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
              <span className="h-px w-8 bg-gold-500" />
              Temporada {ep.season.season_number} · Episodio {ep.episode_number}
            </p>
            <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] italic leading-[1.05] text-ink text-balance">
              {ep.title_es}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              {ep.duration_seconds ? (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-paper px-3 py-1.5">
                  {formatDuration(ep.duration_seconds)}
                </span>
              ) : null}
              {ep.categories?.map((c) => (
                <Link
                  key={c.id}
                  href={`/categorias/${c.slug}`}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 transition-colors hover:border-gold-400 hover:text-gold-700"
                >
                  {c.name_es}
                </Link>
              ))}
            </div>
            {ep.synopsis_es ? (
              <p className="mt-6 max-w-3xl text-[16.5px] leading-relaxed text-gray-700 text-pretty">
                {ep.synopsis_es}
              </p>
            ) : null}
          </header>

          <div className="mt-10">
            <EpisodeCta
              episodeId={ep.id}
              episodeSlug={ep.slug}
              categoryLabel={primaryCategorySlug}
            />
          </div>

          <Transcript transcript={ep.transcript_es} />
        </Container>

        {related.length ? (
          <div className="mt-20">
            <ContentRail
              title="Más episodios de esta serie"
              eyebrow={ep.series.title_es}
              seeAllHref={`/series/${ep.series.slug}`}
            >
              {related.map((r) => (
                <EpisodeCard
                  key={r.id}
                  episode={r}
                  seriesSlug={ep.series.slug}
                  seasonNumber={ep.season.season_number}
                />
              ))}
            </ContentRail>
          </div>
        ) : null}
      </article>
    </>
  );
}
