import { useState, useEffect, ReactNode, useMemo } from "react";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Luxury cinematic envelope opening animation.
 *
 * Driven entirely by CSS keyframes (single continuous timeline) so that
 * every element animates on the GPU compositor — no React re-render jank,
 * no setTimeout chain, no abrupt transition handoffs.
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

  // Refined ivory/cream paper tones with rose-gold accent
  const paperFront = "#F7F1E3";
  const paperBack = "#EDE3CC";
  const paperInner = "#FBF7EC";
  const paperShadow = "#C9BD9E";
  const accent = accentColor || "#C9A961";
  const sealColor = primaryColor || "#7A1F2B";

  // Total animation length (ms). Must match keyframe percentages below.
  const TOTAL = 2600;

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    // Remove from DOM after animation finishes
    setTimeout(() => setHidden(true), TOTAL + 50);
  };

  // Lock body scroll until invitation is revealed
  useEffect(() => {
    if (!hidden) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [hidden]);

  // Floating dust particles
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 40 + Math.random() * 50,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 4,
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
          {/* Ambient warm glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(201,169,97,0.10) 0%, transparent 55%)",
            }}
          />

          {/* Floating dust particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <span
                key={p.id}
                className="absolute rounded-full env-particle"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: `radial-gradient(circle, ${accent}aa 0%, transparent 70%)`,
                  animation: `envFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
                  filter: "blur(0.5px)",
                }}
              />
            ))}
          </div>

          {/* All animation styles */}
          <style>{`
            .env-overlay {
              background: radial-gradient(ellipse at center, hsl(35 22% 14%) 0%, hsl(30 18% 6%) 100%);
              opacity: 1;
              transition: opacity 700ms cubic-bezier(0.4, 0, 0.2, 1);
            }
            .env-overlay.is-opening {
              animation: envOverlayFade 2600ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }
            @keyframes envOverlayFade {
              0%, 65% { opacity: 1; }
              100% { opacity: 0; pointer-events: none; }
            }

            @keyframes envFloat {
              0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
              50% { transform: translateY(-22px) translateX(6px); opacity: 0.85; }
            }

            @keyframes envIdle {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-6px) scale(1); }
            }
            .env-idle { animation: envIdle 4.2s ease-in-out infinite; }

            @keyframes envSheen {
              0% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
              30% { opacity: 0.55; }
              100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
            }

            .env-hover-zone:hover .env-hover-target {
              transform: scale(1.025);
              filter: drop-shadow(0 35px 55px rgba(0,0,0,0.55));
            }

            /* === Master envelope timeline === */
            /* Total: 2600ms. Easing: cubic-bezier(0.25, 1, 0.5, 1) (luxury) */
            @keyframes envMaster {
              0%   { transform: scale(1) translateY(0); opacity: 1; }
              8%   { transform: scale(0.985) translateY(0); opacity: 1; }   /* breath in */
              25%  { transform: scale(1) translateY(0); opacity: 1; }       /* settle */
              60%  { transform: scale(1) translateY(18px); opacity: 1; }    /* drift down as card rises */
              85%  { transform: scale(0.98) translateY(40px); opacity: 0.4; }
              100% { transform: scale(0.96) translateY(60px); opacity: 0; }
            }
            .is-opening .env-body {
              animation: envMaster 2600ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            /* === Flap === */
            /* Rotates around its top hinge. We stop at ~155° (not 180°) so the flap
               leans back behind the envelope without floating disconnected above it.
               Slight Z translate keeps it visually attached to the body. */
            @keyframes envFlap {
              0%   { transform: translateZ(0) rotateX(0deg); }
              8%   { transform: translateZ(0) rotateX(-3deg); }      /* anticipation lift */
              18%  { transform: translateZ(0) rotateX(0deg); }
              55%  { transform: translateZ(-2px) rotateX(-158deg); } /* gentle overshoot */
              70%  { transform: translateZ(-2px) rotateX(-152deg); } /* settle back */
              100% { transform: translateZ(-2px) rotateX(-152deg); }
            }
            .is-opening .env-flap {
              animation: envFlap 2600ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            /* === Sheen sweep across flap during opening === */
            @keyframes envSheenTimed {
              0%, 18% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
              28% { opacity: 0.6; }
              45% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
              100% { opacity: 0; }
            }
            .is-opening .env-sheen {
              animation: envSheenTimed 2600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* === Wax seal === */
            @keyframes envSeal {
              0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              6%   { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
              14%  { opacity: 0; transform: translate(-50%, -50%) scale(1.45); }
              100% { opacity: 0; transform: translate(-50%, -50%) scale(1.45); }
            }
            .is-opening .env-seal {
              animation: envSeal 2600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* === Inner card: stays hidden until flap is half open, then parallax-rises === */
            @keyframes envCard {
              0%, 25%   { transform: translateX(-50%) translateY(8%) scale(0.96); opacity: 0; }
              35%       { opacity: 1; }
              60%       { transform: translateX(-50%) translateY(-42%) scale(1.02); opacity: 1; }
              80%       { transform: translateX(-50%) translateY(-90%) scale(1.25); opacity: 1; }
              100%      { transform: translateX(-50%) translateY(-130%) scale(1.6); opacity: 0; }
            }
            .is-opening .env-card {
              animation: envCard 2600ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }

            /* === Tap hint fades immediately on click === */
            @keyframes envHintFade {
              0% { opacity: 1; }
              10%, 100% { opacity: 0; }
            }
            .is-opening .env-hint {
              animation: envHintFade 2600ms ease-out forwards;
            }

            @media (prefers-reduced-motion: reduce) {
              .env-idle, .env-particle { animation: none !important; }
            }
          `}</style>

          {/* Hover/scale wrapper */}
          <div
            className="env-hover-zone relative cursor-pointer select-none"
            style={{
              perspective: "1600px",
              width: "min(88vw, 540px)",
              aspectRatio: "1.55 / 1",
            }}
            onClick={handleOpen}
            role="button"
            aria-label="Tap to open invitation"
          >
            <div
              className={`env-hover-target env-body ${!opening ? "env-idle" : ""}`}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                filter: "drop-shadow(0 25px 45px rgba(0,0,0,0.45))",
                transformStyle: "preserve-3d",
                transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1), filter 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "transform, opacity",
              }}
            >
              {/* === Back envelope body === */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${paperFront} 0%, ${paperBack} 100%)`,
                  boxShadow:
                    "inset 0 0 40px rgba(0,0,0,0.06), inset 0 -2px 0 rgba(0,0,0,0.04)",
                }}
              >
                {/* Subtle paper texture */}
                <div
                  className="absolute inset-0 opacity-[0.18] mix-blend-multiply"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.06) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.05) 0%, transparent 40%)",
                  }}
                />
                {/* Diagonal V fold lines */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 155 100"
                  preserveAspectRatio="none"
                >
                  <line x1="0" y1="100" x2="77.5" y2="48" stroke={paperShadow} strokeWidth="0.25" opacity="0.6" />
                  <line x1="155" y1="100" x2="77.5" y2="48" stroke={paperShadow} strokeWidth="0.25" opacity="0.6" />
                </svg>
                {/* Gold accent baseline */}
                <div
                  className="absolute left-[8%] right-[8%]"
                  style={{
                    bottom: "12%",
                    height: "1px",
                    background: `linear-gradient(90deg, transparent 0%, ${accent}88 50%, transparent 100%)`,
                  }}
                />
              </div>

              {/* === Inner card === */}
              <div
                className="env-card absolute left-1/2 rounded-xl overflow-hidden"
                style={{
                  bottom: "8%",
                  width: "82%",
                  height: "78%",
                  transform: "translateX(-50%) translateY(8%) scale(0.96)",
                  opacity: 0,
                  background: `linear-gradient(170deg, ${paperInner} 0%, #F2EAD3 100%)`,
                  boxShadow:
                    "0 18px 40px -12px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.08), inset 0 0 30px rgba(201,169,97,0.08)",
                  zIndex: 2,
                  border: `1px solid ${accent}33`,
                  willChange: "transform, opacity",
                }}
              >
                <div
                  className="absolute inset-3 rounded-lg pointer-events-none"
                  style={{ border: `1px solid ${accent}55` }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <p
                    className="uppercase tracking-[0.5em] text-[10px] sm:text-xs mb-3"
                    style={{ color: `${sealColor}cc` }}
                  >
                    You're invited
                  </p>
                  <p
                    className="font-serif italic"
                    style={{
                      color: sealColor,
                      fontSize: "clamp(20px, 4vw, 34px)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {groomName} <span style={{ color: accent }}>&amp;</span> {brideName}
                  </p>
                  <div
                    className="mt-3"
                    style={{
                      width: "60%",
                      height: "1px",
                      background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                    }}
                  />
                </div>
              </div>

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
                    background: `linear-gradient(170deg, ${paperFront} 0%, ${paperBack} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 -12px 24px rgba(0,0,0,0.10)",
                  }}
                >
                  {/* Light sheen sweep */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  >
                    <div
                      className="env-sheen absolute top-0 bottom-0"
                      style={{
                        width: "40%",
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                        mixBlendMode: "overlay",
                        transform: "translateX(-120%) skewX(-20deg)",
                        opacity: 0,
                      }}
                    />
                  </div>
                  {/* Gold accent line along flap edges */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 60"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="2,2 50,58 98,2"
                      fill="none"
                      stroke={accent}
                      strokeWidth="0.25"
                      opacity="0.5"
                    />
                  </svg>
                </div>

                {/* Inner face */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                    background: `linear-gradient(170deg, ${paperInner} 0%, ${paperFront} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 12px 24px rgba(0,0,0,0.08)",
                  }}
                />
              </div>

              {/* === Wax seal monogram === */}
              <div
                className="env-seal absolute left-1/2 top-1/2"
                style={{
                  width: "20%",
                  aspectRatio: "1 / 1",
                  zIndex: 4,
                  transform: "translate(-50%, -50%) scale(1)",
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 32% 28%, ${sealColor}f5 0%, ${sealColor} 55%, ${sealColor}bb 100%)`,
                    boxShadow:
                      "inset -5px -7px 12px rgba(0,0,0,0.40), inset 4px 4px 9px rgba(255,255,255,0.20), 0 6px 14px rgba(0,0,0,0.45)",
                    border: `1px dashed ${accent}80`,
                  }}
                >
                  <span
                    className="font-serif tracking-wider"
                    style={{
                      color: accent,
                      fontSize: "clamp(13px, 3.2vw, 26px)",
                      textShadow: "0 1px 1px rgba(0,0,0,0.35)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {groomInitial}&nbsp;&amp;&nbsp;{brideInitial}
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
