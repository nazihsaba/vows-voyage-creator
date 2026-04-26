import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Realistic linen/kraft envelope with a modernized wax seal.
 *
 * Visuals:
 *  - Natural linen-weave paper rendered with layered SVG noise + diagonal fiber lines
 *  - Subtle stitched edge along the envelope perimeter
 *  - Slightly warm cream/sand tones with realistic micro-shadows along folds
 *  - Modern compact wax seal: smaller, flatter, refined serif monogram, thin foil ring
 *
 * Animation: single CSS @keyframes timeline per element, GPU-composited.
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

  const groomInitial = (groomName?.trim()?.charAt(0) || "A").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "B").toUpperCase();

  // Linen / natural paper palette
  const linenLight = "#EFE6D2"; // sun-bleached linen
  const linenMid = "#E2D5B8";   // mid linen
  const linenDeep = "#C9B894";  // shadowed fold
  const linenInner = "#BFAD86"; // back-of-flap (paper thickness)
  const cardCream = "#FBF6EC";
  const stitch = "#A89572";
  const accent = accentColor || "#B89968";   // soft antique gold
  const sealColor = primaryColor || "#5C1A20"; // deep oxblood wax

  const TOTAL = 2000;

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => setHidden(true), TOTAL + 100);
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
          {/* SVG filters: linen weave + fine paper grain */}
          <svg className="absolute -z-10 w-0 h-0" aria-hidden="true">
            <defs>
              {/* Coarser fiber for linen weave */}
              <filter id="env-linen-weave">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.65 1.4"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  values="0 0 0 0 0.45
                          0 0 0 0 0.36
                          0 0 0 0 0.22
                          0 0 0 0.32 0"
                />
              </filter>
              {/* Fine grain overlay */}
              <filter id="env-grain">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="1.6"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  values="0 0 0 0 0.50
                          0 0 0 0 0.42
                          0 0 0 0 0.28
                          0 0 0 0.18 0"
                />
              </filter>
            </defs>
          </svg>

          {/* Ambient warm glow */}
          <div
            className="env-glow absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 48%, rgba(184,153,104,0.13) 0%, transparent 55%)",
            }}
          />

          {/* Floating dust */}
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
              transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1);
            }
            .env-overlay.is-opening {
              animation: envOverlayOut 2000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes envOverlayOut {
              0%, 75% { opacity: 1; }
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

            @keyframes envBody {
              0%   { transform: scale(1)     translateY(0);   opacity: 1; }
              7%   { transform: scale(0.98)  translateY(0);   opacity: 1; }
              18%  { transform: scale(1)     translateY(0);   opacity: 1; }
              60%  { transform: scale(1)     translateY(14px); opacity: 1; }
              80%  { transform: scale(0.985) translateY(34px); opacity: 0.5; }
              100% { transform: scale(0.97)  translateY(56px); opacity: 0; }
            }
            .is-opening .env-body {
              animation: envBody 2000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envFlap {
              0%, 14%  { transform: rotateX(0deg); }
              45%      { transform: rotateX(-168deg); }
              55%      { transform: rotateX(-162deg); }
              100%     { transform: rotateX(-162deg); }
            }
            .is-opening .env-flap {
              animation: envFlap 2000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envShimmer {
              0%   { transform: translateX(-130%) skewX(-22deg); opacity: 0; }
              5%   { opacity: 0.55; }
              16%  { transform: translateX(230%)  skewX(-22deg); opacity: 0; }
              100% { opacity: 0; }
            }
            .is-opening .env-shimmer {
              animation: envShimmer 2000ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes envSeal {
              0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              4%   { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
              16%  { opacity: 0; transform: translate(-50%, -50%) scale(1.45); }
              100% { opacity: 0; transform: translate(-50%, -50%) scale(1.45); }
            }
            .is-opening .env-seal {
              animation: envSeal 2000ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes envCard {
              0%, 28%  { transform: translateX(-50%) translateY(0)     scale(1);    opacity: 0; }
              35%      { opacity: 1; }
              60%      { transform: translateX(-50%) translateY(-55%)  scale(1.08); opacity: 1; }
              80%      { transform: translateX(-50%) translateY(-95%)  scale(1.15); opacity: 1; }
              100%     { transform: translateX(-50%) translateY(-110%) scale(1.18); opacity: 0; }
            }
            .is-opening .env-card {
              animation: envCard 2000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envHinge {
              0%, 18% { opacity: 0; }
              45%     { opacity: 1; }
              90%     { opacity: 0.8; }
              100%    { opacity: 0; }
            }
            .is-opening .env-hinge {
              animation: envHinge 2000ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes envHint {
              0% { opacity: 1; }
              8%, 100% { opacity: 0; }
            }
            .is-opening .env-hint { animation: envHint 2000ms ease-out forwards; }

            @media (prefers-reduced-motion: reduce) {
              .env-overlay { animation: none !important; opacity: 0 !important; pointer-events: none !important; }
              .env-idle, .env-mote, .env-glow,
              .env-body, .env-flap, .env-shimmer, .env-seal, .env-card, .env-hinge, .env-hint {
                animation: none !important;
              }
            }
          `}</style>

          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "1500px",
              width: "min(88vw, 540px)",
              aspectRatio: "1.55 / 1",
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
              {/* === Envelope body (linen paper) === */}
              <div
                className="absolute inset-0 rounded-[14px] overflow-hidden"
                style={{
                  background: `
                    radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 55%),
                    linear-gradient(160deg, ${linenLight} 0%, ${linenMid} 70%, ${linenDeep} 100%)
                  `,
                  boxShadow:
                    "inset 0 0 60px rgba(80,55,20,0.10), inset 0 -3px 0 rgba(0,0,0,0.06)",
                }}
              >
                {/* Linen weave */}
                <div
                  className="absolute inset-0 opacity-55 mix-blend-multiply pointer-events-none"
                  style={{ filter: "url(#env-linen-weave)" }}
                />
                {/* Fine grain on top */}
                <div
                  className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
                  style={{ filter: "url(#env-grain)" }}
                />
                {/* Subtle warm sheen along the diagonal */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,250,235,0.25) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.06) 100%)",
                  }}
                />
                {/* Diagonal V fold lines (where flap meets body) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 155 100"
                  preserveAspectRatio="none"
                >
                  <line x1="0"   y1="100" x2="77.5" y2="48" stroke="#8E7C58" strokeWidth="0.3" opacity="0.55" />
                  <line x1="155" y1="100" x2="77.5" y2="48" stroke="#8E7C58" strokeWidth="0.3" opacity="0.55" />
                </svg>
                {/* Inner pocket shadow at the bottom (where the card sits) */}
                <div
                  className="absolute left-0 right-0 bottom-0 pointer-events-none"
                  style={{
                    height: "40%",
                    background:
                      "linear-gradient(to top, rgba(60,40,15,0.18) 0%, rgba(60,40,15,0.06) 60%, transparent 100%)",
                  }}
                />
                {/* Stitched edge — dashed border just inside the envelope */}
                <div
                  className="absolute inset-[6px] rounded-[10px] pointer-events-none"
                  style={{
                    border: `1px dashed ${stitch}`,
                    opacity: 0.45,
                  }}
                />
              </div>

              {/* === Inner card === */}
              <div
                className="env-card absolute left-1/2 rounded-[10px] overflow-hidden"
                style={{
                  bottom: "8%",
                  width: "82%",
                  height: "78%",
                  transform: "translateX(-50%) translateY(0) scale(1)",
                  opacity: 0,
                  background: `linear-gradient(170deg, ${cardCream} 0%, #F2EAD3 100%)`,
                  boxShadow:
                    "0 20px 50px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.1), inset 0 0 30px rgba(184,153,104,0.10)",
                  zIndex: 2,
                  border: `1px solid ${accent}40`,
                  willChange: "transform, opacity",
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                {/* Subtle card grain */}
                <div
                  className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                  style={{ filter: "url(#env-grain)" }}
                />
                {/* Double rule */}
                <div
                  className="absolute inset-2 rounded-md pointer-events-none"
                  style={{ border: `1.5px solid ${accent}aa` }}
                />
                <div
                  className="absolute inset-3.5 rounded-sm pointer-events-none"
                  style={{ border: `0.5px solid ${accent}66` }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <p
                    className="uppercase tracking-[0.5em] text-[10px] sm:text-xs mb-3"
                    style={{ color: `${sealColor}cc`, fontFamily: "Georgia, serif", fontStyle: "italic" }}
                  >
                    You're Invited
                  </p>
                  <p
                    className="italic"
                    style={{
                      color: sealColor,
                      fontSize: "clamp(22px, 4.2vw, 36px)",
                      letterSpacing: "0.03em",
                      lineHeight: 1.15,
                    }}
                  >
                    {groomName}
                    <span
                      style={{
                        color: accent,
                        fontFamily: "Georgia, serif",
                        margin: "0 0.4em",
                        fontWeight: 300,
                      }}
                    >
                      &amp;
                    </span>
                    {brideName}
                  </p>
                  <svg className="mt-4" width="120" height="14" viewBox="0 0 120 14" fill="none" aria-hidden="true">
                    <line x1="2"  y1="7" x2="48"  y2="7" stroke={accent} strokeWidth="0.6" />
                    <line x1="72" y1="7" x2="118" y2="7" stroke={accent} strokeWidth="0.6" />
                    <path d="M60 2 C 56 5, 56 9, 60 12 C 64 9, 64 5, 60 2 Z" fill={accent} opacity="0.85" />
                    <circle cx="50" cy="7" r="1.1" fill={accent} />
                    <circle cx="70" cy="7" r="1.1" fill={accent} />
                  </svg>
                </div>
              </div>

              {/* === Hinge crescent shadow === */}
              <div
                className="env-hinge absolute left-0 right-0 top-0 pointer-events-none rounded-t-[14px]"
                style={{
                  height: "14%",
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
                  opacity: 0,
                  zIndex: 2,
                }}
              />

              {/* === Top flap === */}
              <div
                className="env-flap absolute top-0 left-0 right-0"
                style={{
                  height: "62%",
                  transformOrigin: "top center",
                  transform: "rotateX(0deg)",
                  transformStyle: "preserve-3d",
                  zIndex: 3,
                  willChange: "transform",
                }}
              >
                {/* Outer face */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    background: `linear-gradient(170deg, ${linenLight} 0%, ${linenMid} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 -14px 26px rgba(0,0,0,0.10)",
                  }}
                >
                  {/* Linen weave on flap */}
                  <div
                    className="absolute inset-0 opacity-55 mix-blend-multiply pointer-events-none"
                    style={{
                      filter: "url(#env-linen-weave)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none"
                    style={{
                      filter: "url(#env-grain)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                  {/* Shimmer */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  >
                    <div
                      className="env-shimmer absolute top-0 bottom-0"
                      style={{
                        width: "42%",
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,250,235,0.55) 50%, transparent 100%)",
                        mixBlendMode: "overlay",
                        transform: "translateX(-130%) skewX(-22deg)",
                        opacity: 0,
                      }}
                    />
                  </div>
                  {/* Stitched edge tracing flap */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 60"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="3,3 50,57 97,3"
                      fill="none"
                      stroke={stitch}
                      strokeWidth="0.35"
                      strokeDasharray="1.2 1"
                      opacity="0.55"
                    />
                  </svg>
                </div>

                {/* Inner face — darker linen for paper thickness */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                    background: `linear-gradient(170deg, ${linenInner} 0%, #A89472 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 18px 32px rgba(0,0,0,0.22)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-65 mix-blend-multiply pointer-events-none"
                    style={{
                      filter: "url(#env-linen-weave)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                </div>
              </div>

              {/* === Modern compact wax seal === */}
              <div
                className="env-seal absolute left-1/2 top-1/2"
                style={{
                  width: "16%",
                  aspectRatio: "1 / 1",
                  zIndex: 4,
                  transform: "translate(-50%, -50%) scale(1)",
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center relative"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${sealColor}f0 0%, ${sealColor} 60%, ${sealColor}c0 100%)`,
                    boxShadow:
                      "inset -3px -5px 9px rgba(0,0,0,0.40), inset 3px 4px 8px rgba(255,255,255,0.18), 0 5px 12px rgba(0,0,0,0.45)",
                  }}
                >
                  {/* Thin foil ring */}
                  <div
                    className="absolute inset-[10%] rounded-full pointer-events-none"
                    style={{
                      border: `0.75px solid ${accent}`,
                      opacity: 0.85,
                    }}
                  />
                  <span
                    className="relative"
                    style={{
                      color: accent,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "clamp(11px, 2.6vw, 22px)",
                      letterSpacing: "0.04em",
                      textShadow: "0 1px 1px rgba(0,0,0,0.45)",
                    }}
                  >
                    {groomInitial}<span style={{ opacity: 0.7, margin: "0 0.15em" }}>·</span>{brideInitial}
                  </span>
                </div>
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
