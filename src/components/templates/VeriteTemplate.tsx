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
import TemplateLoader from "@/components/templates/TemplateLoader";

interface VeriteTemplateProps {
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

export const VeriteTemplate = ({
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
}: VeriteTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, hasArabic, getLocalizedValue } = useArabicContent(wedding);
  const [hasStarted, setHasStarted] = useState(false);
  const [heroLoading, setHeroLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  // Preload hero image so the loader stays until the first paint is ready.
  useEffect(() => {
    if (!wedding.main_picture_url) {
      setHeroLoading(false);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.src = wedding.main_picture_url;
    const done = () => { if (!cancelled) setHeroLoading(false); };
    if (img.complete && img.naturalWidth > 0) {
      done();
    } else {
      img.onload = done;
      img.onerror = done;
    }
    // Safety timeout so users never get stuck on the loader.
    const timeout = window.setTimeout(done, 6000);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [wedding.main_picture_url]);

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
    setTimeout(() => {
      document.getElementById("family-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
      document.body.style.touchAction = "auto";
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

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";

  return (
    <div className="w-full bg-[#faf8f5] text-[#3e2723] font-serif overflow-x-hidden lg:px-[25%]" dir={isArabic ? 'rtl' : 'ltr'}>
      {heroLoading && (
        <TemplateLoader groomName={wedding.groom_name} brideName={wedding.bride_name} />
      )}
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} loop onTimeUpdate={handleTimeUpdate}>
          <source src={wedding.audio_url} type="audio/mpeg" />
        </audio>
      )}
      {!heroLoading && (
        <div className="animate-fade-in">
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
          <div className="space-y-2 py-6 md:py-8">
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
                text={t("family.theFamily", { name: getFieldValue("groom-family", getLocalizedValue("groom_family", wedding.groom_family || "Groom")) })}
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

      {/* Gallery Grid */}
      {gallery.length > 0 && (
        <section className="py-16 px-4 bg-[#faf8f5]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.slice(0, 8).map((image: any, index: number) => (
                <AnimatedSection key={image.id || index} delay={index * 100} animation="scale-in">
                  <div className="aspect-square overflow-hidden rounded-lg shadow-lg">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `Gallery ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      style={{ objectPosition: `50% ${Math.min(100, Math.max(0, image.position_y ?? 50))}%` }}
                      loading="lazy"
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Countdown */}
      <AnimatedSection animation="fade-up">
        <section className="py-16 px-4 bg-white">
          <CountdownTimer targetDate={wedding.wedding_date} />
        </section>
      </AnimatedSection>

      {/* Wedding Events */}
      <section className="py-16 px-4 bg-[#faf8f5]">
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
                <div className="bg-white p-8 rounded-lg shadow-soft space-y-6">
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
                <div className="bg-white p-8 rounded-lg shadow-soft space-y-6">
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

      {/* Gallery Image */}
      {gallery.length > 0 && (
        <AnimatedSection animation="fade-in">
          <section className="w-full px-4">
            <div className="max-w-6xl mx-auto">
              <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-lg">
                <img
                  src={gallery[0].image_url}
                  alt="Wedding moment"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `50% ${Math.min(100, Math.max(0, gallery[0].position_y ?? 50))}%` }}
                />
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

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

      {/* RSVP Section */}
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
      )}
    </div>
  );
};
