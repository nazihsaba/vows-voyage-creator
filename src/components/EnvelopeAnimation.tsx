import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import envelopeImage from "@/assets/envelope-wax-seal.jpeg";

interface EnvelopeAnimationProps {
  groomName: string;
  brideName: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Photographic envelope using the real envelope+wax-seal image as the base.
 * On tap: a subtle "open" animation lifts the top portion, the card slides up,
 * and the overlay fades out.
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

  const cardCream = "#FBF6EC";
  const accent = accentColor || "#B89968";
  const sealBase = primaryColor || "#7A1F25";

  const groomInitial = (groomName?.trim()?.charAt(0) || "A").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "B").toUpperCase();

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

            /* Top portion of the photo (flap+seal) lifts away */
            @keyframes envFlapLift {
              0%, 14%  { transform: rotateX(0deg); opacity: 1; }
              45%      { transform: rotateX(-150deg); opacity: 1; }
              70%      { transform: rotateX(-160deg); opacity: 0.7; }
              100%     { transform: rotateX(-160deg); opacity: 0; }
            }
            .is-opening .env-flap {
              animation: envFlapLift 2000ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
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

            @keyframes envHint {
              0% { opacity: 1; }
              8%, 100% { opacity: 0; }
            }
            .is-opening .env-hint { animation: envHint 2000ms ease-out forwards; }

            @media (prefers-reduced-motion: reduce) {
              .env-overlay { animation: none !important; opacity: 0 !important; pointer-events: none !important; }
              .env-idle, .env-mote, .env-glow,
              .env-body, .env-flap, .env-card, .env-hint {
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
              {/* === Bottom (static) half of the envelope photo === */}
              <div
                className="absolute inset-0 rounded-[6px] overflow-hidden"
                style={{
                  backgroundImage: `url(${envelopeImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {/* === Inner card — slides up from the envelope === */}
              <div
                className="env-card absolute left-1/2 rounded-[6px] overflow-hidden"
                style={{
                  bottom: "8%",
                  width: "82%",
                  height: "70%",
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

              {/* === Top half of the photo (flap + wax seal) — lifts away on open === */}
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
                  // Use the same image but show only the top portion of the envelope
                  backgroundImage: `url(${envelopeImage})`,
                  backgroundSize: "100% auto",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                  boxShadow: "inset 0 -10px 22px rgba(0,0,0,0.10)",
                }}
              >
                {/* Dynamic monogram overlay — masks the printed "FM" on the wax seal */}
                <div
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    // Position over the wax-seal monogram area in the photo
                    left: "50%",
                    top: "78%",
                    transform: "translate(-50%, -50%)",
                    width: "26%",
                    aspectRatio: "1.1 / 1",
                  }}
                >
                  {/* Soft wax-tone wash to hide the original "FM" letters underneath */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse at 45% 40%, rgba(132,32,38,0.95) 0%, rgba(110,24,30,0.92) 55%, rgba(95,20,26,0.85) 100%)",
                      borderRadius: "50%",
                      filter: "blur(0.4px)",
                      mixBlendMode: "multiply",
                      opacity: 0.92,
                    }}
                  />
                  {/* Dynamic embossed initials */}
                  <span
                    className="relative"
                    style={{
                      color: "#5A1218",
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                      fontWeight: 600,
                      fontStyle: "italic",
                      fontSize: "clamp(22px, 5.5vw, 52px)",
                      letterSpacing: "0.02em",
                      lineHeight: 1,
                      textShadow:
                        "0 1px 0 rgba(255,180,170,0.35), 0 -1px 1px rgba(0,0,0,0.55), 0 0 6px rgba(0,0,0,0.20)",
                    }}
                  >
                    {groomInitial}{brideInitial}
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
