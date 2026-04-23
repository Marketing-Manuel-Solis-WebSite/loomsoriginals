"use client";

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

export async function trackVideoEvent(
  episodeId: string,
  eventType: VideoEvent,
  data?: { progressSeconds?: number; metadata?: Json }
) {
  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("video_events").insert({
      episode_id: episodeId,
      event_type: eventType,
      progress_seconds: data?.progressSeconds ?? null,
      metadata: data?.metadata ?? null,
    });
    if (typeof window !== "undefined") {
      window.gtag?.("event", `video_${eventType}`, {
        episode_id: episodeId,
        progress_seconds: data?.progressSeconds,
      });
      if (eventType === "complete") window.fbq?.("trackCustom", "VideoComplete", { episode_id: episodeId });
    }
  } catch (err) {
    console.warn("trackVideoEvent failed", err);
  }
}

export type CtaType = "consultation" | "youtube" | "whatsapp" | "phone" | "subscribe" | "social";

export async function trackCtaClick(
  ctaType: CtaType,
  destinationUrl: string,
  episodeId?: string | null
) {
  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("cta_clicks").insert({
      cta_type: ctaType,
      destination_url: destinationUrl,
      episode_id: episodeId ?? null,
    });
    if (typeof window !== "undefined") {
      window.gtag?.("event", "cta_click", { cta_type: ctaType, destination: destinationUrl });
      if (ctaType === "consultation") {
        window.gtag?.("event", "conversion", { send_to: ctaType });
        window.fbq?.("track", "Lead", { content_name: "consultation" });
      }
    }
  } catch (err) {
    console.warn("trackCtaClick failed", err);
  }
}

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
