import { ImageResponse } from "next/og";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { youtubeThumbnailUrl } from "@/lib/utils";

export const runtime = "edge";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ episodeId: string }> }
) {
  const { episodeId } = await ctx.params;
  const supabase = await getSupabaseServerClient();
  const { data: ep } = await supabase
    .from("episodes")
    .select(
      `title_es, youtube_id, thumbnail_url, episode_number,
       series:series(title_es),
       season:seasons(season_number)`
    )
    .eq("id", episodeId)
    .maybeSingle();

  const backdrop =
    ep?.thumbnail_url ??
    (ep?.youtube_id ? youtubeThumbnailUrl(ep.youtube_id) : null);
  const title = ep?.title_es ?? "Loom Originals";
  const seriesTitle =
    (ep?.series as unknown as { title_es?: string } | null)?.title_es ?? "Loom Originals";
  const ep_label = ep
    ? `T${(ep.season as unknown as { season_number?: number } | null)?.season_number ?? 1} · Episodio ${ep.episode_number}`
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#060f1f",
          color: "#f5f1e8",
          fontFamily: "serif",
        }}
      >
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders to PNG, next/image not applicable
          <img
            src={backdrop}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.5,
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, rgba(6,15,31,0.95) 0%, rgba(6,15,31,0.7) 55%, rgba(6,15,31,0.2) 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 28,
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: -1,
              }}
            >
              L<span style={{ color: "#d4af37" }}>m</span>
            </span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: 4,
                color: "#a8b2c8",
                textTransform: "uppercase",
              }}
            >
              Originals
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
            <span
              style={{
                color: "#d4af37",
                fontSize: 16,
                letterSpacing: 6,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {seriesTitle}
            </span>
            <span
              style={{
                fontSize: 72,
                fontStyle: "italic",
                lineHeight: 1.03,
                letterSpacing: -1.5,
              }}
            >
              {title}
            </span>
            <span style={{ color: "#d9d3c4", fontSize: 20 }}>{ep_label}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
