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
 * Modern, photorealistic envelope.
 *
 * Composition (back to front):
 *  1. Back panel (paper)
 *  2. Front panel: rectangle + bottom inverted-triangle pocket (single shape via clip-path)
 *  3. Seam shadows where the front panel meets the back (subtle, NOT grey triangles)
 *  4. Top triangular flap (hinges from top edge, lifts on open)
 *  5. Wax seal (drippy organic silhouette, layered shading, deep deboss monogram)
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
  const waxHi = "#FBE6A4";
  const waxMid = "#A8782F";
  const waxLo = "#5C3F11";
  const waxDeep = "#2E1E05";

  const groomInitial = (groomName?.trim()?.charAt(0) || "A").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "B").toUpperCase();

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
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 40 + Math.random() * 55,
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
                "radial-gradient(circle at 50% 50%, rgba(201,162,74,0.16) 0%, transparent 55%)",
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
              background: radial-gradient(ellipse at center, hsl(30 18% 11%) 0%, hsl(28 16% 4%) 100%);
              opacity: 1;
            }
            .env-overlay.is-opening {
              animation: envOverlayOut ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes envOverlayOut {
              0%, 60% { opacity: 1; }
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
              filter: drop-shadow(0 42px 60px rgba(0,0,0,0.6));
            }

            /* Whole envelope sinks + fades */
            @keyframes envBody {
              0%   { transform: scale(1)     translateY(0);    opacity: 1; }
              12%  { transform: scale(0.985) translateY(0);    opacity: 1; }
              50%  { transform: scale(1)     translateY(14px); opacity: 1; }
              82%  { transform: scale(0.98)  translateY(50px); opacity: 0.5; }
              100% { transform: scale(0.95)  translateY(86px); opacity: 0; }
            }
            .is-opening .env-target {
              animation: envBody ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            /* Wax seal cracks then fades */
            @keyframes envSealPop {
              0%   { transform: translate(-50%, -50%) scale(1)    rotate(-4deg); opacity: 1; }
              10%  { transform: translate(-50%, -50%) scale(1.08) rotate(-4deg); opacity: 1; }
              22%  { transform: translate(-50%, -50%) scale(1.12) rotate(-5deg); opacity: 1; }
              36%  { transform: translate(-50%, -50%) scale(0.94) rotate(-3deg); opacity: 0; }
              100% { transform: translate(-50%, -50%) scale(0.94) rotate(-3deg); opacity: 0; }
            }
            .is-opening .env-seal {
              animation: envSealPop ${TOTAL}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* Triangular flap lifts open */
            @keyframes envFlapLift {
              0%, 18% { transform: rotateX(0deg);    opacity: 1; }
              55%     { transform: rotateX(-158deg); opacity: 1; }
              82%     { transform: rotateX(-168deg); opacity: 0.55; }
              100%    { transform: rotateX(-172deg); opacity: 0; }
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
              perspective: "1800px",
              width: "min(86vw, 480px)",
              aspectRatio: "1.55 / 1",
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
                filter: "drop-shadow(0 38px 58px rgba(0,0,0,0.6)) drop-shadow(0 12px 18px rgba(0,0,0,0.35))",
                transformStyle: "preserve-3d",
                transition:
                  "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), filter 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform, opacity",
              }}
            >
              {/* === 1. Back panel (deeper, slightly darker paper) === */}
              <div
                className="absolute inset-0 rounded-[8px] overflow-hidden"
                style={{
                  backgroundImage: `url(${paperTexture})`,
                  backgroundSize: "220% 220%",
                  backgroundPosition: "70% 30%",
                  filter: "brightness(0.82) saturate(0.95)",
                  boxShadow:
                    "inset 0 0 80px rgba(0,0,0,0.28), inset 0 -3px 8px rgba(0,0,0,0.14)",
                }}
              >
                {/* deep interior vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0) 60%)",
                  }}
                />
              </div>

              {/* === 2. Front panel: a single shape (rectangle below 50% + V tip extending to 100% top) === */}
              {/* Outer shadow halo behind the front panel for separation */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "0",
                  right: "0",
                  top: "0",
                  bottom: "0",
                  zIndex: 1,
                  background:
                    "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 55%)",
                }}
              />

              <div
                className="absolute inset-0 rounded-b-[8px] overflow-hidden"
                style={{
                  zIndex: 2,
                  // Front panel: rectangle from 50%→100% PLUS V triangle reaching up to top center
                  clipPath:
                    "polygon(0% 50%, 50% 0%, 100% 50%, 100% 100%, 0% 100%)",
                  backgroundImage: `url(${paperTexture})`,
                  backgroundSize: "200% 200%",
                  backgroundPosition: "20% 90%",
                  boxShadow:
                    "inset 0 6px 14px rgba(0,0,0,0.10), inset 0 -2px 6px rgba(0,0,0,0.10)",
                }}
              >
                {/* warm vignette on front panel */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 80%, transparent 45%, rgba(70,55,35,0.20) 100%)",
                  }}
                />

                {/* Subtle V-seam highlight (catches light along the diagonals) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 300 200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="env-vlight-l" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(255,250,235,0.0)" />
                      <stop offset="40%" stopColor="rgba(255,250,235,0.55)" />
                      <stop offset="100%" stopColor="rgba(255,250,235,0.0)" />
                    </linearGradient>
                    <linearGradient id="env-vlight-r" x1="1" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,250,235,0.0)" />
                      <stop offset="40%" stopColor="rgba(255,250,235,0.55)" />
                      <stop offset="100%" stopColor="rgba(255,250,235,0.0)" />
                    </linearGradient>
                  </defs>
                  {/* Light catch on the V edges (the diagonals that go from top-center DOWN to mid-sides) */}
                  <line x1="150" y1="0" x2="0" y2="100" stroke="url(#env-vlight-l)" strokeWidth="1.2" />
                  <line x1="150" y1="0" x2="300" y2="100" stroke="url(#env-vlight-r)" strokeWidth="1.2" />
                  {/* Soft shadow just under the V edges (gives the front panel thickness) */}
                  <line x1="150" y1="0" x2="0" y2="100" stroke="rgba(40,28,10,0.18)" strokeWidth="0.8" transform="translate(0.6 0.6)" />
                  <line x1="150" y1="0" x2="300" y2="100" stroke="rgba(40,28,10,0.18)" strokeWidth="0.8" transform="translate(-0.6 0.6)" />
                </svg>

                {/* Tiny stamp in the upper-right corner of the front panel */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    right: "7%",
                    top: "16%",
                    width: "14%",
                    aspectRatio: "0.78 / 1",
                    background:
                      "linear-gradient(135deg, rgba(190,150,80,0.6), rgba(120,85,30,0.6))",
                    border: "1px dashed rgba(255,245,220,0.65)",
                    borderRadius: "1px",
                    boxShadow:
                      "0 1px 2px rgba(0,0,0,0.28), inset 0 0 6px rgba(0,0,0,0.20)",
                  }}
                >
                  <div
                    className="absolute inset-[14%] rounded-[1px]"
                    style={{
                      background:
                        "radial-gradient(circle at 38% 38%, rgba(255,238,200,0.55), rgba(70,45,15,0.55))",
                    }}
                  />
                </div>

                {/* Faint embossed monogram watermark on the front panel (not the wax seal) */}
                <div
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    left: "8%",
                    bottom: "10%",
                    width: "18%",
                    aspectRatio: "1 / 1",
                    opacity: 0.16,
                    color: waxLo,
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                    fontSize: "12px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  est. {new Date().getFullYear()}
                </div>
              </div>

              {/* === 3. Top triangular flap === */}
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
                  clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                  backgroundImage: `url(${paperTexture})`,
                  backgroundSize: "200% 200%",
                  backgroundPosition: "30% 20%",
                  filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.25))",
                }}
              >
                {/* Flap shading: gentle gradient, brightest near top, darker toward V point */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,250,235,0.20) 0%, rgba(0,0,0,0) 30%, rgba(60,45,25,0.28) 100%)",
                  }}
                />
                {/* A soft warm sheen just below the top edge */}
                <div
                  className="absolute inset-x-0 top-0 h-[14%] pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,245,220,0.35), transparent)",
                  }}
                />
                {/* Soft contact shadow at the V tip */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.30) 0%, transparent 24%)",
                  }}
                />
              </div>

              {/* === 4. HYPER-REAL WAX SEAL (sits over the flap V point) === */}
              <div
                className="env-seal absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "62%",
                  transform: "translate(-50%, -50%) rotate(-4deg)",
                  width: "30%",
                  aspectRatio: "1 / 1",
                  zIndex: 4,
                  willChange: "transform, opacity",
                  filter:
                    "drop-shadow(0 12px 14px rgba(0,0,0,0.55)) drop-shadow(0 3px 5px rgba(0,0,0,0.45))",
                }}
              >
                <svg
                  viewBox="0 0 140 140"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <defs>
                    {/* Main body gradient: bright top-left highlight, deep bottom-right shadow */}
                    <radialGradient id="env-wax-fill" cx="34%" cy="28%" r="82%">
                      <stop offset="0%" stopColor={waxHi} />
                      <stop offset="22%" stopColor={waxBase} />
                      <stop offset="55%" stopColor={waxMid} />
                      <stop offset="88%" stopColor={waxLo} />
                      <stop offset="100%" stopColor={waxDeep} />
                    </radialGradient>
                    {/* Sharp specular */}
                    <radialGradient id="env-wax-spec" cx="32%" cy="24%" r="22%">
                      <stop offset="0%" stopColor="rgba(255,250,225,0.95)" />
                      <stop offset="55%" stopColor="rgba(255,250,225,0.25)" />
                      <stop offset="100%" stopColor="rgba(255,250,225,0)" />
                    </radialGradient>
                    {/* Soft secondary highlight */}
                    <radialGradient id="env-wax-spec2" cx="58%" cy="40%" r="12%">
                      <stop offset="0%" stopColor="rgba(255,245,210,0.65)" />
                      <stop offset="100%" stopColor="rgba(255,245,210,0)" />
                    </radialGradient>
                    {/* Bottom-right deep shadow */}
                    <radialGradient id="env-wax-shadow" cx="68%" cy="78%" r="55%">
                      <stop offset="0%" stopColor="rgba(40,25,5,0)" />
                      <stop offset="60%" stopColor="rgba(40,25,5,0.30)" />
                      <stop offset="100%" stopColor="rgba(20,12,2,0.65)" />
                    </radialGradient>
                    {/* Rim light around edges */}
                    <radialGradient id="env-wax-rim" cx="50%" cy="50%" r="50%">
                      <stop offset="85%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="96%" stopColor="rgba(255,235,180,0.4)" />
                      <stop offset="100%" stopColor="rgba(255,235,180,0)" />
                    </radialGradient>
                    <filter id="env-wax-grain">
                      <feTurbulence type="fractalNoise" baseFrequency="2.6" numOctaves="2" stitchTiles="stitch" />
                      <feColorMatrix values="0 0 0 0 0.18
                                             0 0 0 0 0.10
                                             0 0 0 0 0.03
                                             0 0 0 0.22 0" />
                    </filter>
                    <filter id="env-wax-soft" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="0.5" />
                    </filter>
                    <filter id="env-wax-cast" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="1.8" />
                    </filter>

                    {/* Irregular drippy wax silhouette */}
                    <path
                      id="env-wax-shape"
                      d="M70 8
                         C 88 6, 104 12, 114 26
                         C 124 38, 128 54, 126 68
                         C 130 76, 132 84, 128 92
                         C 124 102, 116 110, 108 116
                         C 112 122, 110 128, 104 130
                         C 98 132, 92 128, 88 122
                         C 80 128, 70 130, 60 128
                         C 52 132, 42 130, 38 122
                         C 30 124, 22 118, 20 110
                         C 12 104, 8 92, 10 80
                         C 6 70, 8 58, 14 48
                         C 10 38, 16 22, 30 14
                         C 44 6, 58 9, 70 8 Z"
                    />
                  </defs>

                  {/* Soft cast shadow under the seal on the paper */}
                  <use
                    href="#env-wax-shape"
                    fill="rgba(0,0,0,0.4)"
                    transform="translate(2.5 5)"
                    style={{ filter: "url(#env-wax-cast)" }}
                  />

                  {/* Base wax body */}
                  <use href="#env-wax-shape" fill="url(#env-wax-fill)" />

                  {/* Bottom-right volumetric shadow */}
                  <use
                    href="#env-wax-shape"
                    fill="url(#env-wax-shadow)"
                    style={{ mixBlendMode: "multiply" }}
                  />

                  {/* Rim light */}
                  <use
                    href="#env-wax-shape"
                    fill="url(#env-wax-rim)"
                    style={{ mixBlendMode: "screen" }}
                  />

                  {/* Specular highlights */}
                  <use href="#env-wax-shape" fill="url(#env-wax-spec)" />
                  <use href="#env-wax-shape" fill="url(#env-wax-spec2)" />

                  {/* Surface grain */}
                  <use
                    href="#env-wax-shape"
                    fill="white"
                    style={{ filter: "url(#env-wax-grain)", mixBlendMode: "overlay", opacity: 0.55 }}
                  />

                  {/* Tiny micro-cracks for realism */}
                  <g
                    stroke={waxDeep}
                    strokeWidth="0.35"
                    opacity="0.35"
                    fill="none"
                    style={{ mixBlendMode: "multiply" }}
                  >
                    <path d="M44 30 q6 4 10 12 t8 14" />
                    <path d="M96 38 q-4 8 -2 14" />
                    <path d="M30 80 q8 -2 14 4" />
                    <path d="M104 96 q-6 -2 -10 -10" />
                  </g>

                  {/* Embossed double oval ring - dark deboss */}
                  <ellipse cx="70" cy="70" rx="38" ry="44" fill="none" stroke={waxDeep} strokeWidth="1.4" opacity="0.7" />
                  {/* light catch on top of ring */}
                  <ellipse cx="70" cy="70" rx="38" ry="44" fill="none" stroke="rgba(255,235,180,0.6)" strokeWidth="0.55" transform="translate(0 -0.7)" />
                  {/* inner ring */}
                  <ellipse cx="70" cy="70" rx="32" ry="37" fill="none" stroke={waxDeep} strokeWidth="0.7" opacity="0.55" />
                  <ellipse cx="70" cy="70" rx="32" ry="37" fill="none" stroke="rgba(255,235,180,0.45)" strokeWidth="0.35" transform="translate(0 -0.4)" />

                  {/* Decorative tiny dots between the two ovals */}
                  <g fill={waxDeep} opacity="0.55">
                    <circle cx="70" cy="29" r="0.9" />
                    <circle cx="70" cy="111" r="0.9" />
                    <circle cx="35" cy="70" r="0.9" />
                    <circle cx="105" cy="70" r="0.9" />
                  </g>

                  {/* Embossed monogram - deep deboss layer */}
                  <text
                    x="70"
                    y="83"
                    textAnchor="middle"
                    fill={waxDeep}
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "36px",
                      letterSpacing: "0.5px",
                      filter: "url(#env-wax-soft)",
                    }}
                  >
                    {groomInitial}{brideInitial}
                  </text>
                  {/* Mid-tone shadow under letters */}
                  <text
                    x="70"
                    y="83.6"
                    textAnchor="middle"
                    fill={waxLo}
                    opacity="0.7"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "36px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {groomInitial}{brideInitial}
                  </text>
                  {/* Highlight catch on top of letters */}
                  <text
                    x="70"
                    y="82.1"
                    textAnchor="middle"
                    fill="rgba(255,240,195,0.6)"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "36px",
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
