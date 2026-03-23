import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../styles";

const fields = [
  { label: "Groom's Name", value: "Alexander", icon: "👤" },
  { label: "Bride's Name", value: "Sophia", icon: "👤" },
  { label: "Wedding Date", value: "September 14, 2025", icon: "📅" },
  { label: "Ceremony", value: "St. Mary's Cathedral", icon: "⛪" },
  { label: "Reception", value: "Grand Ballroom, The Ritz", icon: "🏛️" },
  { label: "Music", value: "A Thousand Years ♪", icon: "🎵" },
];

export const Scene3Form: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${colors.ivory} 0%, ${colors.offWhite} 100%)`,
      padding: "70px 50px",
    }}>
      <div style={{ opacity: titleOp, textAlign: "center", marginBottom: 40 }}>
        <div style={{
          fontFamily: fonts.body, fontSize: 20, color: colors.champagne,
          textTransform: "uppercase", letterSpacing: "4px", fontWeight: 500, marginBottom: 12,
        }}>Step 2</div>
        <div style={{
          fontFamily: fonts.heading, fontSize: 48, color: colors.slate, fontWeight: 700,
        }}>Fill in the Details</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 900, margin: "0 auto" }}>
        {fields.map((f, i) => {
          const delay = 15 + i * 10;
          const s = spring({ frame: frame - delay, fps, config: { damping: 20 } });
          const op = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          const typingEnd = delay + 15;
          const charCount = Math.floor(interpolate(frame, [delay + 5, typingEnd], [0, f.value.length], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          }));

          return (
            <div key={f.label} style={{
              opacity: op, transform: `translateX(${(1 - s) * 60}px)`,
              background: colors.white, borderRadius: 16, padding: "20px 28px",
              border: `1px solid ${colors.champagne}30`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{ fontSize: 32 }}>{f.icon}</div>
              <div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 18, color: colors.muted,
                  fontWeight: 500, marginBottom: 4,
                }}>{f.label}</div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 28, color: colors.slate, fontWeight: 600,
                }}>
                  {f.value.slice(0, charCount)}
                  {charCount < f.value.length && (
                    <span style={{
                      opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                      color: colors.champagne,
                    }}>|</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: "absolute", bottom: 100, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          background: colors.champagne, color: colors.white,
          fontFamily: fonts.body, fontSize: 24, fontWeight: 600,
          padding: "16px 50px", borderRadius: 50,
          boxShadow: "0 8px 30px rgba(212,184,150,0.4)",
        }}>Create Invitation ✓</div>
      </div>
    </AbsoluteFill>
  );
};
