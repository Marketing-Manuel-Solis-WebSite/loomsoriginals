import { cn, youtubeThumbnailUrl } from "@/lib/utils";
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
  const src =
    thumbnailUrl ??
    (youtubeId ? youtubeThumbnailUrl(youtubeId, "maxres") : "/placeholder-thumb.jpg");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-navy-800",
        aspect === "video" && "aspect-video",
        aspect === "poster" && "aspect-[2/3]",
        aspect === "backdrop" && "aspect-[21/9]",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        priority={priority}
        unoptimized={src.includes("ytimg.com")}
      />
    </div>
  );
}
