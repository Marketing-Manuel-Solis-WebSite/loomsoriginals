import { SITE } from "@/lib/site";
import { getLatestEpisodes } from "@/lib/queries/getEpisode";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";

export const revalidate = 3600;

function escape(x: string): string {
  return x
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const episodes = await getLatestEpisodes(40).catch(() => []);
  const allSeries = await getAllSeries().catch(() => []);
  const slugById = Object.fromEntries(allSeries.map((s) => [s.id, s.slug]));
  const seasonById: Record<string, number> = {};
  await Promise.all(
    allSeries.map(async (s) => {
      const detail = await getSeriesBySlug(s.slug).catch(() => null);
      if (!detail) return;
      for (const season of detail.seasons) {
        for (const ep of season.episodes ?? []) seasonById[ep.id] = season.season_number;
      }
    })
  );

  const items = episodes
    .map((ep) => {
      const seriesSlug = slugById[ep.series_id] ?? "uniendo-familias-manuel-solis";
      const seasonNumber = seasonById[ep.id] ?? 1;
      const url = `${SITE.url}/series/${seriesSlug}/t${seasonNumber}/${ep.slug}`;
      const pubDate = ep.published_at
        ? new Date(ep.published_at).toUTCString()
        : new Date().toUTCString();
      return `
        <item>
          <title>${escape(ep.title_es)}</title>
          <link>${escape(url)}</link>
          <guid isPermaLink="true">${escape(url)}</guid>
          <pubDate>${pubDate}</pubDate>
          <description>${escape(ep.synopsis_es ?? "")}</description>
          ${ep.youtube_id ? `<enclosure url="https://www.youtube.com/watch?v=${escape(ep.youtube_id)}" type="video/mp4" />` : ""}
        </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)}</title>
    <link>${SITE.url}</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escape("Historias migrantes producidas por Bufete Manuel Solís.")}</description>
    <language>es-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`.trim();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600",
    },
  });
}
