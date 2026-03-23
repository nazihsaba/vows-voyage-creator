import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../styles";

export const Caption: React.FC<{ text: string; sub?: string; delay?: number }> = ({
  text, sub, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const opacity = interpolate(f, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [0, 15], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineWidth = spring({ frame: f - 5, fps, config: { damping: 30 } });

  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, textAlign: "center", padding: "0 60px" }}>
      <div style={{
        width: `${lineWidth * 80}px`, height: 2, background: colors.champagne,
        margin: "0 auto 20px", transition: "none",
      }} />
      <div style={{
        fontFamily: fonts.heading, fontSize: 42, color: colors.slate,
        fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.5px",
      }}>{text}</div>
      {sub && (
        <div style={{
          fontFamily: fonts.body, fontSize: 26, color: colors.muted,
          marginTop: 12, fontWeight: 400, letterSpacing: "1px",
        }}>{sub}</div>
      )}
    </div>
  );
};
