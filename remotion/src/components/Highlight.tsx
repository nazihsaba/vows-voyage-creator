import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../styles";

export const Highlight: React.FC<{
  label: string; delay?: number; x: number; y: number; width?: number;
}> = ({ label, delay = 0, x, y, width = 220 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;

  const scale = spring({ frame: f, fps, config: { damping: 12, stiffness: 150 } });
  const opacity = interpolate(f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `scale(${scale})`, opacity, transformOrigin: "center",
    }}>
      <div style={{
        background: colors.champagne, color: colors.white,
        fontFamily: fonts.body, fontSize: 22, fontWeight: 600,
        padding: "12px 28px", borderRadius: 50, textAlign: "center",
        boxShadow: "0 8px 30px rgba(212,184,150,0.4)",
        width,
      }}>{label}</div>
      <div style={{
        width: 2, height: 40, background: colors.champagne,
        margin: "0 auto",
      }} />
    </div>
  );
};
