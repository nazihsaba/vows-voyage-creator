import { useRef, useEffect } from "react";
import { EditableField } from "@/components/EditableField";
import { GiftCards } from "@/components/GiftCards";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Calendar, Church, Wine, PartyPopper, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import { formatTimeTo12Hour } from "@/lib/formatTime";

interface AuraTemplateProps {
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

export const AuraTemplate = ({
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
}: AuraTemplateProps) => {
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
          // Autoplay blocked by browser; play on first user interaction
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

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && wedding.audio_end_time && audio.currentTime >= wedding.audio_end_time) {
      audio.currentTime = wedding.audio_start_time || 0;
    }
  };

  const weddingDate = new Date(wedding.wedding_date);
  const dateFormatted = weddingDate.toLocaleDateString("en-US", { day: "numeric", month: "long" });

  const timelineEvents = [
    ...(ceremony
      ? [
          {
            id: "ceremony",
            title: "Ceremony",
            time: formatTimeTo12Hour(ceremony.time) || "7:00 PM",
            location: ceremony.location_name,
            link: ceremony.location_link,
            icon: Church,
          },
        ]
      : []),
    ...(venue
      ? [
          {
            id: "welcome",
            title: "Welcome Drink",
            time: "8:00 PM",
            location: venue.location_name,
            link: venue.location_link,
            icon: Wine,
          },
          {
            id: "dinner",
            title: "Dinner & Party",
            time: "9:00 PM",
            location: venue.location_name,
            link: venue.location_link,
            icon: PartyPopper,
          },
        ]
      : []),
  ];

  const hasGiftCards = giftCards && giftCards.length > 0;

  return (
    <div className="relative w-full min-h-screen bg-background font-serif text-foreground lg:px-[25%]">
      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      <div>
        {/* ===== INTRO SECTION ===== */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-muted/30 to-background pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-muted/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 px-6 py-16 max-w-xl mx-auto space-y-10">
            <div className="space-y-3 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.1s_forwards]">
              <div className="w-12 h-px bg-primary/40 mx-auto" />
              <EditableField
                fieldId="bible-verse"
                text={getFieldValue(
                  "bible-verse",
                  '"Two are better than one. For if they fall, one will lift up the other."',
                )}
                style={getFieldStyle("bible-verse")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-body italic max-w-sm mx-auto leading-relaxed opacity-80"
              />
              <EditableField
                fieldId="bible-verse-reference"
                text={getFieldValue("bible-verse-reference", "— Ecclesiastes 4:9-12")}
                style={getFieldStyle("bible-verse-reference")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-small mt-1"
              />
              <div className="w-12 h-px bg-primary/40 mx-auto" />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.25s_forwards]">
              <EditableField
                fieldId="together-text"
                text={getFieldValue("together-text", "Together with their families")}
                style={getFieldStyle("together-text")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-small tracking-[0.3em]"
              />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                <div className="text-center space-y-1">
                  <EditableField
                    fieldId="groom-parents"
                    text={getFieldValue("groom-parents", `Mr. & Mrs.`)}
                    style={getFieldStyle("groom-parents")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-sm font-medium tracking-wide"
                  />
                  <EditableField
                    fieldId="groom-family-name"
                    text={getFieldValue(
                      "groom-family-name",
                      wedding.groom_family || wedding.groom_name.split(" ").pop() || "Family",
                    )}
                    style={getFieldStyle("groom-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-template-subtitle"
                  />
                </div>
                <span className="text-3xl font-light">&</span>
                <div className="text-center space-y-1">
                  <EditableField
                    fieldId="bride-parents"
                    text={getFieldValue("bride-parents", `Mr. & Mrs.`)}
                    style={getFieldStyle("bride-parents")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-sm font-medium tracking-wide"
                  />
                  <EditableField
                    fieldId="bride-family-name"
                    text={getFieldValue(
                      "bride-family-name",
                      wedding.bride_family || wedding.bride_name.split(" ").pop() || "Family",
                    )}
                    style={getFieldStyle("bride-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-template-subtitle"
                  />
                </div>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeIn_0.7s_ease-out_0.55s_forwards]">
              <EditableField
                fieldId="invitation-line"
                text={getFieldValue(
                  "invitation-line",
                  wedding.main_description ||
                    "Request the honor of your presence at the wedding of their Son and Daughter",
                )}
                style={getFieldStyle("invitation-line")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-template-body opacity-70 whitespace-pre-line leading-relaxed"
              />
            </div>

            <div className="opacity-0 animate-[scaleIn_0.7s_ease-out_0.7s_forwards]">
              <div className="py-4">
                <h1 className="text-template-title text-primary">
                  {wedding.groom_name} & {wedding.bride_name}
                </h1>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.85s_forwards]">
              <div className="space-y-3">
                <div className="w-16 h-px bg-primary/30 mx-auto" />
                <EditableField
                  fieldId="wedding-date-formatted"
                  text={getFieldValue(
                    "wedding-date-formatted",
                    new Date(wedding.wedding_date).toLocaleDateString("en-US", {
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
                  className="text-template-body font-semibold tracking-wide text-primary"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="w-24 h-px mx-auto" />

        {/* ===== COUNTDOWN SECTION ===== */}
        <section className="py-16 px-4 bg-card">
          <CountdownTimer targetDate={wedding.wedding_date} />
        </section>

        <div className="w-24 mx-auto mb-16" />

        {/* ===== TIMELINE SECTION ===== */}
        {timelineEvents.length > 0 && (
          <section className="mb-16">
            <AnimatedSection animation="fade-in">
              <div className="flex items-center justify-center gap-4 mb-12">
                <Calendar className="w-7 h-7 text-primary" />
                <h2 className="text-template-subtitle">{dateFormatted}</h2>
              </div>
            </AnimatedSection>

            <div className="relative max-w-lg mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

              <div className="space-y-12">
                {timelineEvents.map((event, index) => (
                  <AnimatedSection key={event.id} delay={index * 150} animation="fade-in">
                    <div className="relative flex items-start">
                      <div className="flex-1 text-right pr-8">
                        <h3 className="text-template-body font-medium">{event.title}</h3>
                        <p className="text-template-body font-semibold">{event.time}</p>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full z-10" />
                      <div className="flex-1 pl-8">
                        <event.icon className="w-6 h-6 mb-1 text-primary" />
                        <p className="text-template-small text-muted-foreground leading-snug">{event.location}</p>
                        {event.link && (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-template-small underline mt-1 hover:text-primary transition-colors"
                          >
                            <MapPin className="w-4 h-4" />
                            Location
                          </a>
                        )}
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== GALLERY SECTION ===== */}
        {gallery && gallery.length > 0 && (
          <section className="mb-16">
            <AnimatedSection animation="fade-in">
              <h2 className="text-template-subtitle text-center text-primary mb-8">Our Moments</h2>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {gallery.map((image: any, index: number) => (
                <AnimatedSection key={image.id || index} delay={index * 80} animation="scale-in">
                  <div className="aspect-square overflow-hidden rounded-lg shadow-soft bg-muted">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `Wedding moment ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
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
          <section className="py-16 px-4 bg-card">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection animation="fade-in">
                <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
                <p className="text-center text-template-body mb-8 text-muted-foreground">
                  For those who desire a wedding list is available
                </p>
              </AnimatedSection>
              <GiftCards giftCards={giftCards} isOwner={isOwner} />
            </div>
          </section>
        )}

        {/* ===== FULL-WIDTH GALLERY IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <section className="relative w-full">
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
              <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-card">
                <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
              </svg>
            </div>
            <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
              <img
                src={
                  gallery && gallery.length > 0
                    ? gallery[0].image_url
                    : "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&h=800&fit=crop"
                }
                alt="Wedding moment"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
              <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-background">
                <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
              </svg>
            </div>
          </section>
        </AnimatedSection>

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
            bgClassName="bg-card"
            cardBgClassName="bg-background"
          />
        )}

        {/* ===== BRANDED FOOTER ===== */}
        <TemplatePreviewFooter />
      </div>
    </div>
  );
};
