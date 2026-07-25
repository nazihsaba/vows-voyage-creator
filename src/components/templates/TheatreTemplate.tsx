import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditableField } from "@/components/EditableField";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { RsvpSection } from "@/components/templates/RsvpSection";
import { GiftCards } from "@/components/GiftCards";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventLocation } from "@/components/EventLocation";
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
import { ChevronDown } from "lucide-react";

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

const BURGUNDY = "#4d0f1b";
const GOLD = "#c9a76a";
const CREAM = "#faf9f5";
const BLACK = "#0d0d0d";

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

const romanDate = (d: Date) =>
  `${toRoman(d.getDate())} · ${toRoman(d.getMonth() + 1)} · ${toRoman(d.getFullYear())}`;

const Curtains = ({ open, onOpen }: { open: boolean; onOpen: () => void }) => (
  <div
    className={`fixed inset-0 z-[60] pointer-events-${open ? "none" : "auto"}`}
    aria-hidden={open}
  >
    {/* Left curtain */}
    <div
      className="absolute top-0 bottom-0 left-0 transition-transform duration-[1800ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
      style={{
        width: "50%",
        transform: open ? "translateX(-100%)" : "translateX(0)",
        background: `repeating-linear-gradient(90deg, ${BURGUNDY} 0px, #6a1626 14px, ${BURGUNDY} 28px, #3a0a14 42px)`,
        boxShadow: "inset -40px 0 80px rgba(0,0,0,0.6)",
      }}
    />
    {/* Right curtain */}
    <div
      className="absolute top-0 bottom-0 right-0 transition-transform duration-[1800ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
      style={{
        width: "50%",
        transform: open ? "translateX(100%)" : "translateX(0)",
        background: `repeating-linear-gradient(90deg, ${BURGUNDY} 0px, #6a1626 14px, ${BURGUNDY} 28px, #3a0a14 42px)`,
        boxShadow: "inset 40px 0 80px rgba(0,0,0,0.6)",
      }}
    />
    {/* Valance */}
    <div
      className={`absolute top-0 left-0 right-0 h-12 md:h-16 transition-opacity duration-700`}
      style={{
        background: `linear-gradient(180deg, #3a0a14 0%, ${BURGUNDY} 60%, transparent 100%)`,
        opacity: open ? 0 : 1,
      }}
    />
    {/* Center prompt */}
    <button
      type="button"
      onClick={onOpen}
      className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-500 ${
        open ? "opacity-0" : "opacity-100"
      }`}
      style={{ color: GOLD, fontFamily: '"Cormorant Garamond", serif' }}
    >
      <span className="text-[10px] md:text-xs tracking-[0.6em] uppercase mb-6" style={{ opacity: 0.85 }}>
        A Celebration In Three Acts
      </span>
      <span className="text-5xl md:text-7xl italic mb-8" style={{ letterSpacing: "0.05em" }}>
        Ouverture
      </span>
      <span
        className="inline-flex items-center gap-3 border px-6 py-2 text-xs md:text-sm tracking-[0.4em] uppercase hover:bg-white/5 transition-colors"
        style={{ borderColor: GOLD }}
      >
        Raise the Curtain
      </span>
    </button>
  </div>
);

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
  const [curtainOpen, setCurtainOpen] = useState(false);

  const ceremony = locations.find((l) => l.type === "ceremony");
  const venue = locations.find((l) => l.type === "venue");
  const welcomeDrink = locations.find((l) => l.type === "welcome_drink");

  const weddingDate = parseLocalDate(wedding.wedding_date);
  const dateLong = formatLocalizedDate(
    weddingDate,
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
    isArabic,
  );
  const romanStamp = romanDate(weddingDate);

  const { showLoader, fadingOut } = useHeroLoader({ imageUrl: wedding.main_picture_url });
  const { showTapToPlay, handleTapToPlay, isMusicUnlocked, setAudioElement } = useTemplateAudio(
    audioRef,
    wedding.audio_url,
    wedding.audio_start_time,
  );

  useEffect(() => {
    if (!curtainOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [curtainOpen]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    applyFadeLoop(audio, wedding.audio_start_time || 0, wedding.audio_end_time, 0.5);
  };

  const openCurtain = () => {
    setCurtainOpen(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Timeline: ceremony, welcome, venue, custom_*
  const timeline: Array<{ id: string; title: string; time: string; location: string; icon?: string }> = [];
  const orderOf = (loc: any) => (typeof loc?.display_order === "number" ? loc.display_order : 999);
  const entries: Array<{ order: number; item: any }> = [];
  if (ceremony) {
    entries.push({
      order: orderOf(ceremony),
      item: {
        id: "ceremony",
        title: t("events.ceremony"),
        time: formatTimeTo12Hour(ceremony.time) || "",
        location: getLocalizedValue("ceremony_location", ceremony.location_name),
      },
    });
  }
  if (welcomeDrink) {
    entries.push({
      order: orderOf(welcomeDrink),
      item: {
        id: "welcome",
        title: t("events.welcomeDrink"),
        time: formatTimeTo12Hour(welcomeDrink.time) || "",
        location: getLocalizedValue("venue_location", venue?.location_name || welcomeDrink.location_name || ""),
      },
    });
  }
  if (venue) {
    entries.push({
      order: orderOf(venue),
      item: {
        id: "dinner",
        title: t("events.dinnerParty"),
        time: formatTimeTo12Hour(venue.time) || "",
        location: getLocalizedValue("venue_location", venue.location_name),
      },
    });
  }
  locations
    .filter((l: any) => typeof l.type === "string" && l.type.startsWith("custom_"))
    .forEach((l: any) => {
      entries.push({
        order: orderOf(l),
        item: {
          id: l.type,
          title: getLocalizedValue(`custom_title_${l.type}`, l.custom_title || "Event"),
          time: formatTimeTo12Hour(l.time) || "",
          location: getLocalizedValue(`custom_location_${l.type}`, l.location_name || ""),
        },
      });
    });
  entries.sort((a, b) => a.order - b.order).forEach((e) => timeline.push(e.item));

  const actImages = (gallery || []).slice(0, 3).map((g: any) => g.image_url);
  while (actImages.length < 3) actImages.push(wedding.main_picture_url || "");

  const actDefaults = [
    { title: "Act I · The Meeting", body: "A quiet coincidence in a crowded room — the story begins where no one expected." },
    { title: "Act II · The Years Between", body: "Slow scenes: cities, seasons, long letters, and a friendship that refused to stay one." },
    { title: "Act III · The Question", body: "Under lantern light, a single word — and everything after it." },
  ];

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden lg:px-[25%]"
      style={{
        backgroundColor: BLACK,
        color: CREAM,
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
          <TapToPlayMusic visible={showTapToPlay && curtainOpen} isUnlocked={isMusicUnlocked} onTap={handleTapToPlay} />
        </>
      )}

      <Curtains open={curtainOpen} onOpen={openCurtain} />

      <div dir={isArabic ? "rtl" : "ltr"}>
        {/* ===== ACT I — STAGE / HERO ===== */}
        <section
          className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 relative"
          style={{ backgroundColor: BLACK }}
        >
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none"
            style={{ background: `linear-gradient(180deg, ${BURGUNDY}22 0%, transparent 100%)` }}
          />
          <span
            className="text-[10px] md:text-xs tracking-[0.6em] uppercase mb-8"
            style={{ color: GOLD }}
          >
            The Marriage Of
          </span>

          <EditableField
            fieldId="groom-name"
            text={getFieldValue("groom-name", getLocalizedValue("groom_name", wedding.groom_name))}
            style={getFieldStyle("groom-name")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="h1"
            className="text-5xl md:text-8xl italic leading-none"
          />

          <span
            className="my-6 md:my-8 text-4xl md:text-6xl italic"
            style={{ color: GOLD, fontFamily: '"Cormorant Garamond", serif' }}
          >
            &amp;
          </span>

          <EditableField
            fieldId="bride-name"
            text={getFieldValue("bride-name", getLocalizedValue("bride_name", wedding.bride_name))}
            style={getFieldStyle("bride-name")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="h1"
            className="text-5xl md:text-8xl italic leading-none"
          />

          <div className="mt-16 flex items-center gap-6">
            <span className="h-px w-10" style={{ backgroundColor: GOLD, opacity: 0.6 }} />
            <span
              className="text-sm md:text-base tracking-[0.5em]"
              style={{ color: GOLD, fontFamily: '"Cormorant Garamond", serif' }}
            >
              {isArabic ? dateLong : romanStamp}
            </span>
            <span className="h-px w-10" style={{ backgroundColor: GOLD, opacity: 0.6 }} />
          </div>

          <div className="absolute bottom-10 animate-bounce" style={{ color: GOLD }}>
            <ChevronDown className="w-6 h-6" />
          </div>
        </section>

        {/* ===== ACT II — INVITATION & MAIN PHOTO ===== */}
        <section className="py-20 px-6" style={{ backgroundColor: CREAM, color: BLACK }}>
          <AnimatedSection animation="fade-up">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: BURGUNDY }}>
                Programme · One
              </span>

              <EditableField
                fieldId="theatre-invitation-title"
                text={getFieldValue("theatre-invitation-title", "You Are Cordially Invited")}
                style={getFieldStyle("theatre-invitation-title")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-3xl md:text-5xl italic"
              />

              <div className="space-y-2">
                <EditableField
                  fieldId="groom-family"
                  text={formatFamily(
                    "groom_family",
                    getFieldValue("groom-family", wedding.groom_family || "Groom's Family"),
                  )}
                  style={getFieldStyle("groom-family")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-lg italic whitespace-pre-line"
                />
                <p className="text-xl italic" style={{ color: BURGUNDY }}>&amp;</p>
                <EditableField
                  fieldId="bride-family"
                  text={formatFamily(
                    "bride_family",
                    getFieldValue("bride-family", wedding.bride_family || "Bride's Family"),
                  )}
                  style={getFieldStyle("bride-family")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-lg italic whitespace-pre-line"
                />
              </div>

              <EditableField
                fieldId="main-description"
                text={getFieldValue(
                  "main-description",
                  getLocalizedValue("main_description", wedding.main_description || t("family.defaultInvitation")),
                )}
                style={getFieldStyle("main-description")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
                tag="p"
                className="text-base md:text-lg leading-relaxed"
              />

              {wedding.main_picture_url && (
                <div className="relative mt-8">
                  <div className="absolute -inset-3 border pointer-events-none" style={{ borderColor: BURGUNDY, opacity: 0.4 }} />
                  <img
                    src={wedding.main_picture_url}
                    alt=""
                    className="w-full h-[420px] md:h-[520px] object-cover"
                    style={{ objectPosition: `center ${wedding.main_photo_position ?? 50}%` }}
                  />
                  <div className="mt-4 flex items-center justify-between text-[10px] tracking-[0.4em] uppercase" style={{ color: BURGUNDY }}>
                    <span>{romanStamp}</span>
                    <span>Curtain · {formatTimeTo12Hour(ceremony?.time || venue?.time) || "—"}</span>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </section>

        {/* ===== COUNTDOWN — "Curtain rises in" ===== */}
        <section className="py-20 px-6" style={{ backgroundColor: BLACK, color: CREAM }}>
          <div className="max-w-2xl mx-auto">
            <CountdownTimer targetDate={wedding.wedding_date} variant="dark" />
          </div>
        </section>

        {/* ===== ACT III — THREE ACTS / OUR STORY ===== */}
        <section className="py-20 px-6" style={{ backgroundColor: CREAM, color: BLACK }}>
          <div className="max-w-3xl mx-auto">
            <AnimatedSection animation="fade-up">
              <div className="text-center mb-16">
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: BURGUNDY }}>
                  Programme · Two
                </span>
                <h2 className="text-3xl md:text-5xl italic mt-3">In Three Acts</h2>
              </div>
            </AnimatedSection>

            <div className="space-y-20">
              {actDefaults.map((act, i) => (
                <AnimatedSection key={i} animation={i % 2 === 0 ? "slide-left" : "slide-right"}>
                  <div className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
                    <div className="relative">
                      {actImages[i] ? (
                        <img
                          src={actImages[i]}
                          alt={`Act ${i + 1}`}
                          className="w-full h-72 md:h-96 object-cover"
                        />
                      ) : (
                        <div className="w-full h-72 md:h-96" style={{ backgroundColor: BURGUNDY, opacity: 0.15 }} />
                      )}
                      <span
                        className="absolute -top-4 -left-2 text-6xl md:text-7xl italic"
                        style={{ color: BURGUNDY, fontFamily: '"Cormorant Garamond", serif' }}
                      >
                        {toRoman(i + 1)}
                      </span>
                    </div>
                    <div>
                      <EditableField
                        fieldId={`theatre-act-${i}-title`}
                        text={getFieldValue(`theatre-act-${i}-title`, act.title)}
                        style={getFieldStyle(`theatre-act-${i}-title`)}
                        onUpdate={onFieldUpdate}
                        isPreview={isPreview}
                        tag="h3"
                        className="text-2xl md:text-3xl italic mb-4"
                      />
                      <EditableField
                        fieldId={`theatre-act-${i}-body`}
                        text={getFieldValue(`theatre-act-${i}-body`, act.body)}
                        style={getFieldStyle(`theatre-act-${i}-body`)}
                        onUpdate={onFieldUpdate}
                        isPreview={isPreview}
                        multiline
                        tag="p"
                        className="text-base leading-relaxed"
                      />
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== THE SETTING — Ceremony & Venue ===== */}
        {(ceremony || venue) && (
          <section className="py-20 px-6" style={{ backgroundColor: BLACK, color: CREAM }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: GOLD }}>
                  Programme · Three
                </span>
                <h2 className="text-3xl md:text-5xl italic mt-3">The Setting</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {ceremony && (
                  <EventLocation
                    type="ceremony"
                    locationName={getLocalizedValue("ceremony_location", ceremony.location_name)}
                    locationLink={ceremony.location_link}
                    time={ceremony.time}
                    note={getLocalizedValue("ceremony_note", ceremony.note || "")}
                  />
                )}
                {venue && (
                  <EventLocation
                    type="venue"
                    locationName={getLocalizedValue("venue_location", venue.location_name)}
                    locationLink={venue.location_link}
                    time={venue.time}
                    welcomeDrinkTime={welcomeDrink?.time}
                    note={getLocalizedValue("venue_note", venue.note || "")}
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===== RUNNING ORDER ===== */}
        {timeline.length > 0 && (
          <section className="py-20 px-6" style={{ backgroundColor: CREAM, color: BLACK }}>
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: BURGUNDY }}>
                  Programme · Four
                </span>
                <h2 className="text-3xl md:text-5xl italic mt-3">Running Order</h2>
              </div>
              <ol className="space-y-6">
                {timeline.map((item, idx) => (
                  <AnimatedSection key={item.id} animation="fade-up" delay={idx * 80}>
                    <li className="flex items-baseline gap-6 border-b pb-6" style={{ borderColor: `${BURGUNDY}33` }}>
                      <span
                        className="text-2xl italic min-w-[3rem]"
                        style={{ color: BURGUNDY, fontFamily: '"Cormorant Garamond", serif' }}
                      >
                        {toRoman(idx + 1)}
                      </span>
                      <div className="flex-1">
                        <p className="text-lg italic">{item.title}</p>
                        {item.location && <p className="text-sm opacity-70">{item.location}</p>}
                      </div>
                      {item.time && (
                        <span className="text-sm tracking-[0.2em]" style={{ color: BURGUNDY }}>{item.time}</span>
                      )}
                    </li>
                  </AnimatedSection>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ===== GIFT REGISTRY ===== */}
        {giftCards.length > 0 && (
          <section className="py-20 px-6" style={{ backgroundColor: BLACK, color: CREAM }}>
            <div className="max-w-3xl mx-auto">
              <GiftCards giftCards={giftCards} />
            </div>
          </section>
        )}

        {/* ===== RÉPONDEZ / RSVP ===== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <div style={{ backgroundColor: CREAM, color: BLACK }}>
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
              cardBgClassName="bg-white"
              accentColorClass=""
            />
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <footer className="py-16 px-6 text-center" style={{ backgroundColor: BLACK, color: CREAM }}>
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] tracking-[0.5em] uppercase" style={{ color: GOLD }}>
              Fin
            </span>
            <p className="text-2xl md:text-3xl italic">
              {wedding.groom_name} · {wedding.bride_name}
            </p>
            <p className="text-xs tracking-[0.4em] uppercase" style={{ color: GOLD, opacity: 0.8 }}>
              {romanStamp}
            </p>
          </div>
          <div className="mt-10 bg-white">
            <TemplatePreviewFooter />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TheatreTemplate;
