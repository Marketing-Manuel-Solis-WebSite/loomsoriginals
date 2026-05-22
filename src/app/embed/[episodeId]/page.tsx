import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { SITE } from "@/lib/site";

type Params = Promise<{ episodeId: string }>;

export const metadata = {
  robots: { index: false, follow: false },
};

async function resolveEpisodeHref(seriesId: string, episodeSlug: string) {
  try {
    const allSeries = await getAllSeries();
    const series = allSeries.find((s) => s.id === seriesId);
    if (!series) return null;
    const detail = await getSeriesBySlug(series.slug);
    if (!detail) return null;
    for (const season of detail.seasons) {
      const ep = season.episodes?.find((e) => e.slug === episodeSlug);
      if (ep) {
        return `${SITE.url}/series/${series.slug}/t${season.season_number}/${ep.slug}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export default async function EmbedPage({ params }: { params: Params }) {
  const { episodeId } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: ep } = await supabase
    .from("episodes")
    .select("id, slug, series_id, youtube_id, title_es, is_published")
    .eq("id", episodeId)
    .maybeSingle();
  if (!ep || !ep.is_published) notFound();

  const canonicalHref = await resolveEpisodeHref(ep.series_id, ep.slug);

  return (
    <div className="fixed inset-0 bg-black">
      <iframe
        title={ep.title_es}
        src={`https://www.youtube-nocookie.com/embed/${ep.youtube_id}?modestbranding=1&rel=0&playsinline=1`}
        className="absolute inset-0 h-full w-full"
        loading="eager"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
      {canonicalHref ? (
        <a
          href={canonicalHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver ${ep.title_es} en Looms Originals`}
          className="group absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md ring-1 ring-white/10 transition-all hover:bg-black/75 hover:ring-gold-400/60"
        >
          <span aria-hidden className="font-display italic text-gold-300">L</span>
          Looms Originals
        </a>
      ) : null}
    </div>
  );
}
