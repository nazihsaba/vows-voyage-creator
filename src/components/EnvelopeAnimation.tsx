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
 * Sequence (triggered on tap):
 *  1. Anticipation — subtle "breath in" micro-scale (~220ms)
 *  2. Flap opens upward on X-axis with soft overshoot (~650ms)
 *  3. Inner card slides up with parallax + scale (~850ms)
 *  4. Envelope drifts down, card moves forward
 *  5. Card expands into full reveal, background blurs & fades
 *
 * Designed to feel like opening a real high-end wedding invitation.
 */
export const EnvelopeAnimation = ({
  groomName,
  brideName,
  primaryColor,
  accentColor,
  children,
}: EnvelopeAnimationProps) => {
  type Stage = "sealed" | "anticipation" | "flap" | "card" | "reveal" | "done";
  const [stage, setStage] = useState<Stage>("sealed");
  const [hidden, setHidden] = useState(false);

  const groomInitial = (groomName?.trim()?.charAt(0) || "A").toUpperCase();
  const brideInitial = (brideName?.trim()?.charAt(0) || "B").toUpperCase();

  // Refined ivory/cream paper tones with rose-gold accent
  const paperFront = "#F7F1E3";
  const paperBack = "#EDE3CC";
  const paperInner = "#FBF7EC";
  const paperShadow = "#C9BD9E";
  const accent = accentColor || "#C9A961"; // soft gold / rose-gold
  const sealColor = primaryColor || "#7A1F2B"; // deep wine wax

  // Premium easing curves
  const luxuryEase = "cubic-bezier(0.25, 1, 0.5, 1)";
  const softEase = "cubic-bezier(0.4, 0, 0.2, 1)";

  const isOpening = stage !== "sealed";

  const handleOpen = () => {
    if (stage !== "sealed") return;

    // Step 1 — Anticipation (breath in)
    setStage("anticipation");

    // Step 2 — Flap opens
    setTimeout(() => setStage("flap"), 240);

    // Step 3 — Card slides up with parallax
    setTimeout(() => setStage("card"), 240 + 450);

    // Step 4/5 — Full reveal: card expands, bg fades
    setTimeout(() => setStage("reveal"), 240 + 450 + 750);

    // Remove from DOM
    setTimeout(() => {
      setStage("done");
      setHidden(true);
    }, 240 + 450 + 750 + 900);
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

  // Floating dust particles (memoized so they don't re-randomize on rerender)
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

  // Stage-driven transforms
  const envelopeScale =
    stage === "anticipation" ? 0.985 : stage === "card" || stage === "reveal" ? 1 : 1;
  const envelopeTranslateY =
    stage === "card" ? 18 : stage === "reveal" ? 40 : 0;
  const envelopeOpacity = stage === "reveal" ? 0 : 1;

  const flapRotate =
    stage === "flap" || stage === "card" || stage === "reveal" ? -178 : 0;

  const cardTranslateY =
    stage === "card" ? -42 : stage === "reveal" ? -120 : 8;
  const cardScale =
    stage === "card" ? 1.02 : stage === "reveal" ? 1.6 : 0.96;
  const cardOpacity =
    stage === "sealed" || stage === "anticipation" ? 0 : stage === "reveal" ? 0 : 1;

  return (
    <>
      {children}

      {!hidden && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background:
              stage === "reveal"
                ? "radial-gradient(ellipse at center, hsla(35,25%,12%,0) 0%, hsla(30,20%,6%,0) 100%)"
                : "radial-gradient(ellipse at center, hsl(35 22% 14%) 0%, hsl(30 18% 6%) 100%)",
            backdropFilter: stage === "reveal" ? "blur(0px)" : "blur(2px)",
            opacity: stage === "reveal" ? 0 : 1,
            transition: `opacity 850ms ${luxuryEase}, backdrop-filter 850ms ${luxuryEase}, background 850ms ${luxuryEase}`,
            pointerEvents: stage === "reveal" ? "none" : "auto",
          }}
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
                className="absolute rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: `radial-gradient(circle, ${accent}aa 0%, transparent 70%)`,
                  opacity: isOpening ? 0.9 : 0.35,
                  transition: `opacity 1200ms ${luxuryEase}`,
                  animation: `envFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
                  filter: "blur(0.5px)",
                }}
              />
            ))}
          </div>

          {/* Local keyframes */}
          <style>{`
            @keyframes envFloat {
              0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
              50% { transform: translateY(-22px) translateX(6px); opacity: 0.9; }
            }
            @keyframes envIdle {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            @keyframes envSheen {
              0% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
              30% { opacity: 0.55; }
              100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
            }
            .env-idle { animation: envIdle 4.2s ease-in-out infinite; }
            .env-hover-zone:hover .env-hover-target {
              transform: scale(1.025);
              filter: drop-shadow(0 35px 55px rgba(0,0,0,0.55));
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
              className={`env-hover-target ${stage === "sealed" ? "env-idle" : ""}`}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                transform: `scale(${envelopeScale}) translateY(${envelopeTranslateY}px)`,
                opacity: envelopeOpacity,
                transition: `transform 850ms ${luxuryEase}, opacity 700ms ${luxuryEase}, filter 500ms ${softEase}`,
                filter: "drop-shadow(0 25px 45px rgba(0,0,0,0.45))",
                transformStyle: "preserve-3d",
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
                {/* Diagonal V fold lines from bottom corners to center */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 155 100"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="0"
                    y1="100"
                    x2="77.5"
                    y2="48"
                    stroke={paperShadow}
                    strokeWidth="0.25"
                    opacity="0.6"
                  />
                  <line
                    x1="155"
                    y1="100"
                    x2="77.5"
                    y2="48"
                    stroke={paperShadow}
                    strokeWidth="0.25"
                    opacity="0.6"
                  />
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

              {/* === Inner card (peeks above flap; slides up on open) === */}
              <div
                className="absolute left-1/2 rounded-xl overflow-hidden"
                style={{
                  bottom: "8%",
                  width: "82%",
                  height: "78%",
                  transform: `translateX(-50%) translateY(${cardTranslateY}%) scale(${cardScale})`,
                  opacity: cardOpacity,
                  transition: `transform 900ms ${luxuryEase}, opacity 700ms ${softEase}`,
                  background: `linear-gradient(170deg, ${paperInner} 0%, #F2EAD3 100%)`,
                  boxShadow:
                    "0 18px 40px -12px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.08), inset 0 0 30px rgba(201,169,97,0.08)",
                  zIndex: 2,
                  border: `1px solid ${accent}33`,
                }}
              >
                {/* Decorative inner border */}
                <div
                  className="absolute inset-3 rounded-lg pointer-events-none"
                  style={{ border: `1px solid ${accent}55` }}
                />
                {/* Monogram inside card */}
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
                    {groomName} <span style={{ color: accent }}>&amp;</span>{" "}
                    {brideName}
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
                className="absolute top-0 left-0 right-0"
                style={{
                  height: "62%",
                  transformOrigin: "top center",
                  transform: `rotateX(${flapRotate}deg)`,
                  transition: `transform 700ms ${luxuryEase}`,
                  transformStyle: "preserve-3d",
                  zIndex: 3,
                }}
              >
                {/* Outer face (visible when closed) */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    background: `linear-gradient(170deg, ${paperFront} 0%, ${paperBack} 100%)`,
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    boxShadow: "inset 0 -12px 24px rgba(0,0,0,0.10)",
                  }}
                >
                  {/* Light sheen sweep across flap during opening */}
                  {(stage === "anticipation" || stage === "flap") && (
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                    >
                      <div
                        className="absolute top-0 bottom-0"
                        style={{
                          width: "40%",
                          background:
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                          animation: `envSheen 900ms ${luxuryEase} forwards`,
                          mixBlendMode: "overlay",
                        }}
                      />
                    </div>
                  )}
                  {/* Subtle gold accent line along flap edges */}
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

                {/* Inner face (visible when opened) */}
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
                className="absolute left-1/2 top-1/2"
                style={{
                  width: "20%",
                  aspectRatio: "1 / 1",
                  zIndex: 4,
                  opacity: stage === "sealed" || stage === "anticipation" ? 1 : 0,
                  transform: `translate(-50%, -50%) scale(${
                    stage === "sealed"
                      ? 1
                      : stage === "anticipation"
                      ? 1.06
                      : 1.4
                  })`,
                  transition: `opacity 350ms ${softEase}, transform 500ms ${luxuryEase}`,
                  pointerEvents: "none",
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
              className="absolute left-0 right-0 text-center pointer-events-none"
              style={{
                bottom: "-3.25rem",
                opacity: stage === "sealed" ? 1 : 0,
                transition: `opacity 400ms ${softEase}`,
              }}
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
