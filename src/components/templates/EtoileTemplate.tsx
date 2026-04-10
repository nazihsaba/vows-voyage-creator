import { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/EditableField";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";
import LumiereCountdown from "./lumiere/LumiereCountdown";
import LumiereEvents from "./lumiere/LumiereEvents";
import LumiereGallery from "./lumiere/LumiereGallery";
import LumiereGifts from "./lumiere/LumiereGifts";
import LumiereRsvp from "./lumiere/LumiereRsvp";
import LumiereTornCard from "./lumiere/LumiereTornCard";

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
  const { isArabic, hasArabic, getLocalizedValue } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");
  const [hasStarted, setHasStarted] = useState(false);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselImages = gallery && gallery.length > 0 ? gallery.map((img: any) => img.image_url) : [];

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
    if (audio && wedding.audio_end_time && audio.currentTime >= wedding.audio_end_time) {
      audio.currentTime = wedding.audio_start_time || 0;
    }
  };

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";
  const weddingDate = new Date(wedding.wedding_date);
  const dateFormatted = weddingDate.toLocaleDateString(dateLocale, { day: "numeric", month: "long" });

  const timelineEvents = [
    ...(ceremony
      ? [
          {
            id: "ceremony",
            title: t("events.ceremony"),
            time: formatTimeTo12Hour(ceremony.time) || "7:00 PM",
            location: getLocalizedValue("ceremony_location", ceremony.location_name),
            link: ceremony.location_link,
            icon: ceremony.icon || "material-symbols:church-rounded",
          },
        ]
      : []),
    ...(venue
      ? [
          {
            id: "venue",
            title: t("events.venue"),
            time: formatTimeTo12Hour(venue.time) || "8:00 PM",
            location: venue.location_name,
            link: venue.location_link,
            icon: venue.icon || "solar:confetti-bold",
          },
        ]
      : []),
  ];

  const hasGiftCards = giftCards && giftCards.length > 0;

  return (
    <div className="w-full min-h-screen font-serif overflow-x-hidden lg:px-[25%]" dir={isArabic ? "rtl" : "ltr"}>
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* Layer 1: Fixed background carousel */}
      <div className="fixed inset-0 z-0 lg:left-[25%] lg:w-[50%]">
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
      <div className="fixed inset-0 bg-black/30 z-[1] lg:left-[25%] lg:w-[50%]" />

      {/* Layer 3: Scrollable content */}
      <div className="relative z-[2]">
        {/* ===== HERO SECTION (Vérité-style) ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center text-white">
          <div className="relative z-10 space-y-6 px-4 max-w-2xl animate-fade-in">
            <EditableField
              fieldId="hero-subtitle"
              text={getFieldValue("hero-subtitle", t("hero.theWeddingOf"))}
              style={getFieldStyle("hero-subtitle")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-template-small"
            />
            <div className="space-y-2">
              <EditableField
                fieldId="groom-name"
                text={getFieldValue("groom-name", getLocalizedValue("groom_name", wedding.groom_name))}
                style={getFieldStyle("groom-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h1"
                className="text-template-title"
              />
              <p className="text-4xl md:text-5xl">&</p>
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
              tag="p"
              className="text-template-body tracking-wide"
            />
            {!hasStarted && (
              <Button
                onClick={() => {
                  setHasStarted(true);
                  setTimeout(() => {
                    document.getElementById("family-section-etoile")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="mt-8 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm"
              >
                {t("hero.tapToStart")}
              </Button>
            )}
          </div>
          <div className="absolute bottom-8 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white" />
          </div>
        </section>

        {/* ===== FAMILY NAMES with ripped borders ===== */}
        <section id="family-section-etoile">
          <LumiereTornCard>
            <div className="py-16 px-4 text-center">
              <AnimatedSection animation="fade-up">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="space-y-4">
                    <EditableField
                      fieldId="groom-family"
                      text={t("family.theFamily", { name: getFieldValue("groom-family", getLocalizedValue("groom_family", wedding.groom_family || "Groom")) })}
                      style={getFieldStyle("groom-family")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      tag="h2"
                      className="text-template-subtitle text-[#3e2723]"
                    />
                    <p className="text-2xl text-[#3e2723]">&</p>
                    <EditableField
                      fieldId="bride-family"
                      text={t("family.theFamily", { name: getFieldValue("bride-family", getLocalizedValue("bride_family", wedding.bride_family || "Bride's Family")) })}
                      style={getFieldStyle("bride-family")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      tag="h2"
                      className="text-template-subtitle text-[#3e2723]"
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
          </LumiereTornCard>
        </section>

        {/* ===== COUNTDOWN ===== */}
        <div className="mt-64">
          <LumiereCountdown targetDate={wedding.wedding_date} />
        </div>

        {/* ===== EVENTS ===== */}
        <div className="mt-64">
          <LumiereEvents events={timelineEvents} dateFormatted={dateFormatted} />
        </div>

        {/* ===== GALLERY ===== */}
        {gallery && gallery.length > 0 && (
          <div className="mt-64">
            <LumiereGallery images={gallery} />
          </div>
        )}

        {/* ===== GIFTS ===== */}
        {hasGiftCards && (
          <div className="mt-64">
            <LumiereGifts giftCards={giftCards} />
          </div>
        )}

        {/* ===== RSVP ===== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <div className="mt-64">
            <LumiereRsvp
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
        )}

        <div className="mt-64">
          <TemplatePreviewFooter />
        </div>
      </div>
    </div>
  );
};

export default EtoileTemplate;
