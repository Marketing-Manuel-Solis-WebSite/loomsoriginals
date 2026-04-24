"use client";

import Image from "next/image";
import { useState } from "react";

export function YouTubeImage({
  youtubeId,
  alt,
  className,
  priority = false,
  sizes,
  fill = true,
  fallbackLabel,
}: {
  youtubeId: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  fallbackLabel?: string | null;
}) {
  const candidates = [
    `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
  ];
  const [idx, setIdx] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  if (failedAll) {
    return <ThumbnailPlaceholder label={fallbackLabel ?? alt} />;
  }

  const src = candidates[idx];

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
        else setFailedAll(true);
      }}
    />
  );
}

function ThumbnailPlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden bg-gradient-to-br from-gold-50 via-paper to-gold-100">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(212,175,55,0.12) 0 2px, transparent 2px 22px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 px-6 text-center">
        <span className="font-display text-3xl italic text-gold-700">
          L<span className="text-gold-500">m</span>
        </span>
        <span className="line-clamp-3 text-[12px] font-medium uppercase tracking-[0.12em] text-gray-600">
          {label.length > 50 ? label.slice(0, 50) + "…" : label}
        </span>
      </div>
    </div>
  );
}
