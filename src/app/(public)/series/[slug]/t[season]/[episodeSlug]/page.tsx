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
  const image = `/api/og/${ep.id}`;
  const canonical = `/series/${slug}/t${ep.season.season_number}/${ep.slug}`;
  const embedUrl = `${SITE.url}/embed/${ep.id}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "es-US": canonical,
        "en-US": `/en${canonical}`,
      },
    },
    openGraph: {
      type: "video.episode",
      title: `${title} — ${ep.series.title_es}`,
      description,
      url: `${SITE.url}${canonical}`,
      videos: [
        {
          url: `https://www.youtube.com/watch?v=${ep.youtube_id}`,
          type: "text/html",
          width: 1280,
          height: 720,
        },
      ],
      images: [{ url: image, width: 1280, height: 720, alt: ep.title_es }],
    },
    twitter: {
      card: "player",
      title,
      description,
      images: [image],
      players: [
        {
          playerUrl: embedUrl,
          streamUrl: `https://www.youtube.com/watch?v=${ep.youtube_id}`,
          width: 1280,
          height: 720,
        },
      ],
    },
  };
}

export default async function EpisodePage({ params }: { params: Params }) {
  const { slug, season, episodeSlug } = await params;
  const ep = await getEpisodeBySlug(slug, episodeSlug).catch(() => null);
  if (!ep) notFound();
  const seasonNumber = parseInt(season, 10);
  if (!Number.isFinite(seasonNumber) || seasonNumber !== ep.season.season_number) notFound();

  const [seriesDetail, related] = await Promise.all([
    getSeriesBySlug(slug),
    getRelatedEpisodes(ep.series_id, ep.id, 10),
  ]);

  const allEpisodesInSeason = seriesDetail?.seasons
    .find((s) => s.season_number === ep.season.season_number)
    ?.episodes ?? [];
  const nextEp = allEpisodesInSeason.find((e) => e.episode_number === ep.episode_number + 1);

  const canonical = `/series/${slug}/t${seasonNumber}/${ep.slug}`;

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
      logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` },
    },
    isPartOf: {
      "@type": "TVSeries",
      name: ep.series.title_es,
      url: `${SITE.url}/series/${ep.series.slug}`,
    },
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
          <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.18em] text-slate-400">
            <Link href="/series" className="hover:text-gold-500">Series</Link>
            <span aria-hidden>·</span>
            <Link href={`/series/${ep.series.slug}`} className="hover:text-gold-500">
              {ep.series.title_es}
            </Link>
            <span aria-hidden>·</span>
            <span className="text-ivory-200">T{ep.season.season_number}:E{ep.episode_number}</span>
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

          <header className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-500">
              Temporada {ep.season.season_number} · Episodio {ep.episode_number}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.5rem)] italic leading-[1.02] text-ivory-50 text-balance">
              {ep.title_es}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory-100/80">
              {ep.duration_seconds ? (
                <span className="glass-flat rounded-full px-3 py-1">{formatDuration(ep.duration_seconds)}</span>
              ) : null}
              {ep.categories?.map((c) => (
                <Link
                  key={c.id}
                  href={`/categorias/${c.slug}`}
                  className="glass-flat rounded-full px-3 py-1 transition-colors hover:border-gold-500/40 hover:text-gold-400"
                >
                  {c.name_es}
                </Link>
              ))}
            </div>
            {ep.synopsis_es ? (
              <p className="mt-6 max-w-3xl text-[16.5px] leading-relaxed text-ivory-200/90 text-pretty">
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
