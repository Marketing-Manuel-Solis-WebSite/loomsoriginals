"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, ArrowUpRight } from "lucide-react";
import type { SeriesCard } from "@/lib/queries/types";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { cn, youtubeThumbnailUrl } from "@/lib/utils";

export function HeroFeatured({
  items,
  firstEpisodeSlugs,
}: {
  items: SeriesCard[];
  firstEpisodeSlugs: Record<
    string,
    { seriesSlug: string; seasonNumber: number; episodeSlug: string } | null
  >;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  const next = useCallback(() => {
    setIndex((i) => (items.length ? (i + 1) % items.length : 0));
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(next, 10000);
    return () => clearInterval(t);
  }, [next, paused, items.length]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(Math.max(window.scrollY, 0), 700);
        hero.style.setProperty("--parallax-y", `${y * 0.14}px`);
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
    (current.trailer_youtube_id ? youtubeThumbnailUrl(current.trailer_youtube_id, "hq") : null);

  return (
    <section
      ref={heroRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden bg-cream"
      aria-roledescription="Serie destacada"
    >
      {/* Giant decorative edition number */}
      <div
        aria-hidden
        className="absolute -right-10 -top-10 sm:top-4 select-none pointer-events-none z-0"
      >
        <span className="edition-number block text-[clamp(10rem,26vw,22rem)] leading-[0.78] tracking-[-0.03em]">
          01
        </span>
      </div>
      {/* Soft gradient blobs for depth */}
      <div
        aria-hidden
        className="absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-gold-200/50 blur-[120px] animate-float"
      />
      <div
        aria-hidden
        className="absolute -right-20 bottom-0 h-[360px] w-[360px] rounded-full bg-parchment blur-[100px]"
      />

      <Container size="xl" className="relative z-10 pt-12 pb-24 md:pt-20 md:pb-32">
        {/* Editorial top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-gold-700">
            <span className="h-[6px] w-[6px] rounded-full bg-gold-500" />
            Edición 01 · Otoño 2026
          </p>
          <p className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500">
            Una producción de Bufete Manuel Solís
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-20">
          <div className="order-2 lg:order-1 animate-blur-in">
            <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-gold-700">
              Serie original de Loom
            </p>
            <h1 className="mt-6 font-display text-[clamp(3rem,8.5vw,7rem)] italic leading-[0.94] tracking-[-0.022em] text-ink text-balance">
              {current.title_es}
            </h1>
            <div aria-hidden className="mt-6 h-px w-20 bg-gradient-to-r from-gold-500 via-gold-400 to-transparent" />
            {current.synopsis_es ? (
              <p className="mt-6 max-w-xl text-[17px] leading-[1.7] text-gray-700 text-pretty sm:text-[18px] first-letter:font-display first-letter:italic first-letter:text-5xl first-letter:leading-none first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-gold-700">
                {current.synopsis_es}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              {current.release_year ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-3.5 py-1.5 shadow-xs">
                  <span className="h-1 w-1 rounded-full bg-gold-500" />
                  {current.release_year}
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-full border border-gray-300 bg-white/80 px-3.5 py-1.5 shadow-xs">
                Serie documental
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-300 bg-white/80 px-3.5 py-1.5 shadow-xs">
                Español · con subtítulos
              </span>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
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
              <ButtonLink href={`/series/${current.slug}`} variant="ghost" size="lg">
                Más información
                <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            {/* Main editorial art card */}
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-xl ring-1 ring-black/5"
              style={{ transform: "translateY(var(--parallax-y, 0px))" }}
            >
              {backdrop ? (
                <>
                  <Image
                    src={backdrop}
                    alt=""
                    aria-hidden
                    priority
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                    unoptimized={backdrop.includes("ytimg.com")}
                  />
                  {/* Duotone tint — subtle gold/warm wash */}
                  <div
                    aria-hidden
                    className="absolute inset-0 mix-blend-multiply"
                    style={{
                      background:
                        "linear-gradient(140deg, rgba(247,243,235,0.25) 0%, rgba(212,175,55,0.1) 55%, rgba(9,9,11,0.35) 100%)",
                    }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent"
                  />
                </>
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-cream via-paper to-parchment" />
              )}

              {/* Editorial label overlay */}
              <div className="absolute left-6 top-6 inline-flex items-center gap-2.5 rounded-full bg-white/95 backdrop-blur-sm pl-2 pr-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-gold-700 shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-500"></span>
                </span>
                Nuevos episodios
              </div>

              {/* Episode count badge bottom-right */}
              <div className="absolute right-6 bottom-6 rounded-2xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-700">
                  Temporada 1
                </p>
                <p className="mt-0.5 font-display text-2xl italic text-ink">3 episodios</p>
              </div>
            </div>

            {/* Floating "pull quote" card */}
            <div className="hidden md:block absolute -left-10 -bottom-8 w-64 rotate-[-3deg] rounded-2xl bg-white px-5 py-4 shadow-xl ring-1 ring-black/5">
              <span className="font-display text-5xl italic leading-none text-gold-500">“</span>
              <p className="-mt-4 font-display italic text-[15px] leading-snug text-ink">
                Cada caso es una historia esperando ser contada con cuidado.
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                — Bufete Manuel Solís
              </p>
            </div>
          </div>
        </div>

        {items.length > 1 ? (
          <div
            className="mt-16 flex items-center gap-2"
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
                  "h-1 rounded-full transition-all duration-500 ease-apple",
                  i === index ? "w-12 bg-ink" : "w-6 bg-gray-300 hover:bg-gray-500"
                )}
              />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
