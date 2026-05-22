"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Heart, Star, Library, ChevronRight } from "lucide-react";
import type { SeriesCard } from "@/lib/queries/types";
import { ButtonLink } from "@/components/ui/Button";
import { loadYouTubeApi } from "@/components/player/loadYouTubeApi";
import type { YTPlayer } from "@/components/player/youtube-types";
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
  const [trailerForIndex, setTrailerForIndex] = useState<number | null>(null);

  const next = useCallback(() => {
    setIndex((i) => (items.length ? (i + 1) % items.length : 0));
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(next, 9000);
    return () => clearInterval(t);
  }, [next, paused, items.length]);

  // Trailer silenciado en autoplay tras un beat — el poster (Image) sigue siendo
  // el LCP; el trailer entra después. Respeta prefers-reduced-motion y data-saver.
  useEffect(() => {
    const tid = items[index]?.trailer_youtube_id ?? null;
    if (!tid || typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (reduced || saveData) return;
    // Sin setState síncrono: el trailer queda atado a ESTE índice; al cambiar de
    // slide, trailerForIndex !== index → se oculta hasta que dispare el nuevo beat.
    const t = window.setTimeout(() => setTrailerForIndex(index), 1600);
    return () => window.clearTimeout(t);
  }, [index, items]);

  if (!items.length) return null;
  const current = items[index];
  const firstEp = firstEpisodeSlugs[current.slug] ?? null;
  const trailerId = current.trailer_youtube_id ?? null;
  const backdrop =
    current.backdrop_url ??
    (trailerId ? youtubeThumbnailUrl(trailerId, "maxres") : null);

  const playHref = firstEp
    ? `/series/${firstEp.seriesSlug}/t${firstEp.seasonNumber}/${firstEp.episodeSlug}`
    : `/series/${current.slug}`;

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate flex min-h-[92dvh] overflow-hidden bg-ink text-white"
      aria-roledescription="Serie destacada"
    >
      {/* Full-bleed backdrop with crossfade between items */}
      <div className="absolute inset-0 -z-10">
        {backdrop ? (
          <Image
            key={`bg-${current.id}`}
            src={backdrop}
            alt=""
            aria-hidden
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center scale-[1.02] animate-hero-zoom"
            unoptimized={backdrop.includes("ytimg.com")}
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-ink via-gray-900 to-ink"
          />
        )}
        {trailerForIndex === index && trailerId ? (
          <HeroTrailer key={`tr-${current.id}`} youtubeId={trailerId} />
        ) : null}
        {/* Bottom-up gradient — heavy at bottom for text legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 via-25% to-transparent"
        />
        {/* Left-to-right gradient */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent"
        />
      </div>

      {/* Top edge: edition strip */}
      <div className="absolute inset-x-0 top-0 z-20 pt-24 md:pt-28">
        <div className="mx-auto max-w-[1440px] px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4">
            <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-gold-300">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-gold-400" />
              </span>
              Edición 01 · Otoño 2026
            </p>
            <p className="hidden md:inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
              <span className="h-px w-6 bg-white/30" />
              Una producción de Law Offices of Manuel Solís
              <span className="h-px w-6 bg-white/30" />
            </p>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink shadow-md">
              <Library className="h-3 w-3" />
              № {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-anchored content — Netflix billboard */}
      <div className="relative z-10 mt-auto pb-20 pt-40 md:pb-28 md:pt-48 w-full">
        <div className="mx-auto max-w-[1440px] px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72">
          <div key={`content-${current.id}`} className="max-w-2xl animate-hero-rise">
            <p className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-300">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-gold-400/20 ring-1 ring-gold-400/40">
                <Star className="h-3 w-3 text-gold-300" fill="currentColor" />
              </span>
              Serie original de Looms
            </p>

            <h1 className="mt-5 font-display text-[clamp(3rem,10vw,8rem)] italic leading-[0.86] tracking-[-0.025em] text-white text-balance drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
              {current.title_es}
            </h1>

            {current.synopsis_es ? (
              <p className="mt-6 max-w-xl text-[16.5px] leading-[1.65] text-white/90 line-clamp-3 text-pretty drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                {current.synopsis_es}
              </p>
            ) : null}

            {/* Inline meta */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] font-medium text-white/85">
              {current.release_year ? (
                <>
                  <span>{current.release_year}</span>
                  <span aria-hidden className="text-white/30">·</span>
                </>
              ) : null}
              <span>Serie documental</span>
              <span aria-hidden className="text-white/30">·</span>
              <span className="inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]">
                HD
              </span>
              <span aria-hidden className="text-white/30">·</span>
              <span>Español · subtítulos</span>
              <span aria-hidden className="text-white/30">·</span>
              <span className="inline-flex items-center gap-1 text-gold-300">
                <Star className="h-3 w-3" fill="currentColor" /> Caso real verificado
              </span>
            </div>

            {/* CTAs — Netflix style */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink
                href={playHref}
                size="lg"
                className="bg-white text-ink hover:bg-white/90 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
              >
                <Play className="h-5 w-5" fill="currentColor" />
                {firstEp ? "Reproducir T1:E1" : "Ver la serie"}
              </ButtonLink>
              <ButtonLink
                href={`/series/${current.slug}`}
                size="lg"
                className="bg-white/15 backdrop-blur-md text-white border border-white/25 hover:bg-white/25 hover:border-white/50"
              >
                <Heart className="h-4 w-4" />
                Más información
              </ButtonLink>
            </div>
          </div>

          {/* Pagination strip */}
          {items.length > 1 ? (
            <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/15 pt-6">
              <div
                className="flex items-center gap-2"
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
                      "h-[3px] rounded-full transition-all duration-500 ease-apple",
                      i === index
                        ? "w-14 bg-gold-400"
                        : "w-7 bg-white/30 hover:bg-white/50"
                    )}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  Próxima serie
                </p>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Siguiente serie destacada"
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/25 text-white transition-all duration-400 ease-apple hover:bg-white/20 hover:ring-gold-400 hover:scale-105"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * Backdrop de video silenciado para el hero (full-bleed, object-cover vía wrapper
 * 16:9 sobredimensionado). Monta el iframe SOLO cuando se le pide (lazy, tras el
 * beat), y lo destruye al desmontar. Siempre muted + playsinline + loop.
 */
function HeroTrailer({ youtubeId }: { youtubeId: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    let destroyed = false;
    loadYouTubeApi().then((YT) => {
      if (destroyed || !hostRef.current) return;
      hostRef.current.innerHTML = "";
      const div = document.createElement("div");
      hostRef.current.appendChild(div);
      playerRef.current = new YT.Player(div, {
        videoId: youtubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          loop: 1,
          playlist: youtubeId,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e) => {
            try {
              e.target.mute();
              e.target.playVideo();
            } catch {}
          },
        },
      });
    });
    return () => {
      destroyed = true;
      try {
        playerRef.current?.destroy();
      } catch {}
    };
  }, [youtubeId]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none animate-fade">
      <div
        ref={hostRef}
        className="absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2 [&>iframe]:h-full [&>iframe]:w-full"
      />
    </div>
  );
}
