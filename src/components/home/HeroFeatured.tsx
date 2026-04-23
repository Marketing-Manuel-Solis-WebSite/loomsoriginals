"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Bookmark } from "lucide-react";
import type { SeriesCard } from "@/lib/queries/types";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { cn, youtubeThumbnailUrl } from "@/lib/utils";

export function HeroFeatured({
  items,
  firstEpisodeSlugs,
}: {
  items: SeriesCard[];
  firstEpisodeSlugs: Record<string, { seriesSlug: string; seasonNumber: number; episodeSlug: string } | null>;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  const next = useCallback(() => {
    setIndex((i) => (items.length ? (i + 1) % items.length : 0));
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(next, 9000);
    return () => clearInterval(t);
  }, [next, paused, items.length]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(Math.max(window.scrollY, 0), 600);
        hero.style.setProperty("--parallax-y", `${y * 0.2}px`);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!items.length) return null;
  const current = items[index];
  const firstEp = firstEpisodeSlugs[current.slug] ?? null;
  const backdrop =
    current.backdrop_url ??
    (current.trailer_youtube_id ? youtubeThumbnailUrl(current.trailer_youtube_id) : null);

  return (
    <section
      ref={heroRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative min-h-[86dvh] overflow-hidden"
      aria-roledescription="Serie destacada"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{ transform: "translateY(var(--parallax-y, 0px))" }}
      >
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            aria-hidden
            priority
            fill
            sizes="100vw"
            className="object-cover opacity-80 transition-opacity duration-700 ease-apple"
            unoptimized={backdrop.includes("ytimg.com")}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950" />
        )}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 gradient-hero-side" />
      <div aria-hidden className="pointer-events-none absolute inset-0 gradient-hero-fade" />
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />

      <div className="relative grid min-h-[86dvh] items-end pb-16 pt-24 sm:pb-24 lg:pb-28">
        <Container size="xl">
          <div className="max-w-2xl animate-rise">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-500">
              Serie original de Loom
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5.75rem)] italic leading-[0.95] tracking-[-0.015em] text-ivory-50 text-balance">
              {current.title_es}
            </h1>
            {current.synopsis_es ? (
              <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-ivory-200/90 text-pretty sm:text-[17px]">
                {current.synopsis_es}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory-100/80">
              {current.release_year ? (
                <span className="glass-flat rounded-full px-3 py-1">{current.release_year}</span>
              ) : null}
              <span className="glass-flat rounded-full px-3 py-1">8 episodios</span>
              <span className="glass-flat rounded-full px-3 py-1">Temporada 1</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {firstEp ? (
                <ButtonLink
                  href={`/series/${firstEp.seriesSlug}/t${firstEp.seasonNumber}/${firstEp.episodeSlug}`}
                  variant="primary"
                  size="lg"
                >
                  <Play className="h-5 w-5" fill="currentColor" />
                  Reproducir T1:E1
                </ButtonLink>
              ) : (
                <ButtonLink href={`/series/${current.slug}`} variant="primary" size="lg">
                  <Play className="h-5 w-5" fill="currentColor" />
                  Ver la serie
                </ButtonLink>
              )}
              <ButtonLink href={`/series/${current.slug}`} variant="secondary" size="lg">
                <Bookmark className="h-5 w-5" />
                Más información
              </ButtonLink>
            </div>
          </div>

          {items.length > 1 ? (
            <div
              className="mt-12 flex items-center gap-2"
              role="tablist"
              aria-label="Series destacadas"
            >
              {items.map((s, i) => (
                <button
                  type="button"
                  key={s.id}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Ver ${s.title_es}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-400 ease-apple",
                    i === index ? "w-10 bg-gold-500" : "w-4 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          ) : null}
        </Container>
      </div>
    </section>
  );
}

