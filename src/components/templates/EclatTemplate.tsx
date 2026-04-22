import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftCards } from "@/components/GiftCards";
import { EditableField } from "@/components/EditableField";
import { ChevronDown } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";

interface EclatTemplateProps {
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

export const EclatTemplate = ({
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
}: EclatTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, hasArabic, getLocalizedValue } = useArabicContent(wedding);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  const handleStart = async () => {
    setHasStarted(true);
    if (audioRef.current && wedding.audio_url) {
      const audio = audioRef.current;
      const startTime = wedding.audio_start_time || 0;
      if (startTime > 0) {
        audio.currentTime = startTime;
        await new Promise<void>((resolve) => {
          audio.addEventListener("seeked", () => resolve(), { once: true });
        });
      }
      audio.play().catch((err) => console.error("Error playing audio:", err));
    }
    document.getElementById("family-section")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

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
    return () => { document.documentElement.dir = 'ltr'; };
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current && wedding.audio_end_time) {
      if (audioRef.current.currentTime >= wedding.audio_end_time) {
        audioRef.current.currentTime = wedding.audio_start_time || 0;
      }
    }
  };

  const renderGalleryImage = (imageUrl: string, altText: string, positionY?: number) => (
    <AnimatedSection animation="fade-in">
      <section className="relative w-full">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>
        <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <img
            src={imageUrl}
            alt={altText}
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ objectPosition: `50% ${Math.min(100, Math.max(0, positionY ?? 50))}%` }}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>
      </section>
    </AnimatedSection>
  );

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";

  return (
    <div className="w-full bg-white text-[#3e2723] font-serif overflow-x-hidden lg:px-[25%]" dir={isArabic ? 'rtl' : 'ltr'}>
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} loop onTimeUpdate={handleTimeUpdate}>
          <source src={wedding.audio_url} type="audio/mpeg" />
        </audio>
      )}

      {/* Hero Section */}
      <section
        className="relative h-screen flex flex-col items-center justify-center text-center text-white"
        style={{
          backgroundImage: wedding.main_picture_url
            ? `url(${wedding.main_picture_url})`
            : "linear-gradient(135deg, #c9a6a6 0%, #e8c4c4 100%)",
          backgroundSize: "cover",
          backgroundPosition: `50% ${Math.min(100, Math.max(0, (wedding as any).main_picture_position_y ?? 50))}%`,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
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
              new Date(wedding.wedding_date).toLocaleDateString(dateLocale, {
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
              onClick={handleStart}
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

      {/* Family Names */}
      <section id="family-section" className="py-16 px-4 text-center bg-white">
        <AnimatedSection animation="fade-up">
          <div className="max-w-3xl mx-auto space-y-8">
            <p className="text-template-body">{getLocalizedValue("welcoming_text", wedding.welcoming_text || t("family.introLine"))}</p>
            <div className="space-y-4">
              <EditableField
                fieldId="groom-family"
                text={t("family.theFamily", { name: getFieldValue("groom-family", getLocalizedValue("groom_family", wedding.groom_family || "Groom's Family")) })}
                style={getFieldStyle("groom-family")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-template-subtitle"
              />
              <p className="text-2xl">&</p>
              <EditableField
                fieldId="bride-family"
                text={t("family.theFamily", { name: getFieldValue("bride-family", getLocalizedValue("bride_family", wedding.bride_family || "Bride's Family")) })}
                style={getFieldStyle("bride-family")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-template-subtitle"
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
              className="text-template-body"
            />
          </div>
        </AnimatedSection>
      </section>

      {/* Gallery Image 1 */}
      {gallery[0] && renderGalleryImage(gallery[0].image_url, gallery[0].alt_text || "Gallery 1", gallery[0].position_y)}

      {/* Countdown */}
      <AnimatedSection animation="fade-up">
        <section className="py-16 px-4 bg-white">
          <CountdownTimer targetDate={wedding.wedding_date} />
        </section>
      </AnimatedSection>

      {/* Gallery Image 2 */}
      {gallery[1] && renderGalleryImage(gallery[1].image_url, gallery[1].alt_text || "Gallery 2", gallery[1].position_y)}

      {/* Wedding Events */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <AnimatedSection animation="fade-up">
            <div>
              <h2 className="text-template-subtitle mb-6 text-primary">{t("events.title")}</h2>
              <EditableField
                fieldId="events-subtitle"
                text={getFieldValue("events-subtitle", t("events.defaultSubtitle"))}
                style={getFieldStyle("events-subtitle")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-template-body max-w-2xl mx-auto whitespace-pre-line"
              />
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {ceremony && (
              <AnimatedSection delay={0} animation="fade-in">
                <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <Icon icon={ceremony.icon || "material-symbols:church-rounded"} className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">{t("events.ceremony")}</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{formatTimeTo12Hour(ceremony.time)}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">{t("events.eventLocation")}</p>
                    <p className="text-template-body font-medium text-[#3e2723]">
                      {getLocalizedValue("ceremony_location", ceremony.location_name)}
                    </p>
                  </div>
                  {ceremony.location_link && (
                    <a
                      href={ceremony.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors"
                    >
                      {t("events.viewOnMap")}
                    </a>
                  )}
                </div>
              </AnimatedSection>
            )}
            {venue && (
              <AnimatedSection delay={200} animation="fade-in">
                <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <Icon icon={venue.icon || "solar:confetti-bold"} className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">{t("events.venue")}</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{formatTimeTo12Hour(venue.time)}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">{t("events.eventLocation")}</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{venue.location_name}</p>
                  </div>
                  {venue.location_link && (
                    <a
                      href={venue.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors"
                    >
                      {t("events.viewOnMap")}
                    </a>
                  )}
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Image 3 */}
      {gallery[2] && renderGalleryImage(gallery[2].image_url, gallery[2].alt_text || "Gallery 3", gallery[2].position_y)}

      {/* Gift Cards */}
      {giftCards.length > 0 && (
        <AnimatedSection animation="fade-up">
          <section className="py-16 px-4 bg-card">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-template-subtitle text-center mb-12 text-primary">{t("gifts.title")}</h2>
              <p className="text-center text-template-body mb-8 text-gray-600">{t("gifts.subtitle")}</p>
              <GiftCards giftCards={giftCards} isOwner={isOwner} />
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Gallery Image 4 */}
      {gallery[3] && renderGalleryImage(gallery[3].image_url, gallery[3].alt_text || "Gallery 4", gallery[3].position_y)}

      {/* RSVP */}
      {(wedding.rsvp_deadline || invitees.length > 0) && (
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
      )}

      {/* Closing Message */}
      <AnimatedSection animation="fade-in">
        <section className="py-16 px-4 bg-[#faf8f5] text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <EditableField
              fieldId="closing-message"
              text={getFieldValue("closing-message", t("closing.defaultMessage"))}
              style={getFieldStyle("closing-message")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-template-body"
            />
          </div>
        </section>
      </AnimatedSection>

      <TemplatePreviewFooter />
    </div>
  );
};

export default EclatTemplate;
