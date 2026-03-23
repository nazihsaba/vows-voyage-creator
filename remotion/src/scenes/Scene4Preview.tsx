import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { colors, fonts } from "../styles";

export const Scene4Preview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 80 } });
  const cardOp = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const detailsOp = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const detailsY = interpolate(frame, [40, 55], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const badgeOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 60, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${colors.slate} 0%, #1a1a1a 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 40,
    }}>
      <div style={{
        fontFamily: fonts.body, fontSize: 20, color: colors.champagne,
        textTransform: "uppercase", letterSpacing: "4px", fontWeight: 500,
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>Live Preview</div>

      <div style={{
        opacity: cardOp, transform: `scale(${0.85 + cardScale * 0.15})`,
        borderRadius: 24, overflow: "hidden", width: 700, 
        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
      }}>
        <Img src={staticFile("images/preview.jpg")} style={{
          width: "100%", height: 500, objectFit: "cover",
        }} />
        <div style={{
          background: colors.white, padding: "36px 40px", textAlign: "center",
        }}>
          <div style={{
            fontFamily: fonts.heading, fontSize: 44, color: colors.slate,
            fontWeight: 700, marginBottom: 8,
          }}>Alexander & Sophia</div>
          <div style={{
            fontFamily: fonts.body, fontSize: 22, color: colors.muted,
          }}>September 14, 2025</div>
        </div>
      </div>

      <div style={{
        opacity: detailsOp, transform: `translateY(${detailsY}px)`,
        display: "flex", gap: 20,
      }}>
        {["⛪ Ceremony", "🏛️ Reception", "🎵 Music"].map((item) => (
          <div key={item} style={{
            background: `${colors.champagne}20`, border: `1px solid ${colors.champagne}40`,
            color: colors.champagne, fontFamily: fonts.body, fontSize: 20,
            padding: "10px 22px", borderRadius: 30, fontWeight: 500,
          }}>{item}</div>
        ))}
      </div>

      <div style={{
        opacity: badgeOp, transform: `scale(${badgeScale})`,
        background: "#2ECC71", color: colors.white,
        fontFamily: fonts.body, fontSize: 22, fontWeight: 600,
        padding: "14px 36px", borderRadius: 50,
      }}>✓ Invitation Created!</div>
    </AbsoluteFill>
  );
};
