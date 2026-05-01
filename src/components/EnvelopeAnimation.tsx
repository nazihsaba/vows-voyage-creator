import { useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import paperTexture from "@/assets/envelope-paper-texture.jpeg";
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

  // Detect low-power mobile devices once on mount so we can scale down decorative
  // layers (fibers, motes, drop-shadow filters) that murder the compositor on
  // phones. Also respects prefers-reduced-motion.
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

  // Format wedding date as e.g. "Twenty-Third of June, 2026" → keep simple: "23 · June · 2026".
  const formattedDate = useMemo(() => {
    if (!weddingDate) return "";
    const d = new Date(weddingDate);
    if (isNaN(d.getTime())) return "";
    const day = d.getUTCDate();
    const month = d.toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const year = d.getUTCFullYear();
    return `${day} · ${month} · ${year}`;
  }, [weddingDate]);

  const TOTAL = 5200;
  const FLAP_REST_TILT = -10; // degrees: flap sits slightly lifted by default
  const FLAP_CORNER_R = 14; // matches body rounded corners

  // (Reveal image logic removed — replaced with a static welcome message.)

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

  // Decorative dust motes — drastically reduced on mobile (and removed when the
  // user prefers reduced motion) because each one is its own animated layer.
  const moteCount = reduceMotion ? 0 : isMobile ? 5 : 14;
  const motes = useMemo(
    () =>
      Array.from({ length: moteCount }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 30 + Math.random() * 65,
        size: 1.5 + Math.random() * 3,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 5,
      })),
    [moteCount]
  );

  // Subtle paper fibers scattered across the envelope face (deterministic).
  // 80 strokes is fine on desktop but doubles SVG paint cost on phones; keep
  // a much smaller deterministic set there.
  const fiberCount = isMobile ? 24 : 80;
  const fibers = useMemo(() => {
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    };
    const r = rng(7);
    return Array.from({ length: fiberCount }).map((_, i) => ({
      id: i,
      x: r() * 600,
      y: r() * 840,
      len: 4 + r() * 10,
      rot: r() * 360,
      o: 0.05 + r() * 0.08,
    }));
  }, [fiberCount]);

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
                className="env-mote absolute rounded-full"
                style={{
                  left: `${m.left}%`,
                  top: `${m.top}%`,
                  width: `${m.size}px`,
                  height: `${m.size}px`,
                  background: `radial-gradient(circle, ${accent}aa 0%, transparent 70%)`,
                  animation: `envMote ${m.duration}s ease-in-out ${m.delay}s infinite`,
                  filter: isMobile ? "none" : "blur(0.4px)",
                  willChange: "transform, opacity",
                }}
              />
            ))}
          </div>

          <style>{`
            .env-overlay {
              background: radial-gradient(ellipse at center, hsl(20 14% 10%) 0%, hsl(20 14% 4%) 100%);
              opacity: 1;
              will-change: opacity;
              /* Cascading height: each line overrides the previous if supported.
                 Old Safari ignores dvh and falls back to -webkit-fill-available,
                 which respects the visible viewport (excludes the URL bar) so
                 the envelope's bottom and "Tap to open" hint stay on screen. */
              height: 100vh;
              height: -webkit-fill-available;
              height: 100dvh;
            }
            @supports (-webkit-touch-callout: none) {
              /* iOS Safari specifically: prefer fill-available to avoid URL bar crop. */
              .env-overlay { height: -webkit-fill-available; }
            }
            .env-overlay.is-opening {
              animation: envOverlayOut ${TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes envOverlayOut {
              0%   { opacity: 1; }
              80%  { opacity: 1; }
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
            /* Modern browsers: prefer dvh which excludes the dynamic browser UI. */
            @supports (height: 100dvh) {
              .env-zone {
                height: min(82dvh, 92vw * (840/600)) !important;
                width: min(92vw, 82dvh * (600/840), 600px) !important;
              }
            }

            @keyframes envBody {
              0%   { transform: scale(1)    translateY(0);     opacity: 1; }
              55%  { transform: scale(1)    translateY(0);     opacity: 1; }
              70%  { transform: scale(.995) translateY(20px);  opacity: 1; }
              85%  { transform: scale(.98)  translateY(60px);  opacity: .7; }
              100% { transform: scale(.94)  translateY(140px); opacity: 0; }
            }
            .is-opening .env-target {
              animation: envBody ${TOTAL}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes envSealPop {
              0%   { transform: translate(-50%,-50%) translateZ(20px) scale(1)    rotate(-3deg); opacity: 1; }
              10%  { transform: translate(-50%,-50%) translateZ(20px) scale(1.12) rotate(-4deg); opacity: 1; }
              22%  { transform: translate(-50%,-54%) translateZ(20px) scale(1.05) rotate(-2deg); opacity: .55; }
              35%  { transform: translate(-50%,-58%) translateZ(20px) scale(.92)  rotate(-1deg); opacity: 0; }
              100% { transform: translate(-50%,-58%) translateZ(20px) scale(.92)  rotate(-1deg); opacity: 0; }
            }
            .is-opening .env-seal {
              animation: envSealPop ${TOTAL}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            /* Full unfold: flap rotates around its top edge from a slight rest
               tilt all the way back to -180°. Two-keyframe form lets the easing
               curve drive the entire arc continuously instead of stepping
               between 6 angular waypoints — which on mobile manifests as
               visible "cuts" near the top of the envelope. */
            @keyframes envFlapLift {
              0%   { transform: rotateX(${FLAP_REST_TILT}deg); opacity: 1; }
              90%  { transform: rotateX(-182deg);              opacity: 1; }
              100% { transform: rotateX(-182deg);              opacity: 1; }
            }
            .env-flap-wrap {
              transform: rotateX(${FLAP_REST_TILT}deg);
            }
            .is-opening .env-flap-wrap {
              animation: envFlapLift ${TOTAL}ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
            }
            /* On mobile, prefer a slightly snappier easing so the flap arc
               feels continuous and finishes before the body slides away. */
            @media (max-width: 767px), (pointer: coarse) {
              .is-opening .env-flap-wrap {
                animation-timing-function: cubic-bezier(0.33, 0, 0.2, 1);
              }
            }

            /* Framed photo behind the flap. Hidden by default, fades in only
               while the envelope is opening so it never peeks before reveal. */
            /* "Welcome / You're Invited" sits on the closed envelope and is
               visible before the user taps. It stays through the open. */
            .env-reveal { opacity: 1; }

            /* Bride & groom names are tucked inside the envelope. They stay
               hidden until the user taps, then fade in immediately. */
            /* Bride & groom names + date are part of the envelope face and
               stay visible at all times (before and during opening). */
            .env-names { opacity: 1; }

            @keyframes envHint { 0%{opacity:1} 12%,100%{opacity:0} }
            .is-opening .env-hint { animation: envHint ${TOTAL}ms ease-out forwards; }

            /* GPU promotion + crisp compositing for the animated layers.
               IMPORTANT: do NOT set backface-visibility: hidden on .env-flap-wrap.
               The flap rotates past 90° during the open animation; hiding the
               back face makes the entire flap vanish on mobile WebKit, which
               looks like the top of the envelope is "cut off" mid-animation. */
            .env-target, .env-seal {
              -webkit-backface-visibility: hidden;
              -webkit-transform-style: preserve-3d;
              -webkit-font-smoothing: antialiased;
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

            /* Mobile-tuned tweaks: smaller blur radius, no expensive drop-shadow
               filter on the seal (it forces a full raster every frame on mobile
               GPUs), and slimmer animations on the dust motes. */
            @media (max-width: 767px), (pointer: coarse) {
              .env-glow { animation-duration: 6s; }
              .env-idle { animation: none; }
              .env-seal {
                filter: none !important;
                /* Replace drop-shadow filter with a cheap radial gradient backdrop
                   applied via the surrounding wrapper instead. */
              }
              /* Disable per-mote blur which costs an extra raster pass. */
              .env-mote { filter: none !important; }
            }

            @media (prefers-reduced-motion: reduce) {
              .env-overlay { animation: none !important; opacity: 0 !important; pointer-events: none !important; }
              .env-idle, .env-glow, .env-target, .env-flap-wrap, .env-seal, .env-hint, .env-reveal, .env-names {
                animation: none !important;
              }
            }
          `}</style>

          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "2200px",
              // Portrait envelope: tall and narrow, fills most of screen height.
              // Use vh as an old-Safari-safe base, with dvh override below for
              // modern browsers via @supports. Parent overlay uses
              // -webkit-fill-available so the envelope is sized against the
              // visible viewport (URL bar excluded) on iOS Safari.
              height: "min(82vh, 92vw * (840/600))",
              width: "min(92vw, 82vh * (600/840), 600px)",
              maxWidth: "min(92vw, 600px)",
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
                // No drop-shadow filter here — filters create a 2D rasterization
                // boundary that flattens the 3D scene and clips the flap when it
                // rotates past 90°. Shadow is delegated to the body SVG instead.
                transformStyle: "preserve-3d",
                transition:
                  "transform 500ms cubic-bezier(.22,1,.36,1)",
                willChange: "transform, opacity",
                // Allow the flap to extend beyond the envelope bounds when folded back.
                overflow: "visible",
              }}
            >
              {/* Cast shadow under the whole envelope (separate layer so it doesn't
                  flatten the 3D scene like a filter on the parent would). */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: 14,
                  boxShadow: isMobile
                    ? "0 18px 28px rgba(0,0,0,.45)"
                    : "0 38px 58px rgba(0,0,0,.55), 0 12px 18px rgba(0,0,0,.35)",
                  transform: "translateZ(-1px)",
                  zIndex: 0,
                }}
              />
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
                    <stop offset="0%" stopColor="rgba(0,0,0,0.42)" />
                    <stop offset="55%" stopColor="rgba(0,0,0,0.10)" />
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
                  {/* Soft shadow cast by the triangular flap onto the body face,
                      hugging the V-edge so the flap reads as a separate piece of paper. */}
                  <path
                    d={`M0 0 L ${V_X} ${V_Y} L ${VB_W} 0 L ${VB_W} ${V_Y + 50} L ${V_X} ${V_Y + 70} L 0 ${V_Y + 50} Z`}
                    fill="url(#env-fold-shadow)"
                    opacity="0.85"
                  />
                  {/* Crisp hairline along the flap's V-edge for a clean separation */}
                  <path
                    d={`M0 0 L ${V_X} ${V_Y} L ${VB_W} 0`}
                    fill="none"
                    stroke="rgba(40,28,10,0.18)"
                    strokeWidth="0.8"
                  />
                  <rect width={VB_W} height={VB_H} fill="url(#env-vignette)" />
                </g>

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
                  className="env-names absolute pointer-events-none select-none text-center flex flex-col items-center justify-center"
                  style={{
                    left: "8%",
                    right: "8%",
                    // Anchored to the lower half of the envelope using top/bottom
                    // bounds so the block always fits — even on short mobile
                    // viewports — without overlapping the seal at the V-fold.
                    top: `${((V_Y + 60) / VB_H) * 100}%`,
                    bottom: "8%",
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
                      fontSize: "clamp(18px, 4.4vw, 38px)",
                      lineHeight: 1.05,
                      fontStyle: "italic",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      textShadow: isMobile
                        ? "none"
                        : "0 1px 0 rgba(255,250,235,0.55), 0 0 1px rgba(58,42,20,0.25)",
                    }}
                  >
                    {bride || "\u00A0"}
                  </div>

                  <div
                    aria-hidden="true"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontStyle: "italic",
                      fontWeight: 400,
                      fontSize: "clamp(26px, 6.6vw, 56px)",
                      lineHeight: 1,
                      margin: "0.05em 0",
                      color: "#865814",
                      textShadow: isMobile
                        ? "none"
                        : "0 1px 0 rgba(255,250,235,0.45), 0 0 1px rgba(134,88,20,0.3)",
                    }}
                  >
                    &amp;
                  </div>

                  <div
                    style={{
                      fontSize: "clamp(18px, 4.4vw, 38px)",
                      lineHeight: 1.05,
                      fontStyle: "italic",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      textShadow: isMobile
                        ? "none"
                        : "0 1px 0 rgba(255,250,235,0.55), 0 0 1px rgba(58,42,20,0.25)",
                    }}
                  >
                    {groom || "\u00A0"}
                  </div>

                  {formattedDate && (
                    <>
                      <div
                        className="mx-auto mt-5"
                        aria-hidden="true"
                        style={{
                          width: "44%",
                          height: "1px",
                          background:
                            "linear-gradient(to right, transparent, rgba(134,88,20,0.45), transparent)",
                          opacity: 0.85,
                        }}
                      />
                      <div
                        className="mt-2"
                        style={{
                          fontFamily:
                            "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                          fontSize: "clamp(9px, 1.6vw, 12px)",
                          letterSpacing: "0.46em",
                          textTransform: "uppercase",
                          color: "#865814",
                          fontWeight: 400,
                        }}
                      >
                        {formattedDate}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* === REVEAL FRAME (photo behind the flap) ===
                  Sits between the body face and the flap. Anchored to the upper
                  portion of the envelope so it sits exactly where the flap was
                  covering, giving the impression that the photo is being
                  uncovered as the flap lifts. */}
              {/* Welcome message tucked behind the flap. The triangular SVG
                  clip matches the flap shape exactly so the message only shows
                  inside the top section that opens. */}
              <div
                className="env-reveal absolute inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                  zIndex: 2,
                  transform: "translateZ(-1px)",
                  willChange: "opacity, transform",
                  // Clip to the exact triangular flap shape using percentages so
                  // it scales fluidly with the envelope on every screen size.
                  clipPath: `polygon(0% 0%, 100% 0%, 50% ${(V_Y / VB_H) * 100}%)`,
                  WebkitClipPath: `polygon(0% 0%, 100% 0%, 50% ${(V_Y / VB_H) * 100}%)`,
                  background: "rgba(253, 246, 230, 0.55)",
                }}
              >
                <div
                  className="absolute left-0 right-0 text-center px-4"
                  style={{
                    top: `${(V_Y * 0.36 / VB_H) * 100}%`,
                    fontFamily:
                      "'Cormorant Garamond', 'Cormorant Upright', Georgia, serif",
                  }}
                >
                  {/* Decorative top hairline */}
                  <div
                    className="mx-auto"
                    style={{
                      width: "32%",
                      height: "1px",
                      background:
                        "linear-gradient(to right, transparent, rgba(134,88,20,0.55), transparent)",
                      marginBottom: "0.6em",
                    }}
                  />
                  {/* Eyebrow */}
                  <div
                    style={{
                      color: "#865814",
                      fontFamily:
                        "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                      fontSize: "clamp(8px, 2.2vw, 14px)",
                      letterSpacing: "0.42em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                    }}
                  >
                    You&apos;re Invited
                  </div>
                  {/* Calligraphic word */}
                  <div
                    style={{
                      color: "#3a2a14",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "clamp(22px, 7vw, 44px)",
                      fontStyle: "italic",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      lineHeight: 1.05,
                      marginTop: "0.15em",
                    }}
                  >
                    Welcome
                  </div>
                  {/* Decorative bottom hairline */}
                  <div
                    className="mx-auto"
                    style={{
                      width: "32%",
                      height: "1px",
                      background:
                        "linear-gradient(to right, transparent, rgba(134,88,20,0.55), transparent)",
                      marginTop: "0.5em",
                    }}
                  />
                </div>
              </div>


              {/* === TRIANGULAR FLAP === */}
              {/* Absolutely positioned, detached from layout flow; rotates around
                  the top edge in true 3D so it can swing fully past 90° and rest
                  behind/above the envelope without being clipped. */}
              <div
                className="env-flap-wrap absolute inset-0"
                style={{
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  zIndex: 5,
                  willChange: "transform, opacity",
                  // Keep the back of the paper visible after passing 90°.
                  backfaceVisibility: "visible",
                  WebkitBackfaceVisibility: "visible",
                  // No CSS filter here — would flatten the 3D layer and re-clip it.
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
                    d={`M${FLAP_CORNER_R} 0 L ${V_X} ${V_Y} L ${VB_W - FLAP_CORNER_R} 0`}
                    fill="none"
                    stroke="rgba(255,250,235,0.30)"
                    strokeWidth="0.5"
                    transform="translate(0 -0.5)"
                  />
                </svg>
              </div>

              {/* === WAX SEAL (heart PNG) === */}
              {/* Sits straddling the V-fold so its top half rests on the flap
                  and its bottom half on the body — like a real wax seal holding
                  the envelope closed. translateZ pushes it forward in 3D space
                  so it stays above the flap surface regardless of stacking
                  quirks inside the preserve-3d context. */}
              <img
                src={waxSealHeart}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                className="env-seal absolute pointer-events-none select-none"
                draggable={false}
                style={{
                  left: "50%",
                  top: `${(V_Y / VB_H) * 100}%`,
                  transform: "translate(-50%, -50%) translateZ(20px) rotate(-3deg)",
                  width: "30%",
                  height: "auto",
                  zIndex: 10,
                  willChange: "transform, opacity",
                  // Drop-shadow filters are extremely expensive on mobile GPUs
                  // and force a per-frame raster of the seal — which is the
                  // visible stutter at the top of the envelope during the
                  // flap arc. Skip the filter on mobile entirely.
                  filter: isMobile
                    ? "none"
                    : "drop-shadow(0 8px 10px rgba(0,0,0,0.55)) drop-shadow(0 2px 3px rgba(0,0,0,0.45))",
                }}
              />
            </div>

            {/* Tap hint */}
            <div
              className="env-hint absolute left-0 right-0 text-center pointer-events-none"
              style={{ bottom: "clamp(-3.5rem, -6vh, -1.5rem)" }}
            >
              <p
                className="tracking-[0.5em] uppercase animate-pulse"
                style={{ color: "#E8DCC4", fontSize: "clamp(10px, 2.6vw, 12px)" }}
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
