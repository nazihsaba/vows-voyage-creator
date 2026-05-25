import { useEffect, useRef, useState } from "react";


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
  onStateChange?: (s: { atEnd: boolean; step: number }) => void;
};

const STRINGS: Record<Locale, { hint: string; map: string }> = {
  en: { hint: "swipe to reveal the day", map: "View Map" },
  fr: { hint: "glissez pour révéler la journée", map: "Voir la carte" },
  ar: { hint: "اسحب لاكتشاف اليوم", map: "عرض الخريطة" },
};

const KEYFRAMES = `
@keyframes dp-title { from { opacity: 0; filter: blur(8px); transform: scale(0.94); } to { opacity: 1; filter: blur(0); transform: scale(1); } }
@keyframes dp-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes dp-rule { from { width: 0; } to { width: 56px; } }
@keyframes dp-bob { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(4px, 0); } }
@keyframes dp-pulse {
  0%, 100% { box-shadow: 0 0 0 1px rgba(255,255,255,0.45), 0 0 0 0 rgba(255,255,255,0); }
  50% { box-shadow: 0 0 0 1px rgba(255,255,255,0.7), 0 0 0 6px rgba(255,255,255,0.12); }
}
`;

export default function DayProgramme({
  date,
  events,
  locale = "en",
  onStateChange,
}: DayProgrammeProps) {
  const strings = STRINGS[locale];
  const total = Math.max(1, events.length);
  const [step, setStep] = useState(0); // 0..total-1
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const agendaRef = useRef<HTMLDivElement>(null);
  const [agendaHeight, setAgendaHeight] = useState(0);
  const isRTL = locale === "ar";

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeHandledRef = useRef(false);

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

  const progress = total <= 1 ? 1 : step / (total - 1);
  const atEnd = step >= total - 1;

  useEffect(() => {
    onStateChange?.({ atEnd, step });
  }, [atEnd, step, onStateChange]);

  const advance = () => {
    if (!hasInteracted) setHasInteracted(true);
    setStep((s) => Math.min(total - 1, s + 1));
  };
  const retreat = () => {
    if (!hasInteracted) setHasInteracted(true);
    setStep((s) => Math.max(0, s - 1));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    swipeHandledRef.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    const t = e.touches[0];
    if (!start || !t || swipeHandledRef.current) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy)) return;
    const forward = isRTL ? dx > 0 : dx < 0;
    // Forward swipe at end → let Embla advance to next slide
    if (forward && atEnd) return;
    // Otherwise we handle it internally; block Embla
    e.stopPropagation();
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    const forward = isRTL ? dx > 0 : dx < 0;
    if (forward) {
      if (!atEnd) {
        e.stopPropagation();
        advance();
      }
    } else if (step > 0) {
      e.stopPropagation();
      retreat();
    }
  };

  const timeColWidth = isNarrow ? 75 : 95;
  const spineColWidth = 56;
  const spineLeft = timeColWidth + spineColWidth / 2;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="absolute inset-0 overflow-hidden"
      style={{ touchAction: "pan-y", fontFamily: "system-ui, -apple-system, sans-serif" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <style>{KEYFRAMES}</style>

      {/* Content */}
      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div
          className="mx-auto w-full px-5"
          style={{
            maxWidth: 580,
            paddingTop: 84,
            paddingBottom: isNarrow ? 130 : 150,
          }}
        >
          {/* Header — date is the title now */}
          <div className="text-center">
            <h1
              className="italic font-normal"
              style={{
                fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif",
                fontSize: isNarrow ? 30 : 38,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                color: "#ffffff",
                textShadow: "0 2px 18px rgba(0,0,0,0.45)",
                opacity: 0,
                animation: "dp-title 1s 0.3s cubic-bezier(0.2,0.7,0.2,1) forwards",
              }}
            >
              {date}
            </h1>
            <div
              style={{
                margin: "20px auto 0",
                height: 1,
                background: "rgba(255,255,255,0.7)",
                width: 0,
                animation: "dp-rule 0.7s 1s cubic-bezier(0.4,0,0.2,1) forwards",
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
                background: "rgba(255,255,255,0.25)",
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
                  "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 100%)",
                boxShadow: "0 0 10px rgba(255,255,255,0.35)",
                transform: "translateX(-50%)",
                transition: "height 0.4s cubic-bezier(0.2,0.7,0.2,1)",
              }}
            />

            {/* Marker on spine */}
            {agendaHeight > 0 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: spineLeft,
                  top: 14 + progress * (agendaHeight - 28),
                  transform: "translate(-50%, -50%)",
                  transition: "top 0.4s cubic-bezier(0.2,0.7,0.2,1)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: "0 0 12px rgba(255,255,255,0.7)",
                }}
              />
            )}

            {/* Event rows */}
            <div className="flex flex-col" style={{ gap: 36 }}>
              {events.map((event, idx) => {
                const on = idx <= step;
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
                        color: "#ffffff",
                        textShadow: "0 1px 10px rgba(0,0,0,0.4)",
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
                            color: "rgba(255,255,255,0.8)",
                          }}
                        >
                          {event.minutePhrase}
                        </span>
                      )}
                    </div>

                    {/* Ring marker (single white ring on spine) */}
                    <div
                      className="flex justify-center items-center"
                      style={{ paddingTop: 8, position: "relative", zIndex: 2 }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: `1.5px solid ${on ? "#ffffff" : "rgba(255,255,255,0.4)"}`,
                          background: on ? "rgba(255,255,255,0.15)" : "transparent",
                          transition: "all 0.4s ease",
                          ...(heroOn
                            ? { animation: "dp-pulse 3s ease-in-out infinite" }
                            : {}),
                        }}
                      />
                    </div>

                    {/* Event info */}
                    <div className="text-left" style={{ paddingTop: 4 }}>
                      <p
                        className="uppercase"
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.42em",
                          color: "rgba(255,255,255,0.8)",
                          marginBottom: 7,
                          textShadow: "0 1px 8px rgba(0,0,0,0.3)",
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
                          color: "#ffffff",
                          textShadow: "0 1px 10px rgba(0,0,0,0.4)",
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
                          color: "rgba(255,255,255,0.75)",
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
                            color: "rgba(255,255,255,0.85)",
                            paddingBottom: 3,
                            marginTop: 10,
                            borderBottom: "0.5px solid rgba(255,255,255,0.5)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#ffffff";
                            e.currentTarget.style.borderBottomColor = "#ffffff";
                            e.currentTarget.style.letterSpacing = "0.48em";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                            e.currentTarget.style.borderBottomColor =
                              "rgba(255,255,255,0.5)";
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

      {/* Stepper control */}
      <div
        className="absolute z-20 flex flex-col items-center"
        style={{
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          width: "86%",
          maxWidth: 420,
        }}
      >
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!hasInteracted) setHasInteracted(true);
                setStep(i);
              }}
              aria-label={`Step ${i + 1}`}
              style={{
                width: i === step ? 22 : 6,
                height: 6,
                borderRadius: 999,
                background:
                  i <= step ? "#ffffff" : "rgba(255,255,255,0.35)",
                transition: "all 0.4s cubic-bezier(0.2,0.7,0.2,1)",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>


        {/* Hint */}
        <div
          className="text-center mt-3 uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.4em",
            color: "rgba(255,255,255,0.85)",
            opacity: hasInteracted ? (atEnd ? 0.85 : 0) : 0.85,
            transition: "opacity 0.6s ease",
            fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif",
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}
        >
          {atEnd && hasInteracted
            ? locale === "fr"
              ? "glissez pour continuer"
              : locale === "ar"
                ? "اسحب للمتابعة"
                : "swipe to continue"
            : strings.hint}
        </div>
      </div>
    </div>
  );
}
