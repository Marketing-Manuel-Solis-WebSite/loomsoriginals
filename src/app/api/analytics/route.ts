import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

const PayloadSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("video_event"),
    episode_id: z.string().uuid(),
    event_type: z.enum([
      "play",
      "pause",
      "progress",
      "complete",
      "cta_click",
      "youtube_redirect",
      "share",
      "favorite",
      "unfavorite",
      "seek",
    ]),
    progress_seconds: z.number().int().nonnegative().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  }),
  z.object({
    kind: z.literal("cta_click"),
    episode_id: z.string().uuid().nullable().optional(),
    cta_type: z.enum(["consultation", "youtube", "whatsapp", "phone", "subscribe", "social"]),
    destination_url: z.string().url().nullable().optional(),
  }),
]);

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }
  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid-payload" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  if (parsed.data.kind === "video_event") {
    const { kind: _k, ...rest } = parsed.data;
    void _k;
    await supabase.from("video_events").insert({
      episode_id: rest.episode_id,
      event_type: rest.event_type,
      progress_seconds: rest.progress_seconds ?? null,
      metadata: (rest.metadata ?? null) as Json | null,
    });
  } else {
    await supabase.from("cta_clicks").insert({
      episode_id: parsed.data.episode_id ?? null,
      cta_type: parsed.data.cta_type,
      destination_url: parsed.data.destination_url ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
