import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import paperTexture from "@/assets/envelope-paper-texture.jpeg";
import waxSealHeart from "@/assets/wax-seal-heart.png";

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
 * Full-screen photoreal envelope opener.
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

  // Brand highlight color used for the ampersand and seal accents.
  const accent = "#865814";
  // Kept for any future SVG accents but the names always use the brand gold.
  void accentColor;
  void primaryColor;

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

  const TOTAL = 1800;

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

  // Load elegant calligraphy font once.
  useEffect(() => {
    const id = "env-google-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Cormorant+Upright:wght@300;400&display=swap";
    document.head.appendChild(link);
  }, []);

  const motes = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 30 + Math.random() * 65,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 5,
      })),
    []
  );

  // Subtle paper fibers scattered across the envelope face (deterministic).
  const fibers = useMemo(() => {
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const r = rng(7);
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: r() * 600,
      y: r() * 840,
      len: 4 + r() * 10,
      rot: r() * 360,
      o: 0.05 + r() * 0.08,
    }));
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
          style={{ height: "100dvh", minHeight: "100vh" }}
        >
          {/* Ambient glow */}
          <div
            className="env-glow absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${accent}33 0%, transparent 60%)`,
            }}
          />
          {/* Floating dust motes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {motes.map((m) => (
              <span
                key={m.id}
                className="absolute rounded-full"
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
              will-change: opacity;
            }
            .env-overlay.is-opening {
              animation: envOverlayOut ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes envOverlayOut {
              0%, 55% { opacity: 1; }
              100% { opacity: 0; pointer-events: none; }
            }
            @keyframes envMote {
              0%, 100% { transform: translateY(0) translateX(0); opacity: .30; }
              50%      { transform: translateY(-22px) translateX(6px); opacity: .85; }
            }
            @keyframes envGlowPulse {
              0%, 100% { opacity: .85; transform: scale(1); }
              50%      { opacity: 1;   transform: scale(1.04); }
            }
            .env-glow { animation: envGlowPulse 4s ease-in-out infinite; }

            @keyframes envIdle {
              0%, 100% { transform: translateY(0) rotate(0); }
              50%      { transform: translateY(-6px) rotate(.15deg); }
            }
            .env-idle { animation: envIdle 4.5s ease-in-out infinite; }

            .env-zone:hover .env-target {
              transform: scale(1.025);
              filter: drop-shadow(0 42px 60px rgba(0,0,0,.6));
            }

            @keyframes envBody {
              0%   { transform: scale(1)    translateY(0);    opacity: 1; }
              15%  { transform: scale(.985) translateY(0);    opacity: 1; }
              55%  { transform: scale(1)    translateY(20px); opacity: 1; }
              85%  { transform: scale(.97)  translateY(60px); opacity: .35; }
              100% { transform: scale(.94)  translateY(110px);opacity: 0; }
            }
            .is-opening .env-target {
              animation: envBody ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envSealPop {
              0%   { transform: translate(-50%,-50%) scale(1)    rotate(-3deg); opacity: 1; }
              12%  { transform: translate(-50%,-50%) scale(1.10) rotate(-3deg); opacity: 1; }
              26%  { transform: translate(-50%,-50%) scale(1.18) rotate(-4deg); opacity: 1; }
              42%  { transform: translate(-50%,-58%) scale(.92)  rotate(-1deg); opacity: 0; }
              100% { transform: translate(-50%,-58%) scale(.92)  rotate(-1deg); opacity: 0; }
            }
            .is-opening .env-seal {
              animation: envSealPop ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envFlapLift {
              0%, 22% { transform: rotateX(0); }
              60%     { transform: rotateX(-160deg); }
              85%     { transform: rotateX(-170deg); opacity: .55; }
              100%    { transform: rotateX(-175deg); opacity: 0; }
            }
            .is-opening .env-flap-wrap {
              animation: envFlapLift ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envHint { 0%{opacity:1} 12%,100%{opacity:0} }
            .is-opening .env-hint { animation: envHint ${TOTAL}ms ease-out forwards; }

            @media (prefers-reduced-motion: reduce) {
              .env-overlay { animation: none !important; opacity: 0 !important; pointer-events: none !important; }
              .env-idle, .env-glow, .env-target, .env-flap-wrap, .env-seal, .env-hint {
                animation: none !important;
              }
            }
          `}</style>

          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "2200px",
              // Portrait envelope: tall and narrow, fills most of screen height.
              height: "min(92dvh, 96vw * (840/600))",
              width: "min(92vw, 92dvh * (600/840), 600px)",
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
              {/* === ENVELOPE BODY === */}
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
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
                  <radialGradient id="env-vignette" cx="50%" cy="55%" r="65%">
                    <stop offset="60%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(70,55,35,0.22)" />
                  </radialGradient>
                  {/* Soft shadow cast by the closed flap onto the body face */}
                  <linearGradient id="env-fold-shadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.32)" />
                    <stop offset="60%" stopColor="rgba(0,0,0,0.06)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>
                  {/* Highlight along the bottom-fold ridge */}
                  <linearGradient id="env-bottom-highlight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,250,235,0)" />
                    <stop offset="100%" stopColor="rgba(255,250,235,0.22)" />
                  </linearGradient>
                  <clipPath id="env-body-clip">
                    <rect x="0" y="0" width={VB_W} height={VB_H} rx="14" ry="14" />
                  </clipPath>
                </defs>

                <g clipPath="url(#env-body-clip)">
                  <rect width={VB_W} height={VB_H} fill="url(#env-paper)" />
                  {/* Fine paper fibers */}
                  <g opacity="0.9">
                    {fibers.map((f) => (
                      <line
                        key={f.id}
                        x1={f.x}
                        y1={f.y}
                        x2={f.x + f.len}
                        y2={f.y}
                        stroke={`rgba(60,42,18,${f.o})`}
                        strokeWidth="0.6"
                        strokeLinecap="round"
                        transform={`rotate(${f.rot} ${f.x} ${f.y})`}
                      />
                    ))}
                  </g>
                  {/* Shadow cast by the closed flap (under the V-fold) */}
                  <path
                    d={`M0 ${V_Y - 6} L ${V_X} ${V_Y + 18} L ${VB_W} ${V_Y - 6} L ${VB_W} ${V_Y + 70} L 0 ${V_Y + 70} Z`}
                    fill="url(#env-fold-shadow)"
                    opacity="0.85"
                  />
                  {/* Bottom inner panel highlight */}
                  <rect
                    x="0"
                    y={VB_H - 90}
                    width={VB_W}
                    height="90"
                    fill="url(#env-bottom-highlight)"
                  />
                  <rect width={VB_W} height={VB_H} fill="url(#env-vignette)" />
                </g>

                {/* Faint embossed bottom-fold line */}
                <line
                  x1="24"
                  y1={VB_H - 88}
                  x2={VB_W - 24}
                  y2={VB_H - 88}
                  stroke="rgba(255,250,235,0.18)"
                  strokeWidth="1"
                />
                <line
                  x1="24"
                  y1={VB_H - 87}
                  x2={VB_W - 24}
                  y2={VB_H - 87}
                  stroke="rgba(40,28,10,0.10)"
                  strokeWidth="1"
                />

                <rect
                  x="0.5"
                  y="0.5"
                  width={VB_W - 1}
                  height={VB_H - 1}
                  rx="14"
                  ry="14"
                  fill="none"
                  stroke="rgba(40,28,10,0.22)"
                  strokeWidth="1"
                />
              </svg>

              {/* === BRIDE & GROOM NAMES === */}
              {hasNames && (
                <div
                  className="env-names absolute pointer-events-none select-none text-center"
                  style={{
                    left: "10%",
                    right: "10%",
                    // Sits centered between the V-fold (seal) and the bottom edge.
                    top: `${(((V_Y + 60) + (VB_H - 90)) / 2 / VB_H) * 100}%`,
                    transform: "translateY(-50%)",
                    color: "#3a2a14",
                    zIndex: 2,
                    fontFamily:
                      "'Cormorant Garamond', 'Cormorant Upright', Georgia, serif",
                  }}
                >
                  {/* Top hairline rule with a small flourish dot */}
                  <div
                    className="mx-auto mb-3 flex items-center justify-center gap-2"
                    style={{ opacity: 0.6 }}
                  >
                    <span
                      style={{
                        display: "block",
                        width: "28%",
                        height: "1px",
                        background:
                          "linear-gradient(to right, transparent, rgba(58,42,20,0.55), transparent)",
                      }}
                    />
                    <span
                      style={{
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: accent,
                        boxShadow: `0 0 0 1px rgba(58,42,20,0.25)`,
                      }}
                    />
                    <span
                      style={{
                        display: "block",
                        width: "28%",
                        height: "1px",
                        background:
                          "linear-gradient(to right, transparent, rgba(58,42,20,0.55), transparent)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: "clamp(20px, 4.6vw, 38px)",
                      lineHeight: 1.05,
                      fontStyle: "italic",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      textShadow:
                        "0 1px 0 rgba(255,250,235,0.55), 0 0 1px rgba(58,42,20,0.25)",
                    }}
                  >
                    {bride || "\u00A0"}
                  </div>

                  <div
                    aria-hidden="true"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontStyle: "italic",
                      fontSize: "clamp(22px, 5.4vw, 44px)",
                      lineHeight: 1,
                      margin: "0.18em 0",
                      color: accent,
                      opacity: 0.95,
                    }}
                  >
                    &amp;
                  </div>

                  <div
                    style={{
                      fontSize: "clamp(20px, 4.6vw, 38px)",
                      lineHeight: 1.05,
                      fontStyle: "italic",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      textShadow:
                        "0 1px 0 rgba(255,250,235,0.55), 0 0 1px rgba(58,42,20,0.25)",
                    }}
                  >
                    {groom || "\u00A0"}
                  </div>

                  <div
                    className="mx-auto mt-4"
                    aria-hidden="true"
                    style={{
                      width: "38%",
                      height: "1px",
                      background:
                        "linear-gradient(to right, transparent, rgba(58,42,20,0.4), transparent)",
                      opacity: 0.7,
                    }}
                  />
                  <div
                    className="mt-2"
                    style={{
                      fontFamily:
                        "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                      fontSize: "clamp(8px, 1.4vw, 11px)",
                      letterSpacing: "0.42em",
                      textTransform: "uppercase",
                      color: "rgba(58,42,20,0.55)",
                    }}
                  >
                    The Wedding Of
                  </div>
                </div>
              )}

              {/* === TRIANGULAR FLAP === */}
              <div
                className="env-flap-wrap absolute inset-0"
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  zIndex: 3,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.18))",
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
                    <image
                      href={paperTexture}
                      x={-VB_W * 0.1}
                      y={-VB_H * 0.1}
                      width={VB_W * 1.2}
                      height={VB_H * 1.2}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <rect width={VB_W} height={VB_H} fill="url(#env-flap-shade)" />
                  </g>

                  <path
                    d={`M0 0 L ${V_X} ${V_Y} L ${VB_W} 0`}
                    fill="none"
                    stroke="rgba(255,250,235,0.30)"
                    strokeWidth="0.5"
                    transform="translate(0 -0.5)"
                  />
                </svg>
              </div>

              {/* === WAX SEAL (heart PNG) === */}
              <img
                src={waxSealHeart}
                alt=""
                aria-hidden="true"
                className="env-seal absolute pointer-events-none select-none"
                draggable={false}
                style={{
                  left: "50%",
                  top: `${(V_Y / VB_H) * 100}%`,
                  transform: "translate(-50%, -50%) rotate(-3deg)",
                  width: "30%",
                  height: "auto",
                  zIndex: 4,
                  willChange: "transform, opacity",
                  filter:
                    "drop-shadow(0 8px 10px rgba(0,0,0,0.55)) drop-shadow(0 2px 3px rgba(0,0,0,0.45))",
                }}
              />
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
