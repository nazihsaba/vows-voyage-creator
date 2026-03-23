import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { colors, fonts } from "../styles";

export const Scene7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgScale = interpolate(frame, [0, 120], [1.05, 1], { extrapolateRight: "clamp" });

  const logoScale = spring({ frame: frame - 15, fps, config: { damping: 12 } });
  const logoOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const headOp = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headY = interpolate(frame, [30, 50], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ctaOp = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - 55, fps, config: { damping: 10 } });

  const pulse = Math.sin(frame * 0.08) * 3;

  return (
    <AbsoluteFill style={{ background: colors.slate }}>
      <div style={{
        position: "absolute", inset: 0, transform: `scale(${bgScale})`, opacity: 0.3,
      }}>
        <Img src={staticFile("images/flowers.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(43,43,43,0.7)" }} />

      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 40,
      }}>
        <div style={{ opacity: logoOp, transform: `scale(${logoScale})` }}>
          <Img src={staticFile("images/logo.png")} style={{ width: 240, objectFit: "contain" }} />
        </div>

        <div style={{
          opacity: headOp, transform: `translateY(${headY}px)`,
          textAlign: "center", padding: "0 60px",
        }}>
          <div style={{
            fontFamily: fonts.heading, fontSize: 52, color: colors.white,
            fontWeight: 700, lineHeight: 1.3, marginBottom: 16,
          }}>Start Creating{"\n"}Your Invitation</div>
          <div style={{
            fontFamily: fonts.body, fontSize: 24, color: colors.champagne,
            fontWeight: 300, letterSpacing: "2px",
          }}>No coding needed • Mobile-friendly</div>
        </div>

        <div style={{
          opacity: ctaOp, transform: `scale(${ctaScale}) translateY(${pulse}px)`,
          background: `linear-gradient(135deg, ${colors.champagne}, ${colors.champagneDark})`,
          color: colors.white,
          fontFamily: fonts.body, fontSize: 28, fontWeight: 700,
          padding: "20px 60px", borderRadius: 50,
          boxShadow: "0 12px 40px rgba(212,184,150,0.5)",
        }}>Get Started Free →</div>

        <div style={{
          opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontFamily: fonts.body, fontSize: 18, color: `${colors.white}80`,
          letterSpacing: "3px", textTransform: "uppercase",
        }}>aureainvites.com</div>
      </div>
    </AbsoluteFill>
  );
};
