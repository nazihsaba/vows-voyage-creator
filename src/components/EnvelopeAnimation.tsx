import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import paperTexture from "@/assets/envelope-paper-texture.jpeg";

/**
 * Reusable, fully prop-driven envelope opening animation.
 *
 * Wrap any invitation content in <EnvelopeAnimation>...</EnvelopeAnimation>
 * and a closed envelope will be shown first; on tap it plays a 4-phase
 * opening sequence and reveals the children.
 *
 * Phases:
 *   1. Seal breaks         (0–400ms)
 *   2. Flap opens in 3D    (300–1100ms)
 *   3. Invitation emerges  (900–1900ms)
 *   4. Envelope fades out  (1700–2200ms) → onAnimationComplete + scroll unlocks
 *
 * Layering (back → front):
 *   Envelope back · Content · Envelope front body · Flap (with seal)
 */

export interface EnvelopeAnimationProps {
  /** Base envelope paper color. */
  envelopeColor?: string;
  /** Accent color for borders, seal, and tap-to-open text. */
  accentColor?: string;
  /** Background behind the envelope. */
  backgroundColor?: string;
  /** Seal style. "custom" lets you pass any node via `sealContent`. */
  sealType?: "monogram" | "floral" | "custom";
  /** Initials for monogram, or any ReactNode when sealType="custom". */
  sealContent?: ReactNode;
  /** Customizable CTA text under the envelope. */
  tapToOpenText?: string;
  /** Optional paper-unfold sound (URL). Off by default. */
  soundEnabled?: boolean;
  soundUrl?: string;
  /** Fired when the full open sequence ends. */
  onAnimationComplete?: () => void;

  /** Content revealed from inside the envelope. */
  children: ReactNode;

  // ── Legacy / convenience props (used by existing wedding invite page) ──
  /** Optional groom name displayed on the envelope face. */
  groomName?: string;
  /** Optional bride name displayed on the envelope face. */
  brideName?: string;
  /** ISO date (YYYY-MM-DD) shown beneath the names. */
  weddingDate?: string;
  /** Legacy alias for envelopeColor. */
  primaryColor?: string;
}

const PHASE_TOTAL = 2200; // ms — full opening sequence
const FADE_AT = 1700; // ms — envelope begins to fade

const toTitle = (s?: string) =>
  (s || "")
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");

export const EnvelopeAnimation = ({
  envelopeColor,
  accentColor = "#865814",
  backgroundColor,
  sealType = "monogram",
  sealContent,
  tapToOpenText = "Tap to open",
  soundEnabled = false,
  soundUrl,
  onAnimationComplete,
  children,
  groomName,
  brideName,
  weddingDate,
  primaryColor,
}: EnvelopeAnimationProps) => {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const completedRef = useRef(false);

  // Resolve colors with fallbacks.
  const envColor = envelopeColor || primaryColor || "#f5e6d3";
  const accent = accentColor;
  const bgColor = backgroundColor; // when undefined → keep cinematic radial dark bg

  // Names + date (legacy face content).
  const groom = toTitle(groomName);
  const bride = toTitle(brideName);
  const hasNames = Boolean(groom || bride);
  const formattedDate = useMemo(() => {
    if (!weddingDate) return "";
    const d = new Date(weddingDate);
    if (isNaN(d.getTime())) return "";
    return `${d.getUTCDate()} · ${d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })} · ${d.getUTCFullYear()}`;
  }, [weddingDate]);

  // ── Accessibility / capability detection ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const cores = (navigator as Navigator & { hardwareConcurrency?: number })
      .hardwareConcurrency;
    if (typeof cores === "number" && cores < 4) setLowPower(true);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // If reduced motion is requested, skip the whole thing immediately.
  useEffect(() => {
    if (reducedMotion && !hidden) {
      setHidden(true);
      if (!completedRef.current) {
        completedRef.current = true;
        onAnimationComplete?.();
      }
    }
  }, [reducedMotion, hidden, onAnimationComplete]);

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

  // Load calligraphy font once.
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

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    if (soundEnabled && soundUrl) {
      try {
        const audio = new Audio(soundUrl);
        audio.volume = 0.6;
        void audio.play().catch(() => {});
      } catch {
        /* noop */
      }
    }
    window.setTimeout(() => {
      setHidden(true);
      if (!completedRef.current) {
        completedRef.current = true;
        onAnimationComplete?.();
      }
    }, PHASE_TOTAL + 80);
  }, [opening, soundEnabled, soundUrl, onAnimationComplete]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  // Floating dust motes — fewer on low-power devices.
  const motes = useMemo(() => {
    const count = lowPower ? 0 : 14;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: 30 + Math.random() * 65,
      size: 1.5 + Math.random() * 3,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 5,
    }));
  }, [lowPower]);

  // Sparkles drifting up as content emerges.
  const sparkles = useMemo(() => {
    const count = lowPower ? 0 : 5;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: 35 + Math.random() * 30,
      delay: 0.9 + Math.random() * 0.5,
      duration: 1.4 + Math.random() * 0.6,
      size: 3 + Math.random() * 3,
    }));
  }, [lowPower]);

  // Subtle paper fibers across the envelope face (deterministic).
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

  // Wax-seal break particles.
  const sealParticles = useMemo(() => {
    const count = lowPower ? 0 : 8;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const dist = 30 + Math.random() * 25;
      return {
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 2 + Math.random() * 2,
        delay: 0.05 + Math.random() * 0.1,
      };
    });
  }, [lowPower]);

  // Geometry — portrait envelope.
  const VB_W = 600;
  const VB_H = 840;
  const V_X = 300;
  const V_Y = 300;

  // Render seal content based on type.
  const renderSeal = () => {
    if (sealType === "custom" && sealContent) return sealContent;
    if (sealType === "floral") {
      return (
        <svg viewBox="0 0 40 40" width="58%" height="58%" aria-hidden="true">
          <g fill="none" stroke="rgba(255,250,235,0.92)" strokeWidth="1.4" strokeLinecap="round">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse
                key={a}
                cx="20"
                cy="11"
                rx="3.2"
                ry="6.5"
                transform={`rotate(${a} 20 20)`}
              />
            ))}
            <circle cx="20" cy="20" r="2.4" fill="rgba(255,250,235,0.92)" />
          </g>
        </svg>
      );
    }
    // monogram (default)
    const text =
      typeof sealContent === "string" && sealContent
        ? sealContent
        : groom && bride
          ? `${bride[0]}&${groom[0]}`
          : sealContent || "&";
    return (
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 500,
          color: "rgba(255,250,235,0.95)",
          fontSize: "clamp(18px, 3.4vw, 30px)",
          lineHeight: 1,
          letterSpacing: "0.02em",
          textShadow: "0 1px 1px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </span>
    );
  };

  return (
    <>
      {children}

      {!hidden && (
        <div
          className={`env-overlay fixed inset-0 z-[9999] flex items-center justify-center ${
            opening ? "is-opening" : ""
          }`}
          style={{
            height: "100dvh",
            minHeight: "100vh",
            ...(bgColor ? { background: bgColor } : {}),
          }}
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

          {/* Sparkles drifting up as content emerges */}
          {opening && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {sparkles.map((s) => (
                <span
                  key={s.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${s.left}%`,
                    bottom: "30%",
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                    animation: `envSparkle ${s.duration}s cubic-bezier(0.16, 1, 0.3, 1) ${s.delay}s forwards`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
          )}

          <style>{`
            .env-overlay {
              ${bgColor ? "" : "background: radial-gradient(ellipse at center, hsl(20 14% 10%) 0%, hsl(20 14% 4%) 100%);"}
              opacity: 1;
              will-change: opacity;
            }
            .env-overlay.is-opening {
              animation: envOverlayOut ${PHASE_TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes envOverlayOut {
              0%, ${Math.round((FADE_AT / PHASE_TOTAL) * 100)}% { opacity: 1; }
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
              0%, 100% { transform: translateY(0); }
              50%      { transform: translateY(-5px); }
            }
            .env-idle { animation: envIdle 3s ease-in-out infinite; }

            .env-zone:hover .env-target {
              transform: scale(1.025);
              filter: drop-shadow(0 42px 60px rgba(0,0,0,.55));
            }

            /* Phase 4: envelope back/front/flap fade out & scale slightly down */
            @keyframes envBody {
              0%, ${Math.round((FADE_AT / PHASE_TOTAL) * 100)}% { transform: scale(1) translateY(0); opacity: 1; }
              100%                                                { transform: scale(.95) translateY(40px); opacity: 0; }
            }
            .is-opening .env-target {
              animation: envBody ${PHASE_TOTAL}ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            /* Phase 1: seal pops then fades, easing 0,22,1,0.36,1 */
            @keyframes envSealPop {
              0%   { transform: translate(-50%,-50%) scale(1)   rotate(-3deg); opacity: 1; }
              45%  { transform: translate(-50%,-50%) scale(1.1) rotate(-3deg); opacity: 1; }
              100% { transform: translate(-50%,-55%) scale(.92) rotate(-1deg); opacity: 0; }
            }
            .is-opening .env-seal {
              animation: envSealPop 400ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            @keyframes envSealParticle {
              0%   { transform: translate(-50%,-50%) translate(0,0) scale(1); opacity: 0; }
              20%  { opacity: 1; }
              100% { transform: translate(-50%,-50%) translate(var(--dx), var(--dy)) scale(.4); opacity: 0; }
            }
            .is-opening .env-seal-particle {
              animation: envSealParticle 600ms cubic-bezier(0.22, 1, 0.36, 1) 50ms forwards;
            }

            /* Phase 2: flap opens 3D from bottom edge (transform-origin top because flap is mirrored) */
            @keyframes envFlapLift {
              0%, ${Math.round((300 / PHASE_TOTAL) * 100)}% { transform: rotateX(0deg); }
              ${Math.round((1100 / PHASE_TOTAL) * 100)}%    { transform: rotateX(-180deg); }
              100% { transform: rotateX(-180deg); opacity: 0; }
            }
            .is-opening .env-flap-wrap {
              animation: envFlapLift ${PHASE_TOTAL}ms cubic-bezier(0.32, 0.72, 0.35, 1) forwards;
            }

            /* Phase 3: invitation hint emerges (we render the actual content via children
               under the envelope; here we only show a soft growing shadow). */
            @keyframes envContentRise {
              0%, ${Math.round((900 / PHASE_TOTAL) * 100)}%  { transform: translateY(20%); opacity: 0; }
              ${Math.round((1900 / PHASE_TOTAL) * 100)}%     { transform: translateY(0);   opacity: 1; }
              100% { transform: translateY(-10%); opacity: 0; }
            }
            .is-opening .env-content-shadow {
              animation: envContentRise ${PHASE_TOTAL}ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            @keyframes envSparkle {
              0%   { transform: translateY(0) scale(.6); opacity: 0; }
              30%  { opacity: 1; }
              100% { transform: translateY(-160px) scale(1.1); opacity: 0; }
            }

            @keyframes envHint { 0%{opacity:1} 14%,100%{opacity:0} }
            .is-opening .env-hint { animation: envHint ${PHASE_TOTAL}ms ease-out forwards; }

            @keyframes envHintPulse {
              0%, 100% { opacity: .75; }
              50%      { opacity: 1; }
            }
            .env-hint-text { animation: envHintPulse 2.4s ease-in-out infinite; }

            @media (prefers-reduced-motion: reduce) {
              .env-overlay, .env-idle, .env-glow, .env-target, .env-flap-wrap,
              .env-seal, .env-seal-particle, .env-hint, .env-hint-text, .env-content-shadow {
                animation: none !important;
              }
              .env-overlay { opacity: 0 !important; pointer-events: none !important; }
            }
          `}</style>

          <div
            className="env-zone relative cursor-pointer select-none outline-none"
            style={{
              perspective: "1500px",
              height: "min(92dvh, 96vw * (840/600))",
              width: "min(92vw, 92dvh * (600/840), 600px)",
            }}
            onClick={handleOpen}
            onKeyDown={handleKey}
            role="button"
            tabIndex={0}
            aria-label="Open invitation"
          >
            {/* Soft growing shadow under envelope as content "rises" — purely visual */}
            <div
              className="env-content-shadow absolute pointer-events-none"
              style={{
                left: "10%",
                right: "10%",
                bottom: "-20px",
                height: "40px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, transparent 70%)",
                opacity: 0,
                zIndex: 0,
              }}
            />

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
              {/* === ENVELOPE BODY (back + front merged into one paper face) === */}
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
                  <linearGradient id="env-fold-shadow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.42)" />
                    <stop offset="55%" stopColor="rgba(0,0,0,0.10)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>
                  <clipPath id="env-body-clip">
                    <rect x="0" y="0" width={VB_W} height={VB_H} rx="16" ry="16" />
                  </clipPath>
                </defs>

                <g clipPath="url(#env-body-clip)">
                  {/* Base envelope tint (envelopeColor prop) under the paper texture */}
                  <rect width={VB_W} height={VB_H} fill={envColor} />
                  <rect width={VB_W} height={VB_H} fill="url(#env-paper)" opacity="0.88" />
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
                  <path
                    d={`M0 0 L ${V_X} ${V_Y} L ${VB_W} 0 L ${VB_W} ${V_Y + 50} L ${V_X} ${V_Y + 70} L 0 ${V_Y + 50} Z`}
                    fill="url(#env-fold-shadow)"
                    opacity="0.85"
                  />
                  <path
                    d={`M 0 16 L ${V_X - 14} ${V_Y - 4} Q ${V_X} ${V_Y + 6} ${V_X + 14} ${V_Y - 4} L ${VB_W} 16`}
                    fill="none"
                    stroke="rgba(40,28,10,0.18)"
                    strokeWidth="0.8"
                  />
                  <rect width={VB_W} height={VB_H} fill="url(#env-vignette)" />
                </g>

                {/* Decorative accent border */}
                <rect
                  x="6"
                  y="6"
                  width={VB_W - 12}
                  height={VB_H - 12}
                  rx="12"
                  ry="12"
                  fill="none"
                  stroke={accent}
                  strokeOpacity="0.55"
                  strokeWidth="1"
                />
                <rect
                  x="0.5"
                  y="0.5"
                  width={VB_W - 1}
                  height={VB_H - 1}
                  rx="16"
                  ry="16"
                  fill="none"
                  stroke="rgba(40,28,10,0.22)"
                  strokeWidth="1"
                />
              </svg>

              {/* === BRIDE & GROOM NAMES (legacy face content) === */}
              {hasNames && (
                <div
                  className="env-names absolute pointer-events-none select-none text-center"
                  style={{
                    left: "10%",
                    right: "10%",
                    top: `${(((V_Y + 60) + (VB_H - 90)) / 2 / VB_H) * 100}%`,
                    transform: "translateY(-50%)",
                    color: "#3a2a14",
                    zIndex: 2,
                    fontFamily:
                      "'Cormorant Garamond', 'Cormorant Upright', Georgia, serif",
                  }}
                >
                  <div
                    className="mx-auto mb-3 flex items-center justify-center gap-2"
                    style={{ opacity: 0.6 }}
                  >
                    <span style={{ display: "block", width: "28%", height: "1px", background: "linear-gradient(to right, transparent, rgba(58,42,20,0.55), transparent)" }} />
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: accent, boxShadow: "0 0 0 1px rgba(58,42,20,0.25)" }} />
                    <span style={{ display: "block", width: "28%", height: "1px", background: "linear-gradient(to right, transparent, rgba(58,42,20,0.55), transparent)" }} />
                  </div>

                  <div
                    style={{
                      fontSize: "clamp(20px, 4.6vw, 38px)",
                      lineHeight: 1.05,
                      fontStyle: "italic",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      textShadow: "0 1px 0 rgba(255,250,235,0.55), 0 0 1px rgba(58,42,20,0.25)",
                    }}
                  >
                    {bride || "\u00A0"}
                  </div>

                  <div
                    aria-hidden="true"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 400,
                      fontSize: "clamp(28px, 7vw, 56px)",
                      lineHeight: 1,
                      margin: "0.1em 0 0.05em",
                      color: accent,
                      textShadow: "0 1px 0 rgba(255,250,235,0.45), 0 0 1px rgba(134,88,20,0.3)",
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
                      textShadow: "0 1px 0 rgba(255,250,235,0.55), 0 0 1px rgba(58,42,20,0.25)",
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
                          background: `linear-gradient(to right, transparent, ${accent}73, transparent)`,
                          opacity: 0.85,
                        }}
                      />
                      <div
                        className="mt-2"
                        style={{
                          fontFamily:
                            "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                          fontSize: "clamp(13px, 2.4vw, 17px)",
                          letterSpacing: "0.46em",
                          textTransform: "uppercase",
                          color: accent,
                          fontWeight: 400,
                        }}
                      >
                        {formattedDate}
                      </div>
                    </>
                  )}
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
                      <path
                        d={`
                          M 16 0
                          L ${VB_W - 16} 0
                          A 16 16 0 0 1 ${VB_W} 16
                          L ${V_X + 14} ${V_Y - 4}
                          Q ${V_X} ${V_Y + 6} ${V_X - 14} ${V_Y - 4}
                          L 0 16
                          A 16 16 0 0 1 16 0
                          Z
                        `}
                      />
                    </clipPath>
                    <linearGradient id="env-flap-shade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(60,45,25,0.10)" />
                      <stop offset="60%" stopColor="rgba(60,45,25,0.06)" />
                      <stop offset="100%" stopColor="rgba(60,45,25,0.16)" />
                    </linearGradient>
                    <radialGradient id="env-flap-vignette" cx="50%" cy="50%" r="70%">
                      <stop offset="55%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="100%" stopColor="rgba(70,55,35,0.22)" />
                    </radialGradient>
                  </defs>

                  <g clipPath="url(#env-flap-clip)">
                    <rect width={VB_W} height={VB_H} fill={envColor} />
                    <image
                      href={paperTexture}
                      x="0"
                      y="0"
                      width={VB_W}
                      height={VB_H}
                      preserveAspectRatio="xMidYMid slice"
                      opacity="0.88"
                    />
                    <rect width={VB_W} height={VB_H} fill="url(#env-flap-shade)" />
                    <rect width={VB_W} height={VB_H} fill="url(#env-flap-vignette)" />
                  </g>

                  <path
                    d={`M 0 16 L ${V_X - 14} ${V_Y - 4} Q ${V_X} ${V_Y + 6} ${V_X + 14} ${V_Y - 4} L ${VB_W} 16`}
                    fill="none"
                    stroke="rgba(255,250,235,0.30)"
                    strokeWidth="0.5"
                    transform="translate(0 -0.5)"
                  />
                </svg>

                {/* === WAX SEAL — sits on the flap so it travels with it === */}
                <div
                  className="env-seal absolute pointer-events-none select-none flex items-center justify-center"
                  aria-hidden="true"
                  style={{
                    left: "50%",
                    top: `${(V_Y / VB_H) * 100}%`,
                    transform: "translate(-50%, -50%) rotate(-3deg)",
                    width: "22%",
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 30%, ${accent} 0%, ${accent} 45%, rgba(0,0,0,0.35) 100%)`,
                    boxShadow:
                      "inset 0 4px 8px rgba(255,255,255,0.18), inset 0 -6px 10px rgba(0,0,0,0.35), 0 8px 12px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.4)",
                    zIndex: 4,
                    willChange: "transform, opacity",
                  }}
                >
                  {renderSeal()}

                  {/* Particle dust on break */}
                  {sealParticles.map((p) => (
                    <span
                      key={p.id}
                      className="env-seal-particle absolute rounded-full"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: accent,
                        opacity: 0,
                        // @ts-expect-error CSS vars
                        "--dx": `${p.dx}px`,
                        "--dy": `${p.dy}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tap-to-open hint */}
            <div
              className="env-hint absolute left-0 right-0 text-center pointer-events-none"
              style={{ bottom: "-3.5rem" }}
            >
              <p
                className="env-hint-text text-xs tracking-[0.5em] uppercase"
                style={{ color: accent }}
              >
                {tapToOpenText}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
