import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EditableField } from "@/components/EditableField";
import { GiftCards } from "@/components/GiftCards";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Calendar, MapPin } from "lucide-react";
import { Icon } from "@iconify/react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";

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

  const dateLocale = isArabic ? "ar-SA" : "en-US";
  const weddingDate = new Date(wedding.wedding_date);

  const hasGiftCards = giftCards && giftCards.length > 0;

  // Monogram initials
  const groomInitial = wedding.groom_name?.charAt(0)?.toUpperCase() || "";
  const brideInitial = wedding.bride_name?.charAt(0)?.toUpperCase() || "";

  return (
    <div className="relative w-full min-h-screen bg-white text-foreground lg:px-[25%]" dir={isArabic ? 'rtl' : 'ltr'}>
      {hasArabic && <LanguageToggle />}

      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      <div>
        {/* ===== HERO SECTION ===== */}
        <section className="relative w-full">
          {wedding.main_picture_url && (
            <div className="w-full h-[85vh] overflow-hidden">
              <img
                src={wedding.main_picture_url}
                alt="Wedding"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="py-16 px-6 text-center">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
              {/* Monogram */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="text-2xl font-light tracking-[0.2em] text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {groomInitial}
                </span>
                <div className="w-8 h-px bg-foreground/20" />
                <span className="text-2xl font-light tracking-[0.2em] text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {brideInitial}
                </span>
              </div>
              <h1 className="text-template-title text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                {getLocalizedValue("groom_name", wedding.groom_name)} & {getLocalizedValue("bride_name", wedding.bride_name)}
              </h1>
            </div>
          </div>
        </section>

        {/* ===== INVITATION MESSAGE ===== */}
        <section className="py-20 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-10">
              <div className="w-12 h-px bg-foreground/20 mx-auto" />
              <EditableField
                fieldId="lumiere-quote"
                text={getFieldValue(
                  "lumiere-quote",
                  getLocalizedValue("quote", '"I have found the one whom my soul loves."'),
                )}
                style={getFieldStyle("lumiere-quote")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-lg italic leading-relaxed text-foreground/70"
                
              />

              <div className="space-y-6">
                <EditableField
                  fieldId="together-text"
                  text={getFieldValue("together-text", t("aura.togetherWithFamilies"))}
                  style={getFieldStyle("together-text")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-xs tracking-[0.35em] uppercase text-foreground/50"
                  
                />

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
                  <div className="text-center space-y-1">
                    <EditableField
                      fieldId="groom-parents"
                      text={getFieldValue("groom-parents", t("aura.mrAndMrs"))}
                      style={getFieldStyle("groom-parents")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      tag="p"
                      className="text-xs tracking-widest uppercase text-foreground/50"
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
                      className="text-xl font-light"
                      
                    />
                  </div>
                  <span className="text-2xl font-extralight text-foreground/30">&</span>
                  <div className="text-center space-y-1">
                    <EditableField
                      fieldId="bride-parents"
                      text={getFieldValue("bride-parents", t("aura.mrAndMrs"))}
                      style={getFieldStyle("bride-parents")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      tag="p"
                      className="text-xs tracking-widest uppercase text-foreground/50"
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
                      className="text-xl font-light"
                      
                    />
                  </div>
                </div>
              </div>

              <EditableField
                fieldId="lumiere-invitation-line"
                text={getFieldValue(
                  "lumiere-invitation-line",
                  getLocalizedValue("main_description", wedding.main_description || t("family.defaultInvitation")),
                )}
                style={getFieldStyle("lumiere-invitation-line")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-sm leading-relaxed text-foreground/60 whitespace-pre-line"
                
              />

              <div className="w-12 h-px bg-foreground/20 mx-auto" />
            </div>
          </AnimatedSection>
        </section>

        {/* ===== DATE SECTION ===== */}
        <section className="py-20 px-6 text-center bg-[#faf9f7]">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-6">
              <p className="text-xs tracking-[0.4em] uppercase text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {t("countdown.title", "Save the Date")}
              </p>
              <h2 className="text-4xl md:text-5xl font-light text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                {getLocalizedValue("groom_name", wedding.groom_name)} & {getLocalizedValue("bride_name", wedding.bride_name)}
              </h2>
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
                className="text-base tracking-widest text-foreground/70"
                
              />
              <div className="w-16 h-px bg-foreground/15 mx-auto" />
            </div>
          </AnimatedSection>
        </section>

        {/* ===== COUNTDOWN ===== */}
        <section className="py-16 px-4">
          <CountdownTimer targetDate={wedding.wedding_date} />
        </section>

        {/* ===== CEREMONY SECTION ===== */}
        {ceremony && (
          <section className="py-20 px-6 text-center">
            <AnimatedSection animation="fade-in">
              <div className="max-w-md mx-auto space-y-6">
                <p className="text-xs tracking-[0.4em] uppercase text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {t("events.ceremony")}
                </p>
                <Icon icon={ceremony.icon || "material-symbols:church-rounded"} className="w-8 h-8 mx-auto text-foreground/30" />
                <p className="text-lg font-light text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {getLocalizedValue("ceremony_location", ceremony.location_name)}
                </p>
                <p className="text-sm text-foreground/60" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {formatTimeTo12Hour(ceremony.time)}
                </p>
                {ceremony.location_link && (
                  <a
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm border border-foreground/20 rounded-full px-6 py-2.5 text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    <MapPin className="w-4 h-4" />
                    {t("events.location")}
                  </a>
                )}
              </div>
            </AnimatedSection>
          </section>
        )}

        {/* ===== GALLERY DIVIDER IMAGE ===== */}
        {gallery && gallery.length > 0 && (
          <AnimatedSection animation="fade-in">
            <div className="w-full h-[50vh] overflow-hidden">
              <img
                src={gallery[0].image_url}
                alt="Wedding moment"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </AnimatedSection>
        )}

        {/* ===== CELEBRATION / VENUE SECTION ===== */}
        {venue && (
          <section className="py-20 px-6 text-center">
            <AnimatedSection animation="fade-in">
              <div className="max-w-md mx-auto space-y-6">
                <p className="text-xs tracking-[0.4em] uppercase text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {t("events.venue")}
                </p>
                <Icon icon={venue.icon || "solar:confetti-bold"} className="w-8 h-8 mx-auto text-foreground/30" />
                <p className="text-lg font-light text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {venue.location_name}
                </p>
                <p className="text-sm text-foreground/60" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {formatTimeTo12Hour(venue.time)}
                </p>
                {venue.location_link && (
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm border border-foreground/20 rounded-full px-6 py-2.5 text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    <MapPin className="w-4 h-4" />
                    {t("events.location")}
                  </a>
                )}
              </div>
            </AnimatedSection>
          </section>
        )}

        {/* ===== GALLERY SECTION ===== */}
        {gallery && gallery.length > 1 && (
          <section className="py-20 px-6 bg-[#faf9f7]">
            <AnimatedSection animation="fade-in">
              <p className="text-xs tracking-[0.4em] uppercase text-foreground/40 text-center mb-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {t("gallery.title")}
              </p>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {gallery.slice(1).map((image: any, index: number) => (
                <AnimatedSection key={image.id || index} delay={index * 80} animation="scale-in">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `Wedding moment ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>
        )}

        {/* ===== GIFTS SECTION ===== */}
        {hasGiftCards && (
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection animation="fade-in">
                <p className="text-xs tracking-[0.4em] uppercase text-foreground/40 text-center mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {t("gifts.title")}
                </p>
                <p className="text-center text-sm mb-10 text-foreground/50" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {t("gifts.subtitle")}
                </p>
              </AnimatedSection>
              <GiftCards giftCards={giftCards} isOwner={isOwner} />
            </div>
          </section>
        )}

        {/* ===== RSVP SECTION ===== */}
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
            bgClassName="bg-[#faf9f7]"
            cardBgClassName="bg-white"
          />
        )}

        {/* ===== FOOTER ===== */}
        <section className="py-20 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <EditableField
              fieldId="lumiere-ending"
              text={getFieldValue("lumiere-ending", "Happily Ever After")}
              style={getFieldStyle("lumiere-ending")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-3xl text-foreground/70"
              
            />
            <div className="w-12 h-px bg-foreground/15 mx-auto mt-8" />
          </AnimatedSection>
        </section>

        <TemplatePreviewFooter />
      </div>
    </div>
  );
};
