import { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Heart } from "lucide-react";

import { EditableField } from "@/components/EditableField";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";
import TemplateLoader from "@/components/templates/TemplateLoader";
import { useHeroLoader } from "@/hooks/useHeroLoader";
import EtoileTornCard from "./etoile/EtoileTornCard";
import EtoileCountdown from "./etoile/EtoileCountdown";
import EtoileEvents from "./etoile/EtoileEvents";
import EtoileGallery from "./etoile/EtoileGallery";
import EtoileGifts from "./etoile/EtoileGifts";
import EtoileRsvp from "./etoile/EtoileRsvp";
import { buildTemplateFontStyle } from "@/components/templateFontDefaults";

interface EtoileTemplateProps {
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

export const EtoileTemplate = ({
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
}: EtoileTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, hasArabic, getLocalizedValue, formatFamily } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselImages = gallery && gallery.length > 0 ? gallery.map((img: any) => img.image_url) : [];

  const { showLoader, fadingOut } = useHeroLoader({ imageUrl: carouselImages[0] });

  const nextSlide = useCallback(() => {
    if (carouselImages.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }
  }, [carouselImages.length]);

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide, carouselImages.length]);

  useEffect(() => {
    if (wedding.audio_url && audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = wedding.audio_start_time || 0;
      audio.loop = true;
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          const playOnInteraction = () => {
            audio.play().catch(() => {});
            document.removeEventListener("click", playOnInteraction);
            document.removeEventListener("touchstart", playOnInteraction);
          };
          document.addEventListener("click", playOnInteraction);
          document.addEventListener("touchstart", playOnInteraction);
        });
      }
    }
  }, [wedding.audio_url, wedding.audio_start_time]);

  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");
    return () => {
      document.documentElement.dir = "ltr";
      document.documentElement.classList.remove("hide-scrollbar");
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    applyFadeLoop(audio, wedding.audio_start_time || 0, wedding.audio_end_time, 0.5);
  };

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";
  const weddingDate = new Date(wedding.wedding_date);
  const dateFormatted = weddingDate.toLocaleDateString(dateLocale, { day: "numeric", month: "long" });

  const welcomeDrinkLoc = locations.find((loc) => loc.type === "welcome_drink");
  const orderOf = (loc: any) =>
    typeof loc?.display_order === "number" ? loc.display_order : 999;

  const rawTimelineEntries: Array<{ order: number; event: any }> = [];
  if (ceremony) {
    rawTimelineEntries.push({
      order: orderOf(ceremony),
      event: {
        id: "ceremony",
        title: t("events.ceremony"),
        time: formatTimeTo12Hour(ceremony.time) || "7:00 PM",
        location: getLocalizedValue("ceremony_location", ceremony.location_name),
        link: ceremony.location_link,
        icon: ceremony.icon || "material-symbols:church-rounded",
      },
    });
  }
  if (venue) {
    if (welcomeDrinkLoc) {
      rawTimelineEntries.push({
        order: orderOf(welcomeDrinkLoc),
        event: {
          id: "welcome-drink",
          title: t("events.welcomeDrink"),
          time: formatTimeTo12Hour(welcomeDrinkLoc.time || venue.time) || "8:00 PM",
          location: getLocalizedValue("venue_location", venue.location_name),
          link: venue.location_link,
          icon: welcomeDrinkLoc.icon || "asset:cheers",
        },
      });
    }
    rawTimelineEntries.push({
      order: orderOf(venue),
      event: {
        id: "dinner-party",
        title: t("events.dinnerParty"),
        time: formatTimeTo12Hour(venue.time) || "8:30 PM",
        location: getLocalizedValue("venue_location", venue.location_name),
        link: venue.location_link,
        icon: venue.icon || "solar:confetti-bold",
      },
    });
  }
  locations
    .filter((loc: any) => typeof loc.type === "string" && loc.type.startsWith("custom_"))
    .forEach((loc: any) => {
      rawTimelineEntries.push({
        order: orderOf(loc),
        event: {
          id: loc.type,
          title: getLocalizedValue(`custom_title_${loc.type}`, loc.custom_title || "Event"),
          time: formatTimeTo12Hour(loc.time) || "",
          location: getLocalizedValue(`custom_location_${loc.type}`, loc.location_name || ""),
          link: loc.location_link,
          icon: loc.icon || "solar:confetti-bold",
        },
      });
    });
  const hasAnyOrder = rawTimelineEntries.some((e) => e.order > 0);
  if (hasAnyOrder) {
    rawTimelineEntries.sort((a, b) => a.order - b.order);
  }
  // Always place welcome drink directly before the venue dinner party.
  const wdIdx = rawTimelineEntries.findIndex((e) => e.event.id === "welcome-drink");
  const dpIdx = rawTimelineEntries.findIndex((e) => e.event.id === "dinner-party");
  if (wdIdx !== -1 && dpIdx !== -1 && wdIdx !== dpIdx - 1) {
    const [wd] = rawTimelineEntries.splice(wdIdx, 1);
    const newDpIdx = rawTimelineEntries.findIndex((e) => e.event.id === "dinner-party");
    rawTimelineEntries.splice(newDpIdx, 0, wd);
  }
  const timelineEvents = rawTimelineEntries.map((e) => e.event);

  const hasGiftCards = giftCards && giftCards.length > 0;
  const quoteDefault = '"Two are better than one. For if they fall, one will lift up the other."';
  const referenceDefault = "— Ecclesiastes 4:9-12";
  const quoteText = isArabic
    ? getLocalizedValue("aura_quote", getFieldValue("bible-verse", quoteDefault))
    : getFieldValue("bible-verse", quoteDefault);
  const referenceText = isArabic
    ? getLocalizedValue("aura_reference", getFieldValue("bible-verse-reference", referenceDefault))
    : getFieldValue("bible-verse-reference", referenceDefault);

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden lg:px-[25%]"
      style={buildTemplateFontStyle("etoile-carousel", wedding.template_fonts)}
      dir="ltr"
    >
      {showLoader && (
        <TemplateLoader groomName={wedding.groom_name} brideName={wedding.bride_name} fadingOut={fadingOut} />
      )}
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* Layer 1: Fixed background carousel */}
      <div className="fixed inset-0 z-0 lg:left-[25%] lg:right-auto lg:w-[50%]">
        {carouselImages.map((src: string, index: number) => (
          <img
            key={index}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: index === currentSlide ? 1 : 0 }}
          />
        ))}
        {carouselImages.length === 0 && <div className="absolute inset-0 bg-black" />}
      </div>

      {/* Layer 2: Dark overlay */}
      <div className="fixed inset-0 bg-black/30 z-[1] lg:left-[25%] lg:right-auto lg:w-[50%]" />

      {/* Layer 3: Scrollable content */}
      <div className="relative z-[2]" dir={isArabic ? "rtl" : "ltr"}>
        {/* ===== HERO SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center text-white">
          <div className="relative z-10 px-4 max-w-2xl">
            <div style={{ animation: "gentleFadeUp 1.2s ease-out both" }}>
              <EditableField
                fieldId="hero-subtitle"
                text={getFieldValue("hero-subtitle", t("hero.theWeddingOf"))}
                style={getFieldStyle("hero-subtitle")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="span"
                className="text-lg md:text-xl tracking-[0.3em] uppercase"
              />
            </div>
            <div className="space-y-4 mt-[9rem] mb-[9rem]">
              <div className="text-left pl-4 md:pl-12" style={{ animation: "slideFromLeft 1.5s ease-out 0.3s both" }}>
                <EditableField
                  fieldId="groom-name"
                  text={getFieldValue("groom-name", getLocalizedValue("groom_name", wedding.groom_name))}
                  style={getFieldStyle("groom-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h1"
                  className="text-template-title"
                />
              </div>
              <span
                className="block text-4xl md:text-5xl text-white text-center italic"
                style={{ animation: "heartPulseIn 1.2s ease-out 0.8s both", fontFamily: "var(--font-template-subtitle)" }}
              >
                &amp;
              </span>
              <div className="text-right pr-4 md:pr-12" style={{ animation: "slideFromRight 1.5s ease-out 0.3s both" }}>
                <EditableField
                  fieldId="bride-name"
                  text={getFieldValue("bride-name", getLocalizedValue("bride_name", wedding.bride_name))}
                  style={getFieldStyle("bride-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h1"
                  className="text-template-title"
                />
              </div>
            </div>
            <div style={{ animation: "gentleFadeUp 1.2s ease-out 1.2s both" }}>
              <EditableField
                fieldId="wedding-date-display"
                text={getFieldValue(
                  "wedding-date-display",
                  weddingDate.toLocaleDateString(dateLocale, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                )}
                style={getFieldStyle("wedding-date-display")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="span"
                className="text-xl md:text-2xl tracking-[0.2em]"
              />
            </div>
          </div>
          <div className="absolute bottom-8 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white" />
          </div>
        </section>

        {/* ===== FAMILY NAMES — LEFT ===== */}
        <section id="family-section-etoile">
          <EtoileTornCard align="left">
            <div className="py-16 px-4 text-center">
              <AnimatedSection animation="fade-up">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="space-y-3">
                    <div className="w-12 h-px bg-[#3e2723]/40 mx-auto" />
                    <EditableField
                      fieldId="bible-verse"
                      text={quoteText}
                      style={getFieldStyle("bible-verse")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      tag="p"
                      className="text-template-body italic text-[#3e2723]/80"
                    />
                    <EditableField
                      fieldId="bible-verse-reference"
                      text={referenceText}
                      style={getFieldStyle("bible-verse-reference")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      tag="p"
                      className="text-sm text-[#3e2723]/60"
                    />
                    <div className="w-12 h-px bg-[#3e2723]/40 mx-auto" />
                   </div>
                  <p className="text-template-body text-[#3e2723]">{getLocalizedValue("welcoming_text", wedding.welcoming_text || t("family.introLine"))}</p>
                  <div className="space-y-4">
                    <EditableField
                      fieldId="groom-family"
                      text={formatFamily(
                        "groom_family",
                        getFieldValue(
                          "groom-family",
                          wedding.groom_family || "Groom",
                        ),
                      )}
                      style={getFieldStyle("groom-family")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      tag="h2"
                      className="text-template-subtitle whitespace-pre-line"
                    />
                    <p className="text-2xl text-[#3e2723] text-template-subtitle">&</p>
                    <EditableField
                      fieldId="bride-family"
                      text={formatFamily(
                        "bride_family",
                        getFieldValue(
                          "bride-family",
                          wedding.bride_family || "Bride's Family",
                        ),
                      )}
                      style={getFieldStyle("bride-family")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      tag="h2"
                      className="text-template-subtitle whitespace-pre-line"
                    />
                  </div>
                  <EditableField
                    fieldId="invitation-text"
                    text={getFieldValue(
                      "invitation-text",
                      getLocalizedValue("main_description", wedding.main_description || t("family.defaultInvitation")),
                    )}
                    style={getFieldStyle("invitation-text")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline={true}
                    tag="p"
                    className="text-template-body text-[#3e2723]"
                  />
                </div>
              </AnimatedSection>
            </div>
          </EtoileTornCard>
        </section>

        {/* ===== COUNTDOWN — RIGHT ===== */}
        <div className="mt-64">
          <EtoileCountdown targetDate={wedding.wedding_date} align="right" />
        </div>

        {/* ===== EVENTS — LEFT ===== */}
        <div className="mt-64">
          <EtoileEvents events={timelineEvents} dateFormatted={dateFormatted} align="left" />
        </div>

        {/* ===== GALLERY — RIGHT ===== */}
        {gallery && gallery.length > 0 && (
          <div className="mt-64">
            <EtoileGallery images={gallery} align="right" />
          </div>
        )}

        {/* ===== GIFTS — LEFT ===== */}
        {hasGiftCards && (
          <div className="mt-64">
            <EtoileGifts giftCards={giftCards} align="left" />
          </div>
        )}

        {/* ===== RSVP — RIGHT ===== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <div className="mt-64">
            <EtoileRsvp
              wedding={wedding}
              isPreview={isPreview}
              invitees={invitees}
              rsvpResponses={rsvpResponses}
              handleRsvpToggle={handleRsvpToggle}
              handleRsvpSubmit={handleRsvpSubmit}
              numberOfPersons={numberOfPersons}
              isRsvpDeadlinePassed={isRsvpDeadlinePassed}
              submittingRsvp={submittingRsvp}
              align="right"
            />
          </div>
        )}

        {/* ===== FOOTER — LEFT ===== */}
        <div className="mt-64">
          <div className="bg-white w-full">
            <TemplatePreviewFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtoileTemplate;
