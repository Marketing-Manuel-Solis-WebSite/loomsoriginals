"use client";

import Link from "next/link";
import { YouTubeImage } from "@/components/ui/YouTubeImage";
import { formatDuration } from "@/lib/utils";
import type { EpisodeCard as EpisodeCardType } from "@/lib/queries/types";

type Props = {
  episode: EpisodeCardType;
  seriesSlug: string;
  seasonNumber: number;
  rank: number;
  priority?: boolean;
};

/**
 * Netflix-style "Top 10" tile: large outlined numeral on the left + horizontal
 * 16:9 thumbnail on the right. Aspect matches YouTube source — no cropping.
 */
export function Top10Card({ episode, seriesSlug, seasonNumber, rank, priority }: Props) {
  const href = `/series/${seriesSlug}/t${seasonNumber}/${episode.slug}`;
  const duration = formatDuration(episode.duration_seconds);

  return (
    <Link
      href={href}
      prefetch
      aria-label={`Top ${rank}: ${episode.title_es}`}
      className="group relative flex shrink-0 snap-start items-stretch gap-0 outline-none"
    >
      {/* Big numeral — sits to the left, matches the card's full height */}
      <span
        aria-hidden
        className="relative z-0 -mr-5 flex select-none items-center font-display italic leading-[0.78] tracking-[-0.04em] text-transparent"
        style={{
          fontSize: "clamp(8rem,16vw,14rem)",
          WebkitTextStroke: "2px rgba(212,175,55,0.55)",
          textShadow: "0 30px 60px -25px rgba(212,175,55,0.4)",
        }}
      >
        {rank}
      </span>

      {/* Thumbnail tile — 16:9, matches YouTube native aspect */}
      <div className="relative z-10 w-[260px] shrink-0 sm:w-[300px] lg:w-[340px] self-end">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-white/10 shadow-md transition-all duration-500 ease-apple group-hover:-translate-y-1 group-hover:ring-gold-400/60 group-hover:shadow-[0_24px_48px_-12px_rgba(9,9,11,0.25)]">
          <YouTubeImage
            youtubeId={episode.youtube_id}
            alt={episode.title_es}
            priority={priority}
            sizes="(max-width: 640px) 260px, (max-width: 1024px) 300px, 340px"
            className="object-cover transition-transform duration-700 ease-apple group-hover:scale-[1.06]"
            fallbackLabel={episode.title_es}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <span className="absolute left-2.5 top-2.5 inline-flex items-center rounded-full bg-white/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink shadow-sm">
            T{seasonNumber}·E{episode.episode_number}
          </span>
          {duration ? (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-ink/85 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] text-white">
              {duration}
            </span>
          ) : null}
        </div>

        {/* Title below the tile, like Netflix */}
        <div className="mt-2.5 px-1">
          <h3 className="line-clamp-2 text-[13.5px] font-medium leading-snug text-white group-hover:text-gold-700 transition-colors">
            {episode.title_es}
          </h3>
        </div>
      </div>
    </Link>
  );
}
