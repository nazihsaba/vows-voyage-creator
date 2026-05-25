import { useEffect, useMemo, useRef, useState } from "react";

export type DayEvent = {
  id: string;
  hour: number; // 1-12
  minutePhrase?: string;
  romanNumeral: string;
  label: string;
  venue: string;
  city: string;
  mapUrl?: string;
  isHero?: boolean;
};

type Locale = "en" | "ar" | "fr";

export type DayProgrammeProps = {
  title?: string;
  eyebrow?: string;
  date: string;
  events: DayEvent[];
  locale?: Locale;
};

const STRINGS: Record<Locale, { eyebrow: string; title: string; apart: string; together: string; hint: string; map: string }> = {
  en: { eyebrow: "The Day", title: "Programme", apart: "Apart", together: "Together", hint: "drag the rings across the day", map: "View Map" },
  fr: { eyebrow: "Le Jour", title: "Programme", apart: "Séparés", together: "Unis", hint: "faites glisser les anneaux à travers la journée", map: "Voir la carte" },
  ar: { eyebrow: "اليوم", title: "البرنامج", apart: "منفصلان", together: "متّحدان", hint: "اسحب الخواتم عبر اليوم", map: "عرض الخريطة" },
};

const RingPair = ({
  progress,
  size = "spine",
  active = false,
}: {
  progress: number;
  size?: "spine" | "thumb";
  active?: boolean;
}) => {
  const ringDiameter = size === "spine" ? 16 : 14;
  const halfHeight = size === "spine" ? 18 : 16;
  const halfWidth = size === "spine" ? 36 : 32;
  const ringGap = 14 - progress * 20; // 14 → -6
  const r = Math.round(212 - progress * 28);
  const g = Math.round(160 - progress * 24);
  const b = Math.round(64 + progress * 7);
  const ringColor = `rgb(${r}, ${g}, ${b})`;
  const glowIntensity = 0.2 + progress * 0.55 + (active ? 0.2 : 0);
  const glowSize = 4 + progress * 12;
  const offset = ringDiameter / 2;

  const baseStyle = {
    position: "absolute" as const,
    top: "50%",
    width: ringDiameter,
    height: ringDiameter,
    border: `1.5px solid ${ringColor}`,
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    boxShadow: `0 0 ${glowSize}px rgba(184,134,11,${glowIntensity})`,
    transition: "left 0.12s linear, border-color 0.3s ease, box-shadow 0.3s ease",
  };

  return (
    <div style={{ position: "relative", width: halfWidth, height: halfHeight }}>
      <div
        style={{
          ...baseStyle,
          left: `calc(50% - ${offset}px - ${ringGap / 2}px)`,
          zIndex: 1,
        }}
      />
      <div
        style={{
          ...baseStyle,
          left: `calc(50% + ${offset}px + ${ringGap / 2}px)`,
          zIndex: 2,
        }}
      />
    </div>
  );
};

const KEYFRAMES = `
@keyframes dp-eyebrow { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes dp-title { from { opacity: 0; filter: blur(8px); transform: scale(0.94); } to { opacity: 1; filter: blur(0); transform: scale(1); } }
@keyframes dp-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes dp-rule { from { width: 0; } to { width: 56px; } }
@keyframes dp-bob { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 3px)); } }
@keyframes dp-hero-pulse {
  0%, 100% { box-shadow: 0 0 0 1px rgba(184,134,11,0.45), 0 0 0 0 rgba(184,134,11,0); }
  50% { box-shadow: 0 0 0 1px rgba(184,134,11,0.6), 0 0 0 6px rgba(184,134,11,0.12); }
}
`;

export default function DayProgramme({
  title,
  eyebrow,
  date,
  events,
  locale = "en",
}: DayProgrammeProps) {
  const strings = STRINGS[locale];
  const [progress, setProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [activeThumb, setActiveThumb] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const agendaRef = useRef<HTMLDivElement>(null);
  const [agendaHeight, setAgendaHeight] = useState(0);
  const draggingRef = useRef(false);
  const isRTL = locale === "ar";

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 500);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!agendaRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setAgendaHeight(e.contentRect.height);
    });
    ro.observe(agendaRef.current);
    return () => ro.disconnect();
  }, []);

  const setFromClientX = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setProgress(p);
    if (!hasInteracted && p > 0.02) setHasInteracted(true);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      setFromClientX(e.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
      setActiveThumb(false);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      if (e.touches[0]) setFromClientX(e.touches[0].clientX);
    };
    const onTouchEnd = () => {
      draggingRef.current = false;
      setActiveThumb(false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInteracted]);

  const onTrackMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    setActiveThumb(true);
    setFromClientX(e.clientX);
  };
  const onTrackTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    draggingRef.current = true;
    setActiveThumb(true);
    setFromClientX(e.touches[0].clientX);
  };

  const thresholds = useMemo(() => {
    if (events.length <= 1) return [0];
    return events.map((_, i) => (i * 0.95) / (events.length - 1));
  }, [events]);

  const timeColWidth = isNarrow ? 75 : 95;
  const spineColWidth = 56;
  const spineLeft = timeColWidth + spineColWidth / 2;

  const baseOverlay = `linear-gradient(135deg, rgba(239,224,197,${0.82 - progress * 0.12}) 0%, rgba(227,209,176,${0.78 - progress * 0.1}) 55%, rgba(207,187,153,0.75) 100%)`;
  const twilightOverlay = `linear-gradient(135deg, rgba(232,200,160,${progress * 0.4}) 0%, rgba(216,176,144,${progress * 0.35}) 50%, rgba(184,152,144,${progress * 0.45}) 100%)`;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="absolute inset-0 overflow-hidden"
      style={{ touchAction: "pan-y", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <style>{KEYFRAMES}</style>

      {/* Morning overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: baseOverlay }} />
      {/* Twilight overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: twilightOverlay }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div
          className="mx-auto w-full px-5"
          style={{
            maxWidth: 580,
            paddingTop: 36,
            paddingBottom: isNarrow ? 160 : 180,
          }}
        >
          {/* Header */}
          <div className="text-center">
            <p
              className="uppercase text-[#6B4F35]"
              style={{
                fontSize: 10,
                letterSpacing: "0.44em",
                opacity: 0,
                animation: "dp-eyebrow 0.7s 0.2s cubic-bezier(0.2,0.7,0.2,1) forwards",
              }}
            >
              {eyebrow || strings.eyebrow}
            </p>
            <h1
              className="italic font-normal"
              style={{
                fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif",
                fontSize: 56,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "#2a1810",
                marginTop: 14,
                opacity: 0,
                animation: "dp-title 1s 0.5s cubic-bezier(0.2,0.7,0.2,1) forwards",
              }}
            >
              {title || strings.title}
            </h1>
            <p
              className="uppercase text-[#6B4F35]"
              style={{
                fontSize: 10,
                letterSpacing: "0.42em",
                marginTop: 14,
                opacity: 0,
                animation: "dp-fade 0.6s 1s ease forwards",
              }}
            >
              {date}
            </p>
            <div
              style={{
                margin: "20px auto 0",
                height: 1,
                background: "#B8860A",
                width: 0,
                animation: "dp-rule 0.7s 1.2s cubic-bezier(0.4,0,0.2,1) forwards",
              }}
            />
          </div>

          {/* Agenda */}
          <div ref={agendaRef} className="relative mt-10" style={{ minHeight: 200 }}>
            {/* Static spine */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: spineLeft,
                top: 14,
                bottom: 14,
                width: "0.5px",
                background: "rgba(74,47,30,0.2)",
                transform: "translateX(-50%)",
              }}
            />
            {/* Foreground spine fill */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: spineLeft,
                top: 14,
                width: "1px",
                height: `calc(${progress} * (100% - 28px))`,
                background:
                  "linear-gradient(180deg, rgba(232,182,85,0.85) 0%, rgba(184,134,11,0.55) 100%)",
                boxShadow: "0 0 10px rgba(232,182,85,0.4)",
                transform: "translateX(-50%)",
                transition: "height 0.12s linear",
              }}
            />

            {/* Rings on spine */}
            {agendaHeight > 0 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: spineLeft,
                  top: 14 + progress * (agendaHeight - 28),
                  transform: "translate(-50%, -50%)",
                  transition: "top 0.12s linear",
                }}
              >
                <RingPair progress={progress} size="spine" />
              </div>
            )}

            {/* Event rows */}
            <div className="flex flex-col" style={{ gap: 36 }}>
              {events.map((event, idx) => {
                const threshold = thresholds[idx];
                const on = progress >= threshold - 0.001;
                const heroOn = event.isHero && on;
                const timeFontSize = event.isHero
                  ? isNarrow
                    ? 34
                    : 40
                  : isNarrow
                    ? 28
                    : 32;

                return (
                  <div
                    key={event.id}
                    className="grid items-start relative"
                    style={{
                      gridTemplateColumns: `${timeColWidth}px ${spineColWidth}px 1fr`,
                      opacity: on ? 1 : 0.18,
                      transform: on ? "translateY(0)" : "translateY(6px)",
                      transition:
                        "opacity 0.55s cubic-bezier(0.2,0.7,0.2,1), transform 0.55s cubic-bezier(0.2,0.7,0.2,1)",
                    }}
                  >
                    {/* Time */}
                    <div
                      className="text-right"
                      style={{
                        fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif",
                        fontStyle: "italic",
                        fontSize: timeFontSize,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        color: "#2a1810",
                        paddingRight: 14,
                        paddingTop: 6,
                      }}
                    >
                      {event.hour}
                      {event.minutePhrase && (
                        <span
                          className="block"
                          style={{
                            fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif",
                            fontStyle: "italic",
                            fontSize: 12,
                            marginTop: 2,
                            color: "#6B4F35",
                          }}
                        >
                          {event.minutePhrase}
                        </span>
                      )}
                    </div>

                    {/* Numeral disc */}
                    <div className="flex justify-center" style={{ paddingTop: 4 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: on ? "#F6E8CC" : "#EFE0C5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          zIndex: 2,
                          transition: "background 0.4s ease",
                          ...(heroOn
                            ? {
                                animation: "dp-hero-pulse 3s ease-in-out infinite",
                                boxShadow:
                                  "0 0 0 1px rgba(184,134,11,0.45), 0 0 16px rgba(184,134,11,0.2)",
                              }
                            : {}),
                        }}
                      >
                        <span
                          style={{
                            fontFamily:
                              "'Cormorant Garamond', Garamond, Georgia, serif",
                            fontStyle: "italic",
                            fontSize: event.isHero ? 19 : 17,
                            color: event.isHero ? "#B8860A" : "#8B6A3D",
                            lineHeight: 1,
                          }}
                        >
                          {event.romanNumeral}
                        </span>
                      </div>
                    </div>

                    {/* Event info */}
                    <div className="text-left" style={{ paddingTop: 4 }}>
                      <p
                        className="uppercase"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.42em",
                          color: "#6B4F35",
                          marginBottom: 7,
                        }}
                      >
                        {event.label}
                      </p>
                      <p
                        style={{
                          fontFamily:
                            "'Cormorant Garamond', Garamond, Georgia, serif",
                          fontStyle: "italic",
                          fontSize: event.isHero ? 20 : 18,
                          lineHeight: 1.3,
                          color: "#2a1810",
                          marginBottom: 4,
                        }}
                      >
                        {event.venue}
                      </p>
                      <p
                        className="uppercase"
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.38em",
                          color: "#6B4F35",
                        }}
                      >
                        {event.city}
                      </p>
                      {event.mapUrl && (
                        <a
                          href={event.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block uppercase transition-all duration-300"
                          style={{
                            fontSize: 9,
                            letterSpacing: "0.42em",
                            color: "#6B4F35",
                            paddingBottom: 3,
                            marginTop: 10,
                            borderBottom: "0.5px solid rgba(107,79,53,0.5)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#2a1810";
                            e.currentTarget.style.borderBottomColor = "#2a1810";
                            e.currentTarget.style.letterSpacing = "0.48em";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#6B4F35";
                            e.currentTarget.style.borderBottomColor =
                              "rgba(107,79,53,0.5)";
                            e.currentTarget.style.letterSpacing = "0.42em";
                          }}
                        >
                          {strings.map}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Ring control */}
      <div
        className="absolute z-20"
        style={{
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          width: "86%",
          maxWidth: 420,
        }}
      >
        <div
          ref={trackRef}
          className="relative cursor-pointer"
          style={{ height: 24, display: "flex", alignItems: "center" }}
          onMouseDown={onTrackMouseDown}
          onTouchStart={onTrackTouchStart}
        >
          {/* Track */}
          <div
            className="absolute left-0 right-0"
            style={{
              height: "0.5px",
              background: "rgba(74,47,30,0.3)",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          {/* Track fill */}
          <div
            className="absolute left-0"
            style={{
              height: 1,
              width: `calc(${progress} * 100%)`,
              background:
                "linear-gradient(90deg, rgba(244,200,74,0.8), rgba(184,134,11,0.7))",
              boxShadow: "0 0 6px rgba(232,182,85,0.4)",
              top: "50%",
              transform: "translateY(-50%)",
              transition: "width 0.12s linear",
            }}
          />
          {/* Thumb */}
          <div
            className="absolute"
            style={{
              left: `calc(${progress} * 100%)`,
              top: "50%",
              transform: `translate(-50%, -50%) scale(${activeThumb ? 1.15 : 1})`,
              cursor: activeThumb ? "grabbing" : "grab",
              transition: "transform 0.2s ease",
              ...(!hasInteracted
                ? { animation: "dp-bob 2s 1.5s ease-in-out infinite" }
                : {}),
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              draggingRef.current = true;
              setActiveThumb(true);
              setFromClientX(e.clientX);
            }}
            onTouchStart={(e) => {
              if (!e.touches[0]) return;
              draggingRef.current = true;
              setActiveThumb(true);
              setFromClientX(e.touches[0].clientX);
            }}
          >
            <RingPair progress={progress} size="thumb" active={activeThumb} />
          </div>
        </div>

        {/* Labels */}
        <div
          className="flex justify-between mt-3"
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            color: "#6B4F35",
            textTransform: "uppercase",
          }}
        >
          <span>{isRTL ? strings.together : strings.apart}</span>
          <span>{isRTL ? strings.apart : strings.together}</span>
        </div>

        {/* Hint */}
        <div
          className="text-center italic mt-2"
          style={{
            fontSize: 11,
            color: "#6B4F35",
            opacity: hasInteracted ? 0 : 0.7,
            transition: "opacity 0.8s ease",
            fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif",
          }}
        >
          {strings.hint}
        </div>
      </div>
    </div>
  );
}
