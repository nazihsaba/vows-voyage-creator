import { useState, useEffect, ReactNode } from "react";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Elegant envelope opening animation shown before the invitation.
 * Guest taps the envelope -> wax seal cracks -> top flap folds open -> envelope fades away,
 * revealing the invitation below.
 */
export const EnvelopeAnimation = ({
  groomName,
  brideName,
  primaryColor,
  accentColor,
  children,
}: EnvelopeAnimationProps) => {
  const [stage, setStage] = useState<"sealed" | "opening" | "open">("sealed");
  const [hidden, setHidden] = useState(false);

  // Derive initials from first letter of each name
  const groomInitial = (groomName?.trim()?.charAt(0) || "A").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "B").toUpperCase();

  // Tones: prefer the wedding's custom palette, fall back to a refined ivory/bronze.
  const envelopeColor = "#F4ECDD"; // ivory paper
  const envelopeShadow = "#D9CDB4";
  const sealColor = primaryColor || "#8B0000"; // deep wax red
  const sealHighlight = accentColor || "#C9A961"; // gold accent on seal text

  const handleOpen = () => {
    if (stage !== "sealed") return;
    setStage("opening");
    // After flap fully opens, fade envelope out
    setTimeout(() => setStage("open"), 1400);
    // Remove from DOM after fade so the invitation is fully interactive
    setTimeout(() => setHidden(true), 2400);
  };

  // Lock body scroll while sealed
  useEffect(() => {
    if (!hidden) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [hidden]);

  return (
    <>
      {children}

      {!hidden && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-1000 ${
            stage === "open" ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(35 25% 12%) 0%, hsl(30 20% 6%) 100%)",
          }}
        >
          {/* Subtle ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(201,169,97,0.08) 0%, transparent 60%)",
            }}
          />

          <div
            className="relative cursor-pointer select-none"
            style={{
              perspective: "1400px",
              width: "min(90vw, 520px)",
              aspectRatio: "1.5 / 1",
            }}
            onClick={handleOpen}
            role="button"
            aria-label="Tap to open invitation"
          >
            {/* Envelope body (back) */}
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                backgroundColor: envelopeColor,
                boxShadow:
                  "0 30px 60px -20px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.05)",
              }}
            />

            {/* Diagonal fold lines (V shape from bottom corners to center) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 150 100"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="100" x2="75" y2="50" stroke={envelopeShadow} strokeWidth="0.3" />
              <line x1="150" y1="100" x2="75" y2="50" stroke={envelopeShadow} strokeWidth="0.3" />
            </svg>

            {/* Top flap — folds upward (away from camera) when opening */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: "60%",
                transformOrigin: "top center",
                transform:
                  stage === "sealed"
                    ? "rotateX(0deg)"
                    : "rotateX(-180deg)",
                transition: "transform 1.3s cubic-bezier(0.7, 0, 0.3, 1)",
                transformStyle: "preserve-3d",
                zIndex: 3,
              }}
            >
              {/* Outer face of flap (visible when closed) */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundColor: envelopeColor,
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.08)",
                }}
              />
              {/* Inner face of flap (visible when opened) */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                  backgroundColor: "#FBF6EA",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                }}
              />
            </div>

            {/* Wax seal — sits centered where flap meets envelope */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "22%",
                aspectRatio: "1 / 1",
                zIndex: 4,
                opacity: stage === "sealed" ? 1 : 0,
                transform: `translate(-50%, -50%) scale(${
                  stage === "sealed" ? 1 : 1.3
                })`,
                transition:
                  "opacity 0.4s ease-out 0.1s, transform 0.5s cubic-bezier(0.5, 0, 0.5, 1.5)",
                pointerEvents: "none",
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${sealColor}ee 0%, ${sealColor} 50%, ${sealColor}cc 100%)`,
                  boxShadow:
                    "inset -4px -6px 10px rgba(0,0,0,0.35), inset 3px 3px 8px rgba(255,255,255,0.18), 0 4px 10px rgba(0,0,0,0.4)",
                  border: `1px dashed ${sealHighlight}66`,
                }}
              >
                <span
                  className="font-serif tracking-wider"
                  style={{
                    color: sealHighlight,
                    fontSize: "clamp(14px, 3.5vw, 28px)",
                    textShadow: "0 1px 1px rgba(0,0,0,0.3)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {groomInitial}&nbsp;&amp;&nbsp;{brideInitial}
                </span>
              </div>
            </div>

            {/* Tap hint */}
            <div
              className="absolute left-0 right-0 text-center pointer-events-none"
              style={{
                bottom: "-3rem",
                opacity: stage === "sealed" ? 1 : 0,
                transition: "opacity 0.3s ease-out",
              }}
            >
              <p
                className="text-sm tracking-[0.3em] uppercase animate-pulse"
                style={{ color: "#E8DCC4" }}
              >
                Tap to open
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
