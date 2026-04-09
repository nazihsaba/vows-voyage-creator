import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditableField } from "@/components/EditableField";
import { GiftCards } from "@/components/GiftCards";
import { MapPin } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";

/* ── Glassmorphic card style for content sections ── */
const cardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: "1rem",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.06)",
  border: "1px solid rgba(255, 255, 255, 0.4)",
};

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
  const [videoFailed, setVideoFailed] = useState(false);
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

  const dateLocale = isArabic ? "ar-SA" : "en-US";
  const weddingDate = new Date(wedding.wedding_date);
  const hasGiftCards = giftCards && giftCards.length > 0;

  const groomInitial = wedding.groom_name?.charAt(0)?.toUpperCase() || "";
  const brideInitial = wedding.bride_name?.charAt(0)?.toUpperCase() || "";

  const hasVideo = wedding.video_url && !videoFailed;
  const fallbackImage = wedding.main_picture_url || (gallery?.[0]?.image_url);

  return (
    <div className="relative w-full min-h-screen text-foreground" dir={isArabic ? 'rtl' : 'ltr'}>
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* ===== LAYER 1 — Fixed fullscreen background video ===== */}
      <div className="fixed inset-0 z-0 w-full h-full">
        {hasVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
            className="w-full h-full object-cover"
          >
            <source src={wedding.video_url} type="video/mp4" />
          </video>
        ) : fallbackImage ? (
          <img src={fallbackImage} alt="Wedding" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-black" />
        )}
      </div>

      {/* ===== LAYER 2 — Dark overlay for readability ===== */}
      <div className="fixed inset-0 z-[1] bg-black/40" />

      {/* ===== LAYER 3 — Scrollable content ===== */}
      <div className="relative z-[2] lg:px-[25%]">
        {/* ===== HERO ===== */}
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            <p className="text-xl tracking-widest text-white/80 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {groomInitial}<span className="text-white/50 mx-1">♥</span>{brideInitial}
            </p>
            <div className="space-y-1">
              <p className="text-5xl md:text-6xl text-white" style={{ fontFamily: "'Dancing Script', cursive" }}>
                {getLocalizedValue("groom_name", wedding.groom_name)}
              </p>
              <p className="text-2xl text-white/50" style={{ fontFamily: "'Dancing Script', cursive" }}>
                &
              </p>
              <p className="text-5xl md:text-6xl text-white" style={{ fontFamily: "'Dancing Script', cursive" }}>
                {getLocalizedValue("bride_name", wedding.bride_name)}
              </p>
            </div>
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
              className="text-lg tracking-wide text-white/80 mt-8"
            />
          </div>
        </section>

        {/* ===== INVITATION MESSAGE ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-8 p-8 md:p-10 text-center" style={cardStyle}>
              <EditableField
                fieldId="lumiere-quote"
                text={getFieldValue(
                  "lumiere-quote",
                  getLocalizedValue("quote", "I have found the one whom my soul loves."),
                )}
                style={getFieldStyle("lumiere-quote")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-lg italic leading-relaxed text-foreground/70"
              />

              <div className="flex flex-col items-center gap-1">
                <EditableField
                  fieldId="groom-family-name"
                  text={getFieldValue(
                    "groom-family-name",
                    `Mr. & Mrs. ${getLocalizedValue("groom_family", wedding.groom_family || wedding.groom_name?.split(" ").pop() || "")}`,
                  )}
                  style={getFieldStyle("groom-family-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-lg font-semibold text-foreground"
                />
                <EditableField
                  fieldId="bride-family-name"
                  text={getFieldValue(
                    "bride-family-name",
                    `Mr. & Mrs. ${getLocalizedValue("bride_family", wedding.bride_family || wedding.bride_name?.split(" ").pop() || "")}`,
                  )}
                  style={getFieldStyle("bride-family-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-lg font-semibold text-foreground"
                />
              </div>

              <EditableField
                fieldId="lumiere-invitation-line"
                text={getFieldValue(
                  "lumiere-invitation-line",
                  getLocalizedValue("main_description", wedding.main_description || "Kindly join us as we unite in marriage."),
                )}
                style={getFieldStyle("lumiere-invitation-line")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-base leading-relaxed text-foreground/70"
              />

              <EditableField
                fieldId="lumiere-date-subtext"
                text={getFieldValue("lumiere-date-subtext", t("countdown.title", "The wedding day has arrived!"))}
                style={getFieldStyle("lumiere-date-subtext")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-sm italic text-foreground/50"
              />
            </div>
          </AnimatedSection>
        </section>

        {/* ===== CEREMONY ===== */}
        {ceremony && (
          <section className="py-16 px-6 flex justify-center">
            <AnimatedSection animation="fade-in">
              <div className="max-w-md mx-auto space-y-5 p-8 md:p-10 text-center" style={cardStyle}>
                <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  {t("events.ceremony")}
                </h2>
                <MapPin className="w-6 h-6 mx-auto text-foreground/80 fill-foreground/80" />
                <div className="space-y-1">
                  <p className="text-base text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {getLocalizedValue("ceremony_location", ceremony.location_name)} - {formatTimeTo12Hour(ceremony.time)}
                  </p>
                </div>
                {ceremony.location_link && (
                  <a
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm border border-foreground/30 px-8 py-2.5 text-foreground/70 hover:text-foreground hover:border-foreground/50 transition-colors"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Map
                  </a>
                )}
              </div>
            </AnimatedSection>
          </section>
        )}

        {/* ===== CELEBRATION ===== */}
        {venue && (
          <section className="py-16 px-6 flex justify-center">
            <AnimatedSection animation="fade-in">
              <div className="max-w-md mx-auto space-y-5 p-8 md:p-10 text-center" style={cardStyle}>
                <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  {t("events.venue")}
                </h2>
                <MapPin className="w-6 h-6 mx-auto text-foreground/80 fill-foreground/80" />
                <div className="space-y-1">
                  <p className="text-base text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {venue.location_name} - {formatTimeTo12Hour(venue.time)}
                  </p>
                </div>
                {venue.location_link && (
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm border border-foreground/30 px-8 py-2.5 text-foreground/70 hover:text-foreground hover:border-foreground/50 transition-colors"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Map
                  </a>
                )}
              </div>
            </AnimatedSection>
          </section>
        )}

        {/* ===== GIFT REGISTRY ===== */}
        {hasGiftCards && (
          <section className="py-16 px-6 flex justify-center">
            <AnimatedSection animation="fade-in">
              <div className="max-w-md mx-auto space-y-6 p-8 md:p-10 text-center" style={cardStyle}>
                <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  {t("gifts.title")}
                </h2>
                <p className="text-base leading-relaxed text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {t("gifts.subtitle")}
                </p>
                <div className="pt-4">
                  <GiftCards giftCards={giftCards} isOwner={isOwner} />
                </div>
              </div>
            </AnimatedSection>
          </section>
        )}

        {/* ===== RSVP ===== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <div className="px-6 py-16">
            <div className="max-w-md mx-auto" style={cardStyle}>
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
                cardBgClassName="bg-transparent"
              />
            </div>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <section className="py-16 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <EditableField
              fieldId="lumiere-ending"
              text={getFieldValue("lumiere-ending", "♡ Happily ever after ♡")}
              style={getFieldStyle("lumiere-ending")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-xl text-white/80"
            />
          </AnimatedSection>
        </section>

        <TemplatePreviewFooter />
      </div>
    </div>
  );
};
