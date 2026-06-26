import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import waxSealHeart from "@/assets/wax-seal-heart.webp";

interface EnvelopeAnimationProps {
  groomName?: string;
  brideName?: string;
  /** ISO date string (YYYY-MM-DD) shown beneath the names. */
  weddingDate?: string;
  primaryColor?: string;
  accentColor?: string;
  children: ReactNode;
}

/**
 * Full-screen editorial envelope opener.
 */
export const EnvelopeAnimation = ({
  groomName,
  brideName,
  weddingDate,
  primaryColor,
  accentColor,
  children,
}: EnvelopeAnimationProps) => {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Detect low-power mobile devices once on mount so we can scale down decorative
  // layers that murder the compositor on phones. Also respects prefers-reduced-motion.
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setIsMobile(mq.matches);
      setReduceMotion(rm.matches);
    };
    update();
    mq.addEventListener?.("change", update);
    rm.addEventListener?.("change", update);
    return () => {
      mq.removeEventListener?.("change", update);
      rm.removeEventListener?.("change", update);
    };
  }, []);

  // New design uses a muted editorial palette; keep props for API compatibility.
  void primaryColor;
  void accentColor;

  // Title-case helper so names always render with elegant capitalization.
  const toTitle = (s?: string) =>
    (s || "")
      .trim()
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" ");
  const groom = toTitle(groomName);
  const bride = toTitle(brideName);
  const hasNames = Boolean(groom || bride);

  // Format wedding date as DD.MM.YYYY to match the editorial design.
  const formattedDate = useMemo(() => {
    if (!weddingDate) return "";
    const d = new Date(weddingDate);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}.${month}.${year}`;
  }, [weddingDate]);

  const TOTAL = 3600;
  const FLAP_REST_TILT = -10;
  const FLAP_CORNER_R = 14;

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => setHidden(true), TOTAL + 120);
  }, [opening]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  // Lock scroll while envelope is visible.
  useEffect(() => {
    if (!hidden) {
      const prevOverflow = document.body.style.overflow;
      const prevTouch = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouch;
      };
    }
  }, [hidden]);

  // Load the editorial typefaces used by the envelope design.
  useEffect(() => {
    const head = document.head;

    if (!document.getElementById("env-gf-preconnect")) {
      const pc1 = document.createElement("link");
      pc1.id = "env-gf-preconnect";
      pc1.rel = "preconnect";
      pc1.href = "https://fonts.googleapis.com";
      head.appendChild(pc1);
      const pc2 = document.createElement("link");
      pc2.rel = "preconnect";
      pc2.href = "https://fonts.gstatic.com";
      pc2.crossOrigin = "anonymous";
      head.appendChild(pc2);
    }

    if (!document.getElementById("env-google-fonts")) {
      const link = document.createElement("link");
      link.id = "env-google-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap";
      head.appendChild(link);
    }
  }, []);

  // SVG viewBox keeps geometry crisp regardless of pixel size.
  // Portrait orientation so the envelope fills vertical screen space.
  const VB_W = 600;
  const VB_H = 840;
  const V_X = 300;
  const V_Y = 300;

  return (
    <>
      {children}

      {!hidden && (
        <div
          className={`env-overlay fixed inset-0 z-[9999] flex items-center justify-center ${
            opening ? "is-opening" : ""
          }`}
        >
          <style>{`
            .env-overlay {
              background: #e7e3dc;
              opacity: 1;
              will-change: opacity;
              height: 100vh;
              height: -webkit-fill-available;
              height: 100dvh;
            }
            @supports (-webkit-touch-callout: none) {
              .env-overlay { height: -webkit-fill-available; }
            }
            .env-overlay.is-opening {
              animation: envOverlayOut ${TOTAL}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            @keyframes envOverlayOut {
              0%   { opacity: 1; }
              60%  { opacity: 1; }
              100% { opacity: 0; pointer-events: none; }
            }

            @keyframes envHint { 0%{opacity:1} 12%,100%{opacity:0} }
            .is-opening .env-hint { animation: envHint ${TOTAL}ms ease-out forwards; }

            .env-seal-static { opacity: 1; }
            @keyframes envStaticSealOut {
              0%   { opacity: 1; }
              100% { opacity: 0; }
            }
            .is-opening .env-seal-static {
              animation: envStaticSealOut 180ms ease-out forwards;
            }

            /* Envelope drop: starts while the flap is still finishing its arc,
               so the two motions overlap into one continuous reveal instead of
               a stop-then-start. Long ease-out tail makes the fall feel weighted. */
            @keyframes envBody {
              0%   { transform: translateY(0)     scale(1);    opacity: 1; }
              45%  { transform: translateY(0)     scale(1);    opacity: 1; }
              70%  { transform: translateY(20%)   scale(0.98); opacity: 0.92; }
              100% { transform: translateY(110%)  scale(0.88); opacity: 0; }
            }
            .is-opening .env-target {
              animation: envBody ${TOTAL}ms cubic-bezier(0.32, 0.04, 0.18, 1) forwards;
            }

            /* Full unfold: flap rotates around its top edge from a slight rest
               tilt all the way back to -180°. */
            @keyframes envFlapLift {
              0%   { transform: rotateX(${FLAP_REST_TILT}deg); opacity: 1; }
              60%  { transform: rotateX(-182deg);              opacity: 1; }
              100% { transform: rotateX(-182deg);              opacity: 1; }
            }
            .env-flap-wrap {
              transform: rotateX(${FLAP_REST_TILT}deg);
            }
            .is-opening .env-flap-wrap {
              animation: envFlapLift ${TOTAL}ms cubic-bezier(0.16, 0.84, 0.24, 1) forwards;
            }
            @media (max-width: 767px), (pointer: coarse) {
              .is-opening .env-flap-wrap {
                animation-timing-function: cubic-bezier(0.22, 0.8, 0.28, 1);
              }
            }

            /* The invitation page sits behind the flap; it fades in as the flap
               rotates open, then the whole overlay fades away to reveal the
               actual invitation content. */
            .env-reveal { opacity: 0; }
            @keyframes envRevealIn {
              0%   { opacity: 0; }
              18%  { opacity: 0; }
              38%  { opacity: 1; }
              100% { opacity: 1; }
            }
            .is-opening .env-reveal {
              animation: envRevealIn ${TOTAL}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            .env-names { opacity: 1; }

            /* GPU promotion + crisp compositing for the animated layers. */
            .env-target {
              -webkit-backface-visibility: hidden;
              -webkit-transform-style: preserve-3d;
              -webkit-font-smoothing: antialiased;
            }
            .env-seal {
              -webkit-backface-visibility: visible;
              backface-visibility: visible;
              -webkit-transform-style: preserve-3d;
            }
            .env-flap-wrap {
              -webkit-backface-visibility: visible;
              backface-visibility: visible;
              -webkit-transform-style: preserve-3d;
            }
            .env-flap-wrap svg {
              -webkit-backface-visibility: visible;
              backface-visibility: visible;
            }

            @media (max-width: 767px), (pointer: coarse) {
              .env-seal {
                filter: none !important;
                transform: translate(-50%, -50%) translateZ(0) rotate(-3deg) !important;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .env-overlay { animation: none !important; opacity: 0 !important; pointer-events: none !important; }
              .env-target, .env-flap-wrap, .env-seal, .env-hint, .env-reveal, .env-names {
                animation: none !important;
              }
            }
          `}</style>

          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "2400px",
              width: "min(92vw, 460px)",
              height: "min(86vh, 640px)",
              aspectRatio: "5 / 7",
              maxWidth: "100%",
            }}
            onClick={handleOpen}
            onKeyDown={handleKey}
            role="button"
            tabIndex={0}
            aria-label="Tap to open invitation"
          >
            <div
              className="env-target"
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                transformStyle: "preserve-3d",
                transition: "transform 500ms cubic-bezier(.22,1,.36,1)",
                willChange: "transform, opacity",
                overflow: "visible",
              }}
            >
              {/* === ENVELOPE BODY === */}
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <filter id="paperTooth" x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="2" seed="6" stitchTiles="stitch" result="n" />
                    <feColorMatrix in="n" type="saturate" values="0" result="g" />
                    <feConvolveMatrix in="g" order="3" kernelMatrix="-2 -1 0 -1 0 1 0 1 2" divisor="1" bias="0.5" preserveAlpha="true" result="e" />
                    <feColorMatrix in="e" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" />
                  </filter>
                  <filter id="paperMottle" x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="2" stitchTiles="stitch" result="n" />
                    <feColorMatrix in="n" type="saturate" values="0" result="g" />
                    <feColorMatrix in="g" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" />
                  </filter>
                  <filter id="foldBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.7" />
                  </filter>

                  <linearGradient id="panelBottom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e6e0d3" />
                    <stop offset="70%" stopColor="#eae4d8" />
                    <stop offset="100%" stopColor="#e4ded1" />
                  </linearGradient>
                  <linearGradient id="panelLeft" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f1ece2" />
                    <stop offset="75%" stopColor="#e9e3d6" />
                    <stop offset="100%" stopColor="#e3ddd0" />
                  </linearGradient>
                  <linearGradient id="panelRight" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ece7dc" />
                    <stop offset="75%" stopColor="#e5dfd2" />
                    <stop offset="100%" stopColor="#dfd9cc" />
                  </linearGradient>
                  <linearGradient id="panelTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f8f4ec" />
                    <stop offset="72%" stopColor="#efeae0" />
                    <stop offset="100%" stopColor="#e8e2d6" />
                  </linearGradient>

                  <radialGradient id="envVignette" cx="50%" cy="40%" r="75%">
                    <stop offset="55%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(60,52,34,0.13)" />
                  </radialGradient>
                  <radialGradient id="envHighlight" cx="27%" cy="16%" r="65%">
                    <stop offset="0%" stopColor="rgba(255,253,245,0.75)" />
                    <stop offset="60%" stopColor="rgba(255,253,245,0)" />
                  </radialGradient>

                  <clipPath id="bodyRound">
                    <rect x="0" y="0" width={VB_W} height={VB_H} rx="14" ry="14" />
                  </clipPath>
                  <clipPath id="panelBottomClip">
                    <polygon points={`0,${VB_H} ${VB_W},${VB_H} ${V_X},${V_Y}`} />
                  </clipPath>
                  <clipPath id="panelLeftClip">
                    <polygon points={`0,0 0,${VB_H} ${V_X},${V_Y}`} />
                  </clipPath>
                  <clipPath id="panelRightClip">
                    <polygon points={`${VB_W},0 ${VB_W},${VB_H} ${V_X},${V_Y}`} />
                  </clipPath>
                  <clipPath id="panelTopClip">
                    <polygon points={`0,0 ${VB_W},0 ${V_X},${V_Y}`} />
                  </clipPath>
                </defs>

                <g clipPath="url(#bodyRound)">
                  <rect width={VB_W} height={VB_H} fill="#ece7dd" />
                  <rect width={VB_W} height={VB_H} clipPath="url(#panelBottomClip)" fill="url(#panelBottom)" />
                  <rect width={VB_W} height={VB_H} clipPath="url(#panelLeftClip)" fill="url(#panelLeft)" />
                  <rect width={VB_W} height={VB_H} clipPath="url(#panelRightClip)" fill="url(#panelRight)" />

                  <rect width={VB_W} height={VB_H} fill="url(#envVignette)" style={{ mixBlendMode: "multiply" }} />
                  <rect width={VB_W} height={VB_H} fill="#808080" filter="url(#paperMottle)" opacity="0.26" style={{ mixBlendMode: "overlay" }} />
                  <rect width={VB_W} height={VB_H} fill="#808080" filter="url(#paperTooth)" opacity="0.4" style={{ mixBlendMode: "overlay" }} />
                  <rect width={VB_W} height={VB_H} fill="url(#envHighlight)" style={{ mixBlendMode: "soft-light" }} />

                  <g filter="url(#foldBlur)" stroke="rgba(60,52,34,0.2)" strokeWidth="2.2" transform="translate(1.5,1.7)">
                    <path d={`M0 0 L${V_X} ${V_Y} M${VB_W} 0 L${V_X} ${V_Y} M0 ${VB_H} L${V_X} ${V_Y} M${VB_W} ${VB_H} L${V_X} ${V_Y}`} />
                  </g>
                  <g stroke="rgba(255,255,250,0.65)" strokeWidth="1" transform="translate(-0.9,-1)">
                    <path d={`M0 0 L${V_X} ${V_Y} M${VB_W} 0 L${V_X} ${V_Y} M0 ${VB_H} L${V_X} ${V_Y} M${VB_W} ${VB_H} L${V_X} ${V_Y}`} />
                  </g>

                  <rect
                    x="0.5"
                    y="0.5"
                    width={VB_W - 1}
                    height={VB_H - 1}
                    rx="14"
                    ry="14"
                    fill="none"
                    stroke="rgba(60,52,34,0.1)"
                    strokeWidth="1"
                  />
                </g>
              </svg>

              {/* === BRIDE & GROOM NAMES === */}
              {hasNames && (
                <div
                  className="env-names absolute pointer-events-none select-none text-center flex flex-col items-center justify-center"
                  style={{
                    left: "8%",
                    right: "8%",
                    top: `${((V_Y + 70) / VB_H) * 100}%`,
                    bottom: "8%",
                    color: "#2c2820",
                    zIndex: 2,
                    fontFamily: "'Bodoni Moda', 'Jost', Georgia, serif",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 500,
                      fontSize: "clamp(10px, 2.2vw, 12px)",
                      letterSpacing: "0.5em",
                      textTransform: "uppercase",
                      color: "#9c9788",
                      paddingLeft: "0.5em",
                      marginBottom: "1.2rem",
                    }}
                  >
                    The wedding of
                  </div>

                  <div
                    style={{
                      fontSize: "clamp(28px, 6.5vw, 42px)",
                      lineHeight: 1.04,
                      fontWeight: 400,
                      color: "#221f18",
                    }}
                  >
                    {bride || "\u00A0"}
                  </div>

                  <div
                    aria-hidden="true"
                    style={{
                      fontFamily: "'Bodoni Moda', serif",
                      fontStyle: "italic",
                      fontWeight: 400,
                      fontSize: "clamp(20px, 4.2vw, 26px)",
                      lineHeight: 1.1,
                      margin: "0.2em 0",
                      color: "#a59a7e",
                    }}
                  >
                    and
                  </div>

                  <div
                    style={{
                      fontSize: "clamp(28px, 6.5vw, 42px)",
                      lineHeight: 1.04,
                      fontWeight: 400,
                      color: "#221f18",
                    }}
                  >
                    {groom || "\u00A0"}
                  </div>

                  {formattedDate && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "14px",
                        marginTop: "1.6rem",
                      }}
                    >
                      <div style={{ width: "28px", height: "1px", background: "rgba(44,40,32,0.3)" }} />
                      <div
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontWeight: 500,
                          fontSize: "clamp(11px, 2.4vw, 13px)",
                          letterSpacing: "0.34em",
                          color: "#5d5849",
                          paddingLeft: "0.34em",
                        }}
                      >
                        {formattedDate}
                      </div>
                      <div style={{ width: "28px", height: "1px", background: "rgba(44,40,32,0.3)" }} />
                    </div>
                  )}
                </div>
              )}

              {/* === REVEAL PANEL (page 0 of the invitation) === */}
              <div
                className="env-reveal absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                  zIndex: 3,
                  willChange: "opacity",
                  clipPath: `polygon(0% 0%, 100% 0%, 50% ${(V_Y / VB_H) * 100}%)`,
                  WebkitClipPath: `polygon(0% 0%, 100% 0%, 50% ${(V_Y / VB_H) * 100}%)`,
                  background: "#f8f4ec",
                }}
              />

              {/* === TRIANGULAR FLAP === */}
              <div
                className="env-flap-wrap absolute inset-0"
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  zIndex: 5,
                  willChange: "transform, opacity",
                  backfaceVisibility: "visible",
                  WebkitBackfaceVisibility: "visible",
                  pointerEvents: "none",
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
                      <path d={`M0 ${FLAP_CORNER_R} Q0 0 ${FLAP_CORNER_R} 0 L ${VB_W - FLAP_CORNER_R} 0 Q ${VB_W} 0 ${VB_W} ${FLAP_CORNER_R} L ${V_X} ${V_Y} Z`} />
                    </clipPath>
                  </defs>

                  <g clipPath="url(#env-flap-clip)">
                    <rect width={VB_W} height={VB_H} fill="#ece7dd" />
                    <rect width={VB_W} height={VB_H} clipPath="url(#panelTopClip)" fill="url(#panelTop)" />
                    <rect width={VB_W} height={VB_H} fill="#808080" filter="url(#paperMottle)" opacity="0.26" style={{ mixBlendMode: "overlay" }} />
                    <rect width={VB_W} height={VB_H} fill="#808080" filter="url(#paperTooth)" opacity="0.4" style={{ mixBlendMode: "overlay" }} />
                  </g>

                  <path
                    d={`M${FLAP_CORNER_R} 0 L ${V_X} ${V_Y} L ${VB_W - FLAP_CORNER_R} 0`}
                    fill="none"
                    stroke="rgba(255,255,250,0.65)"
                    strokeWidth="1"
                    transform="translate(0 -0.5)"
                  />
                </svg>

                {/* === WAX SEAL === */}
                <div
                  className="env-seal absolute pointer-events-none select-none"
                  draggable={false}
                  style={{
                    left: "50%",
                    top: `${(V_Y / VB_H) * 100}%`,
                    transform: "translate(-50%, -50%) translateZ(60px) rotate(-4deg)",
                    width: "22%",
                    minWidth: "84px",
                    maxWidth: "120px",
                    aspectRatio: "1 / 1",
                    zIndex: 2,
                    willChange: "transform",
                    filter: isMobile
                      ? "drop-shadow(0 4px 6px rgba(80,15,15,.35))"
                      : "drop-shadow(0 10px 14px rgba(80,15,15,.45))",
                  }}
                >
                  <img
                    src={waxSealHeart}
                    alt=""
                    draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </div>
              </div>

              {/* Static first-paint seal fallback. */}
              <div
                className="env-seal-static absolute pointer-events-none select-none"
                draggable={false}
                style={{
                  left: "50%",
                  top: `${(V_Y / VB_H) * 100}%`,
                  transform: "translate(-50%, -50%) rotate(-4deg)",
                  width: "22%",
                  minWidth: "84px",
                  maxWidth: "120px",
                  aspectRatio: "1 / 1",
                  zIndex: 7,
                  filter: isMobile
                    ? "drop-shadow(0 4px 6px rgba(80,15,15,.35))"
                    : "drop-shadow(0 10px 14px rgba(80,15,15,.45))",
                }}
              >
                <img
                  src={waxSealHeart}
                  alt=""
                  draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                />
              </div>

            </div>

            {/* Tap hint */}
            <div
              className="env-hint absolute left-0 right-0 text-center pointer-events-none"
              style={{ bottom: "clamp(2rem, 6vh, 4rem)" }}
            >
              <p
                className="animate-pulse"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(10px, 2.6vw, 12px)",
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(44,40,32,0.42)",
                  paddingLeft: "0.42em",
                }}
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
