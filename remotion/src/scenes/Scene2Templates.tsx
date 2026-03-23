import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { colors, fonts } from "../styles";

const templates = [
  { name: "Aura", img: "aura.jpg", desc: "Warm & Romantic" },
  { name: "Éclat", img: "eclat.jpg", desc: "Bold & Modern" },
  { name: "Vérité", img: "verite.jpg", desc: "Classic Elegance" },
  { name: "Grâce", img: "aura2.jpg", desc: "Cinematic Beauty" },
];

export const Scene2Templates: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${colors.offWhite} 0%, ${colors.ivory} 100%)`,
      padding: "80px 50px",
    }}>
      <div style={{
        opacity: titleOp, transform: `translateY(${titleY}px)`,
        textAlign: "center", marginBottom: 50,
      }}>
        <div style={{
          fontFamily: fonts.body, fontSize: 20, color: colors.champagne,
          textTransform: "uppercase", letterSpacing: "4px", fontWeight: 500, marginBottom: 12,
        }}>Step 1</div>
        <div style={{
          fontFamily: fonts.heading, fontSize: 52, color: colors.slate, fontWeight: 700,
        }}>Choose Your Template</div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
        maxWidth: 900, margin: "0 auto",
      }}>
        {templates.map((t, i) => {
          const delay = 20 + i * 12;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15 } });
          const op = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div key={t.name} style={{
              opacity: op, transform: `scale(${0.8 + s * 0.2})`,
              borderRadius: 20, overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              background: colors.white,
            }}>
              <Img src={staticFile(`images/${t.img}`)} style={{
                width: "100%", height: 500, objectFit: "cover",
              }} />
              <div style={{ padding: "20px 24px" }}>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 30, color: colors.slate, fontWeight: 700,
                }}>{t.name}</div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 20, color: colors.muted, marginTop: 4,
                }}>{t.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)",
        opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          background: `${colors.champagne}20`, border: `2px solid ${colors.champagne}`,
          color: colors.champagne, fontFamily: fonts.body, fontSize: 22,
          fontWeight: 600, padding: "14px 40px", borderRadius: 50,
        }}>Select Template →</div>
      </div>
    </AbsoluteFill>
  );
};
