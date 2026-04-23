"use client";

import Image from "next/image";
import { useState } from "react";
import { youtubeThumbnailCandidates } from "@/lib/utils";

export function YouTubeImage({
  youtubeId,
  alt,
  className,
  priority = false,
  sizes,
  fill = true,
  fallback,
}: {
  youtubeId: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  fallback?: string | null;
}) {
  const candidates = youtubeThumbnailCandidates(youtubeId);
  const [idx, setIdx] = useState(0);
  const src = candidates[idx] ?? fallback ?? candidates[candidates.length - 1];

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      {...(fill ? {} : { width: 1280, height: 720 })}
      sizes={sizes}
      priority={priority}
      unoptimized
      className={className}
      onError={() => {
        if (idx < candidates.length - 1) setIdx(idx + 1);
      }}
    />
  );
}
