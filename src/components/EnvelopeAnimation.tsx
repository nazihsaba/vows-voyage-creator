import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import paperTexture from "@/assets/envelope-cream-corner.jpeg";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/* ---------- color helpers (derive a wax palette from any primary) ---------- */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h.padEnd(6, "0").slice(0, 6);
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(hex: string, with_: string, t: number) {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(with_);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/**
 * Photoreal cream envelope built as a single SVG so the geometry is crisp:
 *  - Clean rectangular body with rounded corners.
 *  - True triangular V-flap that points to the horizontal middle of the body.
 *  - Soft fold-line shading on the front (no overlapping ghost shapes).
 *  - Wax seal palette derived from the user's primary color.
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

  // Derive a full wax palette from the primary color.
  const base = primaryColor || "#7A1F22";
  const accent = accentColor || base;
  const waxHi = mix(base, "#FFFFFF", 0.55); // bright specular tint
  const waxBase = base;
  const waxMid = mix(base, "#000000", 0.18);
  const waxLo = mix(base, "#000000", 0.45);
  const waxDeep = mix(base, "#000000", 0.65);
  const rimGlow = mix(base, "#FFFFFF", 0.4);

  const groomInitial = (groomName?.trim()?.charAt(0) || "A").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "E").toUpperCase();

  const TOTAL = 1600;

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
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 40 + Math.random() * 55,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 5,
      })),
    []
  );

  /* Envelope geometry (SVG viewBox is 600x420)
     Body:    rounded rect (0,0)-(600,420)
     V-fold:  diagonals from top corners to (300,210) — middle of body
     Flap:    triangle (0,0)-(600,0)-(300,210), hinges from y=0 */
  const VB_W = 600;
  const VB_H = 420;
  const V_X = 300;
  const V_Y = 210;

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
              background: `radial-gradient(circle at 50% 50%, ${rimGlow}22 0%, transparent 55%)`,
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
                  background: `radial-gradient(circle, ${accent}aa 0%, transparent 70%)`,
                  animation: `envMote ${m.duration}s ease-in-out ${m.delay}s infinite`,
                  filter: "blur(0.4px)",
                }}
              />
            ))}
          </div>

          <style>{`
            .env-overlay {
              background: radial-gradient(ellipse at center, hsl(20 14% 10%) 0%, hsl(20 14% 4%) 100%);
              opacity: 1;
            }
            .env-overlay.is-opening {
              animation: envOverlayOut ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes envOverlayOut { 0%,60%{opacity:1} 100%{opacity:0;pointer-events:none} }
            @keyframes envMote {
              0%,100% { transform: translateY(0) translateX(0); opacity:.30 }
              50%     { transform: translateY(-22px) translateX(6px); opacity:.85 }
            }
            @keyframes envGlowPulse {
              0%,100% { opacity:.85; transform:scale(1) }
              50%     { opacity:1;   transform:scale(1.04) }
            }
            .env-glow { animation: envGlowPulse 4s ease-in-out infinite; }

            @keyframes envIdle {
              0%,100% { transform: translateY(0) rotate(0) }
              50%     { transform: translateY(-5px) rotate(.12deg) }
            }
            .env-idle { animation: envIdle 4.5s ease-in-out infinite; }

            .env-zone:hover .env-target {
              transform: scale(1.025);
              filter: drop-shadow(0 42px 60px rgba(0,0,0,.6));
            }

            @keyframes envBody {
              0%   { transform: scale(1)     translateY(0);    opacity:1 }
              12%  { transform: scale(.985)  translateY(0);    opacity:1 }
              50%  { transform: scale(1)     translateY(14px); opacity:1 }
              82%  { transform: scale(.98)   translateY(50px); opacity:.5 }
              100% { transform: scale(.95)   translateY(86px); opacity:0 }
            }
            .is-opening .env-target {
              animation: envBody ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envSealPop {
              0%   { transform: translate(-50%,-50%) scale(1)    rotate(-2deg); opacity:1 }
              10%  { transform: translate(-50%,-50%) scale(1.07) rotate(-2deg); opacity:1 }
              22%  { transform: translate(-50%,-50%) scale(1.10) rotate(-3deg); opacity:1 }
              36%  { transform: translate(-50%,-50%) scale(.94)  rotate(-1deg); opacity:0 }
              100% { transform: translate(-50%,-50%) scale(.94)  rotate(-1deg); opacity:0 }
            }
            .is-opening .env-seal {
              animation: envSealPop ${TOTAL}ms cubic-bezier(.4,0,.2,1) forwards;
            }

            @keyframes envFlapLift {
              0%,18% { transform: rotateX(0)        }
              55%    { transform: rotateX(-158deg)  }
              82%    { transform: rotateX(-168deg); opacity:.55 }
              100%   { transform: rotateX(-172deg); opacity:0 }
            }
            .is-opening .env-flap-wrap {
              animation: envFlapLift ${TOTAL}ms cubic-bezier(.22,1,.36,1) forwards;
            }

            @keyframes envHint { 0%{opacity:1} 10%,100%{opacity:0} }
            .is-opening .env-hint { animation: envHint ${TOTAL}ms ease-out forwards; }

            @media (prefers-reduced-motion: reduce) {
              .env-overlay { animation:none!important; opacity:0!important; pointer-events:none!important }
              .env-idle,.env-mote,.env-glow,
              .env-target,.env-flap-wrap,.env-seal,.env-hint { animation:none!important }
            }
          `}</style>

          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "2000px",
              width: "min(86vw, 480px)",
              aspectRatio: `${VB_W} / ${VB_H}`,
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
                filter:
                  "drop-shadow(0 38px 58px rgba(0,0,0,.6)) drop-shadow(0 12px 18px rgba(0,0,0,.35))",
                transformStyle: "preserve-3d",
                transition:
                  "transform 500ms cubic-bezier(.22,1,.36,1), filter 500ms cubic-bezier(.4,0,.2,1)",
                willChange: "transform, opacity",
              }}
            >
              {/* === ENVELOPE BODY (single SVG for crisp geometry) === */}
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  {/* Paper pattern */}
                  <pattern
                    id="env-paper"
                    patternUnits="userSpaceOnUse"
                    width={VB_W}
                    height={VB_H}
                  >
                    <image
                      href={paperTexture}
                      x="0"
                      y="0"
                      width={VB_W}
                      height={VB_H}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </pattern>

                  {/* Subtle warm vignette over the body */}
                  <radialGradient id="env-vignette" cx="50%" cy="55%" r="65%">
                    <stop offset="60%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(70,55,35,0.22)" />
                  </radialGradient>

                  {/* Light-catching highlights along the V */}
                  <linearGradient id="env-vlight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,250,235,0)" />
                    <stop offset="50%" stopColor="rgba(255,250,235,0.55)" />
                    <stop offset="100%" stopColor="rgba(255,250,235,0)" />
                  </linearGradient>

                  {/* Soft shadow under the V (gives the front a fold) */}
                  <linearGradient id="env-vshadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(40,28,10,0)" />
                    <stop offset="50%" stopColor="rgba(40,28,10,0.28)" />
                    <stop offset="100%" stopColor="rgba(40,28,10,0)" />
                  </linearGradient>

                  {/* Body rounded-rect clip */}
                  <clipPath id="env-body-clip">
                    <rect x="0" y="0" width={VB_W} height={VB_H} rx="14" ry="14" />
                  </clipPath>
                </defs>

                {/* Body fill (paper) — kept intentionally clean.
                    The flap layer above provides the V silhouette; drawing
                    additional V-creases here causes the "double layer" look. */}
                <g clipPath="url(#env-body-clip)">
                  <rect width={VB_W} height={VB_H} fill="url(#env-paper)" />
                  {/* Warm vignette */}
                  <rect width={VB_W} height={VB_H} fill="url(#env-vignette)" />
                </g>

                {/* Crisp rounded-rect outline (gives a clean edge) */}
                <rect
                  x="0.5"
                  y="0.5"
                  width={VB_W - 1}
                  height={VB_H - 1}
                  rx="14"
                  ry="14"
                  fill="none"
                  stroke="rgba(40,28,10,0.18)"
                  strokeWidth="1"
                />
              </svg>

              {/* === TRIANGULAR FLAP (separate layer, hinges in 3D) === */}
              <div
                className="env-flap-wrap absolute inset-0"
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  zIndex: 3,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.30))",
                }}
              >
                <svg
                  viewBox={`0 0 ${VB_W} ${VB_H}`}
                  className="w-full h-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <clipPath id="env-flap-clip">
                      <path d={`M0 0 L ${VB_W} 0 L ${V_X} ${V_Y} Z`} />
                    </clipPath>
                    <linearGradient id="env-flap-shade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,250,240,0.18)" />
                      <stop offset="35%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="100%" stopColor="rgba(60,45,25,0.30)" />
                    </linearGradient>
                  </defs>

                  <g clipPath="url(#env-flap-clip)">
                    {/* Paper texture (slightly offset for natural variance) */}
                    <image
                      href={paperTexture}
                      x={-VB_W * 0.1}
                      y={-VB_H * 0.1}
                      width={VB_W * 1.2}
                      height={VB_H * 1.2}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    {/* shading */}
                    <rect width={VB_W} height={VB_H} fill="url(#env-flap-shade)" />
                  </g>

                  {/* Subtle light catch ONLY along the V edges (no second outline) */}
                  <path
                    d={`M0 0 L ${V_X} ${V_Y} L ${VB_W} 0`}
                    fill="none"
                    stroke="rgba(255,250,235,0.30)"
                    strokeWidth="0.5"
                    transform="translate(0 -0.5)"
                  />
                </svg>
              </div>

              {/* === WAX SEAL (palette derived from primary color) === */}
              <div
                className="env-seal absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: `${(V_Y / VB_H) * 100}%`,
                  transform: "translate(-50%, -50%) rotate(-2deg)",
                  width: "26%",
                  aspectRatio: "0.86 / 1",
                  zIndex: 4,
                  willChange: "transform, opacity",
                  filter:
                    "drop-shadow(0 14px 18px rgba(0,0,0,0.55)) drop-shadow(0 4px 6px rgba(0,0,0,0.45))",
                }}
              >
                <svg viewBox="0 0 120 140" className="w-full h-full" aria-hidden="true">
                  <defs>
                    <radialGradient id="seal-fill" cx="36%" cy="28%" r="80%">
                      <stop offset="0%" stopColor={waxHi} />
                      <stop offset="22%" stopColor={waxBase} />
                      <stop offset="58%" stopColor={waxMid} />
                      <stop offset="88%" stopColor={waxLo} />
                      <stop offset="100%" stopColor={waxDeep} />
                    </radialGradient>
                    <radialGradient id="seal-spec" cx="34%" cy="22%" r="22%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                      <stop offset="60%" stopColor="rgba(255,255,255,0.20)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    <radialGradient id="seal-shadow" cx="68%" cy="80%" r="55%">
                      <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="65%" stopColor="rgba(0,0,0,0.30)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
                    </radialGradient>
                    <radialGradient id="seal-rim" cx="50%" cy="50%" r="50%">
                      <stop offset="84%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="96%" stopColor={`${rimGlow}88`} />
                      <stop offset="100%" stopColor={`${rimGlow}00`} />
                    </radialGradient>
                    <filter id="seal-deboss" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="0.6" />
                    </filter>
                    <filter id="seal-grain">
                      <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="2" stitchTiles="stitch" />
                      <feColorMatrix values="0 0 0 0 0.10
                                             0 0 0 0 0.05
                                             0 0 0 0 0.05
                                             0 0 0 0.18 0" />
                    </filter>
                    <filter id="seal-cast" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="2" />
                    </filter>

                    <path
                      id="seal-shape"
                      d="M60 6
                         C 82 5, 102 18, 108 42
                         C 114 60, 114 82, 106 102
                         C 100 118, 84 132, 64 134
                         C 42 134, 22 122, 14 102
                         C 6 82, 6 58, 16 38
                         C 26 18, 42 7, 60 6 Z"
                    />
                    <rect id="seal-pill" x="26" y="30" width="68" height="80" rx="32" ry="32" />
                  </defs>

                  <use href="#seal-shape" fill="rgba(0,0,0,0.4)" transform="translate(2 5)" style={{ filter: "url(#seal-cast)" }} />
                  <use href="#seal-shape" fill="url(#seal-fill)" />
                  <use href="#seal-shape" fill="url(#seal-shadow)" style={{ mixBlendMode: "multiply" }} />
                  <use href="#seal-shape" fill="url(#seal-rim)" style={{ mixBlendMode: "screen" }} />
                  <use href="#seal-shape" fill="url(#seal-spec)" />
                  <use href="#seal-shape" fill="white" style={{ filter: "url(#seal-grain)", mixBlendMode: "overlay", opacity: 0.5 }} />

                  {/* Pill deboss ring */}
                  <use href="#seal-pill" fill="none" stroke={waxDeep} strokeWidth="1.4" opacity="0.7" style={{ filter: "url(#seal-deboss)" }} />
                  <rect x="29" y="33" width="62" height="74" rx="29" ry="29" fill="none" stroke={waxDeep} strokeWidth="0.6" opacity="0.55" />
                  <use href="#seal-pill" fill="none" stroke={`${rimGlow}aa`} strokeWidth="0.5" transform="translate(0 -0.6)" />

                  {/* Stacked monogram */}
                  {[
                    { y: 70, ch: groomInitial },
                    { y: 98, ch: brideInitial },
                  ].map((row, i) => (
                    <g key={i}>
                      <text x="60" y={row.y} textAnchor="middle" fill={waxDeep}
                        style={{
                          fontFamily: "'Playfair Display','Cormorant Garamond',Georgia,serif",
                          fontWeight: 700, fontSize: "30px", letterSpacing: "0.5px",
                          filter: "url(#seal-deboss)",
                        }}>{row.ch}</text>
                      <text x="60" y={row.y + 0.6} textAnchor="middle" fill={waxLo} opacity="0.65"
                        style={{
                          fontFamily: "'Playfair Display','Cormorant Garamond',Georgia,serif",
                          fontWeight: 700, fontSize: "30px", letterSpacing: "0.5px",
                        }}>{row.ch}</text>
                      <text x="60" y={row.y - 0.6} textAnchor="middle" fill={`${rimGlow}aa`}
                        style={{
                          fontFamily: "'Playfair Display','Cormorant Garamond',Georgia,serif",
                          fontWeight: 700, fontSize: "30px", letterSpacing: "0.5px",
                        }}>{row.ch}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Tap hint */}
            <div
              className="env-hint absolute left-0 right-0 text-center pointer-events-none"
              style={{ bottom: "-3.5rem" }}
            >
              <p
                className="text-xs tracking-[0.5em] uppercase animate-pulse"
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
