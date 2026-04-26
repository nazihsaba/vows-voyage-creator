import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import paperTexture from "@/assets/envelope-cream-corner.jpeg";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Photoreal cream envelope inspired by a real photographic reference:
 * - Soft cream paper with subtle grain (from the uploaded photo, used as a
 *   tileable surface).
 * - A clean rectangular body with a softly-rounded triangular flap that
 *   matches the reference (gentle V, slight rounding at the tip).
 * - A burgundy wax seal: oval/egg silhouette, deep deboss with a rounded
 *   "pill" inner ring and a serif monogram, layered shading + grain so the
 *   wax looks pressed, not flat.
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

  const accent = accentColor || "#8E2A2A";

  // Burgundy wax palette (matches the reference)
  const waxBase = primaryColor || "#7A1F22";
  const waxHi = "#C75A55";
  const waxMid = "#6A1A1D";
  const waxLo = "#3E0E10";
  const waxDeep = "#220607";

  const groomInitial = (groomName?.trim()?.charAt(0) || "F").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "M").toUpperCase();

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
                "radial-gradient(circle at 50% 50%, rgba(190,90,80,0.10) 0%, transparent 55%)",
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
            @keyframes envOverlayOut {
              0%, 60% { opacity: 1; }
              100% { opacity: 0; pointer-events: none; }
            }

            @keyframes envMote {
              0%, 100% { transform: translateY(0) translateX(0); opacity: 0.30; }
              50%      { transform: translateY(-22px) translateX(6px); opacity: 0.85; }
            }
            @keyframes envGlowPulse {
              0%, 100% { opacity: 0.85; transform: scale(1); }
              50%      { opacity: 1;    transform: scale(1.04); }
            }
            .env-glow { animation: envGlowPulse 4s ease-in-out infinite; }

            @keyframes envIdle {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50%      { transform: translateY(-5px) rotate(0.12deg); }
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
              0%   { transform: translate(-50%, -50%) scale(1)    rotate(-2deg); opacity: 1; }
              10%  { transform: translate(-50%, -50%) scale(1.07) rotate(-2deg); opacity: 1; }
              22%  { transform: translate(-50%, -50%) scale(1.10) rotate(-3deg); opacity: 1; }
              36%  { transform: translate(-50%, -50%) scale(0.94) rotate(-1deg); opacity: 0; }
              100% { transform: translate(-50%, -50%) scale(0.94) rotate(-1deg); opacity: 0; }
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
              aspectRatio: "1.45 / 1",
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
                  "drop-shadow(0 38px 58px rgba(0,0,0,0.6)) drop-shadow(0 12px 18px rgba(0,0,0,0.35))",
                transformStyle: "preserve-3d",
                transition:
                  "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), filter 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform, opacity",
              }}
            >
              {/* === 1. Back/body of the envelope (cream paper) === */}
              <div
                className="absolute inset-0 rounded-[10px] overflow-hidden"
                style={{
                  backgroundImage: `url(${paperTexture})`,
                  backgroundSize: "180% 180%",
                  backgroundPosition: "70% 70%",
                  boxShadow:
                    "inset 0 0 90px rgba(60,45,25,0.18), inset 0 -3px 10px rgba(0,0,0,0.10)",
                }}
              >
                {/* warm vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 55%, transparent 50%, rgba(70,55,35,0.16) 100%)",
                  }}
                />
              </div>

              {/* === 2. Triangular top flap (rounded V like the reference) === */}
              <div
                className="env-flap absolute top-0 left-0 right-0"
                style={{
                  height: "60%",
                  transformOrigin: "top center",
                  transform: "rotateX(0deg)",
                  transformStyle: "preserve-3d",
                  zIndex: 3,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  // Softly-rounded triangle: a V with a gently rounded tip
                  // (uses path-like polygon via clip-path-svg-style polygon)
                  clipPath:
                    "polygon(0% 0%, 100% 0%, 56% 96%, 50% 100%, 44% 96%)",
                  backgroundImage: `url(${paperTexture})`,
                  backgroundSize: "180% 180%",
                  backgroundPosition: "30% 20%",
                  filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.22))",
                }}
              >
                {/* Flap shading: soft gradient, brightest near top, gentle shadow toward V */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,250,240,0.14) 0%, rgba(0,0,0,0) 35%, rgba(60,45,25,0.20) 100%)",
                  }}
                />
                {/* Soft warm sheen near top edge */}
                <div
                  className="absolute inset-x-0 top-0 h-[16%] pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,245,225,0.30), transparent)",
                  }}
                />
                {/* Contact shadow at flap tip */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.22) 0%, transparent 22%)",
                  }}
                />
              </div>

              {/* === 3. Subtle V-seam highlight on the body where the flap meets === */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 300 200"
                preserveAspectRatio="none"
                style={{ zIndex: 2 }}
              >
                <defs>
                  <linearGradient id="env-vlight-l" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255,250,235,0)" />
                    <stop offset="50%" stopColor="rgba(255,250,235,0.45)" />
                    <stop offset="100%" stopColor="rgba(255,250,235,0)" />
                  </linearGradient>
                  <linearGradient id="env-vlight-r" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,250,235,0)" />
                    <stop offset="50%" stopColor="rgba(255,250,235,0.45)" />
                    <stop offset="100%" stopColor="rgba(255,250,235,0)" />
                  </linearGradient>
                </defs>
                {/* Light catch on the V edges */}
                <line x1="150" y1="118" x2="0" y2="0" stroke="url(#env-vlight-l)" strokeWidth="1" />
                <line x1="150" y1="118" x2="300" y2="0" stroke="url(#env-vlight-r)" strokeWidth="1" />
                {/* Soft drop shadow under the V for depth */}
                <line x1="150" y1="118" x2="0" y2="0" stroke="rgba(40,28,10,0.15)" strokeWidth="0.7" transform="translate(0.6 0.8)" />
                <line x1="150" y1="118" x2="300" y2="0" stroke="rgba(40,28,10,0.15)" strokeWidth="0.7" transform="translate(-0.6 0.8)" />
              </svg>

              {/* === 4. BURGUNDY WAX SEAL (matches the reference photo) === */}
              <div
                className="env-seal absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "60%",
                  transform: "translate(-50%, -50%) rotate(-2deg)",
                  width: "30%",
                  aspectRatio: "0.86 / 1",
                  zIndex: 4,
                  willChange: "transform, opacity",
                  filter:
                    "drop-shadow(0 14px 18px rgba(0,0,0,0.55)) drop-shadow(0 4px 6px rgba(0,0,0,0.45))",
                }}
              >
                <svg
                  viewBox="0 0 120 140"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <defs>
                    {/* Body gradient: deep burgundy with brighter top-left */}
                    <radialGradient id="seal-fill" cx="36%" cy="28%" r="80%">
                      <stop offset="0%" stopColor={waxHi} />
                      <stop offset="22%" stopColor={waxBase} />
                      <stop offset="58%" stopColor={waxMid} />
                      <stop offset="88%" stopColor={waxLo} />
                      <stop offset="100%" stopColor={waxDeep} />
                    </radialGradient>
                    {/* Sharp specular highlight */}
                    <radialGradient id="seal-spec" cx="34%" cy="22%" r="22%">
                      <stop offset="0%" stopColor="rgba(255,210,200,0.85)" />
                      <stop offset="60%" stopColor="rgba(255,210,200,0.20)" />
                      <stop offset="100%" stopColor="rgba(255,210,200,0)" />
                    </radialGradient>
                    {/* Bottom-right deep shadow */}
                    <radialGradient id="seal-shadow" cx="68%" cy="80%" r="55%">
                      <stop offset="0%" stopColor="rgba(20,4,5,0)" />
                      <stop offset="65%" stopColor="rgba(20,4,5,0.30)" />
                      <stop offset="100%" stopColor="rgba(20,4,5,0.65)" />
                    </radialGradient>
                    {/* Rim light */}
                    <radialGradient id="seal-rim" cx="50%" cy="50%" r="50%">
                      <stop offset="84%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="96%" stopColor="rgba(255,180,170,0.45)" />
                      <stop offset="100%" stopColor="rgba(255,180,170,0)" />
                    </radialGradient>
                    {/* Inner deboss shadow (for the pill ring + letters) */}
                    <filter id="seal-deboss" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="0.6" />
                    </filter>
                    {/* Surface grain */}
                    <filter id="seal-grain">
                      <feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="2" stitchTiles="stitch" />
                      <feColorMatrix values="0 0 0 0 0.12
                                             0 0 0 0 0.03
                                             0 0 0 0 0.04
                                             0 0 0 0.20 0" />
                    </filter>
                    {/* Cast shadow under seal */}
                    <filter id="seal-cast" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="2" />
                    </filter>

                    {/* Egg/oval irregular silhouette (like the reference) */}
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

                    {/* Inner pill / rounded rectangle (the deboss ring like the reference) */}
                    <rect
                      id="seal-pill"
                      x="26" y="30" width="68" height="80" rx="32" ry="32"
                    />
                  </defs>

                  {/* Soft cast shadow on the paper */}
                  <use
                    href="#seal-shape"
                    fill="rgba(0,0,0,0.40)"
                    transform="translate(2 5)"
                    style={{ filter: "url(#seal-cast)" }}
                  />

                  {/* Base wax body */}
                  <use href="#seal-shape" fill="url(#seal-fill)" />

                  {/* Bottom-right volumetric shadow */}
                  <use
                    href="#seal-shape"
                    fill="url(#seal-shadow)"
                    style={{ mixBlendMode: "multiply" }}
                  />

                  {/* Rim light catching the edge */}
                  <use
                    href="#seal-shape"
                    fill="url(#seal-rim)"
                    style={{ mixBlendMode: "screen" }}
                  />

                  {/* Specular highlight */}
                  <use href="#seal-shape" fill="url(#seal-spec)" />

                  {/* Surface grain */}
                  <use
                    href="#seal-shape"
                    fill="white"
                    style={{
                      filter: "url(#seal-grain)",
                      mixBlendMode: "overlay",
                      opacity: 0.5,
                    }}
                  />

                  {/* === Deboss: pill-shaped ring (the inner outline from the reference) === */}
                  {/* Dark debossed groove */}
                  <use
                    href="#seal-pill"
                    fill="none"
                    stroke={waxDeep}
                    strokeWidth="1.4"
                    opacity="0.7"
                    style={{ filter: "url(#seal-deboss)" }}
                  />
                  {/* Inner thinner outline (double-line look) */}
                  <rect
                    x="29" y="33" width="62" height="74" rx="29" ry="29"
                    fill="none"
                    stroke={waxDeep}
                    strokeWidth="0.6"
                    opacity="0.55"
                  />
                  {/* Light catch on top of the ring (raised edge of the deboss) */}
                  <use
                    href="#seal-pill"
                    fill="none"
                    stroke="rgba(255,200,190,0.45)"
                    strokeWidth="0.5"
                    transform="translate(0 -0.6)"
                  />

                  {/* === Embossed serif monogram (F over M style, vertically stacked initials) === */}
                  {/* Deep deboss layer */}
                  <text
                    x="60" y="70"
                    textAnchor="middle"
                    fill={waxDeep}
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "30px",
                      letterSpacing: "0.5px",
                      filter: "url(#seal-deboss)",
                    }}
                  >
                    {groomInitial}
                  </text>
                  <text
                    x="60" y="98"
                    textAnchor="middle"
                    fill={waxDeep}
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "30px",
                      letterSpacing: "0.5px",
                      filter: "url(#seal-deboss)",
                    }}
                  >
                    {brideInitial}
                  </text>
                  {/* Mid-tone shadow under letters */}
                  <text
                    x="60" y="70.6"
                    textAnchor="middle"
                    fill={waxLo}
                    opacity="0.65"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "30px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {groomInitial}
                  </text>
                  <text
                    x="60" y="98.6"
                    textAnchor="middle"
                    fill={waxLo}
                    opacity="0.65"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "30px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {brideInitial}
                  </text>
                  {/* Highlight catch on letters (raised glint) */}
                  <text
                    x="60" y="69.4"
                    textAnchor="middle"
                    fill="rgba(255,200,190,0.5)"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "30px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {groomInitial}
                  </text>
                  <text
                    x="60" y="97.4"
                    textAnchor="middle"
                    fill="rgba(255,200,190,0.5)"
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 700,
                      fontSize: "30px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {brideInitial}
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
