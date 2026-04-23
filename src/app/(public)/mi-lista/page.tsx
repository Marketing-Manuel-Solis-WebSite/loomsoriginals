import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { EpisodeCard } from "@/components/home/EpisodeCard";
import { SeriesCard } from "@/components/home/SeriesCard";
import { getCurrentUser } from "@/lib/auth";
import { getContinueWatching, getFavoriteSeriesIds } from "@/lib/queries/getWatchHistory";
import { getAllSeries, getSeriesBySlug } from "@/lib/queries/getSeries";

export const metadata: Metadata = {
  title: "Mi lista",
  description: "Sus series favoritas y episodios en progreso en Loom Originals.",
  robots: { index: false, follow: false },
};

export default async function MiListaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/mi-lista");

  const [inProgress, favoriteIds, allSeries] = await Promise.all([
    getContinueWatching(user.id, 20).catch(() => [] as Awaited<ReturnType<typeof getContinueWatching>>),
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

  return (
    <Container size="xl" className="pt-28 pb-24">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
          Su biblioteca
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] italic leading-tight text-ivory-50">
          Mi lista
        </h1>
      </header>

      {inProgress.length ? (
        <section className="mt-12">
          <h2 className="mb-6 font-display text-2xl italic text-ivory-50">Continuar viendo</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((ep) => {
              const seriesSlug = seriesBySlug[ep.series_id] ?? "uniendo-familias-manuel-solis";
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
        </section>
      ) : null}

      {favorites.length ? (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl italic text-ivory-50">Series favoritas</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {favorites.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </section>
      ) : null}

      {!inProgress.length && !favorites.length ? (
        <p className="mt-12 text-ivory-200/70">
          Aún no ha guardado nada. Explore nuestras series y presione el corazón para agregar a su
          lista.
        </p>
      ) : null}
    </Container>
  );
}
