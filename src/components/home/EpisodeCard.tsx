"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Play, Share2, Heart, ChevronRight } from "lucide-react";
import { YouTubeImage } from "@/components/ui/YouTubeImage";
import { cn, formatDuration, youtubeThumbnailUrl } from "@/lib/utils";
import { trackShare } from "@/lib/tracking";
import type { EpisodeCard as EpisodeCardType } from "@/lib/queries/types";
import type { Series } from "@/lib/supabase/types";
import { SITE } from "@/lib/site";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loadYouTubeApi } from "@/components/player/loadYouTubeApi";
import type { YTPlayer } from "@/components/player/youtube-types";

type Props = {
  episode: EpisodeCardType;
  seriesSlug: string;
  seasonNumber: number;
  size?: "md" | "lg";
  priority?: boolean;
  progress?: number;
};

export function EpisodeCard({
  episode,
  seriesSlug,
  seasonNumber,
  size = "md",
  priority,
  progress,
}: Props) {
  const href = `/series/${seriesSlug}/t${seasonNumber}/${episode.slug}`;
  const duration = formatDuration(episode.duration_seconds);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const openTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleOpen = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    if (openTimeout.current) clearTimeout(openTimeout.current);
    openTimeout.current = setTimeout(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
      setPreviewOpen(true);
    }, 550);
  };

  const scheduleClose = () => {
    if (openTimeout.current) clearTimeout(openTimeout.current);
    closeTimeout.current = setTimeout(() => setPreviewOpen(false), 180);
  };

  const cancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  useEffect(
    () => () => {
      if (openTimeout.current) clearTimeout(openTimeout.current);
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    },
    []
  );

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${SITE.url}${href}`;
    const data = {
      title: episode.title_es,
      text: `${episode.title_es} — Looms Originals`,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(data);
        trackShare(episode.id, "clipboard");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        trackShare(episode.id, "clipboard");
      }
    } catch {
      // user cancelled — no-op
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
        className="group relative block w-[240px] shrink-0 snap-start sm:w-[288px] lg:w-[320px] transition-transform duration-500 ease-apple hover:-translate-y-1.5"
      >
        <Link href={href} prefetch aria-label={episode.title_es} className="outline-none block">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100 transition-all duration-500 ease-apple shadow-sm group-hover:shadow-[0_24px_40px_-18px_rgba(9,9,11,0.35)] ring-1 ring-white/10 group-hover:ring-gold-400/60">
            <YouTubeImage
              youtubeId={episode.youtube_id}
              alt={episode.title_es}
              priority={priority}
              sizes={size === "lg" ? "(max-width: 768px) 80vw, 320px" : "(max-width: 768px) 70vw, 288px"}
              className="object-cover transition-transform duration-700 ease-apple group-hover:scale-[1.06]"
              fallbackLabel={episode.title_es}
            />
            <div className="pointer-events-none absolute inset-0 gradient-card-bottom opacity-40 transition-opacity group-hover:opacity-60" />

            <span className="absolute left-2.5 top-2.5 inline-flex items-center rounded-full bg-white/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink shadow-sm">
              T{seasonNumber}·E{episode.episode_number}
            </span>

            {duration ? (
              <span className="absolute right-2.5 top-2.5 rounded-full bg-ink/85 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] text-white">
                {duration}
              </span>
            ) : null}

            {progress !== undefined && progress > 0 ? (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/25">
                <div className="h-full bg-gold-500" style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
            ) : null}
          </div>

          <div className="mt-2.5 px-0.5">
            <h3 className="line-clamp-2 text-[13.5px] font-medium leading-snug text-white group-hover:text-gold-700 transition-colors">
              {episode.title_es}
            </h3>
          </div>
        </Link>
      </div>

      {previewOpen && coords ? (
        <HoverPreviewPortal
          coords={coords}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          episode={episode}
          href={href}
          seasonNumber={seasonNumber}
          onShare={handleShare}
        />
      ) : null}
    </>
  );
}

function HoverPreviewPortal({
  coords,
  onMouseEnter,
  onMouseLeave,
  episode,
  href,
  seasonNumber,
  onShare,
}: {
  coords: { top: number; left: number; width: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  episode: EpisodeCardType;
  href: string;
  seasonNumber: number;
  onShare: (e: React.MouseEvent) => Promise<void>;
}) {
  const [playVideo, setPlayVideo] = useState(false);
  const [fav, setFav] = useState<boolean | null>(null);
  const [favPending, startFav] = useTransition();

  // Arranca el preview en video tras un beat corto (el portal ya abrió a los 550ms
  // de hover). Respeta reduced-motion y data-saver; si no, queda la imagen.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (reduced || saveData) return;
    const t = window.setTimeout(() => setPlayVideo(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  // Estado de favorito de la SERIE de este episodio (favorites es por series_id).
  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!auth.user) {
        setFav(false);
        return;
      }
      const { data } = await supabase
        .from("favorites")
        .select("series_id")
        .eq("user_id", auth.user.id)
        .eq("series_id", episode.series_id)
        .maybeSingle();
      if (!cancelled) setFav(Boolean(data));
    })();
    return () => {
      cancelled = true;
    };
  }, [episode.series_id]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startFav(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (fav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", auth.user.id)
          .eq("series_id", episode.series_id);
        setFav(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: auth.user.id, series_id: episode.series_id });
        setFav(true);
      }
    });
  };

  if (typeof document === "undefined") return null;

  const expandedWidth = Math.max(coords.width * 1.35, 340);
  const widthDiff = expandedWidth - coords.width;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1440;
  let left = coords.left - widthDiff / 2;
  if (left < 16) left = 16;
  if (left + expandedWidth > viewportW - 16) left = viewportW - expandedWidth - 16;

  const topAdjust = coords.top - 40;

  return createPortal(
    <div
      role="dialog"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        top: topAdjust,
        left,
        width: expandedWidth,
        zIndex: 60,
      }}
      className="hidden lg:block pointer-events-auto animate-blur-in"
    >
      <div className="rounded-2xl glass-card shadow-2xl overflow-hidden">
        <Link href={href} className="block relative aspect-video bg-gray-100 overflow-hidden">
          <Image
            src={youtubeThumbnailUrl(episode.youtube_id, "maxres")}
            alt={episode.title_es}
            fill
            unoptimized
            sizes="420px"
            className="object-cover"
          />
          {playVideo ? <MutedPreview youtubeId={episode.youtube_id} /> : null}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink">
              T{seasonNumber}·E{episode.episode_number}
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-xl">
              <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
            </span>
          </div>
        </Link>

        <div className="p-4">
          <h3 className="line-clamp-2 font-display text-lg italic leading-tight text-white">
            {episode.title_es}
          </h3>
          {episode.synopsis_es ? (
            <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-gray-600">
              {episode.synopsis_es}
            </p>
          ) : null}
          <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            {episode.duration_seconds ? <span>{formatDuration(episode.duration_seconds)}</span> : null}
            {(episode.tags ?? []).slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-gold-50 px-2 py-0.5 text-gold-700 border border-gold-200">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Link
              href={href}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-ink hover:bg-white/90 transition-colors shadow-md"
            >
              <Play className="h-3.5 w-3.5" fill="currentColor" />
              Reproducir
            </Link>
            <button
              type="button"
              onClick={onShare}
              aria-label="Compartir"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:border-gold-400/60 hover:text-gold-300 hover:bg-white/10 backdrop-blur-md transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleFav}
              disabled={favPending}
              aria-pressed={fav ?? undefined}
              aria-label={fav ? "Quitar de mi lista" : "Agregar a mi lista"}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-colors",
                fav
                  ? "border-gold-400/70 bg-gold-400/15 text-gold-300"
                  : "border-white/15 bg-white/5 text-white/80 hover:border-gold-400/60 hover:text-gold-300 hover:bg-white/10"
              )}
            >
              <Heart className="h-3.5 w-3.5" fill={fav ? "currentColor" : "none"} />
            </button>
            <Link
              href={href}
              aria-label="Ver detalle"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:border-gold-400/60 hover:text-gold-300 hover:bg-white/10 backdrop-blur-md transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Preview en video silenciado para el hover (16:9, llena el contenedor). Monta el
 * iframe SOLO cuando el portal lo pide (1 a la vez) y lo destruye al desmontar.
 * pointer-events-none → los clics pasan al Link.
 */
function MutedPreview({ youtubeId }: { youtubeId: string }) {
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
    <div
      ref={hostRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none animate-fade [&>iframe]:h-full [&>iframe]:w-full"
    />
  );
}

export type EpisodeWithSeries = EpisodeCardType & {
  series?: Pick<Series, "slug"> | null;
  season_number?: number;
};
