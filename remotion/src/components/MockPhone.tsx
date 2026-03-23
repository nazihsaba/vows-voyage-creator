import { colors } from "../styles";

export const MockPhone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 380, height: 780, borderRadius: 40,
    border: `3px solid ${colors.champagne}40`, background: colors.white,
    overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.15)",
    position: "relative",
  }}>
    <div style={{
      position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
      width: 140, height: 28, background: colors.slate, borderRadius: "0 0 16px 16px",
      zIndex: 10,
    }} />
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      {children}
    </div>
  </div>
);
