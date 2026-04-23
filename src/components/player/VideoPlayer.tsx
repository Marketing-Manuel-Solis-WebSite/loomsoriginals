"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn, formatTimestamp, youtubeThumbnailUrl } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { loadYouTubeApi } from "./loadYouTubeApi";
import type { YTPlayer } from "./youtube-types";
import { trackCtaClick, trackVideoEvent, upsertWatchHistory } from "@/lib/tracking";

type NextUp = {
  title: string;
  href: string;
  thumbnailUrl?: string | null;
  youtubeId?: string | null;
};

type Props = {
  youtubeId: string;
  episodeId: string;
  episodeTitle: string;
  episodeNumberLabel?: string;
  nextEpisode?: NextUp | null;
  initialProgress?: number;
};

export function VideoPlayer({
  youtubeId,
  episodeId,
  episodeTitle,
  episodeNumberLabel,
  nextEpisode,
  initialProgress = 0,
}: Props) {
  const [active, setActive] = useState(false);

  if (!active) {
    return (
      <FacadeOverlay
        youtubeId={youtubeId}
        episodeTitle={episodeTitle}
        episodeNumberLabel={episodeNumberLabel}
        onActivate={() => setActive(true)}
      />
    );
  }
  return (
    <ActivePlayer
      youtubeId={youtubeId}
      episodeId={episodeId}
      nextEpisode={nextEpisode ?? null}
      initialProgress={initialProgress}
    />
  );
}

function FacadeOverlay({
  youtubeId,
  episodeTitle,
  episodeNumberLabel,
  onActivate,
}: {
  youtubeId: string;
  episodeTitle: string;
  episodeNumberLabel?: string;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className="group relative block w-full overflow-hidden rounded-3xl bg-navy-900 aspect-video text-left ring-1 ring-white/8 hover:ring-gold-500/50 transition-all duration-500 ease-apple shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)]"
      aria-label={`Reproducir ${episodeTitle}`}
    >
      <Image
        src={youtubeThumbnailUrl(youtubeId, "maxres")}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover transition-transform duration-700 ease-apple group-hover:scale-[1.02]"
        unoptimized
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-navy-950/20" />
      <div className="absolute left-6 top-6 flex items-center gap-3">
        <Logo />
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-gold-500 text-navy-950 shadow-[0_20px_60px_-10px_rgba(212,175,55,0.6)] transition-transform duration-400 ease-apple group-hover:scale-110">
          <Play className="h-9 w-9 translate-x-1" fill="currentColor" />
        </div>
      </div>
      <div className="absolute left-6 right-6 bottom-6">
        {episodeNumberLabel ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-500">
            {episodeNumberLabel}
          </p>
        ) : null}
        <h2 className="mt-2 font-display text-2xl italic text-ivory-50 sm:text-3xl md:text-4xl">
          {episodeTitle}
        </h2>
      </div>
    </button>
  );
}

function ActivePlayer({
  youtubeId,
  episodeId,
  nextEpisode,
  initialProgress,
}: {
  youtubeId: string;
  episodeId: string;
  nextEpisode: NextUp | null;
  initialProgress: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const [nextUpShown, setNextUpShown] = useState(false);
  const lastProgressPush = useRef(0);

  useEffect(() => {
    let destroyed = false;
    loadYouTubeApi().then((YT) => {
      if (destroyed || !playerHostRef.current) return;
      const host = playerHostRef.current;
      host.innerHTML = "";
      const div = document.createElement("div");
      host.appendChild(div);
      new YT.Player(div, {
        videoId: youtubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          controls: 0,
          playsinline: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          origin: typeof window !== "undefined" ? window.location.origin : "",
          start: Math.max(0, Math.floor(initialProgress)),
          cc_load_policy: 1,
        },
        events: {
          onReady: (e) => {
            playerRef.current = e.target;
            setReady(true);
            setDuration(e.target.getDuration());
            setVolume(e.target.getVolume());
            setMuted(e.target.isMuted());
            e.target.playVideo();
          },
          onStateChange: (e) => {
            if (e.data === 1) {
              setPlaying(true);
              trackVideoEvent(episodeId, "play", {
                progressSeconds: Math.floor(e.target.getCurrentTime()),
              });
            }
            if (e.data === 2) {
              setPlaying(false);
              trackVideoEvent(episodeId, "pause", {
                progressSeconds: Math.floor(e.target.getCurrentTime()),
              });
            }
            if (e.data === 0) {
              setPlaying(false);
              trackVideoEvent(episodeId, "complete", {
                progressSeconds: Math.floor(e.target.getCurrentTime()),
              });
              upsertWatchHistory(
                episodeId,
                Math.floor(e.target.getCurrentTime()),
                e.target.getDuration()
              );
            }
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
  }, [youtubeId, episodeId, initialProgress]);

  useEffect(() => {
    if (!ready) return;
    const t = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const time = p.getCurrentTime();
      const dur = p.getDuration();
      setCurrentTime(time);
      if (dur && !duration) setDuration(dur);

      if (dur > 0 && time / dur >= 0.85 && !nextUpShown && nextEpisode) {
        setNextUpShown(true);
      }

      const now = Date.now();
      if (now - lastProgressPush.current > 10000) {
        lastProgressPush.current = now;
        trackVideoEvent(episodeId, "progress", { progressSeconds: Math.floor(time) });
        upsertWatchHistory(episodeId, Math.floor(time), dur);
      }
    }, 500);
    return () => window.clearInterval(t);
  }, [ready, episodeId, duration, nextUpShown, nextEpisode]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  };

  const onVolume = (v: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(v);
    setVolume(v);
    if (v === 0) {
      p.mute();
      setMuted(true);
    } else if (muted) {
      p.unMute();
      setMuted(false);
    }
  };

  const onSeek = (seconds: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.seekTo(seconds, true);
    setCurrentTime(seconds);
    trackVideoEvent(episodeId, "seek", { progressSeconds: Math.floor(seconds) });
  };

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "f") {
        toggleFullscreen();
      } else if (e.key === "m") {
        toggleMute();
      } else if (e.key === "ArrowLeft") {
        onSeek(Math.max(0, currentTime - 10));
      } else if (e.key === "ArrowRight") {
        onSeek(Math.min(duration, currentTime + 10));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, currentTime, duration]);

  const bumpControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 2800);
  };

  useEffect(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2800);
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [playing]);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={bumpControls}
      onTouchStart={bumpControls}
      className={cn(
        "group/player relative overflow-hidden rounded-3xl bg-black ring-1 ring-white/8 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.6)]",
        fullscreen ? "rounded-none" : "aspect-video"
      )}
    >
      <div ref={playerHostRef} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full" />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 opacity-80">
        <Logo />
      </div>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 px-5 pb-4 pt-10 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <ProgressBar current={currentTime} duration={duration} progressPct={progressPct} onSeek={onSeek} />
        <div className="flex items-center gap-4 text-ivory-50">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="grid h-11 w-11 place-items-center rounded-full bg-gold-500 text-navy-950 transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Activar sonido" : "Silenciar"}
              className="grid h-10 w-10 place-items-center rounded-full text-ivory-100 hover:bg-white/10"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => onVolume(parseInt(e.target.value, 10))}
              aria-label="Volumen"
              className="h-1 w-24 cursor-pointer accent-gold-500"
            />
          </div>
          <span className="font-mono text-xs text-ivory-200/80">
            {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackCtaClick("youtube", `https://www.youtube.com/watch?v=${youtubeId}`, episodeId)
              }
              aria-label="Ver en YouTube"
              className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-medium hover:bg-white/20"
            >
              <ExternalLink className="h-4 w-4" />
              Ver en YouTube
            </a>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              className="grid h-10 w-10 place-items-center rounded-full text-ivory-100 hover:bg-white/10"
            >
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {nextUpShown && nextEpisode ? (
        <NextUpCard
          nextEpisode={nextEpisode}
          onDismiss={() => setNextUpShown(false)}
        />
      ) : null}
    </div>
  );
}

function ProgressBar({
  current,
  duration,
  progressPct,
  onSeek,
}: {
  current: number;
  duration: number;
  progressPct: number;
  onSeek: (s: number) => void;
}) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const handle = (clientX: number) => {
    const bar = barRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(pct * duration);
  };
  return (
    <div
      ref={barRef}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={current}
      aria-label="Progreso del video"
      tabIndex={0}
      onClick={(e) => handle(e.clientX)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onSeek(Math.max(0, current - 5));
        if (e.key === "ArrowRight") onSeek(Math.min(duration, current + 5));
      }}
      className="group/bar relative h-1.5 cursor-pointer rounded-full bg-white/20 transition-[height] hover:h-2"
    >
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-gold-500"
        style={{ width: `${progressPct}%` }}
      />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-gold-400 opacity-0 shadow transition-opacity group-hover/bar:opacity-100"
        style={{ left: `${progressPct}%` }}
      />
    </div>
  );
}

function NextUpCard({ nextEpisode, onDismiss }: { nextEpisode: NextUp; onDismiss: () => void }) {
  return (
    <div
      role="complementary"
      className="absolute bottom-20 right-4 w-[320px] max-w-[calc(100%-2rem)] rounded-2xl bg-navy-900/90 p-4 backdrop-blur-md ring-1 ring-gold-500/40 animate-rise"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-500">
        Próximo episodio
      </p>
      <p className="mt-1 line-clamp-2 font-display text-lg italic text-ivory-50">
        {nextEpisode.title}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={nextEpisode.href}
          className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 hover:bg-gold-400"
        >
          Ver ahora
          <ChevronRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full px-3 py-2 text-xs text-ivory-200/80 hover:text-ivory-50"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
