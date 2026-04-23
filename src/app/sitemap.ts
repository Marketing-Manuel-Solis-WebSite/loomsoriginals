import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { getAllCategories } from "@/lib/queries/getCategories";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/series`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/categorias`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/buscar`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/sobre`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [allSeries, categories] = await Promise.all([getAllSeries(), getAllCategories()]);

    for (const s of allSeries) {
      entries.push({
        url: `${base}/series/${s.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.85,
      });
      const detail = await getSeriesBySlug(s.slug).catch(() => null);
      if (!detail) continue;
      for (const season of detail.seasons) {
        for (const ep of season.episodes ?? []) {
          const published = ep.published_at ? new Date(ep.published_at) : now;
          entries.push({
            url: `${base}/series/${s.slug}/t${season.season_number}/${ep.slug}`,
            lastModified: published,
            changeFrequency: "monthly",
            priority: 0.95,
          });
        }
      }
    }

    for (const cat of categories) {
      entries.push({
        url: `${base}/categorias/${cat.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Database unreachable at build time — serve the static entries above.
  }

  return entries;
}
