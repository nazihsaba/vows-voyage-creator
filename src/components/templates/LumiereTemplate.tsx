import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { EditableField } from "@/components/EditableField";
import { CountdownTimer } from "@/components/CountdownTimer";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import VideoBackground from "@/components/templates/shared/VideoBackground";
import { GiftCards } from "@/components/GiftCards";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";
import { ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import gracePreviewVideo from "@/assets/grace-preview-video.mp4";

/* Torn / deckled edge SVG — placed at top or bottom of white sections */
const TornEdgeTop = () => (
  <div className="relative w-full -mt-px">
    <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="block w-full h-[30px] md:h-[40px]">
      <path
        d="M0,40 C60,38 90,10 120,12 C150,14 180,35 240,32 C300,29 330,8 390,10 C450,12 480,30 540,28 C600,26 630,6 690,8 C750,10 780,32 840,30 C900,28 930,5 990,8 C1050,11 1080,28 1140,26 C1200,24 1230,8 1290,10 C1350,12 1380,30 1440,28 L1440,40 L0,40 Z"
        fill="white"
      />
    </svg>
  </div>
);

const TornEdgeBottom = () => (
  <div className="relative w-full -mb-px">
    <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="block w-full h-[30px] md:h-[40px]">
      <path
        d="M0,0 C60,2 90,30 120,28 C150,26 180,5 240,8 C300,11 330,32 390,30 C450,28 480,10 540,12 C600,14 630,34 690,32 C750,30 780,8 840,10 C900,12 930,35 990,32 C1050,29 1080,12 1140,14 C1200,16 1230,32 1290,30 C1350,28 1380,10 1440,12 L1440,0 L0,0 Z"
        fill="white"
      />
    </svg>
  </div>
);

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
  const { t, i18n } = useTranslation();
  const { isArabic, hasArabic, getLocalizedValue } = useArabicContent(wedding);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");
  const videoUrl = wedding.video_url || gracePreviewVideo;

  useEffect(() => {
    if (!hasStarted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [hasStarted]);

  useEffect(() => {
    return () => { document.documentElement.dir = "ltr"; };
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current && wedding.audio_end_time) {
      if (audioRef.current.currentTime >= wedding.audio_end_time) {
        audioRef.current.currentTime = wedding.audio_start_time || 0;
      }
    }
  };

  const handleStartClick = async () => {
    setHasStarted(true);
    if (wedding.audio_url && audioRef.current) {
      const audio = audioRef.current;
      const startTime = wedding.audio_start_time || 0;
      if (startTime > 0) {
        audio.currentTime = startTime;
        await new Promise<void>((resolve) => {
          audio.addEventListener("seeked", () => resolve(), { once: true });
        });
      }
      try { await audio.play(); } catch (err) { console.log("Audio playback failed:", err); }
    }
    setTimeout(() => {
      document.getElementById("lumiere-story")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";

  return (
    <div className="w-full overflow-x-hidden font-serif" dir={isArabic ? "rtl" : "ltr"}>
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} preload="auto" onTimeUpdate={handleTimeUpdate}>
          <source src={wedding.audio_url} type="audio/mpeg" />
        </audio>
      )}

      {/* Fixed Video Background */}
      <VideoBackground videoUrl={videoUrl} overlayOpacity={0.3} fixed />

      {/* Scrollable Foreground */}
      <div className="relative z-10">
        {/* Hero — video shows through */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center text-white px-4">
          <div className="space-y-6 max-w-2xl animate-fade-in">
            <EditableField
              fieldId="hero-subtitle"
              text={getFieldValue("hero-subtitle", t("hero.theWeddingOf"))}
              style={getFieldStyle("hero-subtitle")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-template-small text-white/80"
            />
            <div className="space-y-2">
              <EditableField
                fieldId="groom-name"
                text={getFieldValue("groom-name", getLocalizedValue("groom_name", wedding.groom_name))}
                style={getFieldStyle("groom-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h1"
                className="text-template-title text-white"
              />
              <p className="text-4xl md:text-5xl text-white/90">&</p>
              <EditableField
                fieldId="bride-name"
                text={getFieldValue("bride-name", getLocalizedValue("bride_name", wedding.bride_name))}
                style={getFieldStyle("bride-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h1"
                className="text-template-title text-white"
              />
            </div>
            <EditableField
              fieldId="wedding-date-display"
              text={getFieldValue(
                "wedding-date-display",
                new Date(wedding.wedding_date).toLocaleDateString(dateLocale, {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })
              )}
              style={getFieldStyle("wedding-date-display")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-template-body tracking-wide text-white/90"
            />
            {!hasStarted && (
              <Button
                onClick={handleStartClick}
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

        {/* ─── White Section: Story / Family ─── */}
        <TornEdgeTop />
        <section id="lumiere-story" className="bg-white py-16 text-center text-[#3e2723]">
          <AnimatedSection animation="fade-up">
            <div className="max-w-xl mx-auto px-6 space-y-8">
              <EditableField
                fieldId="invitation-text"
                text={getFieldValue(
                  "invitation-text",
                  getLocalizedValue("main_description", wedding.main_description || t("family.defaultInvitation"))
                )}
                style={getFieldStyle("invitation-text")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
                tag="p"
                className="text-template-body"
              />
              <div className="space-y-2">
                <EditableField
                  fieldId="groom-family"
                  text={getFieldValue("groom-family", getLocalizedValue("groom_family", wedding.groom_family || "Groom's Family"))}
                  style={getFieldStyle("groom-family")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h2"
                  className="text-template-subtitle font-bold"
                />
                <EditableField
                  fieldId="bride-family"
                  text={getFieldValue("bride-family", getLocalizedValue("bride_family", wedding.bride_family || "Bride's Family"))}
                  style={getFieldStyle("bride-family")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h2"
                  className="text-template-subtitle font-bold"
                />
              </div>
              <p className="text-template-body text-gray-600">{t("family.kindlyJoin", "Kindly join us as we unite in marriage.")}</p>
              <div className="space-y-1">
                <EditableField
                  fieldId="groom-name-story"
                  text={getFieldValue("groom-name-story", getLocalizedValue("groom_name", wedding.groom_name))}
                  style={getFieldStyle("groom-name-story")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h2"
                  className="text-template-title text-[#3e2723]"
                />
                <p className="text-2xl">&</p>
                <EditableField
                  fieldId="bride-name-story"
                  text={getFieldValue("bride-name-story", getLocalizedValue("bride_name", wedding.bride_name))}
                  style={getFieldStyle("bride-name-story")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h2"
                  className="text-template-title text-[#3e2723]"
                />
              </div>
              <EditableField
                fieldId="wedding-date-story"
                text={getFieldValue(
                  "wedding-date-story",
                  new Date(wedding.wedding_date).toLocaleDateString(dateLocale, {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })
                )}
                style={getFieldStyle("wedding-date-story")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-body"
              />
            </div>
          </AnimatedSection>
        </section>
        <TornEdgeBottom />

        {/* Video gap — countdown area */}
        <section className="py-16 px-4">
          <div className="relative z-10">
            <CountdownTimer targetDate={wedding.wedding_date} variant="dark" />
          </div>
        </section>

        {/* ─── White Section: Ceremony ─── */}
        {ceremony && (
          <>
            <TornEdgeTop />
            <section className="bg-white py-16 text-center text-[#3e2723]">
              <AnimatedSection animation="fade-up">
                <div className="max-w-xl mx-auto px-6 space-y-6">
                  <h2 className="text-template-title">{t("events.ceremony")}</h2>
                  <MapPin className="w-6 h-6 mx-auto text-[#3e2723]" />
                  <p className="text-template-body">
                    {getLocalizedValue("ceremony_location", ceremony.location_name)}
                    {ceremony.time ? ` - ${formatTimeTo12Hour(ceremony.time)}` : ""}
                  </p>
                  {ceremony.location_link && (
                    <a
                      href={ceremony.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block border border-[#3e2723] text-[#3e2723] px-8 py-2 rounded-sm transition-colors hover:bg-[#3e2723] hover:text-white"
                    >
                      {t("events.viewOnMap", "Map")}
                    </a>
                  )}
                </div>
              </AnimatedSection>
            </section>
            <TornEdgeBottom />
          </>
        )}

        {/* ─── White Section: Venue ─── */}
        {venue && (
          <>
            <TornEdgeTop />
            <section className="bg-white py-16 text-center text-[#3e2723]">
              <AnimatedSection animation="fade-up">
                <div className="max-w-xl mx-auto px-6 space-y-6">
                  <h2 className="text-template-title">{t("events.venue")}</h2>
                  <MapPin className="w-6 h-6 mx-auto text-[#3e2723]" />
                  <p className="text-template-body">
                    {getLocalizedValue("venue_location", venue.location_name)}
                    {venue.time ? ` - ${formatTimeTo12Hour(venue.time)}` : ""}
                  </p>
                  {venue.location_link && (
                    <a
                      href={venue.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block border border-[#3e2723] text-[#3e2723] px-8 py-2 rounded-sm transition-colors hover:bg-[#3e2723] hover:text-white"
                    >
                      {t("events.viewOnMap", "Map")}
                    </a>
                  )}
                </div>
              </AnimatedSection>
            </section>
            <TornEdgeBottom />
          </>
        )}

        {/* ─── White Section: Gift Cards ─── */}
        {giftCards.length > 0 && (
          <>
            <TornEdgeTop />
            <section className="bg-white py-16 text-center text-[#3e2723]">
              <AnimatedSection animation="fade-up">
                <div className="max-w-xl mx-auto px-6 space-y-6">
                  <h2 className="text-template-title">{t("gifts.title")}</h2>
                  <p className="text-template-body text-gray-600">{t("gifts.subtitle")}</p>
                  <GiftCards giftCards={giftCards} isOwner={isOwner} />
                </div>
              </AnimatedSection>
            </section>
            <TornEdgeBottom />
          </>
        )}

        {/* ─── White Section: RSVP ─── */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <>
            <TornEdgeTop />
            <div className="bg-white">
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
            <TornEdgeBottom />
          </>
        )}

        {/* Closing — over video */}
        <AnimatedSection animation="fade-in">
          <section className="py-16 px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <EditableField
                fieldId="closing-message"
                text={getFieldValue("closing-message", t("closing.defaultMessage"))}
                style={getFieldStyle("closing-message")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
                tag="p"
                className="text-template-body text-white"
              />
            </div>
          </section>
        </AnimatedSection>

        {/* Footer */}
        <div className="bg-white">
          <TemplatePreviewFooter />
        </div>
      </div>
    </div>
  );
};
