import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftCards } from "@/components/GiftCards";
import { EditableField } from "@/components/EditableField";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";
import { EnvelopeAnimation } from "@/components/EnvelopeAnimation";

interface VeronaTemplateProps {
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
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
  handleRsvpSubmit?: () => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
}

// === Design tokens carried over from EnvelopeAnimation ===
const PAPER = "rgb(248, 240, 222)";
const INK = "#3a2a14";
const GOLD = "#865814";
const SERIF_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const SERIF_LABEL = "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif";

const Hairline = () => (
  <div
    aria-hidden
    className="mx-auto my-10"
    style={{
      width: "44%",
      height: 1,
      background:
        "linear-gradient(to right, transparent, rgba(134,88,20,0.45), transparent)",
    }}
  />
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p
    className="text-center"
    style={{
      fontFamily: SERIF_LABEL,
      letterSpacing: "0.46em",
      textTransform: "uppercase",
      fontSize: "clamp(11px, 2.6vw, 13px)",
      color: GOLD,
      fontWeight: 500,
    }}
  >
    {children}
  </p>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="text-center"
    style={{
      fontFamily: SERIF_DISPLAY,
      fontStyle: "italic",
      fontWeight: 500,
      color: INK,
      fontSize: "clamp(28px, 6.5vw, 40px)",
      lineHeight: 1.15,
    }}
  >
    {children}
  </h2>
);

const HeartGlyph = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden
    className={className}
    style={{
      color: GOLD,
      fontStyle: "italic",
      fontFamily: SERIF_DISPLAY,
      fontSize: "1.05em",
    }}
  >
    ♥
  </span>
);

export const VeronaTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isOwner = false,
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
}: VeronaTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, hasArabic, getLocalizedValue } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ceremony = locations.find((l) => l.type === "ceremony");
  const venue = locations.find((l) => l.type === "venue");
  const welcomeDrink = locations.find((l) => l.type === "welcome_drink");
  const customs = locations
    .filter((l) => typeof l.type === "string" && l.type.startsWith("custom_"))
    .sort((a, b) => a.type.localeCompare(b.type));

  // Audio: start on first interaction (envelope tap or any later interaction).
  useEffect(() => {
    if (!wedding.audio_url) return;
    const startAudio = async () => {
      const audio = audioRef.current;
      if (!audio) return;
      const startTime = wedding.audio_start_time || 0;
      try {
        if (startTime > 0) audio.currentTime = startTime;
        await audio.play();
      } catch {
        /* awaiting next user interaction */
      }
    };
    const onFirst = () => {
      startAudio();
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
    window.addEventListener("pointerdown", onFirst, { once: true });
    window.addEventListener("keydown", onFirst, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [wedding.audio_url, wedding.audio_start_time]);

  const handleTimeUpdate = () => {
    if (audioRef.current && wedding.audio_end_time) {
      if (audioRef.current.currentTime >= wedding.audio_end_time) {
        audioRef.current.currentTime = wedding.audio_start_time || 0;
      }
    }
  };

  useEffect(() => {
    return () => {
      document.documentElement.dir = "ltr";
    };
  }, []);

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";

  const formattedEnvelopeDate = wedding.wedding_date as string;

  const heroDate = useMemo(() => {
    if (!wedding.wedding_date) return "";
    const d = new Date(wedding.wedding_date);
    if (isNaN(d.getTime())) return "";
    const day = d.getUTCDate();
    const month = d
      .toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })
      .toUpperCase();
    const year = d.getUTCFullYear();
    return `${day} · ${month} · ${year}`;
  }, [wedding.wedding_date]);

  const groomName = getLocalizedValue("groom_name", wedding.groom_name);
  const brideName = getLocalizedValue("bride_name", wedding.bride_name);

  const hasStory = Boolean(wedding.main_description);
  const hasDressCode = Boolean(wedding.dress_code);
  const hasGallery = gallery.length > 0;
  const hasCeremony = Boolean(ceremony);
  const hasVenue = Boolean(venue);
  const hasGifts = giftCards.length > 0;
  const hasRsvp = Boolean(wedding.rsvp_deadline) || invitees.length > 0;

  return (
    <EnvelopeAnimation
      groomName={groomName}
      brideName={brideName}
      weddingDate={formattedEnvelopeDate}
      primaryColor={GOLD}
      accentColor={GOLD}
    >
      <div
        className="w-full overflow-x-hidden lg:px-[25%]"
        style={{
          background: PAPER,
          color: INK,
          fontFamily: SERIF_DISPLAY,
        }}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {hasArabic && <LanguageToggle />}
        {wedding.audio_url && (
          <audio ref={audioRef} loop onTimeUpdate={handleTimeUpdate}>
            <source src={wedding.audio_url} type="audio/mpeg" />
          </audio>
        )}

        {/* Subtle paper grain overlay to match the envelope */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.06] mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(58,42,20,0.6) 1px, transparent 0)",
            backgroundSize: "3px 3px",
          }}
        />

        <div className="relative z-10">
          {/* ===== HERO ===== */}
          <section className="px-6 pt-20 pb-14 md:pt-28 md:pb-20 text-center">
            <AnimatedSection animation="fade-in">
              <EditableField
                fieldId="hero-eyebrow"
                text={getFieldValue("hero-eyebrow", t("hero.theWeddingOf"))}
                style={getFieldStyle("hero-eyebrow")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-center"
                wrapperStyle={{
                  fontFamily: SERIF_LABEL,
                  letterSpacing: "0.46em",
                  textTransform: "uppercase",
                  fontSize: "clamp(11px, 2.6vw, 13px)",
                  color: GOLD,
                }}
              />
              <Hairline />
              <div className="space-y-3">
                <EditableField
                  fieldId="groom-name"
                  text={getFieldValue("groom-name", groomName)}
                  style={getFieldStyle("groom-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h1"
                  wrapperStyle={{
                    fontFamily: SERIF_DISPLAY,
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: INK,
                    fontSize: "clamp(36px, 9vw, 64px)",
                    lineHeight: 1.05,
                  }}
                />
                <p
                  aria-hidden
                  style={{
                    fontFamily: SERIF_DISPLAY,
                    fontStyle: "italic",
                    color: GOLD,
                    fontSize: "clamp(40px, 11vw, 76px)",
                    lineHeight: 1,
                  }}
                >
                  &amp;
                </p>
                <EditableField
                  fieldId="bride-name"
                  text={getFieldValue("bride-name", brideName)}
                  style={getFieldStyle("bride-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h1"
                  wrapperStyle={{
                    fontFamily: SERIF_DISPLAY,
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: INK,
                    fontSize: "clamp(36px, 9vw, 64px)",
                    lineHeight: 1.05,
                  }}
                />
              </div>
              <Hairline />
              <p
                style={{
                  fontFamily: SERIF_LABEL,
                  letterSpacing: "0.46em",
                  textTransform: "uppercase",
                  color: GOLD,
                  fontSize: "clamp(13px, 3.2vw, 16px)",
                  fontWeight: 500,
                }}
              >
                {heroDate}
              </p>
              {(ceremony?.location_name || venue?.location_name) && (
                <p
                  className="mt-4"
                  style={{
                    fontFamily: SERIF_DISPLAY,
                    fontStyle: "italic",
                    color: INK,
                    fontSize: "clamp(15px, 3.6vw, 18px)",
                    opacity: 0.85,
                  }}
                >
                  {getLocalizedValue(
                    "ceremony_location",
                    ceremony?.location_name || venue?.location_name,
                  )}
                </p>
              )}
            </AnimatedSection>
          </section>

          <Hairline />

          {/* ===== OPENING LINE ===== */}
          <section className="px-6 py-14 text-center">
            <AnimatedSection animation="fade-up">
              <HeartGlyph className="block mb-6" />
              <EditableField
                fieldId="opening-line"
                text={getFieldValue(
                  "opening-line",
                  getLocalizedValue(
                    "welcoming_text",
                    wedding.welcoming_text || t("family.defaultInvitation"),
                  ),
                )}
                style={getFieldStyle("opening-line")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
                tag="p"
                wrapperStyle={{
                  fontFamily: SERIF_DISPLAY,
                  fontStyle: "italic",
                  color: INK,
                  fontSize: "clamp(18px, 4.4vw, 24px)",
                  lineHeight: 1.7,
                  maxWidth: "38rem",
                  margin: "0 auto",
                }}
              />
            </AnimatedSection>
          </section>

          {/* ===== OUR STORY ===== */}
          {hasStory && (
            <>
              <Hairline />
              <section className="px-6 py-14 text-center">
                <AnimatedSection animation="fade-up">
                  <Eyebrow>{t("story.title", { defaultValue: "Our Story" })}</Eyebrow>
                  <div className="h-6" />
                  <SectionTitle>
                    {groomName} <span style={{ color: GOLD, fontStyle: "italic" }}>&amp;</span>{" "}
                    {brideName}
                  </SectionTitle>
                  <div className="h-6" />
                  <EditableField
                    fieldId="our-story"
                    text={getFieldValue(
                      "our-story",
                      getLocalizedValue("main_description", wedding.main_description || ""),
                    )}
                    style={getFieldStyle("our-story")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline
                    tag="p"
                    wrapperStyle={{
                      fontFamily: SERIF_DISPLAY,
                      color: INK,
                      fontSize: "clamp(15px, 3.8vw, 18px)",
                      lineHeight: 1.7,
                      maxWidth: "38rem",
                      margin: "0 auto",
                    }}
                  />
                  {gallery[0] && (
                    <div className="mt-10 max-w-md mx-auto">
                      <img
                        src={gallery[0].image_url}
                        alt="Our story"
                        loading="lazy"
                        className="w-full h-[55vw] max-h-[420px] object-cover"
                        style={{
                          filter: "sepia(0.08) saturate(0.95)",
                          objectPosition: `50% ${Math.min(
                            100,
                            Math.max(0, gallery[0].position_y ?? 50),
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </AnimatedSection>
              </section>
            </>
          )}

          {/* ===== CEREMONY ===== */}
          {hasCeremony && (
            <>
              <Hairline />
              <section className="px-6 py-14 text-center">
                <AnimatedSection animation="fade-up">
                  <Eyebrow>{t("events.ceremony")}</Eyebrow>
                  <div className="h-4" />
                  <Icon
                    icon={ceremony!.icon || "material-symbols:church-rounded"}
                    style={{ color: GOLD, fontSize: 28, margin: "0 auto" }}
                    className="block"
                  />
                  <div className="h-3" />
                  <p
                    style={{
                      fontFamily: SERIF_LABEL,
                      letterSpacing: "0.42em",
                      textTransform: "uppercase",
                      color: GOLD,
                      fontSize: "clamp(12px, 3vw, 14px)",
                    }}
                  >
                    {formatTimeTo12Hour(ceremony!.time)}
                  </p>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: SERIF_DISPLAY,
                      fontStyle: "italic",
                      color: INK,
                      fontSize: "clamp(20px, 5vw, 28px)",
                    }}
                  >
                    {getLocalizedValue("ceremony_location", ceremony!.location_name)}
                  </p>
                  {ceremony!.location_link && (
                    <a
                      href={ceremony!.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 underline-offset-4 hover:underline"
                      style={{
                        fontFamily: SERIF_LABEL,
                        letterSpacing: "0.34em",
                        textTransform: "uppercase",
                        color: GOLD,
                        fontSize: "clamp(11px, 2.8vw, 13px)",
                      }}
                    >
                      {t("events.viewOnMap")}
                    </a>
                  )}
                </AnimatedSection>
              </section>
            </>
          )}

          {/* ===== RECEPTION / VENUE ===== */}
          {hasVenue && (
            <>
              <Hairline />
              <section className="px-6 py-14 text-center">
                <AnimatedSection animation="fade-up">
                  <Eyebrow>{t("events.venue")}</Eyebrow>
                  <div className="h-4" />
                  <Icon
                    icon={venue!.icon || "solar:confetti-bold"}
                    style={{ color: GOLD, fontSize: 28, margin: "0 auto" }}
                    className="block"
                  />
                  <div className="h-3" />
                  {welcomeDrink?.time && (
                    <p
                      style={{
                        fontFamily: SERIF_LABEL,
                        letterSpacing: "0.34em",
                        textTransform: "uppercase",
                        color: INK,
                        opacity: 0.7,
                        fontSize: "clamp(11px, 2.8vw, 13px)",
                      }}
                    >
                      {t("events.welcomeDrink")} · {formatTimeTo12Hour(welcomeDrink.time)}
                    </p>
                  )}
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: SERIF_LABEL,
                      letterSpacing: "0.42em",
                      textTransform: "uppercase",
                      color: GOLD,
                      fontSize: "clamp(12px, 3vw, 14px)",
                    }}
                  >
                    {formatTimeTo12Hour(venue!.time)}
                  </p>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: SERIF_DISPLAY,
                      fontStyle: "italic",
                      color: INK,
                      fontSize: "clamp(20px, 5vw, 28px)",
                    }}
                  >
                    {venue!.location_name}
                  </p>
                  {venue!.location_link && (
                    <a
                      href={venue!.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 underline-offset-4 hover:underline"
                      style={{
                        fontFamily: SERIF_LABEL,
                        letterSpacing: "0.34em",
                        textTransform: "uppercase",
                        color: GOLD,
                        fontSize: "clamp(11px, 2.8vw, 13px)",
                      }}
                    >
                      {t("events.viewOnMap")}
                    </a>
                  )}
                </AnimatedSection>
              </section>
            </>
          )}

          {/* ===== SCHEDULE / TIMELINE ===== */}
          {customs.length > 0 && (
            <>
              <Hairline />
              <section className="px-6 py-14">
                <AnimatedSection animation="fade-up">
                  <Eyebrow>{t("schedule.title", { defaultValue: "Schedule" })}</Eyebrow>
                  <div className="h-6" />
                  <ul className="max-w-md mx-auto space-y-6">
                    {customs.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-baseline justify-center gap-4 text-center"
                      >
                        <span
                          style={{
                            fontFamily: SERIF_LABEL,
                            letterSpacing: "0.34em",
                            textTransform: "uppercase",
                            color: GOLD,
                            fontSize: "clamp(11px, 2.8vw, 13px)",
                            minWidth: "5.5rem",
                            textAlign: "right",
                          }}
                        >
                          {formatTimeTo12Hour(c.time)}
                        </span>
                        <HeartGlyph />
                        <span
                          style={{
                            fontFamily: SERIF_DISPLAY,
                            fontStyle: "italic",
                            color: INK,
                            fontSize: "clamp(16px, 4vw, 20px)",
                          }}
                        >
                          {c.location_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AnimatedSection>
              </section>
            </>
          )}

          {/* ===== DRESS CODE ===== */}
          {hasDressCode && (
            <>
              <Hairline />
              <section className="px-6 py-14 text-center">
                <AnimatedSection animation="fade-up">
                  <Eyebrow>{t("dressCode.title", { defaultValue: "Dress Code" })}</Eyebrow>
                  <div className="h-6" />
                  <EditableField
                    fieldId="dress-code"
                    text={getFieldValue("dress-code", wedding.dress_code)}
                    style={getFieldStyle("dress-code")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    wrapperStyle={{
                      fontFamily: SERIF_DISPLAY,
                      fontStyle: "italic",
                      color: INK,
                      fontSize: "clamp(18px, 4.2vw, 22px)",
                    }}
                  />
                </AnimatedSection>
              </section>
            </>
          )}

          {/* ===== COUNTDOWN ===== */}
          <Hairline />
          <section className="px-6 py-14">
            <AnimatedSection animation="fade-up">
              <CountdownTimer targetDate={wedding.wedding_date} />
            </AnimatedSection>
          </section>

          {/* ===== GALLERY ===== */}
          {hasGallery && (
            <>
              <Hairline />
              <section className="px-6 py-14">
                <AnimatedSection animation="fade-up">
                  <Eyebrow>{t("gallery.title", { defaultValue: "Moments" })}</Eyebrow>
                  <div className="h-6" />
                  <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
                    {gallery.slice(0, 6).map((image, index) => (
                      <AnimatedSection
                        key={image.id}
                        delay={index * 80}
                        animation="fade-in"
                      >
                        <div className="aspect-[3/4] overflow-hidden">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || `Gallery ${index + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            style={{
                              filter: "sepia(0.06) saturate(0.95)",
                              objectPosition: `50% ${Math.min(
                                100,
                                Math.max(0, image.position_y ?? 50),
                              )}%`,
                            }}
                          />
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </AnimatedSection>
              </section>
            </>
          )}

          {/* ===== GIFTS ===== */}
          {hasGifts && (
            <>
              <Hairline />
              <section className="px-6 py-14">
                <AnimatedSection animation="fade-up">
                  <Eyebrow>{t("gifts.title")}</Eyebrow>
                  <div className="h-6" />
                  <p
                    className="text-center mb-8"
                    style={{
                      fontFamily: SERIF_DISPLAY,
                      fontStyle: "italic",
                      color: INK,
                      fontSize: "clamp(15px, 3.6vw, 18px)",
                      maxWidth: "34rem",
                      margin: "0 auto",
                    }}
                  >
                    {t("gifts.subtitle")}
                  </p>
                  <GiftCards giftCards={giftCards} isOwner={isOwner} />
                </AnimatedSection>
              </section>
            </>
          )}

          {/* ===== RSVP — dark band moment to echo the envelope's surroundings ===== */}
          {hasRsvp && (
            <section
              className="relative -mx-[max(0px,(100vw-100%)/2)]"
              style={{
                background:
                  "radial-gradient(ellipse at center, hsl(20 14% 10%) 0%, hsl(20 14% 4%) 100%)",
                color: PAPER,
              }}
            >
              <div className="lg:px-[25%] py-14 px-6">
                <AnimatedSection animation="fade-up">
                  <p
                    className="text-center"
                    style={{
                      fontFamily: SERIF_LABEL,
                      letterSpacing: "0.46em",
                      textTransform: "uppercase",
                      color: GOLD,
                      fontSize: "clamp(11px, 2.6vw, 13px)",
                    }}
                  >
                    {t("rsvp.title", { defaultValue: "RSVP" })}
                  </p>
                </AnimatedSection>
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
                />
              </div>
            </section>
          )}

          {/* ===== FOOTER ===== */}
          <Hairline />
          <section className="px-6 py-16 text-center">
            <AnimatedSection animation="fade-in">
              <HeartGlyph className="block mb-4" />
              <EditableField
                fieldId="closing-message"
                text={getFieldValue("closing-message", t("closing.defaultMessage"))}
                style={getFieldStyle("closing-message")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
                tag="p"
                wrapperStyle={{
                  fontFamily: SERIF_DISPLAY,
                  fontStyle: "italic",
                  color: INK,
                  fontSize: "clamp(16px, 4vw, 20px)",
                  lineHeight: 1.7,
                  maxWidth: "36rem",
                  margin: "0 auto",
                }}
              />
              <div className="h-6" />
              <p
                style={{
                  fontFamily: SERIF_LABEL,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: GOLD,
                  fontSize: "clamp(11px, 2.6vw, 13px)",
                }}
              >
                {groomName} <span style={{ color: GOLD }}>&amp;</span> {brideName} ·{" "}
                {heroDate}
              </p>
            </AnimatedSection>
          </section>

          <TemplatePreviewFooter />
        </div>
      </div>
    </EnvelopeAnimation>
  );
};

export default VeronaTemplate;
