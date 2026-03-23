import { useState, useEffect, useRef } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftCards } from "@/components/GiftCards";
import { EditableField } from "@/components/EditableField";
import { Church, PartyPopper, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import gracePreviewVideo from "@/assets/grace-preview-video.mp4";

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
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
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
      document.getElementById("family-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="w-full text-[#3e2723] font-serif overflow-x-hidden">
      {wedding.audio_url && (
        <audio ref={audioRef} preload="auto" onTimeUpdate={handleTimeUpdate}>
          <source src={wedding.audio_url} type="audio/mpeg" />
        </audio>
      )}

      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden">
        <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source
            src={wedding.video_url || gracePreviewVideo}
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 space-y-6 px-4 max-w-2xl animate-fade-in">
          <EditableField
            fieldId="hero-subtitle"
            text={getFieldValue("hero-subtitle", "The Wedding Of")}
            style={getFieldStyle("hero-subtitle")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-template-small"
          />
          <div className="space-y-2">
            <EditableField
              fieldId="groom-name"
              text={getFieldValue("groom-name", wedding.groom_name)}
              style={getFieldStyle("groom-name")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h1"
              className="text-template-title"
            />
            <p className="text-4xl">&</p>
            <EditableField
              fieldId="bride-name"
              text={getFieldValue("bride-name", wedding.bride_name)}
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
              new Date(wedding.wedding_date).toLocaleDateString("en-US", {
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
              onClick={handleStartClick}
              className="mt-8 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm"
            >
              Tap To Start
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
            <div className="space-y-4">
              <EditableField
                fieldId="groom-family"
                text={`The ${getFieldValue("groom-family", wedding.groom_family || "Groom's Family")} Family`}
                style={getFieldStyle("groom-family")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-template-subtitle"
              />
              <p className="text-2xl">&</p>
              <EditableField
                fieldId="bride-family"
                text={`The ${getFieldValue("bride-family", wedding.bride_family || "Bride's Family")} Family`}
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
                wedding.main_description ||
                  "Request the honor of your presence at the wedding of their Son and Daughter",
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
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source
            src={wedding.video_url || gracePreviewVideo}
            type="video/mp4"
          />
        </video>
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
              <h2 className="text-template-subtitle mb-6 text-primary">Wedding Events</h2>
              <EditableField
                fieldId="events-subtitle"
                text={getFieldValue("events-subtitle", "Join us in celebrating this special day")}
                style={getFieldStyle("events-subtitle")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-template-body max-w-2xl mx-auto"
              />
            </div>
          </AnimatedSection>

          <div className="grid gap-8 mt-12">
            {ceremony && (
              <AnimatedSection delay={0} animation="fade-in">
                <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <Church className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">Ceremony</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{formatTimeTo12Hour(ceremony.time)}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">Event Location</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{ceremony.location_name}</p>
                  </div>
                  {ceremony.location_link && (
                    <a
                      href={ceremony.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors"
                    >
                      View on Map
                    </a>
                  )}
                </div>
              </AnimatedSection>
            )}
            {venue && (
              <AnimatedSection delay={200} animation="fade-in">
                <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <PartyPopper className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">Venue</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{formatTimeTo12Hour(venue.time)}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">Event Location</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{venue.location_name}</p>
                  </div>
                  {venue.location_link && (
                    <a
                      href={venue.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors"
                    >
                      View on Map
                    </a>
                  )}
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Image - Full Width with Wave SVGs */}
      <AnimatedSection animation="fade-in">
        <section className="relative w-full">
          <div className="w-full h-[50vh] overflow-hidden">
            <img
              src={
                gallery.length > 0
                  ? gallery[0].image_url
                  : "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&h=800&fit=crop"
              }
              alt="Wedding moment"
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      </AnimatedSection>

      {/* Gift Cards */}
      {giftCards.length > 0 && (
        <AnimatedSection animation="fade-up">
          <section className="py-16 px-4 bg-[#faf8f5]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
              <p className="text-center text-template-body mb-8 text-gray-600">
                For those who desire a wedding list is available
              </p>
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
              text={getFieldValue(
                "closing-message",
                "We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures, and make wonderful memories with us.",
              )}
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

      {/* ===== BRANDED FOOTER ===== */}
      <TemplatePreviewFooter />
    </div>
  );
};
