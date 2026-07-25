import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditableField } from "@/components/EditableField";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { RsvpSection } from "@/components/templates/RsvpSection";
import { GiftCards } from "@/components/GiftCards";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { formatLocalizedDate } from "@/lib/formatDate";
import { parseLocalDate } from "@/lib/weddingDate";
import { useArabicContent } from "@/hooks/useArabicContent";
import { useTemplateAudio } from "@/hooks/useTemplateAudio";
import { applyFadeLoop } from "@/lib/audioFadeLoop";
import TapToPlayMusic from "@/components/templates/TapToPlayMusic";
import { buildTemplateFontStyle } from "@/components/templateFontDefaults";
import TemplateLoader from "@/components/templates/TemplateLoader";
import { useHeroLoader } from "@/hooks/useHeroLoader";

interface TheatreTemplateProps {
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
  isOwner?: boolean;
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean | null>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean | null) => void;
  handleRsvpSubmit?: (wishesMessage?: string) => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
}

const toRoman = (num: number): string => {
  const map: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = num;
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) { out += s; n -= v; }
  }
  return out;
};

const NUMBER_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen", "Twenty",
];
const toWord = (n: number) =>
  n <= 20
    ? NUMBER_WORDS[n]
    : n < 30
      ? "Twenty-" + NUMBER_WORDS[n - 20].toLowerCase()
      : String(n);

const HOUR_WORDS: Record<number, string> = {
  1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six",
  7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten", 11: "Eleven", 12: "Twelve",
};

const hourWord = (time?: string | null) => {
  if (!time) return "";
  const [h] = time.split(":").map(Number);
  const twelve = ((h + 11) % 12) + 1;
  const period = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `${HOUR_WORDS[twelve] || twelve} o'clock in the ${period}`;
};

export const TheatreTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
}: TheatreTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, hasArabic, arabicOnly, getLocalizedValue, formatFamily } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);

  const ceremony = locations.find((l) => l.type === "ceremony");
  const venue = locations.find((l) => l.type === "venue");
  const welcomeDrink = locations.find((l) => l.type === "welcome_drink");

  const weddingDate = parseLocalDate(wedding.wedding_date);
  const dateArabic = formatLocalizedDate(
    weddingDate,
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
    isArabic,
  );

  const MONTHS = [
    "January","February","March","April","May","June","July","August","September","October","November","December",
  ];
  const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const romanYear = toRoman(weddingDate.getFullYear());
  const dayWord = toWord(weddingDate.getDate());
  const monthWord = MONTHS[weddingDate.getMonth()];
  const weekdayWord = WEEKDAYS[weddingDate.getDay()];
  const overtureLine = `${dayWord} ${monthWord} ${romanYear}`;
  const ceremonyDateLine = `${weekdayWord}, the ${dayWord.toLowerCase()}\nof ${monthWord}`;

  const { showLoader, fadingOut } = useHeroLoader({ imageUrl: wedding.main_picture_url });
  const { showTapToPlay, handleTapToPlay, isMusicUnlocked, setAudioElement } = useTemplateAudio(
    audioRef,
    wedding.audio_url,
    wedding.audio_start_time,
  );

  // Scroll-driven curtain reveal — writes --c on the root wrapper (0 → 1 over ~1.6vh).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    let last = -1;
    const apply = () => {
      const raw = Math.min(
        1,
        Math.max(0, (window.scrollY || 0) / (window.innerHeight * 1.6)),
      );
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      if (Math.abs(eased - last) > 0.0004) {
        last = eased;
        el.style.setProperty("--c", eased.toFixed(4));
      }
      if (!musicStarted && raw > 0.05 && audioRef.current) {
        audioRef.current.play().then(() => setMusicStarted(true)).catch(() => {});
      }
    };
    const loop = () => { apply(); raf = requestAnimationFrame(loop); };
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    apply();
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, [musicStarted]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    applyFadeLoop(audio, wedding.audio_start_time || 0, wedding.audio_end_time, 0.5);
  };

  // Countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = weddingDate.getTime();
  let diff = Math.max(0, target - now);
  const days = Math.floor(diff / 864e5); diff -= days * 864e5;
  const hrs = Math.floor(diff / 36e5); diff -= hrs * 36e5;
  const mins = Math.floor(diff / 6e4); diff -= mins * 6e4;
  const secs = Math.floor(diff / 1e3);
  const pad = (n: number) => String(n).padStart(2, "0");
  const countdownUnits = [
    { value: String(days), label: t("countdown.days", "Days") },
    { value: pad(hrs), label: t("countdown.hours", "Hours") },
    { value: pad(mins), label: t("countdown.minutes", "Minutes") },
    { value: pad(secs), label: t("countdown.seconds", "Seconds") },
  ];

  // Acts — 3 images from gallery
  const galleryImgs = (gallery || []).map((g: any) => g.image_url).filter(Boolean);
  const actImages: string[] = [];
  for (let i = 0; i < 3; i++) actImages.push(galleryImgs[i] || wedding.main_picture_url || "");
  const actDefaults = [
    { numeral: "I", title: "The Meeting", body: "A summer evening in Beirut. A crowded room, a borrowed chair, a conversation that outlasted everyone else in it." },
    { numeral: "II", title: "The Years Between", body: "Long drives up the coast, coffee gone cold from talking, and a thousand ordinary days that quietly became everything." },
    { numeral: "III", title: "The Question", body: "Asked without an audience, under a sky full of stars, and answered before it was finished." },
  ];

  // Running order — from locations
  const orderOf = (loc: any) => (typeof loc?.display_order === "number" ? loc.display_order : 999);
  const runningEntries: Array<{ order: number; time: string; title: string; note: string }> = [];
  if (ceremony) runningEntries.push({
    order: orderOf(ceremony),
    time: formatTimeTo12Hour(ceremony.time) || "",
    title: t("events.ceremony"),
    note: getLocalizedValue("ceremony_location", ceremony.location_name),
  });
  if (welcomeDrink) runningEntries.push({
    order: orderOf(welcomeDrink),
    time: formatTimeTo12Hour(welcomeDrink.time) || "",
    title: t("events.welcomeDrink"),
    note: getLocalizedValue("venue_location", venue?.location_name || welcomeDrink.location_name || ""),
  });
  if (venue) runningEntries.push({
    order: orderOf(venue),
    time: formatTimeTo12Hour(venue.time) || "",
    title: t("events.dinnerParty"),
    note: getLocalizedValue("venue_location", venue.location_name),
  });
  locations
    .filter((l: any) => typeof l.type === "string" && l.type.startsWith("custom_"))
    .forEach((l: any) => runningEntries.push({
      order: orderOf(l),
      time: formatTimeTo12Hour(l.time) || "",
      title: getLocalizedValue(`custom_title_${l.type}`, l.custom_title || "Event"),
      note: getLocalizedValue(`custom_location_${l.type}`, l.location_name || ""),
    }));
  runningEntries.sort((a, b) => a.order - b.order);

  // Palette from source HTML
  const INK = "#1a1611";
  const CREAM = "#f7f3ea";
  const DARK = "#0d0b09";
  const NIGHT = "#14110d";
  const GOLD = "#a8834a";
  const GOLD_LIGHT = "#c4a06a";
  const GOLD_PALE = "#d8c8ab";

  return (
    <div
      ref={rootRef}
      className="w-full min-h-screen overflow-x-clip"
      style={{
        backgroundColor: DARK,
        color: INK,
        fontFamily: "'Cormorant', Georgia, serif",
        ...buildTemplateFontStyle("theatre-opera", wedding.template_fonts),
      }}
      dir="ltr"
    >
      {showLoader && (
        <TemplateLoader groomName={wedding.groom_name} brideName={wedding.bride_name} fadingOut={fadingOut} />
      )}
      {hasArabic && !arabicOnly && <LanguageToggle />}

      {wedding.audio_url && (
        <>
          <audio ref={setAudioElement} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
          <TapToPlayMusic visible={showTapToPlay} isUnlocked={isMusicUnlocked} onTap={handleTapToPlay} />
        </>
      )}

      <div dir={isArabic ? "rtl" : "ltr"}>
        {/* ==================== OVERTURE — scroll-driven curtains ==================== */}
        <div style={{ height: "260vh", position: "relative" }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: DARK }}>
            {/* the stage: photograph */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "scale(calc(1.14 - var(--c, 0) * 0.14))",
                willChange: "transform",
              }}
            >
              {wedding.main_picture_url && (
                <img
                  src={wedding.main_picture_url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `center ${wedding.main_photo_position ?? 50}%`,
                  }}
                />
              )}
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(to bottom, rgba(13,11,9,.55) 0%, rgba(13,11,9,.12) 32%, rgba(13,11,9,.35) 68%, rgba(13,11,9,.86) 100%)",
              }}
            />

            {/* title block */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "0 26px",
                pointerEvents: "none",
                opacity: "calc((var(--c, 0) - 0.3) * 2.4)" as any,
                transform: "translateY(calc((1 - var(--c, 0)) * 28px))",
              }}
            >
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 200,
                  fontSize: 11,
                  letterSpacing: "0.62em",
                  textTransform: "uppercase",
                  color: GOLD_PALE,
                }}
              >
                The marriage of
              </div>
              <div
                style={{
                  width: 1,
                  height: 46,
                  background: `linear-gradient(to bottom, transparent, ${GOLD})`,
                  margin: "26px 0",
                }}
              />
              <EditableField
                fieldId="groom-name"
                text={getFieldValue("groom-name", getLocalizedValue("groom_name", wedding.groom_name))}
                style={getFieldStyle("groom-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="div"
                className=""
              >
                <span
                  style={{
                    fontSize: "clamp(46px, 9.5vw, 104px)",
                    fontWeight: 300,
                    lineHeight: 0.98,
                    color: "#fbf7ef",
                    letterSpacing: "0.01em",
                  }}
                />
              </EditableField>
              <div
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(24px, 4.4vw, 40px)",
                  color: GOLD_LIGHT,
                  margin: "4px 0 2px",
                }}
              >
                and
              </div>
              <EditableField
                fieldId="bride-name"
                text={getFieldValue("bride-name", getLocalizedValue("bride_name", wedding.bride_name))}
                style={getFieldStyle("bride-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="div"
                className=""
              >
                <span
                  style={{
                    fontSize: "clamp(46px, 9.5vw, 104px)",
                    fontWeight: 300,
                    lineHeight: 0.98,
                    color: "#fbf7ef",
                    letterSpacing: "0.01em",
                  }}
                />
              </EditableField>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  marginTop: 36,
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                  fontSize: 12,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "#e6dac2",
                }}
              >
                <span style={{ width: 34, height: 1, background: "rgba(196,160,106,.7)" }} />
                <span>{isArabic ? dateArabic : overtureLine}</span>
                <span style={{ width: 34, height: 1, background: "rgba(196,160,106,.7)" }} />
              </div>
            </div>

            {/* silk curtains */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: "54%",
                transform: "translateX(calc(var(--c, 0) * -101%))",
                willChange: "transform",
                background:
                  "linear-gradient(90deg, #2a0810 0%, #4d0f1b 7%, #34090f 13%, #59131f 21%, #370a12 28%, #611620 37%, #3b0b13 45%, #5c1420 55%, #360a11 64%, #631721 74%, #3d0b13 84%, #571320 93%, #24060c 100%)",
                boxShadow: "inset -60px 0 90px rgba(0,0,0,.6), 22px 0 60px rgba(0,0,0,.55)",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,225,190,.14), transparent 26%, rgba(0,0,0,.4))" }} />
            </div>
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: "54%",
                transform: "translateX(calc(var(--c, 0) * 101%))",
                willChange: "transform",
                background:
                  "linear-gradient(270deg, #2a0810 0%, #4d0f1b 7%, #34090f 13%, #59131f 21%, #370a12 28%, #611620 37%, #3b0b13 45%, #5c1420 55%, #360a11 64%, #631721 74%, #3d0b13 84%, #571320 93%, #24060c 100%)",
                boxShadow: "inset 60px 0 90px rgba(0,0,0,.6), -22px 0 60px rgba(0,0,0,.55)",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,225,190,.14), transparent 26%, rgba(0,0,0,.4))" }} />
            </div>

            {/* valance */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "11vh",
                zIndex: 3,
                background:
                  "linear-gradient(90deg, #3a0a11, #5c1420 18%, #380a11 34%, #611620 52%, #3b0b13 70%, #57131f 86%, #2c0810)",
                boxShadow: "0 18px 44px rgba(0,0,0,.6)",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(255,228,192,.16), transparent 60%, rgba(0,0,0,.55))" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
            </div>

            {/* scroll cue */}
            <div
              style={{
                position: "absolute",
                bottom: 34,
                left: 0,
                right: 0,
                zIndex: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: "calc(1 - var(--c, 0) * 4)" as any,
                pointerEvents: "none",
              }}
            >
              <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase", color: GOLD_PALE }}>
                Scroll
              </div>
              <div style={{ width: 1, height: 46, background: "linear-gradient(to bottom, rgba(216,200,171,.8), transparent)" }} />
            </div>
          </div>
        </div>

        {/* ==================== THE PROGRAMME — cream stock ==================== */}
        <div style={{ position: "relative", background: CREAM, color: INK }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: 0.35,
              mixBlendMode: "multiply",
              backgroundImage:
                "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"320\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\"/><feColorMatrix type=\"saturate\" values=\"0\"/></filter><rect width=\"320\" height=\"320\" filter=\"url(%23n)\" opacity=\"0.22\"/></svg>')",
            }}
          />

          {/* invitation */}
          <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", padding: "130px 30px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.58em", textTransform: "uppercase", color: GOLD }}>
              With joyful hearts
            </div>
            <div style={{ marginTop: 30, maxWidth: 540 }}>
              <EditableField
                fieldId="theatre-invitation-body"
                text={getFieldValue(
                  "theatre-invitation-body",
                  getLocalizedValue(
                    "main_description",
                    wedding.main_description || t("family.defaultInvitation"),
                  ),
                )}
                style={getFieldStyle("theatre-invitation-body")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
                tag="p"
                className=""
              >
                <p style={{ fontSize: "clamp(25px, 4.4vw, 34px)", fontWeight: 400, lineHeight: 1.45 }} />
              </EditableField>
            </div>
            <div style={{ marginTop: 24, lineHeight: 1.6 }}>
              <EditableField
                fieldId="groom-family"
                text={formatFamily("groom_family", getFieldValue("groom-family", wedding.groom_family || ""))}
                style={getFieldStyle("groom-family")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className=""
              >
                <p style={{ fontSize: 22, fontStyle: "italic", color: "#4a4132" }} />
              </EditableField>
              <EditableField
                fieldId="bride-family"
                text={formatFamily("bride_family", getFieldValue("bride-family", wedding.bride_family || ""))}
                style={getFieldStyle("bride-family")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className=""
              >
                <p style={{ fontSize: 22, fontStyle: "italic", color: "#4a4132" }} />
              </EditableField>
            </div>
            <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, #d6c6a4, transparent)", marginTop: 46 }} />
          </div>

          {/* portrait plate */}
          {wedding.main_picture_url && (
            <div style={{ position: "relative", maxWidth: 980, margin: "60px auto 0", padding: "0 30px" }}>
              <div style={{ position: "relative", height: "min(78vh, 620px)" }}>
                <img
                  src={wedding.main_picture_url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `center ${wedding.main_photo_position ?? 50}%`,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginTop: 14,
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  color: "#8d7d64",
                }}
              >
                <span>
                  <EditableField
                    fieldId="theatre-city"
                    text={getFieldValue("theatre-city", "Beirut")}
                    style={getFieldStyle("theatre-city")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="span"
                    className=""
                  />
                </span>
                <span>{romanYear}</span>
              </div>
            </div>
          )}

          {/* countdown */}
          <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", padding: "110px 30px 0", textAlign: "center" }}>
            <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.58em", textTransform: "uppercase", color: GOLD }}>
              Curtain rises in
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 6vw, 54px)", marginTop: 34 }}>
              {countdownUnits.map((u) => (
                <div key={u.label}>
                  <div style={{ fontSize: "clamp(38px, 8vw, 60px)", fontWeight: 300, lineHeight: 1, color: INK }}>{u.value}</div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#8d7d64", marginTop: 12 }}>
                    {u.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* acts */}
          <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", padding: "130px 30px 0" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.58em", textTransform: "uppercase", color: GOLD }}>
                In three acts
              </div>
              <div style={{ fontSize: "clamp(34px, 6.4vw, 52px)", fontWeight: 300, fontStyle: "italic", marginTop: 16 }}>
                Our Story
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 78, marginTop: 72 }}>
              {actDefaults.map((act, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr", gap: 26 }}>
                  <div style={{ position: "relative", height: "min(52vh, 400px)" }}>
                    {actImages[i] && (
                      <img src={actImages[i]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: 26, alignItems: "start" }}>
                    <div
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontWeight: 300,
                        fontSize: 10,
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: GOLD,
                        paddingTop: 8,
                        borderTop: "1px solid #ddcfb3",
                      }}
                    >
                      Act {act.numeral}
                    </div>
                    <div>
                      <EditableField
                        fieldId={`theatre-act-${i}-title`}
                        text={getFieldValue(`theatre-act-${i}-title`, act.title)}
                        style={getFieldStyle(`theatre-act-${i}-title`)}
                        onUpdate={onFieldUpdate}
                        isPreview={isPreview}
                        tag="div"
                        className=""
                      >
                        <div style={{ fontSize: 27, fontWeight: 400, fontStyle: "italic" }} />
                      </EditableField>
                      <div style={{ marginTop: 10, maxWidth: "46ch" }}>
                        <EditableField
                          fieldId={`theatre-act-${i}-body`}
                          text={getFieldValue(`theatre-act-${i}-body`, act.body)}
                          style={getFieldStyle(`theatre-act-${i}-body`)}
                          onUpdate={onFieldUpdate}
                          isPreview={isPreview}
                          multiline
                          tag="div"
                          className=""
                        >
                          <div style={{ fontSize: 20, lineHeight: 1.65, color: "#4a4132" }} />
                        </EditableField>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ceremony */}
          {ceremony && (
            <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "140px 30px 0", textAlign: "center" }}>
              <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.58em", textTransform: "uppercase", color: GOLD }}>
                The ceremony
              </div>
              <div style={{ fontSize: "clamp(38px, 7vw, 62px)", fontWeight: 300, marginTop: 20, lineHeight: 1.1, whiteSpace: "pre-line" }}>
                {ceremonyDateLine}
              </div>
              {ceremony.time && (
                <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 12, letterSpacing: "0.42em", textTransform: "uppercase", color: "#6f6252", marginTop: 24 }}>
                  {hourWord(ceremony.time) || formatTimeTo12Hour(ceremony.time)}
                </div>
              )}
              <div style={{ width: 1, height: 54, background: "linear-gradient(to bottom, #d6c6a4, transparent)", margin: "40px auto" }} />
              <div style={{ fontSize: 27, fontWeight: 400 }}>
                {getLocalizedValue("ceremony_location", ceremony.location_name)}
              </div>
              {ceremony.note && (
                <div style={{ fontSize: 19, color: "#6f6252", marginTop: 8, fontStyle: "italic" }}>
                  {getLocalizedValue("ceremony_note", ceremony.note)}
                </div>
              )}
              {venue && (
                <div style={{ fontSize: 19, color: "#4a4132", marginTop: 30, maxWidth: 420, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                  Dinner and dancing to follow at {getLocalizedValue("venue_location", venue.location_name)}
                </div>
              )}
            </div>
          )}

          {/* venue */}
          {venue && (
            <div style={{ position: "relative", maxWidth: 980, margin: "0 auto", padding: "130px 30px 0" }}>
              {venue.image_url && (
                <div style={{ position: "relative", height: "min(64vh, 480px)" }}>
                  <img src={venue.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 22, justifyItems: "center", textAlign: "center", marginTop: 40 }}>
                <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.58em", textTransform: "uppercase", color: GOLD }}>
                  The setting
                </div>
                <div style={{ fontSize: 30, fontWeight: 400 }}>
                  {getLocalizedValue("venue_location", venue.location_name)}
                </div>
                {venue.note && (
                  <div style={{ fontSize: 19, color: "#4a4132", maxWidth: 420, lineHeight: 1.6 }}>
                    {getLocalizedValue("venue_note", venue.note)}
                  </div>
                )}
                {venue.location_link && (
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 300,
                      fontSize: 11,
                      letterSpacing: "0.4em",
                      textTransform: "uppercase",
                      padding: "16px 34px",
                      border: "1px solid #c9b58f",
                      color: "#6f6252",
                      textDecoration: "none",
                    }}
                  >
                    Directions
                  </a>
                )}
              </div>
            </div>
          )}

          {/* schedule */}
          {runningEntries.length > 0 && (
            <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", padding: "140px 30px 0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 10, letterSpacing: "0.58em", textTransform: "uppercase", color: GOLD }}>
                  Running order
                </div>
                <div style={{ fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 300, fontStyle: "italic", marginTop: 16 }}>
                  The Evening
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 54 }}>
                {runningEntries.map((s, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "108px 1fr", gap: 24, alignItems: "baseline", padding: "24px 0", borderBottom: "1px solid #e4dac6" }}>
                    <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD }}>
                      {s.time}
                    </div>
                    <div>
                      <div style={{ fontSize: 23, fontWeight: 400 }}>{s.title}</div>
                      {s.note && (
                        <div style={{ fontSize: 18, color: "#7a6a52", fontStyle: "italic", marginTop: 2 }}>{s.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* gift registry */}
          {giftCards.length > 0 && (
            <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", padding: "140px 30px 0" }}>
              <GiftCards giftCards={giftCards} />
            </div>
          )}

          <div style={{ height: 140 }} />
        </div>

        {/* ==================== RSVP · house lights down ==================== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <div style={{ position: "relative", background: NIGHT, color: "#f0e9db" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
            <RsvpSection
              wedding={wedding}
              isPreview={isPreview}
              invitees={invitees}
              rsvpResponses={rsvpResponses}
              handleRsvpToggle={handleRsvpToggle}
              handleRsvpSubmit={handleRsvpSubmit}
              numberOfPersons={numberOfPersons}
              isRsvpDeadlinePassed={isRsvpDeadlinePassed}
              submittingRsvp={submittingRsvp}
              bgClassName=""
              cardBgClassName="bg-white/5"
              accentColorClass=""
            />
          </div>
        )}

        {/* ==================== FOOTER ==================== */}
        <footer style={{ background: NIGHT, color: "#f0e9db", padding: "60px 30px 90px", textAlign: "center" }}>
          <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 1, height: 44, background: "linear-gradient(to bottom, #3d372c, transparent)" }} />
            <div style={{ fontSize: 22, fontStyle: "italic", color: "#8d8271" }}>
              {getLocalizedValue("groom_name", wedding.groom_name)} &amp; {getLocalizedValue("bride_name", wedding.bride_name)}
            </div>
            <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: 9, letterSpacing: "0.5em", textTransform: "uppercase", color: "#8d8271" }}>
              Auréa Invites
            </div>
          </div>
          <div style={{ marginTop: 40, background: "#fff" }}>
            <TemplatePreviewFooter />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TheatreTemplate;
