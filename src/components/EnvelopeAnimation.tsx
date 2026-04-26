import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";

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
 * Driven by a single CSS @keyframes master timeline per element so the entire
 * sequence runs on the GPU compositor — no setTimeout chains, no React
 * re-renders during playback.
 *
 * Sequence (≈2000ms total):
 *   0–150ms     Breath in (envelope scales 0.98)
 *   0–300ms     Seal bursts outward and fades; flap shimmer sweep
 *   300–900ms   Flap unfolds (rotateX 0 → -162deg)
 *   600–1400ms  Inner card slides up out of pocket with parallax + scale
 *   1200–1600ms Envelope body sinks & fades
 *   1500–2000ms Background overlay dissolves to reveal the page
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

  // Luxury palette
  const paperLight = "#F5EDD8";
  const paperMid = "#EDE0C4";
  const paperInnerDark = "#DDD0B0"; // back face of flap (paper thickness)
  const cardCream = "#FBF6EC";
  const accent = accentColor || "#C4A35A"; // rose-gold
  const sealColor = primaryColor || "#6D1A26"; // deep burgundy

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

  // Lock body scroll until the invitation is revealed
  useEffect(() => {
    if (!hidden) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [hidden]);

  // Floating gold dust motes
  const motes = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
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
          {/* SVG paper-grain noise filter (referenced by paper surfaces) */}
          <svg className="absolute -z-10 w-0 h-0" aria-hidden="true">
            <defs>
              <filter id="env-paper-noise">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.9"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  values="0 0 0 0 0.55
                          0 0 0 0 0.45
                          0 0 0 0 0.30
                          0 0 0 0.25 0"
                />
              </filter>
            </defs>
          </svg>

          {/* Ambient warm glow */}
          <div
            className="env-glow absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 48%, rgba(196,163,90,0.14) 0%, transparent 55%)",
            }}
          />

          {/* Floating gold dust */}
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

          {/* Master stylesheet — single timeline per element */}
          <style>{`
            .env-overlay {
              background: radial-gradient(ellipse at center, hsl(30 22% 13%) 0%, hsl(30 20% 7%) 100%);
              opacity: 1;
              transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1);
            }
            .env-overlay.is-opening {
              animation: envOverlayOut 2000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes envOverlayOut {
              0%, 75%  { opacity: 1; }
              100%     { opacity: 0; pointer-events: none; }
            }

            @keyframes envMote {
              0%, 100% { transform: translateY(0) translateX(0); opacity: 0.35; }
              50%      { transform: translateY(-26px) translateX(8px); opacity: 0.95; }
            }

            @keyframes envGlowPulse {
              0%, 100% { opacity: 0.85; transform: scale(1); }
              50%      { opacity: 1; transform: scale(1.04); }
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

            /* === ENVELOPE BODY ===
               Breath in at start, then sink and fade out as the card rises out. */
            @keyframes envBody {
              0%   { transform: scale(1)     translateY(0);  opacity: 1; }
              7%   { transform: scale(0.98)  translateY(0);  opacity: 1; }   /* breath */
              18%  { transform: scale(1)     translateY(0);  opacity: 1; }
              60%  { transform: scale(1)     translateY(14px); opacity: 1; }
              80%  { transform: scale(0.985) translateY(34px); opacity: 0.5; }
              100% { transform: scale(0.97)  translateY(56px); opacity: 0; }
            }
            .is-opening .env-body {
              animation: envBody 2000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            /* === FLAP ===
               Holds closed during the breath/seal burst, then unfolds with the
               cinematic ease curve, settling at -162° (leans back behind body). */
            @keyframes envFlap {
              0%, 14%  { transform: rotateX(0deg); }
              45%      { transform: rotateX(-168deg); } /* slight overshoot */
              55%      { transform: rotateX(-162deg); } /* settle */
              100%     { transform: rotateX(-162deg); }
            }
            .is-opening .env-flap {
              animation: envFlap 2000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            /* === SHIMMER sweep across flap (0–300ms window) === */
            @keyframes envShimmer {
              0%       { transform: translateX(-130%) skewX(-22deg); opacity: 0; }
              5%       { opacity: 0.65; }
              16%      { transform: translateX(230%)  skewX(-22deg); opacity: 0; }
              100%     { opacity: 0; }
            }
            .is-opening .env-shimmer {
              animation: envShimmer 2000ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* === SEAL burst (0–300ms) === */
            @keyframes envSeal {
              0%       { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              4%       { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
              16%      { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
              100%     { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
            }
            .is-opening .env-seal {
              animation: envSeal 2000ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* === CARD: physically extracted from the envelope pocket === */
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

            /* === Hinge crescent shadow — appears as flap opens === */
            @keyframes envHinge {
              0%, 18%  { opacity: 0; }
              45%      { opacity: 1; }
              90%      { opacity: 0.8; }
              100%     { opacity: 0; }
            }
            .is-opening .env-hinge {
              animation: envHinge 2000ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* === Tap hint fades on click === */
            @keyframes envHint {
              0%        { opacity: 1; }
              8%, 100%  { opacity: 0; }
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

          {/* Hover/scale wrapper */}
          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "1400px",
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
              {/* === Back envelope body === */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(160deg, ${paperLight} 0%, ${paperMid} 100%)`,
                  boxShadow:
                    "inset 0 0 50px rgba(0,0,0,0.07), inset 0 -3px 0 rgba(0,0,0,0.05)",
                }}
              >
                {/* Paper grain (SVG noise) */}
                <div
                  className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
                  style={{ filter: "url(#env-paper-noise)" }}
                />
                {/* Diagonal V fold lines */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 155 100"
                  preserveAspectRatio="none"
                >
                  <line x1="0"   y1="100" x2="77.5" y2="48" stroke="#C9BD9E" strokeWidth="0.25" opacity="0.55" />
                  <line x1="155" y1="100" x2="77.5" y2="48" stroke="#C9BD9E" strokeWidth="0.25" opacity="0.55" />
                </svg>
                {/* Silk ribbon — horizontal across body, beneath where the seal sits */}
                <div
                  className="absolute left-0 right-0"
                  style={{
                    top: "50%",
                    height: "2px",
                    background: `linear-gradient(90deg, transparent 0%, ${accent}aa 12%, ${accent} 50%, ${accent}aa 88%, transparent 100%)`,
                    boxShadow: `0 1px 0 ${accent}33`,
                  }}
                />
              </div>

              {/* === Inner card (slides up out of envelope pocket) === */}
              <div
                className="env-card absolute left-1/2 rounded-xl overflow-hidden"
                style={{
                  bottom: "8%",
                  width: "82%",
                  height: "78%",
                  transform: "translateX(-50%) translateY(0) scale(1)",
                  opacity: 0,
                  background: `linear-gradient(170deg, ${cardCream} 0%, #F2EAD3 100%)`,
                  boxShadow:
                    "0 20px 50px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.1), inset 0 0 30px rgba(196,163,90,0.08)",
                  zIndex: 2,
                  border: `1px solid ${accent}40`,
                  willChange: "transform, opacity",
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                {/* Double-rule gold border */}
                <div
                  className="absolute inset-2 rounded-lg pointer-events-none"
                  style={{ border: `1.5px solid ${accent}aa` }}
                />
                <div
                  className="absolute inset-3.5 rounded-md pointer-events-none"
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
                  {/* Decorative floral divider */}
                  <svg
                    className="mt-4"
                    width="120"
                    height="14"
                    viewBox="0 0 120 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <line x1="2" y1="7" x2="48" y2="7" stroke={accent} strokeWidth="0.6" />
                    <line x1="72" y1="7" x2="118" y2="7" stroke={accent} strokeWidth="0.6" />
                    <path
                      d="M60 2 C 56 5, 56 9, 60 12 C 64 9, 64 5, 60 2 Z"
                      fill={accent}
                      opacity="0.85"
                    />
                    <circle cx="50" cy="7" r="1.1" fill={accent} />
                    <circle cx="70" cy="7" r="1.1" fill={accent} />
                  </svg>
                </div>
              </div>

              {/* === Hinge crescent shadow — fold cast on body when flap opens === */}
              <div
                className="env-hinge absolute left-0 right-0 top-0 pointer-events-none rounded-t-2xl"
                style={{
                  height: "14%",
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
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
                {/* Outer face (visible when closed) */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    background: `linear-gradient(170deg, ${paperLight} 0%, ${paperMid} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 -14px 26px rgba(0,0,0,0.10)",
                  }}
                >
                  {/* Paper grain on flap */}
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
                    style={{
                      filter: "url(#env-paper-noise)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                  {/* Shimmer sweep */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  >
                    <div
                      className="env-shimmer absolute top-0 bottom-0"
                      style={{
                        width: "42%",
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)",
                        mixBlendMode: "overlay",
                        transform: "translateX(-130%) skewX(-22deg)",
                        opacity: 0,
                      }}
                    />
                  </div>
                  {/* Gold accent line tracing flap edges */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 60"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="2,2 50,58 98,2"
                      fill="none"
                      stroke={accent}
                      strokeWidth="0.3"
                      opacity="0.55"
                    />
                  </svg>
                </div>

                {/* Inner face (back of flap — slightly darker for paper thickness) */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                    background: `linear-gradient(170deg, ${paperInnerDark} 0%, #C9BB97 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 18px 32px rgba(0,0,0,0.20)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-50 mix-blend-multiply pointer-events-none"
                    style={{
                      filter: "url(#env-paper-noise)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                </div>
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
                  className="w-full h-full rounded-full flex items-center justify-center relative"
                  style={{
                    background: `radial-gradient(circle at 32% 28%, ${sealColor}f5 0%, ${sealColor} 55%, ${sealColor}b5 100%)`,
                    boxShadow:
                      "inset -6px -8px 14px rgba(0,0,0,0.45), inset 4px 5px 10px rgba(255,255,255,0.22), 0 8px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Beveled dashed border */}
                  <div
                    className="absolute inset-[8%] rounded-full pointer-events-none"
                    style={{
                      border: `1px dashed ${accent}aa`,
                      boxShadow: "inset 0 0 6px rgba(0,0,0,0.35)",
                    }}
                  />
                  <span
                    className="tracking-wider relative"
                    style={{
                      color: accent,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "clamp(13px, 3.2vw, 26px)",
                      textShadow:
                        "0 1px 1px rgba(0,0,0,0.45), 0 0 6px rgba(196,163,90,0.25)",
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
