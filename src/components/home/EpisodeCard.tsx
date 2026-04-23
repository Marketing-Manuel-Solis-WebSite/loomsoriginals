import Link from "next/link";
import { Play } from "lucide-react";
import { Thumbnail } from "./Thumbnail";
import { formatDuration } from "@/lib/utils";
import type { EpisodeCard as EpisodeCardType } from "@/lib/queries/types";
import type { Series } from "@/lib/supabase/types";

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
  return (
    <Link
      href={href}
      prefetch
      className="group relative block w-[280px] shrink-0 snap-start sm:w-[340px] lg:w-[360px] outline-none"
      aria-label={episode.title_es}
    >
      <div className="relative overflow-hidden rounded-2xl transition-all duration-400 ease-apple group-hover:-translate-y-1 group-hover:scale-[1.025] group-focus-visible:-translate-y-1 group-focus-visible:scale-[1.025] shadow-[0_2px_12px_rgba(6,15,31,0.3)] group-hover:shadow-[0_20px_60px_-10px_rgba(212,175,55,0.2)] ring-1 ring-white/5 group-hover:ring-gold-500/35">
        <Thumbnail
          youtubeId={episode.youtube_id}
          thumbnailUrl={episode.thumbnail_url}
          alt={episode.title_es}
          priority={priority}
          sizes={
            size === "lg"
              ? "(max-width: 768px) 80vw, 360px"
              : "(max-width: 768px) 70vw, 300px"
          }
        />
        <div className="pointer-events-none absolute inset-0 gradient-card-bottom" />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-apple group-hover:opacity-100 group-focus-visible:opacity-100 bg-gradient-to-b from-navy-950/30 via-transparent to-navy-950/70" />

        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-navy-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory-100 backdrop-blur-md">
          T{seasonNumber}:E{episode.episode_number}
        </span>

        {duration ? (
          <span className="absolute right-3 bottom-3 rounded-full bg-navy-950/75 px-2.5 py-1 font-mono text-[10px] text-ivory-100 backdrop-blur-md">
            {duration}
          </span>
        ) : null}

        <div className="absolute inset-0 grid place-items-center opacity-0 transition-all duration-400 ease-apple group-hover:opacity-100 group-focus-visible:opacity-100">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gold-500/95 text-navy-950 shadow-[0_12px_32px_rgba(212,175,55,0.45)]">
            <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
          </div>
        </div>

        {progress !== undefined && progress > 0 ? (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-navy-950/60">
            <div className="h-full bg-gold-500" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        ) : null}
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-ivory-100 group-hover:text-gold-500 transition-colors">
          {episode.title_es}
        </h3>
        {episode.synopsis_es ? (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-400">
            {episode.synopsis_es}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export type EpisodeWithSeries = EpisodeCardType & {
  series?: Pick<Series, "slug"> | null;
  season_number?: number;
};
