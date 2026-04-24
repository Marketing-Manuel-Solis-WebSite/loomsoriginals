import { SITE } from "@/lib/site";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { youtubeThumbnailUrl } from "@/lib/utils";

export const revalidate = 3600;

function esc(x: string | null | undefined): string {
  if (!x) return "";
  return x
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = SITE.url;
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

  try {
    const allSeries = await getAllSeries();
    for (const s of allSeries) {
      const detail = await getSeriesBySlug(s.slug).catch(() => null);
      if (!detail) continue;
      for (const season of detail.seasons) {
        for (const ep of season.episodes ?? []) {
          const loc = `${base}/series/${s.slug}/t${season.season_number}/${ep.slug}`;
          const thumb = ep.thumbnail_url ?? youtubeThumbnailUrl(ep.youtube_id, "hq");
          const duration = ep.duration_seconds ?? 0;
          const published = ep.published_at ?? new Date().toISOString();
          xml += `  <url>
    <loc>${esc(loc)}</loc>
    <video:video>
      <video:thumbnail_loc>${esc(thumb)}</video:thumbnail_loc>
      <video:title>${esc(ep.title_es)}</video:title>
      <video:description>${esc((ep.synopsis_es ?? ep.title_es).slice(0, 2048))}</video:description>
      <video:content_loc>https://www.youtube.com/watch?v=${esc(ep.youtube_id)}</video:content_loc>
      <video:player_loc allow_embed="yes" autoplay="autoplay=1">https://www.youtube.com/embed/${esc(ep.youtube_id)}</video:player_loc>
      ${duration ? `<video:duration>${duration}</video:duration>` : ""}
      <video:publication_date>${esc(published)}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:requires_subscription>no</video:requires_subscription>
      <video:live>no</video:live>
      <video:platform relationship="allow">web mobile tv</video:platform>
      <video:uploader info="${esc(SITE.url)}">${esc(SITE.name)}</video:uploader>
${(ep.tags ?? [])
  .slice(0, 32)
  .map((t) => `      <video:tag>${esc(t)}</video:tag>`)
  .join("\n")}
    </video:video>
  </url>
`;
        }
      }
    }
  } catch (err) {
    console.warn("Video sitemap: supabase error", err);
  }

  xml += "</urlset>";
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
