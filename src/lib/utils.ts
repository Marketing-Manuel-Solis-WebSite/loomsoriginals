import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds <= 0) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return `${seconds}s`;
}

export function formatDurationISO(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds <= 0) return "PT0S";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  let out = "PT";
  if (hours) out += `${hours}H`;
  if (minutes) out += `${minutes}M`;
  if (seconds || (!hours && !minutes)) out += `${seconds}S`;
  return out;
}

export function formatTimestamp(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://loomsoriginal.com";
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function withUtm(
  url: string,
  params: { source?: string; medium?: string; campaign?: string; content?: string; term?: string }
): string {
  try {
    const u = new URL(url);
    if (params.source) u.searchParams.set("utm_source", params.source);
    if (params.medium) u.searchParams.set("utm_medium", params.medium);
    if (params.campaign) u.searchParams.set("utm_campaign", params.campaign);
    if (params.content) u.searchParams.set("utm_content", params.content);
    if (params.term) u.searchParams.set("utm_term", params.term);
    return u.toString();
  } catch {
    return url;
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function youtubeThumbnailUrl(
  videoId: string,
  quality: "hq" | "sd" | "maxres" = "hq"
): string {
  // hqdefault.jpg is always available (480x360) — safe default.
  // maxresdefault.jpg (1280x720) is nicer but not uploaded for every video.
  // sddefault.jpg (640x480) is an alternative, also not universally available.
  const q = quality === "maxres" ? "maxresdefault" : quality === "sd" ? "sddefault" : "hqdefault";
  return `https://i.ytimg.com/vi/${videoId}/${q}.jpg`;
}

/** Returns a list of candidate URLs in decreasing quality, all guaranteed valid formats. */
export function youtubeThumbnailCandidates(videoId: string): string[] {
  return [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  ];
}
