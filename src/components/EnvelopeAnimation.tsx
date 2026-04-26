import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import envelopeImage from "@/assets/envelope-cream-flap.jpeg";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Photographic envelope with a single dynamic wax seal.
 *
 * - The envelope photo is the base visual.
 * - A fresh SVG wax seal is rendered on top, fully covering the printed "FM"
 *   in the photo, and shows the groom + bride initials dynamically.
 * - On tap: flap lifts, envelope sinks/fades, overlay dissolves —
 *   directly revealing the template behind it (no intermediate card).
 */
export const EnvelopeAnimation = ({
  groomName,
  brideName,
  primaryColor,
  accentColor,
  children,
}: EnvelopeAnimationProps) => {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

    const accent = accentColor || "#B89968";
    // Champagne/cream wax palette (matches the new photo)
    const sealBase = primaryColor || "#C9BFA3";
    const sealHi = "#E6DCC1";
    const sealLo = "#8C8262";

  const groomInitial = (groomName?.trim()?.charAt(0) || "A").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "B").toUpperCase();

  const TOTAL = 1400;

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => setHidden(true), TOTAL + 50);
  }, [opening]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  useEffect(() => {
    if (!hidden) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [hidden]);

  const motes = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 50 + Math.random() * 45,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 5,
      })),
    []
  );

  return (
    <>
      {children}

      {!hidden && (
        <div
          className={`env-overlay fixed inset-0 z-[9999] flex items-center justify-center ${
            opening ? "is-opening" : ""
          }`}
        >
          {/* SVG defs for the wax seal */}
          <svg className="absolute -z-10 w-0 h-0" aria-hidden="true">
            <defs>
              <radialGradient id="env-wax-grad" cx="38%" cy="32%" r="78%">
                <stop offset="0%" stopColor={sealHi} />
                <stop offset="55%" stopColor={sealBase} />
                <stop offset="100%" stopColor={sealLo} />
              </radialGradient>
              <filter id="env-wax-noise">
                <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix values="0 0 0 0 0.10
                                       0 0 0 0 0.02
                                       0 0 0 0 0.04
                                       0 0 0 0.30 0" />
              </filter>
            </defs>
          </svg>

          {/* Ambient glow + dust */}
          <div
            className="env-glow absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 48%, rgba(184,153,104,0.13) 0%, transparent 55%)",
            }}
          />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {motes.map((m) => (
              <span
                key={m.id}
                className="absolute rounded-full env-mote"
                style={{
                  left: `${m.left}%`,
                  top: `${m.top}%`,
                  width: `${m.size}px`,
                  height: `${m.size}px`,
                  background: `radial-gradient(circle, ${accent}cc 0%, transparent 70%)`,
                  animation: `envMote ${m.duration}s ease-in-out ${m.delay}s infinite`,
                  filter: "blur(0.4px)",
                }}
              />
            ))}
          </div>

          <style>{`
            .env-overlay {
              background: radial-gradient(ellipse at center, hsl(30 18% 12%) 0%, hsl(28 16% 6%) 100%);
              opacity: 1;
            }
            .env-overlay.is-opening {
              animation: envOverlayOut ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes envOverlayOut {
              0%, 55% { opacity: 1; }
              100% { opacity: 0; pointer-events: none; }
            }

            @keyframes envMote {
              0%, 100% { transform: translateY(0) translateX(0); opacity: 0.35; }
              50%      { transform: translateY(-26px) translateX(8px); opacity: 0.95; }
            }
            @keyframes envGlowPulse {
              0%, 100% { opacity: 0.85; transform: scale(1); }
              50%      { opacity: 1;    transform: scale(1.04); }
            }
            .env-glow { animation: envGlowPulse 4s ease-in-out infinite; }

            @keyframes envIdle {
              0%, 100% { transform: translateY(0); }
              50%      { transform: translateY(-6px); }
            }
            .env-idle { animation: envIdle 4s ease-in-out infinite; }

            .env-zone:hover .env-target {
              transform: scale(1.025);
              filter: drop-shadow(0 36px 60px rgba(0,0,0,0.55));
            }

            /* Whole envelope sinks + fades */
            @keyframes envBody {
              0%   { transform: scale(1)     translateY(0);    opacity: 1; }
              10%  { transform: scale(0.985) translateY(0);    opacity: 1; }
              45%  { transform: scale(1)     translateY(10px); opacity: 1; }
              80%  { transform: scale(0.98)  translateY(40px); opacity: 0.55; }
              100% { transform: scale(0.96)  translateY(70px); opacity: 0; }
            }
            .is-opening .env-body {
              animation: envBody ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            /* Wax seal pops slightly then fades with the flap */
            @keyframes envSealPop {
              0%   { transform: translate(-50%, -50%) scale(1)    rotate(-3deg); opacity: 1; }
              12%  { transform: translate(-50%, -50%) scale(1.08) rotate(-3deg); opacity: 1; }
              30%  { transform: translate(-50%, -50%) scale(0.92) rotate(-3deg); opacity: 0; }
              100% { transform: translate(-50%, -50%) scale(0.92) rotate(-3deg); opacity: 0; }
            }
            .is-opening .env-seal {
              animation: envSealPop ${TOTAL}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* Top portion (flap + seal area of the photo) lifts and fades */
            @keyframes envFlapLift {
              0%, 14% { transform: rotateX(0deg); opacity: 1; }
              50%     { transform: rotateX(-150deg); opacity: 1; }
              75%     { transform: rotateX(-160deg); opacity: 0.5; }
              100%    { transform: rotateX(-160deg); opacity: 0; }
            }
            .is-opening .env-flap {
              animation: envFlapLift ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envHint {
              0% { opacity: 1; }
              10%, 100% { opacity: 0; }
            }
            .is-opening .env-hint { animation: envHint ${TOTAL}ms ease-out forwards; }

            @media (prefers-reduced-motion: reduce) {
              .env-overlay { animation: none !important; opacity: 0 !important; pointer-events: none !important; }
              .env-idle, .env-mote, .env-glow,
              .env-body, .env-flap, .env-seal, .env-hint {
                animation: none !important;
              }
            }
          `}</style>

          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "1500px",
              width: "min(82vw, 460px)",
              aspectRatio: "0.78 / 1",
            }}
            onClick={handleOpen}
            onKeyDown={handleKey}
            role="button"
            tabIndex={0}
            aria-label="Tap to open invitation"
          >
            <div
              className={`env-target env-body ${!opening ? "env-idle" : ""}`}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
                transformStyle: "preserve-3d",
                transition:
                  "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), filter 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform, opacity",
              }}
            >
              {/* === Bottom (static) photo of the envelope === */}
              <div
                className="absolute inset-0 rounded-[6px] overflow-hidden"
                style={{
                  backgroundImage: `url(${envelopeImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {/* === Top portion of the photo (flap area) — lifts away on open === */}
              <div
                className="env-flap absolute top-0 left-0 right-0 overflow-hidden rounded-t-[6px]"
                style={{
                  height: "62%",
                  transformOrigin: "top center",
                  transform: "rotateX(0deg)",
                  transformStyle: "preserve-3d",
                  zIndex: 3,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  backgroundImage: `url(${envelopeImage})`,
                  backgroundSize: "100% auto",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                  boxShadow: "inset 0 -10px 22px rgba(0,0,0,0.10)",
                }}
              />

              {/* === Single dynamic wax seal — fully covers the printed FM === */}
              <div
                className="env-seal absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "48%",
                  transform: "translate(-50%, -50%) rotate(-3deg)",
                  width: "32%",
                  aspectRatio: "0.86 / 1",
                  zIndex: 4,
                  willChange: "transform, opacity",
                  filter:
                    "drop-shadow(0 6px 10px rgba(0,0,0,0.45)) drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
                }}
              >
                <svg
                  viewBox="0 0 100 116"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  {/* Irregular wax blob shape */}
                  <path
                    d="M50 4
                       C 72 4, 94 18, 95 44
                       C 96 64, 92 86, 78 102
                       C 68 112, 56 114, 50 113
                       C 44 114, 30 112, 20 100
                       C 6 84, 3 62, 5 42
                       C 8 18, 28 4, 50 4 Z"
                    fill="url(#env-wax-grad)"
                  />
                  {/* Specular highlight */}
                  <ellipse
                    cx="38" cy="28" rx="22" ry="10"
                    fill="rgba(255,210,200,0.35)"
                    style={{ filter: "blur(2px)" }}
                  />
                  {/* Subtle wax surface noise */}
                  <path
                    d="M50 4
                       C 72 4, 94 18, 95 44
                       C 96 64, 92 86, 78 102
                       C 68 112, 56 114, 50 113
                       C 44 114, 30 112, 20 100
                       C 6 84, 3 62, 5 42
                       C 8 18, 28 4, 50 4 Z"
                    fill="white"
                    style={{ filter: "url(#env-wax-noise)", mixBlendMode: "overlay", opacity: 0.55 }}
                  />
                  {/* Outer debossed oval ring */}
                  <ellipse
                    cx="50" cy="58" rx="32" ry="40"
                    fill="none"
                    stroke={sealLo}
                    strokeWidth="1.4"
                    opacity="0.85"
                  />
                  <ellipse
                    cx="50" cy="58" rx="32" ry="40"
                    fill="none"
                    stroke="rgba(255,180,170,0.35)"
                    strokeWidth="0.5"
                    transform="translate(0 0.8)"
                  />
                  {/* Inner thinner ring */}
                  <ellipse
                    cx="50" cy="58" rx="27" ry="34"
                    fill="none"
                    stroke={sealLo}
                    strokeWidth="0.7"
                    opacity="0.65"
                  />
                  {/* Embossed dynamic monogram */}
                  <text
                    x="50"
                    y="68"
                    textAnchor="middle"
                    fill={sealLo}
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 600,
                      fontSize: "32px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {groomInitial}{brideInitial}
                  </text>
                  {/* Highlight on letters for embossed feel */}
                  <text
                    x="50"
                    y="67.4"
                    textAnchor="middle"
                    fill="rgba(255,180,170,0.25)"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 600,
                      fontSize: "32px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {groomInitial}{brideInitial}
                  </text>
                </svg>
              </div>
            </div>

            {/* Tap hint */}
            <div
              className="env-hint absolute left-0 right-0 text-center pointer-events-none"
              style={{ bottom: "-3.25rem" }}
            >
              <p
                className="text-xs tracking-[0.45em] uppercase animate-pulse"
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
