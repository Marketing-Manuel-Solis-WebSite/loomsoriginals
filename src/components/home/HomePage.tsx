import "server-only";
import { getFeaturedSeries } from "@/lib/queries/getFeatured";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { getLatestEpisodes } from "@/lib/queries/getEpisode";
import { getCategoriesWithEpisodes } from "@/lib/queries/getCategories";
import { HeroFeatured } from "./HeroFeatured";
import { ContentRail } from "./ContentRail";
import { EpisodeCard } from "./EpisodeCard";
import { SeriesCard } from "./SeriesCard";
import { HomeEmptyState } from "./HomeEmptyState";

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
      getLatestEpisodes(10),
      getCategoriesWithEpisodes(8),
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

  return (
    <>
      {featured.length ? (
        <HeroFeatured items={featured} firstEpisodeSlugs={firstEpisodeMap} />
      ) : null}

      <div className="mt-16 space-y-16 sm:mt-24 sm:space-y-24">
        {latest.length ? (
          <ContentRail
            title="Nuevos episodios"
            eyebrow="Recién estrenados"
            seeAllHref="/series"
          >
            {latest.map((ep, i) => {
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
        ) : null}

        {categoryRails.map((cat) => (
          <ContentRail
            key={cat.id}
            title={cat.name_es}
            eyebrow={cat.description_es ?? undefined}
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
        ))}

        {allSeries.length ? (
          <ContentRail
            title="Explora todas las series"
            eyebrow="Biblioteca Loom"
            seeAllHref="/series"
          >
            {allSeries.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </ContentRail>
        ) : null}
      </div>
    </>
  );
}
