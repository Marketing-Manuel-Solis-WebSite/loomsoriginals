import Link from "next/link";
import Image from "next/image";
import type { SeriesCard as SeriesCardType } from "@/lib/queries/types";
import { cn, youtubeThumbnailUrl } from "@/lib/utils";

export function SeriesCard({
  series,
  variant = "backdrop",
  priority,
  fullWidth = false,
}: {
  series: SeriesCardType;
  variant?: "poster" | "backdrop";
  priority?: boolean;
  fullWidth?: boolean;
}) {
  const src =
    series.poster_url ??
    (series.trailer_youtube_id ? youtubeThumbnailUrl(series.trailer_youtube_id, "hq") : null);
  const backdropSrc =
    series.backdrop_url ??
    (series.trailer_youtube_id ? youtubeThumbnailUrl(series.trailer_youtube_id, "hq") : null);

  return (
    <Link
      href={`/series/${series.slug}`}
      prefetch
      className={cn(
        "group relative block outline-none",
        fullWidth ? "w-full" : "shrink-0 snap-start",
        !fullWidth && (variant === "poster" ? "w-[190px] sm:w-[220px]" : "w-[280px] sm:w-[340px] lg:w-[380px]")
      )}
      aria-label={series.title_es}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200 transition-all duration-500 ease-apple group-hover:-translate-y-1 group-hover:ring-gold-400/60 shadow-sm group-hover:shadow-lg",
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
              className="object-cover transition-transform duration-700 ease-apple group-hover:scale-105"
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
            sizes={fullWidth ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 640px) 80vw, 380px"}
            className="object-cover transition-transform duration-700 ease-apple group-hover:scale-[1.03]"
            priority={priority}
            unoptimized={backdropSrc.includes("ytimg.com")}
          />
        ) : (
          <PosterPlaceholder title={series.title_es} />
        )}
        <div className="pointer-events-none absolute inset-0 gradient-card-bottom opacity-70" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="line-clamp-2 font-display text-lg italic leading-tight text-white">
            {series.title_es}
          </p>
          {series.release_year ? (
            <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-gold-300">
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
    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <div className="absolute inset-0 grid place-items-center">
        <span className="px-4 text-center font-display text-2xl italic text-gold-700">{title}</span>
      </div>
    </div>
  );
}
