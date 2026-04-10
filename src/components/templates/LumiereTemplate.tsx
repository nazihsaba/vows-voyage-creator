import { useRef, useEffect } from "react";
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

interface LumiereTemplateProps {
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

export const LumiereTemplate = ({
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
}: LumiereTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, hasArabic, getLocalizedValue } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

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
    return () => { document.documentElement.dir = 'ltr'; };
  }, []);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && wedding.audio_end_time && audio.currentTime >= wedding.audio_end_time) {
      audio.currentTime = wedding.audio_start_time || 0;
    }
  };

  const videoUrl = wedding.video_url || wedding.hero_media;
  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";
  const weddingDate = new Date(wedding.wedding_date);
  const dateFormatted = weddingDate.toLocaleDateString(dateLocale, { day: "numeric", month: "long" });

  const timelineEvents = [
    ...(ceremony ? [{
      id: "ceremony",
      title: t("events.ceremony"),
      time: formatTimeTo12Hour(ceremony.time) || "7:00 PM",
      location: getLocalizedValue("ceremony_location", ceremony.location_name),
      link: ceremony.location_link,
      icon: ceremony.icon || "material-symbols:church-rounded",
    }] : []),
    ...(venue ? [{
      id: "venue",
      title: t("events.venue"),
      time: formatTimeTo12Hour(venue.time) || "8:00 PM",
      location: venue.location_name,
      link: venue.location_link,
      icon: venue.icon || "solar:confetti-bold",
    }] : []),
  ];

  const hasGiftCards = giftCards && giftCards.length > 0;

  return (
    <div className="relative w-full min-h-screen" dir={isArabic ? 'rtl' : 'ltr'}>
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* Layer 1: Fixed background video */}
      {videoUrl && (
        <video
          className="fixed inset-0 w-full h-[100dvh] object-cover z-0"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Layer 2: Dark overlay */}
      <div className="fixed inset-0 bg-black/30 z-[1]" />

      {/* Layer 3: Scrollable content */}
      <div className="relative z-[2]">
        {/* ===== HERO SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center">
          <div className="px-6 py-16 max-w-xl mx-auto space-y-10">
            <div className="space-y-3 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.1s_forwards]">
              <div className="w-12 h-px bg-white/40 mx-auto" />
              <EditableField
                fieldId="bible-verse"
                text={getFieldValue(
                  "bible-verse",
                  getLocalizedValue("quote", '"Two are better than one. For if they fall, one will lift up the other."'),
                )}
                style={getFieldStyle("bible-verse")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="font-['Montserrat'] text-sm italic max-w-sm mx-auto leading-relaxed text-white/80"
              />
              <EditableField
                fieldId="bible-verse-reference"
                text={getFieldValue("bible-verse-reference", getLocalizedValue("reference", "— Ecclesiastes 4:9-12"))}
                style={getFieldStyle("bible-verse-reference")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="font-['Montserrat'] text-xs text-white/60 mt-1"
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
                className="font-['Montserrat'] text-xs tracking-[0.3em] text-white/70 uppercase"
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
                    className="font-['Montserrat'] text-sm font-medium tracking-wide text-white/90"
                  />
                  <EditableField
                    fieldId="groom-family-name"
                    text={getFieldValue(
                      "groom-family-name",
                      getLocalizedValue("groom_family", wedding.groom_family || wedding.groom_name.split(" ").pop() || "Family"),
                    )}
                    style={getFieldStyle("groom-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="font-['Dancing_Script'] text-2xl text-white"
                  />
                </div>
                <span className="text-3xl font-light text-white/70">&</span>
                <div className="text-center space-y-1">
                  <EditableField
                    fieldId="bride-parents"
                    text={getFieldValue("bride-parents", t("aura.mrAndMrs"))}
                    style={getFieldStyle("bride-parents")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="font-['Montserrat'] text-sm font-medium tracking-wide text-white/90"
                  />
                  <EditableField
                    fieldId="bride-family-name"
                    text={getFieldValue(
                      "bride-family-name",
                      getLocalizedValue("bride_family", wedding.bride_family || wedding.bride_name.split(" ").pop() || "Family"),
                    )}
                    style={getFieldStyle("bride-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="font-['Dancing_Script'] text-2xl text-white"
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
                className="font-['Montserrat'] text-sm text-white/70 whitespace-pre-line leading-relaxed"
              />
            </div>

            <div className="opacity-0 animate-[scaleIn_0.7s_ease-out_0.7s_forwards]">
              <h1 className="font-['Dancing_Script'] text-5xl md:text-6xl text-white">
                {getLocalizedValue("groom_name", wedding.groom_name)} & {getLocalizedValue("bride_name", wedding.bride_name)}
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
                  className="font-['Montserrat'] text-sm font-semibold tracking-wide text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== COUNTDOWN ===== */}
        <LumiereCountdown targetDate={wedding.wedding_date} />

        {/* ===== EVENTS ===== */}
        <LumiereEvents events={timelineEvents} dateFormatted={dateFormatted} />

        {/* ===== GALLERY ===== */}
        {gallery && gallery.length > 0 && (
          <LumiereGallery images={gallery} />
        )}

        {/* ===== GIFTS ===== */}
        {hasGiftCards && (
          <LumiereGifts giftCards={giftCards} />
        )}

        {/* ===== RSVP ===== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
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
        )}

        <TemplatePreviewFooter />
      </div>
    </div>
  );
};
