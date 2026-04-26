import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import paperTexture from "@/assets/envelope-cream-flap.jpeg";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Realistic cream envelope, fully constructed in CSS/SVG so the geometry
 * is correct (rectangular body + V-shaped flap meeting in the middle).
 *
 * - Paper texture comes from the uploaded asset (used as a tileable surface).
 * - The flap is a real triangular shape that hinges and lifts on open.
 * - The wax seal is rendered with layered SVG: drip silhouette, radial shading,
 *   specular highlights, embossed double ring, and the couple's initials.
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
  // Warm champagne/gold wax palette
  const waxBase = primaryColor || "#C9A24A";
  const waxHi = "#F2D98A";
  const waxMid = "#B8893A";
  const waxLo = "#6E4E1C";

  const groomInitial = (groomName?.trim()?.charAt(0) || "A").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "B").toUpperCase();

  const TOTAL = 1500;

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => setHidden(true), TOTAL + 80);
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
      Array.from({ length: 14 }).map((_, i) => ({
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
          {/* Ambient glow + dust */}
          <div
            className="env-glow absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(201,162,74,0.14) 0%, transparent 55%)",
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
              background: radial-gradient(ellipse at center, hsl(30 18% 11%) 0%, hsl(28 16% 5%) 100%);
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
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50%      { transform: translateY(-6px) rotate(0.15deg); }
            }
            .env-idle { animation: envIdle 4.5s ease-in-out infinite; }

            .env-zone:hover .env-target {
              transform: scale(1.025);
              filter: drop-shadow(0 38px 60px rgba(0,0,0,0.55));
            }

            /* Whole envelope sinks + fades */
            @keyframes envBody {
              0%   { transform: scale(1)     translateY(0);    opacity: 1; }
              12%  { transform: scale(0.985) translateY(0);    opacity: 1; }
              48%  { transform: scale(1)     translateY(12px); opacity: 1; }
              80%  { transform: scale(0.98)  translateY(46px); opacity: 0.5; }
              100% { transform: scale(0.95)  translateY(80px); opacity: 0; }
            }
            .is-opening .env-target {
              animation: envBody ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            /* Wax seal pops then fades */
            @keyframes envSealPop {
              0%   { transform: translate(-50%, -50%) scale(1)    rotate(-4deg); opacity: 1; }
              14%  { transform: translate(-50%, -50%) scale(1.10) rotate(-4deg); opacity: 1; }
              32%  { transform: translate(-50%, -50%) scale(0.94) rotate(-4deg); opacity: 0; }
              100% { transform: translate(-50%, -50%) scale(0.94) rotate(-4deg); opacity: 0; }
            }
            .is-opening .env-seal {
              animation: envSealPop ${TOTAL}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* Triangular flap lifts open */
            @keyframes envFlapLift {
              0%, 14% { transform: rotateX(0deg);    opacity: 1; }
              52%     { transform: rotateX(-155deg); opacity: 1; }
              80%     { transform: rotateX(-165deg); opacity: 0.5; }
              100%    { transform: rotateX(-170deg); opacity: 0; }
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
              .env-target, .env-flap, .env-seal, .env-hint {
                animation: none !important;
              }
            }
          `}</style>

          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "1600px",
              width: "min(82vw, 440px)",
              aspectRatio: "1.5 / 1",
            }}
            onClick={handleOpen}
            onKeyDown={handleKey}
            role="button"
            tabIndex={0}
            aria-label="Tap to open invitation"
          >
            <div
              className={`env-target ${!opening ? "env-idle" : ""}`}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                filter: "drop-shadow(0 32px 50px rgba(0,0,0,0.55))",
                transformStyle: "preserve-3d",
                transition:
                  "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), filter 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform, opacity",
              }}
            >
              {/* === Envelope body (rectangle with paper texture) === */}
              <div
                className="absolute inset-0 rounded-[6px] overflow-hidden"
                style={{
                  backgroundImage: `url(${paperTexture})`,
                  backgroundSize: "180% 180%",
                  backgroundPosition: "20% 80%",
                  boxShadow:
                    "inset 0 0 60px rgba(0,0,0,0.10), inset 0 -2px 6px rgba(0,0,0,0.08)",
                }}
              >
                {/* Subtle warm vignette on the paper */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 60%, transparent 50%, rgba(70,55,35,0.18) 100%)",
                  }}
                />
                {/* Inverted-V crease lines from corners to center where flap meets body */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 300 200"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <line
                    x1="0" y1="0" x2="150" y2="100"
                    stroke="rgba(80,65,40,0.18)" strokeWidth="0.6"
                  />
                  <line
                    x1="300" y1="0" x2="150" y2="100"
                    stroke="rgba(80,65,40,0.18)" strokeWidth="0.6"
                  />
                  {/* Highlight catching the crease */}
                  <line
                    x1="0" y1="0" x2="150" y2="100"
                    stroke="rgba(255,250,235,0.35)" strokeWidth="0.4"
                    transform="translate(0.4 -0.4)"
                  />
                  <line
                    x1="300" y1="0" x2="150" y2="100"
                    stroke="rgba(255,250,235,0.35)" strokeWidth="0.4"
                    transform="translate(-0.4 -0.4)"
                  />
                </svg>
              </div>

              {/* === Triangular flap (hinges from top, points to center) === */}
              <div
                className="env-flap absolute top-0 left-0 right-0"
                style={{
                  height: "62%",
                  transformOrigin: "top center",
                  transform: "rotateX(0deg)",
                  transformStyle: "preserve-3d",
                  zIndex: 3,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  // Triangular flap shape using clip-path (V pointing down to center)
                  clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                  backgroundImage: `url(${paperTexture})`,
                  backgroundSize: "180% 180%",
                  backgroundPosition: "30% 20%",
                  filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.18))",
                }}
              >
                {/* Flap shading: darker toward the bottom point */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,250,235,0.18) 0%, rgba(0,0,0,0) 35%, rgba(60,45,25,0.18) 100%)",
                  }}
                />
                {/* Subtle edge highlight on the V edges */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.20) 0%, transparent 22%)",
                  }}
                />
              </div>

              {/* === Realistic wax seal (sits over the flap point) === */}
              <div
                className="env-seal absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "62%",
                  transform: "translate(-50%, -50%) rotate(-4deg)",
                  width: "26%",
                  aspectRatio: "1 / 1",
                  zIndex: 4,
                  willChange: "transform, opacity",
                  filter:
                    "drop-shadow(0 8px 10px rgba(0,0,0,0.45)) drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
                }}
              >
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="env-wax-fill" cx="38%" cy="32%" r="78%">
                      <stop offset="0%" stopColor={waxHi} />
                      <stop offset="35%" stopColor={waxBase} />
                      <stop offset="75%" stopColor={waxMid} />
                      <stop offset="100%" stopColor={waxLo} />
                    </radialGradient>
                    <radialGradient id="env-wax-spec" cx="35%" cy="28%" r="35%">
                      <stop offset="0%" stopColor="rgba(255,245,210,0.85)" />
                      <stop offset="60%" stopColor="rgba(255,245,210,0.15)" />
                      <stop offset="100%" stopColor="rgba(255,245,210,0)" />
                    </radialGradient>
                    <radialGradient id="env-wax-shadow" cx="65%" cy="78%" r="55%">
                      <stop offset="0%" stopColor="rgba(40,25,5,0)" />
                      <stop offset="65%" stopColor="rgba(40,25,5,0.25)" />
                      <stop offset="100%" stopColor="rgba(40,25,5,0.55)" />
                    </radialGradient>
                    <filter id="env-wax-grain">
                      <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="2" stitchTiles="stitch" />
                      <feColorMatrix values="0 0 0 0 0.20
                                             0 0 0 0 0.12
                                             0 0 0 0 0.04
                                             0 0 0 0.18 0" />
                    </filter>
                    <filter id="env-wax-soft" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="0.6" />
                    </filter>
                  </defs>

                  {/* Irregular organic wax blob with small drips */}
                  <path
                    id="env-wax-shape"
                    d="M60 6
                       C 78 5, 96 14, 102 32
                       C 108 48, 110 62, 104 78
                       C 100 90, 92 100, 82 106
                       C 78 112, 70 116, 64 114
                       C 58 116, 50 112, 46 106
                       C 36 102, 24 94, 18 82
                       C 10 68, 8 50, 14 34
                       C 22 14, 42 7, 60 6 Z"
                    fill="url(#env-wax-fill)"
                  />

                  {/* Inner shadow on lower-right (volume) */}
                  <use href="#env-wax-shape" fill="url(#env-wax-shadow)" style={{ mixBlendMode: "multiply" }} />

                  {/* Specular highlight (top-left) */}
                  <use href="#env-wax-shape" fill="url(#env-wax-spec)" />

                  {/* Surface grain */}
                  <use
                    href="#env-wax-shape"
                    fill="white"
                    style={{ filter: "url(#env-wax-grain)", mixBlendMode: "overlay", opacity: 0.55 }}
                  />

                  {/* Embossed double oval ring */}
                  <ellipse
                    cx="60" cy="60" rx="32" ry="38"
                    fill="none"
                    stroke={waxLo}
                    strokeWidth="1.2"
                    opacity="0.75"
                  />
                  <ellipse
                    cx="60" cy="60" rx="32" ry="38"
                    fill="none"
                    stroke="rgba(255,235,180,0.55)"
                    strokeWidth="0.5"
                    transform="translate(0 -0.6)"
                  />
                  <ellipse
                    cx="60" cy="60" rx="27" ry="32"
                    fill="none"
                    stroke={waxLo}
                    strokeWidth="0.6"
                    opacity="0.55"
                  />

                  {/* Embossed monogram - dark debossed layer */}
                  <text
                    x="60"
                    y="71"
                    textAnchor="middle"
                    fill={waxLo}
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 600,
                      fontSize: "30px",
                      letterSpacing: "0.5px",
                      filter: "url(#env-wax-soft)",
                    }}
                  >
                    {groomInitial}{brideInitial}
                  </text>
                  {/* Highlight catch on top of letters (embossed feel) */}
                  <text
                    x="60"
                    y="70.2"
                    textAnchor="middle"
                    fill="rgba(255,235,180,0.45)"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 600,
                      fontSize: "30px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {groomInitial}{brideInitial}
                  </text>
                </svg>
              </div>

              {/* Subtle shadow cast by seal onto envelope below */}
              <div
                className="env-seal absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "64%",
                  transform: "translate(-50%, -50%)",
                  width: "28%",
                  aspectRatio: "1 / 0.55",
                  zIndex: 2,
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)",
                  filter: "blur(4px)",
                }}
              />
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
