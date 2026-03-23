import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { colors, fonts } from "../styles";
import { Caption } from "../components/Caption";

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 80 } });
  const logoOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bgScale = interpolate(frame, [0, 120], [1.1, 1], { extrapolateRight: "clamp" });
  const overlayOpacity = interpolate(frame, [0, 30], [0.7, 0.55], { extrapolateRight: "clamp" });

  const tagY = interpolate(frame, [40, 60], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subtitleOp = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [65, 85], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: colors.slate }}>
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${bgScale})`,
      }}>
        <Img src={staticFile("images/hero.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(43,43,43,${overlayOpacity})` }} />

      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 30,
      }}>
        <div style={{
          transform: `scale(${logoScale})`, opacity: logoOpacity,
        }}>
          <Img src={staticFile("images/logo.png")} style={{ width: 280, objectFit: "contain" }} />
        </div>

        <div style={{
          opacity: tagOp, transform: `translateY(${tagY}px)`,
          fontFamily: fonts.heading, fontSize: 48, color: colors.white,
          fontWeight: 700, textAlign: "center", lineHeight: 1.3, padding: "0 40px",
        }}>
          Create Beautiful{"\n"}Event Invitations
        </div>

        <div style={{
          opacity: subtitleOp, transform: `translateY(${subtitleY}px)`,
          fontFamily: fonts.body, fontSize: 24, color: colors.champagne,
          fontWeight: 300, letterSpacing: "3px", textTransform: "uppercase",
        }}>
          Elegant • Digital • Instant
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 120, left: 0, right: 0,
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [80, 100], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
          background: colors.champagne, color: colors.white,
          fontFamily: fonts.body, fontSize: 26, fontWeight: 600,
          padding: "18px 50px", borderRadius: 50,
          boxShadow: "0 10px 40px rgba(212,184,150,0.5)",
        }}>
          ✨ See How It Works
        </div>
      </div>
    </AbsoluteFill>
  );
};
