"use client";

import { track as vercelTrack } from "@vercel/analytics";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

export type VideoEvent =
  | "play"
  | "pause"
  | "progress"
  | "complete"
  | "cta_click"
  | "youtube_redirect"
  | "share"
  | "favorite"
  | "unfavorite"
  | "seek";

export type CtaType =
  | "consultation"
  | "youtube"
  | "whatsapp"
  | "phone"
  | "subscribe"
  | "social"
  | "reviews"
  | "law-firm"
  | "search";

type VercelEventProps = Record<string, string | number | boolean | null>;

function sanitizeProps(input: Record<string, unknown> | null | undefined): VercelEventProps {
  if (!input) return {};
  const out: VercelEventProps = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = v;
    } else {
      out[k] = String(v);
    }
  }
  return out;
}

function forwardToVercel(name: string, props?: Record<string, unknown>) {
  try {
    vercelTrack(name, sanitizeProps(props));
  } catch {
    // analytics silently disabled
  }
}

function forwardToGA(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, sanitizeProps(props));
  } catch {
    // ignore
  }
}

function forwardToMeta(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.fbq?.("trackCustom", event, sanitizeProps(props));
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────
// Video events
// ─────────────────────────────────────────────────────────────────────
export async function trackVideoEvent(
  episodeId: string,
  eventType: VideoEvent,
  data?: {
    progressSeconds?: number;
    durationSeconds?: number | null;
    episodeSlug?: string;
    episodeTitle?: string;
    seriesSlug?: string;
    metadata?: Json;
  }
) {
  const progress = data?.progressSeconds ?? null;
  const duration = data?.durationSeconds ?? null;
  const pct =
    duration && duration > 0 && progress !== null
      ? Math.round((progress / duration) * 100)
      : null;

  const props: VercelEventProps = {
    episode_id: episodeId,
    event_type: eventType,
  };
  if (data?.episodeSlug) props.episode_slug = data.episodeSlug;
  if (data?.episodeTitle) props.episode_title = data.episodeTitle;
  if (data?.seriesSlug) props.series_slug = data.seriesSlug;
  if (progress !== null) props.progress_seconds = progress;
  if (duration !== null) props.duration_seconds = duration;
  if (pct !== null) props.progress_pct = pct;

  forwardToVercel(`video_${eventType}`, props);
  forwardToGA(`video_${eventType}`, props);
  if (eventType === "play") forwardToMeta("ViewContent", props);
  if (eventType === "complete") forwardToMeta("VideoComplete", props);

  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("video_events").insert({
      episode_id: episodeId,
      event_type: eventType,
      progress_seconds: progress,
      metadata: (data?.metadata ?? {
        pct,
        duration,
        slug: data?.episodeSlug ?? null,
        title: data?.episodeTitle ?? null,
        series: data?.seriesSlug ?? null,
      }) as Json,
    });
  } catch (err) {
    console.warn("trackVideoEvent(supabase) failed", err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Percent-based milestones (25 / 50 / 75 / 90)
// ─────────────────────────────────────────────────────────────────────
export async function trackMilestone(
  episodeId: string,
  milestone: 25 | 50 | 75 | 90,
  extra?: { episodeSlug?: string; episodeTitle?: string; seriesSlug?: string; durationSeconds?: number | null }
) {
  const props: VercelEventProps = { episode_id: episodeId, milestone };
  if (extra?.episodeSlug) props.episode_slug = extra.episodeSlug;
  if (extra?.episodeTitle) props.episode_title = extra.episodeTitle;
  if (extra?.seriesSlug) props.series_slug = extra.seriesSlug;

  forwardToVercel(`video_milestone_${milestone}`, props);
  forwardToGA(`video_milestone`, props);

  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("video_events").insert({
      episode_id: episodeId,
      event_type: "progress",
      progress_seconds:
        extra?.durationSeconds && extra.durationSeconds > 0
          ? Math.floor((milestone / 100) * extra.durationSeconds)
          : null,
      metadata: {
        milestone,
        slug: extra?.episodeSlug ?? null,
        title: extra?.episodeTitle ?? null,
        series: extra?.seriesSlug ?? null,
      } as Json,
    });
  } catch (err) {
    console.warn("trackMilestone failed", err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// CTA click — links that take the user off-site or to legal flows
// ─────────────────────────────────────────────────────────────────────
export async function trackCtaClick(
  ctaType: CtaType,
  destinationUrl: string,
  episodeId?: string | null,
  extra?: { episodeSlug?: string; seriesSlug?: string; source?: string; label?: string }
) {
  const props: VercelEventProps = { cta_type: ctaType, destination: destinationUrl };
  if (episodeId) props.episode_id = episodeId;
  if (extra?.episodeSlug) props.episode_slug = extra.episodeSlug;
  if (extra?.seriesSlug) props.series_slug = extra.seriesSlug;
  if (extra?.source) props.source = extra.source;
  if (extra?.label) props.label = extra.label;

  forwardToVercel(`cta_${ctaType}`, props);
  forwardToGA("cta_click", props);
  if (ctaType === "consultation") {
    forwardToMeta("Lead", { content_name: "consultation", destination: destinationUrl });
    forwardToGA("conversion", { send_to: "consultation", destination: destinationUrl });
  }
  if (ctaType === "reviews") {
    forwardToMeta("ViewContent", { content_type: "reviews" });
  }

  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("cta_clicks").insert({
      cta_type: ctaType,
      destination_url: destinationUrl,
      episode_id: episodeId ?? null,
    });
  } catch (err) {
    console.warn("trackCtaClick failed", err);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Discrete interactions — search, category browse, login, etc.
// ─────────────────────────────────────────────────────────────────────
export function trackSearch(query: string, resultCount: number) {
  const props = { query, result_count: resultCount };
  forwardToVercel("search", props);
  forwardToGA("search", { search_term: query, result_count: resultCount });
  forwardToMeta("Search", { search_string: query });
}

export function trackCategoryView(categorySlug: string) {
  forwardToVercel("category_view", { category: categorySlug });
  forwardToGA("category_view", { category: categorySlug });
}

export function trackSeriesView(seriesSlug: string) {
  forwardToVercel("series_view", { series: seriesSlug });
  forwardToGA("series_view", { series: seriesSlug });
}

export function trackSignInAttempt(method: "magic_link" | "google") {
  forwardToVercel("sign_in_attempt", { method });
  forwardToGA("login_attempt", { method });
}

export function trackSignInSuccess(method: "magic_link" | "google") {
  forwardToVercel("sign_in_success", { method });
  forwardToGA("login", { method });
  forwardToMeta("CompleteRegistration", { method });
}

export function trackShare(episodeId: string, channel: "clipboard" | "whatsapp" | "facebook" | "x") {
  const props = { episode_id: episodeId, channel };
  forwardToVercel("episode_share", props);
  forwardToGA("share", { method: channel, content_id: episodeId, content_type: "video" });
}

export function trackSocialClick(network: "instagram" | "facebook" | "tiktok" | "youtube") {
  forwardToVercel("social_click", { network });
  forwardToGA("social_click", { network });
}

// ─────────────────────────────────────────────────────────────────────
// Watch history
// ─────────────────────────────────────────────────────────────────────
export async function upsertWatchHistory(
  episodeId: string,
  progressSeconds: number,
  durationSeconds?: number | null
) {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;
    const completed =
      durationSeconds && durationSeconds > 0
        ? progressSeconds / durationSeconds >= 0.92
        : false;
    await supabase.from("watch_history").upsert(
      {
        user_id: userId,
        episode_id: episodeId,
        progress_seconds: Math.floor(progressSeconds),
        completed,
        last_watched_at: new Date().toISOString(),
      },
      { onConflict: "user_id,episode_id" }
    );
  } catch (err) {
    console.warn("upsertWatchHistory failed", err);
  }
}
