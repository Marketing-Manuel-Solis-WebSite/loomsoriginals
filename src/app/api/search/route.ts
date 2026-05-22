import { NextResponse } from "next/server";
import { searchEpisodes } from "@/lib/queries/search";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { youtubeThumbnailUrl } from "@/lib/utils";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json({ episodes: [], series: [] });
  }

  try {
    const [episodes, allSeries] = await Promise.all([
      searchEpisodes(q, "es", 8).catch(() => []),
      getAllSeries().catch(() => []),
    ]);

    const seriesBySlug = Object.fromEntries(allSeries.map((s) => [s.id, s.slug]));
    const seasonNumberById: Record<string, number> = {};

    if (episodes.length) {
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
    }

    const lower = q.toLowerCase();
    const matchingSeries = allSeries
      .filter(
        (s) =>
          s.title_es.toLowerCase().includes(lower) ||
          (s.synopsis_es ?? "").toLowerCase().includes(lower)
      )
      .slice(0, 4)
      .map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title_es,
        year: s.release_year ?? null,
        backdrop:
          s.backdrop_url ??
          (s.trailer_youtube_id ? youtubeThumbnailUrl(s.trailer_youtube_id, "hq") : null),
      }));

    const episodeResults = episodes.slice(0, 8).map((ep) => {
      const seriesSlug = seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis";
      const seasonNumber = seasonNumberById[ep.id] ?? 1;
      return {
        id: ep.id,
        title: ep.title_es,
        href: `/series/${seriesSlug}/t${seasonNumber}/${ep.slug}`,
        episodeNumber: ep.episode_number,
        seasonNumber,
        thumbnail:
          ep.thumbnail_url ??
          (ep.youtube_id ? youtubeThumbnailUrl(ep.youtube_id, "hq") : null),
      };
    });

    return NextResponse.json(
      {
        episodes: episodeResults,
        series: matchingSeries,
      },
      {
        headers: {
          // Same query from any visitor gets edge-cached for 5min, kept warm for 1h
          "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
          Vary: "Accept-Language",
        },
      }
    );
  } catch (err) {
    console.error("search api error", err);
    return NextResponse.json({ episodes: [], series: [] }, { status: 200 });
  }
}
