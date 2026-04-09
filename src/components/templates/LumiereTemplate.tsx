import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { EditableField } from "@/components/EditableField";
import { CountdownTimer } from "@/components/CountdownTimer";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import VideoBackground from "@/components/templates/shared/VideoBackground";
import EventDetailsSection from "@/components/templates/shared/EventDetailsSection";
import GiftCardsSection from "@/components/templates/shared/GiftCardsSection";
import GallerySection from "@/components/templates/shared/GallerySection";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import gracePreviewVideo from "@/assets/grace-preview-video.mp4";

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
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [hasStarted]);

  useEffect(() => {
    return () => {
      document.documentElement.dir = "ltr";
    };
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
      try {
        await audio.play();
      } catch (err) {
        console.log("Audio playback failed:", err);
      }
    }
    setTimeout(() => {
      document.getElementById("lumiere-story")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";

  return (
    <div className="w-full overflow-x-hidden" dir={isArabic ? "rtl" : "ltr"}>
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} preload="auto" onTimeUpdate={handleTimeUpdate}>
          <source src={wedding.audio_url} type="audio/mpeg" />
        </audio>
      )}

      {/* Fixed Video Background */}
      <VideoBackground videoUrl={videoUrl} overlayOpacity={0.45} fixed />

      {/* Scrollable Foreground */}
      <div className="relative z-10">
        {/* Hero */}
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
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
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

        {/* Story / Family Names */}
        <section id="lumiere-story" className="py-20 px-4 text-center">
          <AnimatedSection animation="fade-up">
            <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 space-y-8">
              <div className="space-y-4">
                <EditableField
                  fieldId="groom-family"
                  text={t("family.theFamily", {
                    name: getFieldValue("groom-family", getLocalizedValue("groom_family", wedding.groom_family || "Groom's Family")),
                  })}
                  style={getFieldStyle("groom-family")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h2"
                  className="text-template-subtitle text-white"
                />
                <p className="text-2xl text-white/80">&</p>
                <EditableField
                  fieldId="bride-family"
                  text={t("family.theFamily", {
                    name: getFieldValue("bride-family", getLocalizedValue("bride_family", wedding.bride_family || "Bride's Family")),
                  })}
                  style={getFieldStyle("bride-family")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h2"
                  className="text-template-subtitle text-white"
                />
              </div>
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
                className="text-template-body text-white/90"
              />
            </div>
          </AnimatedSection>
        </section>

        {/* Countdown */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <CountdownTimer targetDate={wedding.wedding_date} variant="dark" />
          </div>
        </section>

        {/* Events */}
        <EventDetailsSection
          title={t("events.title")}
          subtitle={getFieldValue("events-subtitle", t("events.defaultSubtitle"))}
          ceremony={ceremony}
          venue={venue}
          ceremonyLabel={t("events.ceremony")}
          venueLabel={t("events.venue")}
          locationLabel={t("events.eventLocation")}
          mapButtonText={t("events.viewOnMap")}
          className="py-16 px-4"
          cardClassName="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 space-y-6"
          titleClassName="text-white"
          textClassName="text-white"
          buttonClassName="inline-block bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-md transition-colors border border-white/30"
          formatTime={formatTimeTo12Hour}
          getLocalizedLocation={getLocalizedValue}
        />

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-5xl mx-auto">
              <AnimatedSection animation="fade-up">
                <h2 className="text-template-subtitle text-center mb-10 text-white">{t("gallery.title", "Gallery")}</h2>
              </AnimatedSection>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img, i) => (
                  <AnimatedSection key={img.id} delay={i * 100} animation="scale-in">
                    <div className="aspect-square overflow-hidden rounded-xl border border-white/20">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || `Photo ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gift Cards */}
        {giftCards.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-template-subtitle text-center mb-12 text-white">{t("gifts.title")}</h2>
              <p className="text-center text-template-body mb-8 text-white/70">{t("gifts.subtitle")}</p>
              <div className="grid gap-4 md:grid-cols-2">
                {giftCards.map((card, index) => (
                  <AnimatedSection key={card.id} delay={index * 150} animation="scale-in">
                    <div className="bg-white/10 p-6 rounded-lg text-center border border-white/20">
                      <p className="font-semibold text-lg text-white">{card.card_name}</p>
                      <p className="text-white/70 mt-2">{card.card_number}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RSVP */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <div className="py-8 px-4">
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
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
                bgClassName="bg-transparent"
                cardBgClassName="bg-white/10"
              />
            </div>
          </div>
        )}

        {/* Closing */}
        <AnimatedSection animation="fade-in">
          <section className="py-16 px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <EditableField
                fieldId="closing-message"
                text={getFieldValue("closing-message", t("closing.defaultMessage"))}
                style={getFieldStyle("closing-message")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline
                tag="p"
                className="text-template-body text-white/90"
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
