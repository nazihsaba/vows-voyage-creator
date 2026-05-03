import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftCards } from "@/components/GiftCards";
import { EditableField } from "@/components/EditableField";
import { ChevronDown } from "lucide-react";
import { Icon } from "@iconify/react";
import { EventIcon } from "@/components/templates/EventIcon";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";
import gracePreviewVideo from "@/assets/grace-preview-video.mp4";
import { BackgroundVideo } from "@/components/templates/BackgroundVideo";
import TemplateLoader from "@/components/templates/TemplateLoader";
import { buildTemplateFontStyle } from "@/components/templateFontDefaults";

interface GraceTemplateProps {
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

export const GraceTemplate = ({
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
}: GraceTemplateProps) => {
  const { t, i18n } = useTranslation();
  const { isArabic, hasArabic, getLocalizedValue, formatFamily } = useArabicContent(wedding);
  const [hasStarted, setHasStarted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [loaderFadingOut, setLoaderFadingOut] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // Wait for the template to paint underneath, then fade the loader out
  // — guarantees no blank flash between loader and template.
  useEffect(() => {
    if (videoLoading || !showLoader) return;
    let raf1 = 0;
    let raf2 = 0;
    let settle = 0;
    let unmount = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        settle = window.setTimeout(() => {
          setLoaderFadingOut(true);
          unmount = window.setTimeout(() => setShowLoader(false), 700);
        }, 80);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(settle);
      window.clearTimeout(unmount);
    };
  }, [videoLoading, showLoader]);

  // Hard safety: cap loader display at 4s.
  useEffect(() => {
    if (!showLoader) return;
    const t = window.setTimeout(() => setVideoLoading(false), 4000);
    return () => window.clearTimeout(t);
  }, [showLoader]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");
  const welcomeDrink = locations.find((loc) => loc.type === "welcome_drink");

  // Lock scroll only while autoplay is blocked and the user hasn't tapped.
  // When autoplay succeeds, the page is freely scrollable from the start.
  useEffect(() => {
    const locked = autoplayBlocked && !hasStarted;
    if (locked) {
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
  }, [autoplayBlocked, hasStarted]);

  // Reset dir when unmounting
  useEffect(() => {
    return () => {
      document.documentElement.dir = 'ltr';
    };
  }, []);

  // Auto-play background audio after the template/video is ready.
  // Falls back to first user interaction if the browser blocks autoplay.
  useEffect(() => {
    if (!wedding.audio_url) return;
    if (videoLoading) return;
    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;

    const startAudio = async () => {
      try {
        const startTime = wedding.audio_start_time || 0;
        if (startTime > 0 && Math.abs(audio.currentTime - startTime) > 0.05) {
          audio.currentTime = startTime;
        }
        await audio.play();
      } catch {
        // Autoplay blocked — wait for first user interaction.
        const resume = async () => {
          if (cancelled) return;
          try {
            await audio.play();
          } catch {
            /* noop */
          }
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("keydown", resume);
          window.removeEventListener("touchstart", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
        window.addEventListener("touchstart", resume, { once: true });
      }
    };

    startAudio();

    return () => {
      cancelled = true;
    };
  }, [wedding.audio_url, wedding.audio_start_time, videoLoading]);

  const handleTimeUpdate = () => {
    if (audioRef.current && wedding.audio_end_time) {
      if (audioRef.current.currentTime >= wedding.audio_end_time) {
        audioRef.current.currentTime = wedding.audio_start_time || 0;
      }
    }
  };

  const handleStartClick = async () => {
    console.log("[Grace] Tap to Start clicked");
    setHasStarted(true);

    // 1) Play the hero background video (gated by user gesture)
    const video = videoRef.current;
    if (video) {
      console.log("[Grace] Video element found", {
        src: video.currentSrc || video.src,
        muted: video.muted,
        playsInline: video.playsInline,
        preload: video.preload,
        readyState: video.readyState,
        paused: video.paused,
      });
      // Ensure attributes required for inline mobile playback
      video.muted = true;
      video.playsInline = true;
      try {
        // If the source hasn't loaded yet, kick it off
        if (video.readyState < 2) {
          try { video.load(); } catch { /* noop */ }
        }
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log("[Grace] video.play() resolved — playback started"))
            .catch((err) => console.error("[Grace] video.play() rejected:", err));
        }
      } catch (err) {
        console.error("[Grace] Error calling video.play():", err);
      }
    } else {
      console.warn("[Grace] videoRef.current is null on tap");
    }

    // 2) Play the audio track (if configured)
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
      document.getElementById("family-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";

  return (
    <>
      {showLoader && (
        <TemplateLoader groomName={wedding.groom_name} brideName={wedding.bride_name} fadingOut={loaderFadingOut} />
      )}
    <div
      className="w-full text-[#3e2723] overflow-x-hidden lg:px-[25%]"
      style={buildTemplateFontStyle("video-cinematic", wedding.template_fonts)}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} preload="auto" onTimeUpdate={handleTimeUpdate}>
          <source src={wedding.audio_url} type="audio/mpeg" />
        </audio>
      )}

      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden">
        <BackgroundVideo
          ref={videoRef}
          src={wedding.video_url || gracePreviewVideo}
          poster={(wedding as any).video_poster_url || undefined}
          className="absolute inset-0 w-full h-full object-cover"
          groomInitial={wedding.groom_name}
          brideInitial={wedding.bride_name}
          loaderTheme="light"
          onLoadingChange={setVideoLoading}
          onAutoplayBlocked={() => setAutoplayBlocked(true)}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="relative z-10 space-y-6 px-4 max-w-2xl transition-opacity duration-500"
          style={{ opacity: videoLoading ? 0 : 1, visibility: videoLoading ? "hidden" : "visible" }}
        >
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
            <p className="text-4xl md:text-5xl text-template-title">&</p>
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
          {autoplayBlocked && !hasStarted && (
            <Button
              onClick={handleStartClick}
              className="mt-8 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm"
              style={{ fontFamily: "var(--font-template-body)" }}
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
                text={formatFamily("groom_family", getFieldValue("groom-family", wedding.groom_family || "Groom's Family"))}
                style={getFieldStyle("groom-family")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-template-subtitle"
              />
              <p className="text-2xl text-template-subtitle">&</p>
              <EditableField
                fieldId="bride-family"
                text={formatFamily("bride_family", getFieldValue("bride-family", wedding.bride_family || "Bride's Family"))}
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

      {/* Countdown with Video Background */}
      <section className="relative py-16 px-4 overflow-hidden">
        <BackgroundVideo
          src={wedding.video_url || gracePreviewVideo}
          poster={(wedding as any).video_poster_url || undefined}
          className="absolute inset-0 w-full h-full object-cover"
          groomInitial={wedding.groom_name}
          brideInitial={wedding.bride_name}
          loaderTheme="light"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <CountdownTimer targetDate={wedding.wedding_date} variant="dark" />
        </div>
      </section>

      {/* Wedding Events */}
      <section className="py-16 px-4 bg-white">
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
                className="text-template-body max-w-2xl mx-auto"
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
                      className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors text-template-body"
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
                  {welcomeDrink?.time && (
                    <p className="text-template-small text-[#3e2723]">
                      <span className="text-gray-600">{t("events.welcomeDrink")}:</span>{" "}
                      <span className="font-semibold">{formatTimeTo12Hour(welcomeDrink.time)}</span>
                    </p>
                  )}
                  <p className="text-template-body font-bold text-[#3e2723]">{formatTimeTo12Hour(venue.time)}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">{t("events.eventLocation")}</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{getLocalizedValue("venue_location", venue.location_name)}</p>
                  </div>
                  {venue.location_link && (
                    <a
                      href={venue.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors text-template-body"
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
      <AnimatedSection animation="fade-in">
        <section className="relative w-full">
          <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
            <img
              src={
                gallery.length > 0
                  ? gallery[0].image_url
                  : "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&h=800&fit=crop"
              }
              alt="Wedding moment"
              className="w-full h-full object-cover"
              style={{ objectPosition: `50% ${Math.min(100, Math.max(0, gallery?.[0]?.position_y ?? 50))}%` }}
            />
          </div>
        </section>
      </AnimatedSection>

      {/* Gift Cards */}
      {giftCards.length > 0 && (
        <AnimatedSection animation="fade-up">
          <section className="py-16 px-4 bg-[#faf8f5]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-template-subtitle text-center mb-12 text-primary">{t("gifts.title")}</h2>
              <p className="text-center text-template-body mb-8 text-gray-600">{t("gifts.subtitle")}</p>
              <GiftCards giftCards={giftCards} isOwner={isOwner} />
            </div>
          </section>
        </AnimatedSection>
      )}

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

      {/* Closing */}
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
    </>
  );
};
