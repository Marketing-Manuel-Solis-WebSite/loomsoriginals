import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { EpisodeCard } from "@/components/home/EpisodeCard";
import { SeriesCard } from "@/components/home/SeriesCard";
import { getCurrentUser } from "@/lib/auth";
import { getContinueWatching, getFavoriteSeriesIds } from "@/lib/queries/getWatchHistory";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";
import { Library, Heart, Play, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Mi lista",
  description: "Sus series favoritas y episodios en progreso en Looms Originals.",
  robots: { index: false, follow: false },
};

export default async function MiListaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/mi-lista");

  const [inProgress, favoriteIds, allSeries] = await Promise.all([
    getContinueWatching(user.id, 20).catch(
      () => [] as Awaited<ReturnType<typeof getContinueWatching>>
    ),
    getFavoriteSeriesIds(user.id).catch(() => [] as string[]),
    getAllSeries().catch(() => [] as Awaited<ReturnType<typeof getAllSeries>>),
  ]);

  const favorites = allSeries.filter((s) => favoriteIds.includes(s.id));
  const seriesBySlug = Object.fromEntries(allSeries.map((s) => [s.id, s.slug]));
  const seasonById: Record<string, number> = {};
  if (inProgress.length) {
    await Promise.all(
      allSeries.map(async (s) => {
        const detail = await getSeriesBySlug(s.slug).catch(() => null);
        if (!detail) return;
        for (const season of detail.seasons) {
          for (const ep of season.episodes ?? []) {
            seasonById[ep.id] = season.season_number;
          }
        }
      })
    );
  }

  const isEmpty = !inProgress.length && !favorites.length;

  return (
    <>
      <section className="relative overflow-hidden bg-paper pt-32 pb-16 md:pt-40 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <Container size="xl" className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <Library className="h-3.5 w-3.5" />
            Su biblioteca personal
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] italic leading-[0.95] tracking-[-0.018em] text-white text-balance">
            Mi <span className="text-gold-gradient">lista</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] text-gray-600">
            Continúe donde lo dejó y vuelva a las series que guardó.
          </p>

          {/* Tally row */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-white/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">
              <Play className="h-3.5 w-3.5 text-gold-700" fill="currentColor" />
              {inProgress.length} en progreso
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-white/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">
              <Heart className="h-3.5 w-3.5 text-gold-700" />
              {favorites.length} favorita{favorites.length === 1 ? "" : "s"}
            </span>
          </div>
        </Container>
      </section>

      <section className="bg-paper pb-28">
        <Container size="xl">
          {inProgress.length ? (
            <div className="mt-4">
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] italic text-white leading-tight">
                Continuar viendo
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((ep) => {
                  const seriesSlug =
                    seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis";
                  const seasonNumber = seasonById[ep.id] ?? 1;
                  const pct =
                    ep.duration_seconds && ep.duration_seconds > 0
                      ? (ep.progress_seconds / ep.duration_seconds) * 100
                      : 0;
                  return (
                    <EpisodeCard
                      key={ep.id}
                      episode={ep}
                      seriesSlug={seriesSlug}
                      seasonNumber={seasonNumber}
                      size="lg"
                      progress={pct}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          {favorites.length ? (
            <div className="mt-20">
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] italic text-white leading-tight">
                Series favoritas
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((s) => (
                  <SeriesCard key={s.id} series={s} variant="backdrop" fullWidth />
                ))}
              </div>
            </div>
          ) : null}

          {isEmpty ? (
            <div className="mt-12 grid place-items-center rounded-3xl glass-card px-8 py-16 text-center shadow-sm">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-paper ring-1 ring-white/10 text-gold-700">
                <Heart className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-3xl italic text-white">
                Su lista está vacía
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-gray-600">
                Explore las series, presione el corazón para guardar las que quiera ver después,
                o reproduzca un episodio para que aparezca en &ldquo;Continuar viendo&rdquo;.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/series" variant="primary" size="lg">
                  Ver series
                  <ArrowUpRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/categorias" variant="ghost" size="lg">
                  Explorar categorías
                </ButtonLink>
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
