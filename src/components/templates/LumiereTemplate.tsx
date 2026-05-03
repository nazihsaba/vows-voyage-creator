import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import LumiereTornCard from "./lumiere/LumiereTornCard";
import { BackgroundVideo } from "@/components/templates/BackgroundVideo";
import TemplateLoader from "@/components/templates/TemplateLoader";
import { DEFAULT_TEMPLATE_FONTS, type TemplateFonts } from "@/components/FontCustomizer";

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
  const { isArabic, hasArabic, getLocalizedValue, formatFamily } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoading, setVideoLoading] = useState(!!wedding?.video_url);
  const [loaderFadingOut, setLoaderFadingOut] = useState(false);
  const [showLoader, setShowLoader] = useState(!!wedding?.video_url);

  // Once the video signals ready, wait for the browser to paint the
  // template underneath (two animation frames + small settle) before
  // fading the loader out — eliminates any blank-flash glitch.
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

  // Hard safety: never block the loader more than 4s (covers cases where
  // BackgroundVideo never fires onLoadingChange(false) on flaky networks).
  useEffect(() => {
    if (!showLoader) return;
    const t = window.setTimeout(() => setVideoLoading(false), 4000);
    return () => window.clearTimeout(t);
  }, [showLoader]);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  // While autoplay is blocked and the user hasn't tapped, lock scroll
  // (same gated-entry behavior as templates with a built-in Tap to Start).
  useEffect(() => {
    const locked = autoplayBlocked && !hasStarted;
    if (locked) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [autoplayBlocked, hasStarted]);

  const handleStartClick = async () => {
    setHasStarted(true);
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      try {
        if (video.readyState < 2) {
          try { video.load(); } catch { /* noop */ }
        }
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            setAutoplayBlocked(false);
          }).catch((err) => {
            console.error("[Lumiere] video.play() rejected on tap:", err);
          });
        }
      } catch (err) {
        console.error("[Lumiere] Error calling video.play():", err);
      }
    }
    // Also kick the audio (some browsers require a fresh user gesture)
    if (wedding.audio_url && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    const resumeVideo = () => {
      const video = videoRef.current;
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") resumeVideo();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", resumeVideo);
    window.addEventListener("pageshow", resumeVideo);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", resumeVideo);
      window.removeEventListener("pageshow", resumeVideo);
    };
  }, []);

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

  const videoUrl = wedding.video_url || wedding.hero_media;
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
          icon: "streamline:champagne-party-alcohol-remix",
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

  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");
    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  return (
    <>
      {showLoader && (
        <TemplateLoader groomName={wedding.groom_name} brideName={wedding.bride_name} fadingOut={loaderFadingOut} />
      )}
    <div
      className="w-full min-h-screen font-serif overflow-x-hidden lg:px-[25%]"
      dir="ltr"
      style={(() => {
        const f: TemplateFonts = (wedding?.template_fonts as TemplateFonts) || {};
        return {
          ["--font-template-title" as any]: f.title || DEFAULT_TEMPLATE_FONTS.title,
          ["--font-template-subtitle" as any]: f.subtitle || DEFAULT_TEMPLATE_FONTS.subtitle,
          ["--font-template-heading" as any]: f.heading || DEFAULT_TEMPLATE_FONTS.heading,
          ["--font-template-body" as any]: f.body || DEFAULT_TEMPLATE_FONTS.body,
          ["--font-template-small" as any]: f.body || DEFAULT_TEMPLATE_FONTS.body,
          ["--font-template-monogram" as any]: f.monogram || DEFAULT_TEMPLATE_FONTS.monogram,
        };
      })()}
    >
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* Layer 1: Fixed background video */}
      {videoUrl && (
        <BackgroundVideo
          ref={videoRef}
          src={videoUrl}
          poster={(wedding as any).video_poster_url || undefined}
          className="fixed inset-0 w-full h-[100lvh] object-cover z-0 lg:left-[25%] lg:right-auto lg:w-[50%]"
          overlayClassName="fixed inset-0 w-full h-[100lvh] z-0 lg:left-[25%] lg:right-auto lg:w-[50%]"
          groomInitial={wedding.groom_name}
          brideInitial={wedding.bride_name}
          loaderTheme="light"
          onLoadingChange={setVideoLoading}
          onAutoplayBlocked={() => setAutoplayBlocked(true)}
        />
      )}

      {/* Layer 2: Dark overlay */}
      <div className="fixed inset-0 h-[100lvh] bg-black/30 z-[1] lg:left-[25%] lg:right-auto lg:w-[50%]" />

      {/* Layer 3: Scrollable content — only mounted after video reveal so all
          entry animations start fresh in sync with the loader disappearing. */}
      {!videoLoading && (
      <div
        className="relative z-[2] animate-[fadeIn_0.4s_ease-out_forwards]"
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* ===== MONOGRAM SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-4 md:gap-6">
            <span
              className="text-template-monogram text-[5rem] md:text-[7rem] font-light text-white tracking-wider opacity-0"
              style={{ animation: "slideFromLeft 1.5s ease-out 0.3s forwards" }}
            >
              {wedding.groom_name?.charAt(0)?.toUpperCase() || "G"}
            </span>
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-white/70 opacity-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ animation: "zoomIn 1.2s ease-out 0.8s forwards" }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span
              className="text-template-monogram text-[5rem] md:text-[7rem] font-light text-white tracking-wider opacity-0"
              style={{ animation: "slideFromRight 1.5s ease-out 0.3s forwards" }}
            >
              {wedding.bride_name?.charAt(0)?.toUpperCase() || "B"}
            </span>
          </div>

          {/* Tap to Start — only when autoplay is blocked (e.g. iOS Low Power Mode). */}
          {autoplayBlocked && !hasStarted && (
            <div
              className="mt-12 opacity-0"
              style={{ animation: "fadeInUp 0.8s ease-out 1.4s forwards" }}
            >
              <Button
                onClick={handleStartClick}
                className="bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm"
                style={{ fontFamily: "var(--font-template-body)" }}
              >
                {t("hero.tapToStart")}
              </Button>
            </div>
          )}
        </section>

        {/* ===== HERO SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center">
          <div className="px-6 py-16 max-w-xl mx-auto space-y-10">
            <div className="space-y-3 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.1s_forwards]">
              <div className="w-12 h-px bg-white/40 mx-auto" />
              <EditableField
                fieldId="bible-verse"
                text={quoteText}
                style={{ ...getFieldStyle("bible-verse"), fontFamily: "var(--font-template-body)" }}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-body italic max-w-sm mx-auto leading-relaxed text-white/80"
              />
              <EditableField
                fieldId="bible-verse-reference"
                text={referenceText}
                style={getFieldStyle("bible-verse-reference")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-small text-white/60 mt-1"
              />
              <div className="w-12 h-px bg-white/40 mx-auto" />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.3s_forwards]">
              <p className="text-template-body text-white/70" style={{ fontFamily: "var(--font-template-body)" }}>{getLocalizedValue("welcoming_text", wedding.welcoming_text || t("family.introLine"))}</p>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                <div className="text-center space-y-1">
                  <EditableField
                    fieldId="groom-family-name"
                    text={t("family.theFamily", {
                      name: getFieldValue(
                        "groom-family-name",
                        getLocalizedValue(
                          "groom_family",
                          wedding.groom_family || wedding.groom_name.split(" ").pop() || "Family",
                        ),
                      ),
                    })}
                    style={getFieldStyle("groom-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="h2"
                    className="text-template-subtitle-white"
                  />
                </div>
                <span className="text-template-subtitle font-light text-white/70">&</span>
                <div className="text-center space-y-1">
                  <EditableField
                    fieldId="bride-family-name"
                    text={t("family.theFamily", {
                      name: getFieldValue(
                        "bride-family-name",
                        getLocalizedValue(
                          "bride_family",
                          wedding.bride_family || wedding.bride_name.split(" ").pop() || "Family",
                        ),
                      ),
                    })}
                    style={getFieldStyle("bride-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="h2"
                    className="text-template-subtitle-white"
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
                style={{ ...getFieldStyle("invitation-line"), fontFamily: "var(--font-template-body)" }}
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
                  style={{ ...getFieldStyle("wedding-date-formatted"), fontFamily: "var(--font-template-body)" }}
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
          <LumiereTornCard>
            <TemplatePreviewFooter />
          </LumiereTornCard>
        </div>
      </div>
      )}
    </div>
    </>
  );
};
