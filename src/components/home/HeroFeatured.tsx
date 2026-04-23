"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, ChevronRight } from "lucide-react";
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
        const y = Math.min(Math.max(window.scrollY, 0), 600);
        hero.style.setProperty("--parallax-y", `${y * 0.18}px`);
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
      className="relative overflow-hidden bg-paper"
      aria-roledescription="Serie destacada"
    >
      <Container size="xl" className="pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div className="order-2 lg:order-1 animate-blur-in">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
              <span className="h-px w-8 bg-gold-500" />
              Serie original de Loom
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,5.75rem)] italic leading-[0.98] tracking-[-0.02em] text-ink text-balance">
              {current.title_es}
            </h1>
            {current.synopsis_es ? (
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-gray-600 text-pretty sm:text-[17.5px]">
                {current.synopsis_es}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              {current.release_year ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                  {current.release_year}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                Serie
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5">
                Documental
              </span>
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
              <ButtonLink href={`/series/${current.slug}`} variant="ghost" size="lg">
                Más información
                <ChevronRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl ring-1 ring-gray-200"
              style={{ transform: "translateY(var(--parallax-y, 0px))" }}
            >
              {backdrop ? (
                <Image
                  src={backdrop}
                  alt=""
                  aria-hidden
                  priority
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized={backdrop.includes("ytimg.com")}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-ink/50 via-ink/10 to-transparent"
              />
              <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-700 shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                </span>
                Estrenos
              </div>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-gold-200/60 blur-3xl animate-float"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-gold-300/40 blur-3xl"
            />
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
