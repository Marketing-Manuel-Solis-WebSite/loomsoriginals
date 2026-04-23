import Link from "next/link";
import Image from "next/image";
import type { SeriesCard as SeriesCardType } from "@/lib/queries/types";
import { cn, youtubeThumbnailUrl } from "@/lib/utils";

export function SeriesCard({
  series,
  variant = "poster",
  priority,
}: {
  series: SeriesCardType;
  variant?: "poster" | "backdrop";
  priority?: boolean;
}) {
  const src =
    series.poster_url ??
    (series.trailer_youtube_id ? youtubeThumbnailUrl(series.trailer_youtube_id) : null);
  const backdropSrc =
    series.backdrop_url ??
    (series.trailer_youtube_id ? youtubeThumbnailUrl(series.trailer_youtube_id) : null);

  return (
    <Link
      href={`/series/${series.slug}`}
      prefetch
      className={cn(
        "group relative block shrink-0 snap-start outline-none",
        variant === "poster" ? "w-[190px] sm:w-[220px]" : "w-[340px] sm:w-[400px]"
      )}
      aria-label={series.title_es}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl ring-1 ring-white/5 transition-all duration-400 ease-apple group-hover:-translate-y-1 group-hover:ring-gold-500/40 shadow-[0_2px_12px_rgba(6,15,31,0.3)] group-hover:shadow-[0_20px_60px_-10px_rgba(212,175,55,0.18)]",
          variant === "poster" ? "aspect-[2/3]" : "aspect-video"
        )}
      >
        {variant === "poster" ? (
          src ? (
            <Image
              src={src}
              alt={series.title_es}
              fill
              sizes="(max-width: 640px) 50vw, 220px"
              className="object-cover"
              priority={priority}
              unoptimized={src.includes("ytimg.com")}
            />
          ) : (
            <PosterPlaceholder title={series.title_es} />
          )
        ) : backdropSrc ? (
          <Image
            src={backdropSrc}
            alt={series.title_es}
            fill
            sizes="(max-width: 640px) 80vw, 400px"
            className="object-cover"
            priority={priority}
            unoptimized={backdropSrc.includes("ytimg.com")}
          />
        ) : (
          <PosterPlaceholder title={series.title_es} />
        )}
        <div className="pointer-events-none absolute inset-0 gradient-card-bottom" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-2 font-display text-base italic leading-tight text-ivory-50">
            {series.title_es}
          </p>
          {series.release_year ? (
            <p className="mt-0.5 text-[10px] font-mono uppercase tracking-widest text-gold-500">
              {series.release_year}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function PosterPlaceholder({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950">
      <div className="absolute inset-0 grid place-items-center">
        <span className="px-4 text-center font-display text-2xl italic text-gold-500/80">
          {title}
        </span>
      </div>
    </div>
  );
}
