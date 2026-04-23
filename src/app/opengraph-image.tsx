import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Loom Originals — Historias que reúnen familias";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #ffffff 0%, #fafafa 55%, #f4f4f5 100%)",
          color: "#09090b",
          fontFamily: "serif",
          padding: 80,
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)",
            filter: "blur(10px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.22), transparent 70%)",
            filter: "blur(10px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "baseline", gap: 14, position: "relative" }}>
          <span style={{ fontSize: 42, fontStyle: "italic", fontWeight: 700, letterSpacing: -1 }}>
            L<span style={{ fontWeight: 500, fontStyle: "normal" }}>oo</span>
            <span style={{ color: "#b8860b" }}>m</span>
          </span>
          <span
            style={{
              fontSize: 14,
              letterSpacing: 6,
              color: "#71717a",
              textTransform: "uppercase",
              fontWeight: 600,
              fontFamily: "sans-serif",
            }}
          >
            originals
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 920, position: "relative" }}>
          <span
            style={{
              color: "#b8860b",
              fontSize: 18,
              letterSpacing: 8,
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "sans-serif",
            }}
          >
            Serie original de Loom
          </span>
          <span
            style={{
              fontSize: 92,
              fontStyle: "italic",
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            Historias que <br />
            <span
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #b8860b 70%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              reúnen familias
            </span>
          </span>
          <span style={{ color: "#52525b", fontSize: 22, fontFamily: "sans-serif" }}>
            Una producción de Bufete Manuel Solís.
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
