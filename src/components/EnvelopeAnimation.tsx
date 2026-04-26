import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Photographic ivory wedding envelope with a prominent oxblood wax seal.
 *
 * Inspired by a real photographed envelope:
 *  - Soft warm ivory cotton paper with felt-like fiber grain
 *  - V-shaped front flap that meets in the center, with both diagonals visible
 *  - Large oval oxblood wax seal with embossed inner oval ring + serif monogram
 *  - Realistic edge highlights along the diagonal folds
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

  // Soft ivory / cream cotton paper palette (matches reference photo)
  const paperLight = "#F1E8D6";   // top highlight
  const paperMid = "#E8DCC4";     // body
  const paperDeep = "#D9C9AB";    // edge / fold shadow
  const paperFlapInner = "#C9B894"; // back-of-flap (paper thickness)
  const cardCream = "#FBF6EC";
  const accent = accentColor || "#B89968";    // antique gold accent
  // Oxblood / burgundy wax (matches reference)
  const sealBase = primaryColor || "#7A1F25";
  const sealHi = "#9C2A30";
  const sealLo = "#4A0F14";

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
          {/* SVG filters: cotton fiber + fine paper grain + wax bevel */}
          <svg className="absolute -z-10 w-0 h-0" aria-hidden="true">
            <defs>
              {/* Cotton fiber felt texture */}
              <filter id="env-fiber">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.9"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  values="0 0 0 0 0.55
                          0 0 0 0 0.46
                          0 0 0 0 0.32
                          0 0 0 0.28 0"
                />
              </filter>
              {/* Fine grain overlay */}
              <filter id="env-grain">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="2.2"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  values="0 0 0 0 0.50
                          0 0 0 0 0.42
                          0 0 0 0 0.28
                          0 0 0 0.14 0"
                />
              </filter>
              {/* Wax surface micro-texture */}
              <filter id="wax-grain">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="1.6"
                  numOctaves="2"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  values="0 0 0 0 0.10
                          0 0 0 0 0.02
                          0 0 0 0 0.04
                          0 0 0 0.35 0"
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
              0%   { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(-4deg); }
              4%   { opacity: 1; transform: translate(-50%, -50%) scale(1.05) rotate(-4deg); }
              16%  { opacity: 0; transform: translate(-50%, -50%) scale(1.45) rotate(-4deg); }
              100% { opacity: 0; transform: translate(-50%, -50%) scale(1.45) rotate(-4deg); }
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
              aspectRatio: "1.5 / 1",
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
              {/* === Envelope body (ivory cotton paper) === */}
              <div
                className="absolute inset-0 rounded-[6px] overflow-hidden"
                style={{
                  background: `
                    radial-gradient(ellipse at 50% 30%, rgba(255,253,245,0.55) 0%, transparent 60%),
                    linear-gradient(165deg, ${paperLight} 0%, ${paperMid} 55%, ${paperDeep} 100%)
                  `,
                  boxShadow:
                    "inset 0 0 80px rgba(120,90,40,0.10), inset 0 -2px 0 rgba(0,0,0,0.05)",
                }}
              >
                {/* Cotton fiber */}
                <div
                  className="absolute inset-0 opacity-50 mix-blend-multiply pointer-events-none"
                  style={{ filter: "url(#env-fiber)" }}
                />
                {/* Fine grain on top */}
                <div
                  className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
                  style={{ filter: "url(#env-grain)" }}
                />
                {/* Soft warm sheen */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,250,235,0.20) 0%, transparent 40%, transparent 65%, rgba(0,0,0,0.05) 100%)",
                  }}
                />

                {/* === Bottom V — visible diagonals from corners up to center === */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 150 100"
                  preserveAspectRatio="none"
                >
                  {/* soft shaded triangle below the V (pocket back) */}
                  <polygon
                    points="0,100 150,100 75,50"
                    fill="rgba(120,90,40,0.06)"
                  />
                  {/* fold lines: bottom-left -> center, bottom-right -> center */}
                  <line x1="0"   y1="100" x2="75" y2="50" stroke="#8B7650" strokeWidth="0.35" opacity="0.55" />
                  <line x1="150" y1="100" x2="75" y2="50" stroke="#8B7650" strokeWidth="0.35" opacity="0.55" />
                  {/* highlight just above each fold line */}
                  <line x1="0"   y1="99.4" x2="75" y2="49.4" stroke="#FFF6E2" strokeWidth="0.25" opacity="0.55" />
                  <line x1="150" y1="99.4" x2="75" y2="49.4" stroke="#FFF6E2" strokeWidth="0.25" opacity="0.55" />
                </svg>

                {/* Inner pocket shadow at the bottom (where the card sits) */}
                <div
                  className="absolute left-0 right-0 bottom-0 pointer-events-none"
                  style={{
                    height: "45%",
                    background:
                      "linear-gradient(to top, rgba(80,55,20,0.14) 0%, rgba(80,55,20,0.05) 55%, transparent 100%)",
                  }}
                />
              </div>

              {/* === Inner card === */}
              <div
                className="env-card absolute left-1/2 rounded-[6px] overflow-hidden"
                style={{
                  bottom: "8%",
                  width: "84%",
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
                    style={{ color: `${sealBase}cc`, fontFamily: "Georgia, serif", fontStyle: "italic" }}
                  >
                    You're Invited
                  </p>
                  <p
                    className="italic"
                    style={{
                      color: sealBase,
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
                className="env-hinge absolute left-0 right-0 top-0 pointer-events-none rounded-t-[6px]"
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
                {/* Outer face — V-shaped flap pointing down to center */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    background: `linear-gradient(180deg, ${paperLight} 0%, ${paperMid} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 -10px 22px rgba(0,0,0,0.10)",
                  }}
                >
                  {/* Cotton fiber on flap */}
                  <div
                    className="absolute inset-0 opacity-50 mix-blend-multiply pointer-events-none"
                    style={{
                      filter: "url(#env-fiber)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-25 mix-blend-multiply pointer-events-none"
                    style={{
                      filter: "url(#env-grain)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                  {/* Soft directional shading on the V faces */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,250,235,0.25) 0%, rgba(0,0,0,0.06) 49%, rgba(0,0,0,0.06) 51%, rgba(255,250,235,0.10) 100%)",
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
                  {/* Crisp edge highlight along the two diagonals */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 60"
                    preserveAspectRatio="none"
                  >
                    {/* darker fold line */}
                    <line x1="0" y1="0" x2="50" y2="60" stroke="#8B7650" strokeWidth="0.35" opacity="0.45" />
                    <line x1="100" y1="0" x2="50" y2="60" stroke="#8B7650" strokeWidth="0.35" opacity="0.45" />
                    {/* bright paper edge */}
                    <line x1="0.4" y1="0" x2="50" y2="59.4" stroke="#FFF8E6" strokeWidth="0.25" opacity="0.7" />
                    <line x1="99.6" y1="0" x2="50" y2="59.4" stroke="#FFF8E6" strokeWidth="0.25" opacity="0.7" />
                  </svg>
                </div>

                {/* Inner face — darker paper for back-of-flap thickness */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                    background: `linear-gradient(170deg, ${paperFlapInner} 0%, #B5A07C 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 18px 32px rgba(0,0,0,0.22)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-60 mix-blend-multiply pointer-events-none"
                    style={{
                      filter: "url(#env-fiber)",
                      clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    }}
                  />
                </div>
              </div>

              {/* === Oxblood oval wax seal (matches reference photo) === */}
              <div
                className="env-seal absolute left-1/2 top-1/2"
                style={{
                  width: "26%",
                  aspectRatio: "0.82 / 1",
                  zIndex: 4,
                  transform: "translate(-50%, -50%) scale(1) rotate(-4deg)",
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                  filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.55)) drop-shadow(0 2px 3px rgba(0,0,0,0.4))",
                }}
              >
                {/* Wax blob — irregular oval */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(ellipse at 35% 28%, ${sealHi} 0%, ${sealBase} 45%, ${sealLo} 100%)
                    `,
                    borderRadius: "48% 52% 47% 53% / 46% 48% 52% 54%",
                    boxShadow: `
                      inset -6px -8px 14px rgba(0,0,0,0.55),
                      inset 5px 6px 10px rgba(255,180,170,0.25),
                      inset 0 0 30px rgba(0,0,0,0.20)
                    `,
                  }}
                >
                  {/* Wax surface micro-grain */}
                  <div
                    className="absolute inset-0 opacity-70 mix-blend-overlay pointer-events-none"
                    style={{
                      filter: "url(#wax-grain)",
                      borderRadius: "48% 52% 47% 53% / 46% 48% 52% 54%",
                    }}
                  />
                  {/* Specular highlight */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: "10%",
                      left: "20%",
                      width: "45%",
                      height: "30%",
                      background:
                        "radial-gradient(ellipse, rgba(255,210,200,0.45) 0%, transparent 70%)",
                      filter: "blur(2px)",
                    }}
                  />

                  {/* Embossed inner oval ring (debossed into wax) */}
                  <div
                    className="absolute"
                    style={{
                      top: "14%",
                      left: "16%",
                      right: "16%",
                      bottom: "14%",
                      borderRadius: "50%",
                      border: `1.5px solid ${sealLo}`,
                      boxShadow: `
                        inset 0 1px 1.5px rgba(0,0,0,0.45),
                        0 1px 0 rgba(255,180,170,0.25)
                      `,
                    }}
                  />
                  {/* Second thinner ring (matching reference) */}
                  <div
                    className="absolute"
                    style={{
                      top: "18%",
                      left: "21%",
                      right: "21%",
                      bottom: "18%",
                      borderRadius: "50%",
                      border: `0.75px solid ${sealLo}`,
                      opacity: 0.7,
                    }}
                  />

                  {/* Embossed serif monogram */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      style={{
                        color: sealLo,
                        fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                        fontWeight: 600,
                        fontSize: "clamp(20px, 4.8vw, 44px)",
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                        textShadow: `
                          0 1px 0 rgba(255,180,170,0.30),
                          0 -1px 1px rgba(0,0,0,0.55)
                        `,
                      }}
                    >
                      {groomInitial}{brideInitial}
                    </span>
                  </div>
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
