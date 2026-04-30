import { useEffect, useState } from "react";
import aureaLogoIcon from "@/assets/aureaLogoIcon.png";

interface TemplateLoaderProps {
  groomName?: string;
  brideName?: string;
  /**
   * When true, the loader fades out smoothly. Parents should keep the
   * component mounted for ~300ms after flipping this to true so the
   * fade animation can complete.
   */
  fadingOut?: boolean;
}

const TemplateLoader = ({ groomName, brideName, fadingOut = false }: TemplateLoaderProps) => {
  const hasNames = !!(groomName && brideName);
  const g = (groomName || "").charAt(0).toUpperCase();
  const b = (brideName || "").charAt(0).toUpperCase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger fade-in on mount
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen overflow-hidden flex flex-col bg-gradient-soft z-[9999]"
      style={{
        height: "100dvh",
        touchAction: "none",
        opacity: fadingOut ? 0 : mounted ? 1 : 0,
        transition: "opacity 450ms ease-out",
        pointerEvents: fadingOut ? "none" : "auto",
      }}
      aria-hidden={fadingOut}
    >
      <div className="flex-1 flex items-center justify-center">
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{
              position: "absolute",
              inset: 0,
              animation: "aurea-spin 1.6s linear infinite",
            }}
          >
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#865814"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="40 300"
            />
          </svg>
          {hasNames && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#1a1a1a",
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ fontSize: 34, fontWeight: 300 }}>{g}</span>
              <span
                style={{
                  fontSize: 22,
                  fontStyle: "italic",
                  opacity: 0.7,
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                &amp;
              </span>
              <span style={{ fontSize: 34, fontWeight: 300 }}>{b}</span>
            </div>
          )}
          <style>{`@keyframes aurea-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
      <div
        className="flex flex-col items-center gap-2 shrink-0"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
      >
        <span className="text-muted-foreground text-xs tracking-wide">Made for love, by</span>
        <img src={aureaLogoIcon} alt="Auréa Invites" className="w-8 h-8 opacity-80" />
      </div>
    </div>
  );
};

export default TemplateLoader;
