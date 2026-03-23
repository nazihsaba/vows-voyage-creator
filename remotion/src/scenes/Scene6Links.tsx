import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../styles";

const guests = [
  { name: "Sarah Johnson", persons: 2, rsvp: "Attending" },
  { name: "Michael Chen", persons: 3, rsvp: "Attending" },
  { name: "Emily Davis", persons: 1, rsvp: "Pending" },
  { name: "Robert Wilson", persons: 4, rsvp: "Attending" },
];

export const Scene6Links: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${colors.ivory} 0%, ${colors.offWhite} 100%)`,
      padding: "70px 50px",
    }}>
      <div style={{
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        textAlign: "center", marginBottom: 40,
      }}>
        <div style={{
          fontFamily: fonts.body, fontSize: 20, color: colors.champagne,
          textTransform: "uppercase", letterSpacing: "4px", fontWeight: 500, marginBottom: 12,
        }}>Step 4</div>
        <div style={{
          fontFamily: fonts.heading, fontSize: 44, color: colors.slate, fontWeight: 700,
        }}>Share & Track Invitations</div>
      </div>

      <div style={{
        display: "flex", gap: 16, justifyContent: "center", marginBottom: 30,
        opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        {["📤 Upload Excel", "✏️ Manual Entry"].map((m, i) => (
          <div key={m} style={{
            background: i === 0 ? colors.champagne : colors.white,
            color: i === 0 ? colors.white : colors.slate,
            border: i === 0 ? "none" : `2px solid ${colors.champagne}40`,
            fontFamily: fonts.body, fontSize: 22, fontWeight: 600,
            padding: "14px 30px", borderRadius: 50,
          }}>{m}</div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {guests.map((g, i) => {
          const delay = 30 + i * 10;
          const s = spring({ frame: frame - delay, fps, config: { damping: 20 } });
          const op = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div key={g.name} style={{
              opacity: op, transform: `scale(${0.9 + s * 0.1})`,
              background: colors.white, borderRadius: 16, padding: "22px 28px",
              border: `1px solid ${colors.champagne}15`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 24, color: colors.slate, fontWeight: 600,
                }}>{g.name}</div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 18, color: colors.muted, marginTop: 4,
                }}>👥 {g.persons} person{g.persons > 1 ? "s" : ""}</div>
              </div>
              <div style={{
                background: g.rsvp === "Attending" ? "#2ECC7118" : `${colors.champagne}18`,
                color: g.rsvp === "Attending" ? "#2ECC71" : colors.champagne,
                fontFamily: fonts.body, fontSize: 18, fontWeight: 600,
                padding: "8px 20px", borderRadius: 30,
              }}>{g.rsvp}</div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: "absolute", bottom: 120, left: 0, right: 0,
        textAlign: "center",
        opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          fontFamily: fonts.body, fontSize: 20, color: colors.muted,
        }}>📊 3 Attending · 1 Pending · 10 Guests Total</div>
      </div>
    </AbsoluteFill>
  );
};
