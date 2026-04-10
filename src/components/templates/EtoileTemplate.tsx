import { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
        {/* ===== MONOGRAM SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-[5rem] md:text-[7rem] font-light text-white tracking-wider opacity-0 animate-[curtainLeft_1s_ease-out_0.2s_forwards]">
              {wedding.groom_name?.charAt(0)?.toUpperCase() || "G"}
            </span>
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white/70 opacity-0 animate-[zoomIn_0.8s_ease-out_0.7s_forwards]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-[5rem] md:text-[7rem] font-light text-white tracking-wider opacity-0 animate-[curtainRight_1s_ease-out_0.2s_forwards]">
              {wedding.bride_name?.charAt(0)?.toUpperCase() || "B"}
            </span>
          </div>
        </section>

        {/* ===== HERO SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center">
          <div className="px-6 py-16 max-w-xl mx-auto space-y-10">
            <div className="space-y-3 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.1s_forwards]">
              <div className="w-12 h-px bg-white/40 mx-auto" />
              <EditableField
                fieldId="bible-verse"
                text={getFieldValue(
                  "bible-verse",
                  getLocalizedValue(
                    "quote",
                    '"Two are better than one. For if they fall, one will lift up the other."',
                  ),
                )}
                style={getFieldStyle("bible-verse")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-body italic max-w-sm mx-auto leading-relaxed text-white/80"
              />
              <EditableField
                fieldId="bible-verse-reference"
                text={getFieldValue("bible-verse-reference", getLocalizedValue("reference", "— Ecclesiastes 4:9-12"))}
                style={getFieldStyle("bible-verse-reference")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-small text-white/60 mt-1"
              />
              <div className="w-12 h-px bg-white/40 mx-auto" />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.25s_forwards]">
              <EditableField
                fieldId="together-text"
                text={getFieldValue("together-text", t("aura.togetherWithFamilies"))}
                style={getFieldStyle("together-text")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-small tracking-[0.3em] text-white/70"
              />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                <div className="text-center space-y-1">
                  <EditableField
                    fieldId="groom-parents"
                    text={getFieldValue("groom-parents", t("aura.mrAndMrs"))}
                    style={getFieldStyle("groom-parents")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-template-small font-medium tracking-wide text-white/90"
                  />
                  <EditableField
                    fieldId="groom-family-name"
                    text={getFieldValue(
                      "groom-family-name",
                      getLocalizedValue(
                        "groom_family",
                        wedding.groom_family || wedding.groom_name.split(" ").pop() || "Family",
                      ),
                    )}
                    style={getFieldStyle("groom-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-template-subtitle text-white"
                  />
                </div>
                <span className="text-template-subtitle font-light text-white/70">&</span>
                <div className="text-center space-y-1">
                  <EditableField
                    fieldId="bride-parents"
                    text={getFieldValue("bride-parents", t("aura.mrAndMrs"))}
                    style={getFieldStyle("bride-parents")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-template-small font-medium tracking-wide text-white/90"
                  />
                  <EditableField
                    fieldId="bride-family-name"
                    text={getFieldValue(
                      "bride-family-name",
                      getLocalizedValue(
                        "bride_family",
                        wedding.bride_family || wedding.bride_name.split(" ").pop() || "Family",
                      ),
                    )}
                    style={getFieldStyle("bride-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-template-subtitle text-white"
                  />
                </div>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeIn_0.7s_ease-out_0.55s_forwards]">
              <EditableField
                fieldId="invitation-line"
                text={getFieldValue(
                  "invitation-line",
                  getLocalizedValue("main_description", wedding.main_description || t("family.defaultInvitation")),
                )}
                style={getFieldStyle("invitation-line")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-template-body text-white/70 whitespace-pre-line leading-relaxed"
              />
            </div>

            <div className="opacity-0 animate-[scaleIn_0.7s_ease-out_0.7s_forwards]">
              <h1 className="text-template-title text-white">
                {getLocalizedValue("groom_name", wedding.groom_name)} &{" "}
                {getLocalizedValue("bride_name", wedding.bride_name)}
              </h1>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.85s_forwards]">
              <div className="space-y-3">
                <div className="w-16 h-px bg-white/30 mx-auto" />
                <EditableField
                  fieldId="wedding-date-formatted"
                  text={getFieldValue(
                    "wedding-date-formatted",
                    weddingDate.toLocaleDateString(dateLocale, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                  )}
                  style={getFieldStyle("wedding-date-formatted")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-template-body font-semibold tracking-wide text-white"
                />
              </div>
            </div>
          </div>
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
