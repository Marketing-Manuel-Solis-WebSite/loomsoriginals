import "server-only";
import Link from "next/link";
import Image from "next/image";
import { getFeaturedSeries } from "@/lib/queries/getFeatured";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { getLatestEpisodes } from "@/lib/queries/getEpisode";
import { getCategoriesWithEpisodes } from "@/lib/queries/getCategories";
import { HeroFeatured } from "./HeroFeatured";
import { ContentRail } from "./ContentRail";
import { EpisodeCard } from "./EpisodeCard";
import { SeriesCard } from "./SeriesCard";
import { HomeEmptyState } from "./HomeEmptyState";
import { InterRailCta } from "./InterRailCta";
import { YouTubeImage } from "@/components/ui/YouTubeImage";
import { formatDuration, youtubeThumbnailUrl, withUtm } from "@/lib/utils";
import { Play, ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";

type FirstEpisodeMap = Record<
  string,
  { seriesSlug: string; seasonNumber: number; episodeSlug: string } | null
>;

export async function HomePage() {
  let featured = [] as Awaited<ReturnType<typeof getFeaturedSeries>>;
  let allSeries = [] as Awaited<ReturnType<typeof getAllSeries>>;
  let latest = [] as Awaited<ReturnType<typeof getLatestEpisodes>>;
  let categoryRails = [] as Awaited<ReturnType<typeof getCategoriesWithEpisodes>>;
  const firstEpisodeMap: FirstEpisodeMap = {};
  let seriesSlugById: Record<string, string> = {};
  const seasonNumberById: Record<string, number> = {};

  try {
    [featured, allSeries, latest, categoryRails] = await Promise.all([
      getFeaturedSeries(3),
      getAllSeries(),
      getLatestEpisodes(12),
      getCategoriesWithEpisodes(12),
    ]);

    seriesSlugById = Object.fromEntries(allSeries.map((s) => [s.id, s.slug]));

    const seasonLookups = await Promise.all(
      featured.map(async (s) => {
        const detail = await getSeriesBySlug(s.slug);
        if (!detail) return null;
        const season = detail.seasons[0];
        const firstEp = season?.episodes?.[0];
        if (!season || !firstEp) return null;
        return {
          seriesId: s.id,
          slug: s.slug,
          seasonNumber: season.season_number,
          episodeSlug: firstEp.slug,
          seasons: detail.seasons,
        };
      })
    );

    for (const hit of seasonLookups) {
      if (hit) {
        firstEpisodeMap[hit.slug] = {
          seriesSlug: hit.slug,
          seasonNumber: hit.seasonNumber,
          episodeSlug: hit.episodeSlug,
        };
        for (const season of hit.seasons) {
          for (const ep of season.episodes ?? []) {
            seasonNumberById[ep.id] = season.season_number;
          }
        }
      }
    }

    for (const s of allSeries) {
      const detail = await getSeriesBySlug(s.slug);
      if (!detail) continue;
      for (const season of detail.seasons) {
        for (const ep of season.episodes ?? []) {
          seasonNumberById[ep.id] = season.season_number;
        }
      }
    }
  } catch (err) {
    console.warn("HomePage: supabase unreachable, rendering empty state.", err);
    return <HomeEmptyState />;
  }

  if (!featured.length && !latest.length) {
    return <HomeEmptyState />;
  }

  const ufSeries = featured[0] ?? allSeries.find((s) => s.slug === "uniendo-familias-manuel-solis");
  const ufEpisode = latest.find((e) => ufSeries && e.series_id === ufSeries.id) ?? latest[0] ?? null;
  const ufBackdrop =
    ufEpisode?.thumbnail_url ??
    (ufEpisode?.youtube_id ? youtubeThumbnailUrl(ufEpisode.youtube_id, "hq") : null);

  const ufEpisodes = latest.filter((e) => e.series_id === ufSeries?.id).slice(0, 10);
  const otherLatest = latest.filter((e) => e.series_id !== ufSeries?.id);

  return (
    <>
      {featured.length ? (
        <HeroFeatured items={featured} firstEpisodeSlugs={firstEpisodeMap} />
      ) : null}

      {/* ─── Featured editorial story (big card) ─── */}
      {ufEpisode && ufSeries ? (
        <section aria-label="Historia destacada" className="relative bg-white pt-20 pb-14 sm:pt-24 sm:pb-16">
          <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14">
            <div className="divider-ornament mb-12">
              <span className="text-[11px] font-semibold uppercase tracking-[0.32em]">
                Historia destacada
              </span>
            </div>
            <Link
              href={`/series/${ufSeries.slug}/t${seasonNumberById[ufEpisode.id] ?? 1}/${ufEpisode.slug}`}
              className="group grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16"
            >
              <div className="relative aspect-video overflow-hidden rounded-[28px] ring-1 ring-black/5 shadow-lg">
                {ufBackdrop ? (
                  <Image
                    src={ufBackdrop}
                    alt={ufEpisode.title_es}
                    fill
                    sizes="(max-width: 1024px) 100vw, 720px"
                    className="object-cover transition-transform duration-700 ease-apple group-hover:scale-[1.03]"
                    unoptimized={ufBackdrop.includes("ytimg.com")}
                  />
                ) : (
                  <YouTubeImage
                    youtubeId={ufEpisode.youtube_id}
                    alt={ufEpisode.title_es}
                    fallbackLabel={ufEpisode.title_es}
                    sizes="(max-width: 1024px) 100vw, 720px"
                    className="object-cover transition-transform duration-700 ease-apple group-hover:scale-[1.03]"
                  />
                )}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-6 bottom-6 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-700">
                    {ufSeries.title_es}
                  </span>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-ink shadow-xl transition-transform duration-400 ease-apple group-hover:scale-110">
                    <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                  Capítulo recomendado
                </p>
                <h3 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.5rem)] italic leading-[1.03] text-ink text-balance">
                  {ufEpisode.title_es}
                </h3>
                {ufEpisode.synopsis_es ? (
                  <p className="mt-5 max-w-xl text-[16.5px] leading-[1.75] text-gray-700 text-pretty line-clamp-5">
                    {ufEpisode.synopsis_es}
                  </p>
                ) : null}
                <div className="mt-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  {ufEpisode.duration_seconds ? (
                    <span>{formatDuration(ufEpisode.duration_seconds)}</span>
                  ) : null}
                  <span aria-hidden>·</span>
                  <span>Español</span>
                </div>
                <span className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-ink group-hover:text-gold-700 transition-colors">
                  Ver ahora
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      {/* ─── Netflix-style continuous rail stack ─── */}
      <div className="bg-paper pt-6 pb-16">
        {ufEpisodes.length ? (
          <div className="mb-12">
            <ContentRail
              title="Uniendo Familias"
              eyebrow="Serie insignia · T1"
              railNumber="01"
              seeAllHref={`/series/${ufSeries?.slug ?? "uniendo-familias-manuel-solis"}`}
            >
              {ufEpisodes.map((ep, i) => {
                const seriesSlug = seriesSlugById[ep.series_id] ?? "uniendo-familias-manuel-solis";
                const seasonNumber = seasonNumberById[ep.id] ?? 1;
                return (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    seriesSlug={seriesSlug}
                    seasonNumber={seasonNumber}
                    priority={i < 2}
                  />
                );
              })}
            </ContentRail>
          </div>
        ) : null}

        {otherLatest.length ? (
          <div className="mb-12">
            <ContentRail
              title="Nuevos episodios"
              eyebrow="Recién estrenados"
              railNumber="02"
              seeAllHref="/series"
            >
              {otherLatest.map((ep) => {
                const seriesSlug = seriesSlugById[ep.series_id] ?? "uniendo-familias-manuel-solis";
                const seasonNumber = seasonNumberById[ep.id] ?? 1;
                return (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    seriesSlug={seriesSlug}
                    seasonNumber={seasonNumber}
                  />
                );
              })}
            </ContentRail>
          </div>
        ) : null}

        {categoryRails.map((cat, i) => (
          <div key={cat.id} className="mb-12">
            <ContentRail
              title={cat.name_es}
              eyebrow={cat.description_es ?? undefined}
              railNumber={String(i + 3).padStart(2, "0")}
              seeAllHref={`/categorias/${cat.slug}`}
            >
              {cat.episodes.map((ep) => {
                const seriesSlug = seriesSlugById[ep.series_id] ?? "uniendo-familias-manuel-solis";
                const seasonNumber = seasonNumberById[ep.id] ?? 1;
                return (
                  <EpisodeCard
                    key={ep.id}
                    episode={ep}
                    seriesSlug={seriesSlug}
                    seasonNumber={seasonNumber}
                  />
                );
              })}
            </ContentRail>
            {i === 1 ? (
              <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 mt-10">
                <InterRailCta
                  headline="¿Un caso similar al que vio?"
                  body="Agendar una consulta gratuita con el Bufete Manuel Solís toma 2 minutos."
                  href={withUtm(SITE.lawFirm.consultationUrl, {
                    source: "looms",
                    medium: "inter-rail",
                    campaign: "consulta",
                  })}
                  ctaLabel="Hablar con un abogado"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* ─── Dark editorial section breaking the whites ─── */}
      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 grain" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gold-500/20 blur-3xl"
        />
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 relative">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-20">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300">
                <span className="h-px w-8 bg-gold-400" />
                Manifiesto editorial
              </p>
              <h2 className="mt-6 font-display text-[clamp(2.25rem,5vw,3.75rem)] italic leading-[1.05] text-balance">
                <span className="text-white/60">Las leyes cambian.</span>
                <br />
                Las historias permanecen.
              </h2>
            </div>
            <div className="space-y-5 text-[16.5px] leading-[1.8] text-white/80 text-pretty">
              <p>
                Creemos que la inmigración se cuenta mejor en voz de quienes la viven. Durante más
                de tres décadas el Bufete Manuel Solís ha acompañado a familias en su proceso —
                esta es la plataforma donde esas historias encuentran su forma final.
              </p>
              <p className="text-white/60 text-[14.5px]">
                Cada episodio es un caso real. Cada familia dio su consentimiento. Cada silencio es
                intencional.
              </p>
              <div className="pt-2">
                <a
                  href={withUtm(SITE.lawFirm.url, {
                    source: "looms",
                    medium: "manifiesto",
                    campaign: "law-firm",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-5 py-2.5 text-[13px] font-semibold text-gold-300 hover:border-gold-400 hover:bg-gold-400/20 transition-colors"
                >
                  Conozca al Bufete
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── All series rail ─── */}
      {allSeries.length ? (
        <div className="bg-paper py-16">
          <ContentRail
            title="Biblioteca Loom"
            eyebrow="Explora todas las series"
            railNumber="∞"
            seeAllHref="/series"
          >
            {allSeries.map((s) => (
              <SeriesCard key={s.id} series={s} variant="backdrop" />
            ))}
          </ContentRail>
        </div>
      ) : null}
    </>
  );
}

