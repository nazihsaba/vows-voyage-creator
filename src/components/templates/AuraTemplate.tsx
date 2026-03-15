import { useRef, useEffect } from "react";
import { EditableField } from "@/components/EditableField";
import { GiftCards } from "@/components/GiftCards";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Calendar, Church, Wine, PartyPopper, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AOS from "aos";
import "aos/dist/aos.css";

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
    AOS.init({ duration: 800, once: true, easing: "ease-out" });
  }, []);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && wedding.audio_end_time && audio.currentTime >= wedding.audio_end_time) {
      audio.currentTime = wedding.audio_start_time || 0;
    }
  };

  const weddingDate = new Date(wedding.wedding_date);
  const dateFormatted = weddingDate.toLocaleDateString("en-US", { day: "numeric", month: "long" });

  // Build timeline events from locations
  const timelineEvents = [
    ...(ceremony
      ? [{
          id: "ceremony",
          title: "Ceremony",
          time: ceremony.time || "7:00 PM",
          location: ceremony.location_name,
          link: ceremony.location_link,
          icon: Church,
        }]
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
    <div className="relative w-full min-h-screen bg-background font-serif text-foreground">
      {/* Hidden audio element */}
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
            {/* Bible Verse */}
            <div className="space-y-3" data-aos="fade-down">
              <div className="w-12 h-px bg-primary/40 mx-auto" />
              <EditableField
                fieldId="bible-verse"
                text={getFieldValue("bible-verse", '"Two are better than one. For if they fall, one will lift up the other."')}
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

            {/* Together with their families */}
            <div data-aos="fade-up" data-aos-delay="100">
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

            {/* Parents Names */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14" data-aos="fade-up" data-aos-delay="200">
              <div className="text-center space-y-1">
                <EditableField
                  fieldId="groom-parents"
                  text={getFieldValue("groom-parents", `Mr. & Mrs. ${wedding.groom_family || wedding.groom_name.split(" ").pop()}`)}
                  style={getFieldStyle("groom-parents")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-sm text-primary font-medium tracking-wide"
                />
                <EditableField
                  fieldId="groom-family-name"
                  text={getFieldValue("groom-family-name", wedding.groom_family || wedding.groom_name.split(" ").pop() || "Family")}
                  style={getFieldStyle("groom-family-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-template-subtitle"
                />
              </div>
              <span className="text-3xl font-light text-primary/50">&</span>
              <div className="text-center space-y-1">
                <EditableField
                  fieldId="bride-parents"
                  text={getFieldValue("bride-parents", `Mr. & Mrs. ${wedding.bride_family || wedding.bride_name.split(" ").pop()}`)}
                  style={getFieldStyle("bride-parents")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-sm text-primary font-medium tracking-wide"
                />
                <EditableField
                  fieldId="bride-family-name"
                  text={getFieldValue("bride-family-name", wedding.bride_family || wedding.bride_name.split(" ").pop() || "Family")}
                  style={getFieldStyle("bride-family-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-template-subtitle"
                />
              </div>
            </div>

            {/* Invitation Text */}
            <div data-aos="fade-up" data-aos-delay="300">
              <EditableField
                fieldId="invitation-line"
                text={getFieldValue("invitation-line", "joyfully invite you to the wedding of their\nbeloved son and daughter")}
                style={getFieldStyle("invitation-line")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-template-body opacity-70 whitespace-pre-line leading-relaxed"
              />
            </div>

            {/* Couple Names */}
            <div className="py-4" data-aos="zoom-in" data-aos-delay="400">
              <EditableField
                fieldId="couple-names"
                text={getFieldValue("couple-names", `${wedding.groom_name} & ${wedding.bride_name}`)}
                style={getFieldStyle("couple-names")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h1"
                className="text-template-title text-primary"
              />
            </div>

            {/* Wedding Date */}
            <div className="space-y-3" data-aos="fade-up" data-aos-delay="500">
              <div className="w-16 h-px bg-primary/30 mx-auto" />
              <EditableField
                fieldId="wedding-date-formatted"
                text={getFieldValue("wedding-date-formatted", new Date(wedding.wedding_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }))}
                style={getFieldStyle("wedding-date-formatted")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-body font-semibold tracking-wide text-primary"
              />
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
            <div className="flex items-center justify-center gap-4 mb-12" data-aos="fade-down">
              <Calendar className="w-7 h-7 text-primary" />
              <h2 className="text-template-subtitle">{dateFormatted}</h2>
            </div>

            <div className="relative max-w-lg mx-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

              <div className="space-y-12">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="relative flex items-start" data-aos="fade-up" data-aos-delay={index * 150}>
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
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Divider */}
        {gallery && gallery.length > 0 && <div className="w-24 h-0.5 bg-border mx-auto mb-16" />}

        {/* ===== GALLERY SECTION ===== */}
        {gallery && gallery.length > 0 && (
          <section className="mb-16" data-aos="fade-up">
            <h2 className="text-template-subtitle text-center text-primary mb-8">Our Moments</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {gallery.map((image: any, index: number) => (
                <div key={image.id || index} className="aspect-square overflow-hidden rounded-lg shadow-soft bg-muted">
                  <img src={image.image_url} alt={image.alt_text || `Wedding moment ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== GIFTS SECTION ===== */}
        {hasGiftCards && (
          <section className="py-16 px-4 bg-card" data-aos="fade-up">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
              <p className="text-center text-template-body mb-8 text-muted-foreground">
                For those who desire a wedding list is available
              </p>
              <GiftCards giftCards={giftCards} isOwner={isOwner} />
            </div>
          </section>
        )}

        {/* ===== RSVP SECTION ===== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <section className="py-16 px-4 bg-card" data-aos="fade-up">
            <div className="max-w-3xl mx-auto space-y-8">
              <EditableField
                fieldId="rsvp-title"
                text={getFieldValue("rsvp-title", "Join Our Celebration")}
                style={getFieldStyle("rsvp-title")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-template-subtitle text-center mb-12 text-primary"
              />
              <EditableField
                fieldId="rsvp-message"
                text={getFieldValue("rsvp-message", "Please let us know if you can join us on our special day. Your presence would mean the world to us.")}
                style={getFieldStyle("rsvp-message")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-template-body text-center text-muted-foreground"
              />

              {invitees.length > 0 && (
                <div className="space-y-4">
                  {invitees.map((invitee: any) => (
                    <div key={invitee.id} className="flex items-center justify-between py-3 px-4 bg-background rounded-lg border border-border">
                      <span className="text-foreground font-medium">{invitee.name}</span>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`attending-${invitee.id}`}
                            checked={rsvpResponses[invitee.id] === true}
                            onCheckedChange={() => handleRsvpToggle(invitee.id, true)}
                            disabled={isRsvpDeadlinePassed}
                          />
                          <Label htmlFor={`attending-${invitee.id}`} className="text-sm text-muted-foreground">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`not-attending-${invitee.id}`}
                            checked={rsvpResponses[invitee.id] === false}
                            onCheckedChange={() => handleRsvpToggle(invitee.id, false)}
                            disabled={isRsvpDeadlinePassed}
                          />
                          <Label htmlFor={`not-attending-${invitee.id}`} className="text-sm text-muted-foreground">No</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {invitees.length > 0 && !isRsvpDeadlinePassed && (
                <Button onClick={handleRsvpSubmit} disabled={submittingRsvp} className="w-full mt-6">
                  {submittingRsvp ? "Submitting..." : "Submit RSVP"}
                </Button>
              )}

              {isRsvpDeadlinePassed && (
                <p className="mt-4 text-sm text-red-600 text-center">The RSVP deadline has passed.</p>
              )}

              {wedding.rsvp_deadline && (
                <div className="pt-8 border-t border-border">
                  <p className="text-template-small text-center mb-2 text-muted-foreground">
                    Kindly confirm your attendance before this date:
                  </p>
                  <p className="text-template-heading text-primary text-center">
                    {new Date(wedding.rsvp_deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
