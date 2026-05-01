import { ReactNode, useCallback, useEffect, useState } from "react";

/**
 * Royale's own envelope entry — built into the template (not optional).
 *
 * Visual design:
 *   - Cream parchment envelope with gold filigree border
 *   - Wax-like seal disc with the couple's initials
 *   - Soft floating gold particles, candle-warm radial glow
 *
 * Interaction:
 *   - Tap/click/key to open: flap rotates back, body fades, overlay
 *     dissolves so the underlying invitation becomes visible.
 *   - Body scroll is locked while the envelope is showing.
 */
interface RoyaleEnvelopeProps {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  children: ReactNode;
}

const GOLD = "#b08a3e";
const GOLD_LIGHT = "#d8b461";
const GOLD_DEEP = "#7e5e1a";
const CREAM = "#f5ecd6";
const CREAM_DEEP = "#e7d6ac";

const RoyaleEnvelope = ({
  groomName,
  brideName,
  weddingDate,
  children,
}: RoyaleEnvelopeProps) => {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

  const initial = (s?: string) =>
    (s || "").trim().charAt(0).toUpperCase() || "";
  const groomInitial = initial(groomName);
  const brideInitial = initial(brideName);

  const formattedDate = (() => {
    if (!weddingDate) return "";
    const d = new Date(weddingDate);
    if (isNaN(d.getTime())) return "";
    return d
      .toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
      .toUpperCase();
  })();

  const TOTAL = 2400;

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => setHidden(true), TOTAL + 200);
  }, [opening]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  // Lock scroll while envelope is showing.
  useEffect(() => {
    if (hidden) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [hidden]);

  return (
    <>
      {children}

      {!hidden && (
        <div
          className={`royale-env-overlay fixed inset-0 z-[9999] flex items-center justify-center ${
            opening ? "is-opening" : ""
          }`}
        >
          <style>{`
            .royale-env-overlay {
              background:
                radial-gradient(ellipse at center, #2a1f10 0%, #15100a 70%, #0c0805 100%);
              height: 100vh;
              height: 100dvh;
              opacity: 1;
              transition: opacity 800ms cubic-bezier(.4,0,.2,1) 1500ms;
            }
            .royale-env-overlay.is-opening { opacity: 0; pointer-events: none; }

            @keyframes royaleGlow {
              0%, 100% { opacity: .55; transform: scale(1); }
              50%      { opacity: .9;  transform: scale(1.05); }
            }
            .royale-glow { animation: royaleGlow 5s ease-in-out infinite; }

            @keyframes royaleParticle {
              0%, 100% { transform: translateY(0) translateX(0); opacity: .3; }
              50%      { transform: translateY(-20px) translateX(8px); opacity: .9; }
            }
            .royale-particle { animation: royaleParticle 6s ease-in-out infinite; }

            @keyframes royaleIdle {
              0%, 100% { transform: translateY(0); }
              50%      { transform: translateY(-5px); }
            }
            .royale-idle { animation: royaleIdle 4s ease-in-out infinite; }

            @keyframes royaleBody {
              0%   { transform: scale(1) translateY(0); opacity: 1; }
              60%  { transform: scale(1) translateY(0); opacity: 1; }
              100% { transform: scale(.96) translateY(60px); opacity: 0; }
            }
            .is-opening .royale-target {
              animation: royaleBody ${TOTAL}ms cubic-bezier(.4,0,.2,1) forwards;
            }

            @keyframes royaleFlap {
              0%   { transform: rotateX(-8deg); }
              100% { transform: rotateX(-178deg); }
            }
            .royale-flap-wrap { transform: rotateX(-8deg); transform-origin: top center; }
            .is-opening .royale-flap-wrap {
              animation: royaleFlap ${TOTAL * 0.55}ms cubic-bezier(.5,.05,.3,1) forwards;
            }

            @keyframes royaleSeal {
              0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
              30%  { transform: translate(-50%,-55%) scale(1.1); opacity: .9; }
              60%  { transform: translate(-50%,-65%) scale(.85); opacity: 0; }
              100% { transform: translate(-50%,-65%) scale(.85); opacity: 0; }
            }
            .is-opening .royale-seal {
              animation: royaleSeal ${TOTAL * 0.45}ms cubic-bezier(.4,0,.2,1) forwards;
            }

            @keyframes royaleHint { 0%{opacity:.85} 12%,100%{opacity:0} }
            .is-opening .royale-hint { animation: royaleHint ${TOTAL}ms ease-out forwards; }

            @media (prefers-reduced-motion: reduce) {
              .royale-env-overlay { animation: none !important; opacity: 0 !important; pointer-events: none !important; }
              .royale-idle, .royale-glow, .royale-particle, .royale-target, .royale-flap-wrap, .royale-seal, .royale-hint {
                animation: none !important;
              }
            }
          `}</style>

          {/* Warm radial glow */}
          <div
            className="royale-glow absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${GOLD}33 0%, transparent 55%)`,
            }}
          />

          {/* Floating gold particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="royale-particle absolute rounded-full"
                style={{
                  left: `${(i * 13 + 7) % 100}%`,
                  top: `${30 + ((i * 17) % 60)}%`,
                  width: `${2 + (i % 3)}px`,
                  height: `${2 + (i % 3)}px`,
                  background: `radial-gradient(circle, ${GOLD_LIGHT} 0%, transparent 70%)`,
                  animationDelay: `${(i * 0.4) % 3}s`,
                }}
              />
            ))}
          </div>

          {/* Envelope */}
          <div
            className="relative cursor-pointer select-none outline-none"
            onClick={handleOpen}
            onKeyDown={handleKey}
            role="button"
            tabIndex={0}
            aria-label="Tap to open invitation"
            style={{
              perspective: "2000px",
              width: "min(88vw, 460px)",
              height: "min(72dvh, 600px)",
            }}
          >
            <div
              className={`royale-target ${!opening ? "royale-idle" : ""}`}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 30px 50px rgba(0,0,0,.55))",
              }}
            >
              {/* Body */}
              <div
                className="absolute inset-0 rounded-md"
                style={{
                  background: `linear-gradient(160deg, ${CREAM} 0%, ${CREAM_DEEP} 100%)`,
                  boxShadow:
                    `inset 0 0 0 1px ${GOLD}55, inset 0 0 60px rgba(126,94,26,0.15)`,
                }}
              >
                {/* Inner gold double border */}
                <div
                  className="absolute inset-3 rounded-sm pointer-events-none"
                  style={{ border: `1px solid ${GOLD}77` }}
                />
                <div
                  className="absolute inset-5 rounded-sm pointer-events-none"
                  style={{ border: `1px solid ${GOLD}33` }}
                />

                {/* Names + date inside the envelope face */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  <p
                    className="text-[10px] sm:text-xs tracking-[0.45em] uppercase mb-6"
                    style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
                  >
                    Together with their families
                  </p>
                  <p
                    className="text-3xl sm:text-4xl italic leading-snug"
                    style={{ color: "#3a2a14" }}
                  >
                    {groomName || "Groom"}
                  </p>
                  <p
                    className="my-2 text-2xl sm:text-3xl"
                    style={{ color: GOLD_DEEP, fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    &amp;
                  </p>
                  <p
                    className="text-3xl sm:text-4xl italic leading-snug"
                    style={{ color: "#3a2a14" }}
                  >
                    {brideName || "Bride"}
                  </p>

                  {formattedDate && (
                    <>
                      <div
                        className="my-6 h-px w-24"
                        style={{ background: `${GOLD}88` }}
                      />
                      <p
                        className="text-[11px] sm:text-xs tracking-[0.35em]"
                        style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
                      >
                        {formattedDate}
                      </p>
                    </>
                  )}
                </div>

                {/* Hint */}
                <div
                  className="royale-hint absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase"
                  style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif", opacity: 0.75 }}
                >
                  Tap to open
                </div>
              </div>

              {/* Top flap (rotates open) */}
              <div
                className="royale-flap-wrap absolute left-0 right-0"
                style={{
                  top: 0,
                  height: "55%",
                  transformStyle: "preserve-3d",
                }}
              >
                <svg
                  viewBox="0 0 460 330"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="royale-flap-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CREAM} />
                      <stop offset="100%" stopColor={CREAM_DEEP} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,0 L460,0 L230,300 Z"
                    fill="url(#royale-flap-grad)"
                    stroke={GOLD}
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M14,12 L446,12 L230,278 Z"
                    fill="none"
                    stroke={GOLD}
                    strokeOpacity="0.35"
                    strokeWidth="0.8"
                  />
                </svg>
              </div>

              {/* Wax seal */}
              <div
                className="royale-seal absolute"
                style={{
                  left: "50%",
                  top: "55%",
                  transform: "translate(-50%, -50%)",
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 30%, #d8b461 0%, #b08a3e 35%, #7e5e1a 75%, #4a3508 100%)",
                  boxShadow:
                    "0 6px 14px rgba(0,0,0,.45), inset 0 2px 6px rgba(255,255,255,.3), inset 0 -4px 10px rgba(0,0,0,.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  color: "#fbe9b8",
                  fontSize: 26,
                  letterSpacing: "0.05em",
                  textShadow: "0 1px 1px rgba(0,0,0,.5)",
                  zIndex: 10,
                }}
              >
                {groomInitial && brideInitial
                  ? `${groomInitial}\u00A0${brideInitial}`
                  : "♥"}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoyaleEnvelope;
