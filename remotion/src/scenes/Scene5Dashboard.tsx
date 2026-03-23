import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fonts } from "../styles";

const events = [
  { names: "Alexander & Sophia", date: "Sep 14, 2025", status: "Published", template: "Aura" },
  { names: "James & Emma", date: "Oct 22, 2025", status: "Draft", template: "Éclat" },
  { names: "David & Olivia", date: "Dec 05, 2025", status: "Published", template: "Vérité" },
];

export const Scene5Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, ${colors.offWhite} 0%, ${colors.ivory} 100%)`,
      padding: "70px 50px",
    }}>
      <div style={{
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        textAlign: "center", marginBottom: 50,
      }}>
        <div style={{
          fontFamily: fonts.body, fontSize: 20, color: colors.champagne,
          textTransform: "uppercase", letterSpacing: "4px", fontWeight: 500, marginBottom: 12,
        }}>Step 3</div>
        <div style={{
          fontFamily: fonts.heading, fontSize: 48, color: colors.slate, fontWeight: 700,
        }}>Your Events Dashboard</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {events.map((e, i) => {
          const delay = 15 + i * 15;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
          const op = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          return (
            <div key={e.names} style={{
              opacity: op, transform: `translateY(${(1 - s) * 40}px)`,
              background: colors.white, borderRadius: 20, padding: "28px 32px",
              border: `1px solid ${colors.champagne}20`,
              boxShadow: "0 6px 30px rgba(0,0,0,0.05)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontFamily: fonts.heading, fontSize: 30, color: colors.slate, fontWeight: 700,
                }}>{e.names}</div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 20, color: colors.muted, marginTop: 6,
                }}>📅 {e.date} · {e.template}</div>
              </div>
              <div style={{
                display: "flex", gap: 12, alignItems: "center",
              }}>
                <div style={{
                  background: e.status === "Published" ? "#2ECC7120" : `${colors.champagne}20`,
                  color: e.status === "Published" ? "#2ECC71" : colors.champagne,
                  fontFamily: fonts.body, fontSize: 18, fontWeight: 600,
                  padding: "8px 20px", borderRadius: 30,
                }}>{e.status}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: "absolute", bottom: 120, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          background: colors.champagne, color: colors.white,
          fontFamily: fonts.body, fontSize: 22, fontWeight: 600,
          padding: "14px 40px", borderRadius: 50,
          boxShadow: "0 8px 30px rgba(212,184,150,0.4)",
        }}>Manage Links →</div>
      </div>
    </AbsoluteFill>
  );
};
