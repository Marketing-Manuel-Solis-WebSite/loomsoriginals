import Link from "next/link";
import { Play } from "lucide-react";
import { YouTubeImage } from "@/components/ui/YouTubeImage";
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
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-100 transition-all duration-500 ease-apple group-hover:-translate-y-1 group-focus-visible:-translate-y-1 shadow-sm group-hover:shadow-lg ring-1 ring-gray-200 group-hover:ring-gold-400/60">
        <YouTubeImage
          youtubeId={episode.youtube_id}
          alt={episode.title_es}
          priority={priority}
          sizes={size === "lg" ? "(max-width: 768px) 80vw, 360px" : "(max-width: 768px) 70vw, 300px"}
          className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 gradient-card-bottom opacity-60 group-hover:opacity-80 transition-opacity" />

        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink shadow-sm">
          T{seasonNumber}·E{episode.episode_number}
        </span>

        {duration ? (
          <span className="absolute right-3 bottom-3 rounded-full bg-ink/85 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] text-white">
            {duration}
          </span>
        ) : null}

        <div className="absolute inset-0 grid place-items-center opacity-0 transition-all duration-400 ease-apple group-hover:opacity-100 group-focus-visible:opacity-100">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-ink shadow-[0_16px_40px_rgba(0,0,0,0.25)] scale-90 group-hover:scale-100 transition-transform">
            <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
          </div>
        </div>

        {progress !== undefined && progress > 0 ? (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
            <div className="h-full bg-gold-500" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        ) : null}
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-ink group-hover:text-gold-700 transition-colors">
          {episode.title_es}
        </h3>
        {episode.synopsis_es ? (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-gray-500">
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
