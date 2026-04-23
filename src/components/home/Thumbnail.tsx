import { cn } from "@/lib/utils";
import { YouTubeImage } from "@/components/ui/YouTubeImage";
import Image from "next/image";

export function Thumbnail({
  youtubeId,
  thumbnailUrl,
  alt,
  className,
  priority = false,
  aspect = "video",
  sizes = "(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 22vw",
}: {
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  aspect?: "video" | "poster" | "backdrop";
  sizes?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200",
        aspect === "video" && "aspect-video",
        aspect === "poster" && "aspect-[2/3]",
        aspect === "backdrop" && "aspect-[21/9]",
        className
      )}
    >
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
          unoptimized={thumbnailUrl.includes("ytimg.com")}
        />
      ) : youtubeId ? (
        <YouTubeImage
          youtubeId={youtubeId}
          alt={alt}
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      )}
    </div>
  );
}
