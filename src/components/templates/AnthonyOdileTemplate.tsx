import { useState, useEffect, useRef } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { EventLocation } from "@/components/EventLocation";
import { GiftCards } from "@/components/GiftCards";
import { EditableField } from "@/components/EditableField";
import { ChevronDown, PartyPopper, Church } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AOS from "aos";
import "aos/dist/aos.css";

interface AnthonyOdileTemplateProps {
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

export const AnthonyOdileTemplate = ({
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
}: AnthonyOdileTemplateProps) => {
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  const handleStart = async () => {
    setHasStarted(true);
    if (audioRef.current && wedding.audio_url) {
      const audio = audioRef.current;
      const startTime = wedding.audio_start_time || 0;

      // If we need to seek, wait for the seek to complete before playing
      if (startTime > 0) {
        audio.currentTime = startTime;
        await new Promise<void>((resolve) => {
          audio.addEventListener("seeked", () => resolve(), { once: true });
        });
      }

      audio.play().catch((err) => console.error("Error playing audio:", err));
    }
    // Smooth scroll to next section
    document.getElementById("family-section")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out",
    });

    // Pause audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Lock/unlock scroll based on hasStarted
  useEffect(() => {
    if (!hasStarted) {
      // Disable scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling
      document.body.style.overflow = "auto";
    }

    // Cleanup: ensure scroll is enabled when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [hasStarted]);

  // Handle audio time updates to loop within trimmed range
  const handleTimeUpdate = () => {
    if (audioRef.current && wedding.audio_end_time) {
      if (audioRef.current.currentTime >= wedding.audio_end_time) {
        audioRef.current.currentTime = wedding.audio_start_time || 0;
      }
    }
  };

  return (
    <div className="w-full bg-[#faf8f5] text-[#3e2723] font-serif">
      {/* Hidden audio element */}
      {wedding.audio_url && (
        <audio ref={audioRef} loop onTimeUpdate={handleTimeUpdate}>
          <source src={wedding.audio_url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {/* Hero Section - Fullscreen */}
      <section
        className="relative h-screen flex flex-col items-center justify-center text-center text-white"
        style={{
          backgroundImage: wedding.main_picture_url
            ? `url(${wedding.main_picture_url})`
            : "linear-gradient(135deg, #c9a6a6 0%, #e8c4c4 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 space-y-6 px-4 max-w-2xl">
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
            <p className="text-4xl md:text-5xl">&</p>
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
              onClick={handleStart}
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

      {/* Family Names Section */}
      <section id="family-section" className="py-16 px-4 text-center bg-white" data-aos="fade-up">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <EditableField
              fieldId="groom-family"
              text={getFieldValue("groom-family", wedding.groom_family || "Groom's Family")}
              style={getFieldStyle("groom-family")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h2"
              className="text-template-subtitle"
            />

            <p className="text-2xl">&</p>

            <EditableField
              fieldId="bride-family"
              text={getFieldValue("bride-family", wedding.bride_family || "Bride's Family")}
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
      </section>

      {/* Photo Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-16 px-4 bg-[#faf8f5]" data-aos="fade-up" data-aos-delay="100">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.slice(0, 4).map((image, index) => (
                <div key={image.id} className="aspect-square overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={image.image_url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Countdown Section */}
      <section className="py-16 px-4 bg-white" data-aos="fade-up" data-aos-delay="200">
        <CountdownTimer targetDate={wedding.wedding_date} />
      </section>

      {/* Wedding Events Section */}
      <section className="py-16 px-4 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-template-subtitle mb-6 text-[#3e2723]">Wedding Events</h2>
            <EditableField
              fieldId="events-subtitle"
              text={getFieldValue(
                "events-subtitle",
                "With all humility, we would like\n\nto invite you all to attend our wedding\n\nwhich will be held on:",
              )}
              style={getFieldStyle("events-subtitle")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-template-body max-w-2xl mx-auto whitespace-pre-line"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {ceremony && (
              <div className="bg-white p-8 rounded-lg shadow-soft space-y-6" data-aos="fade-up" data-aos-delay="400">
                <div className="flex items-center justify-center w-full">
                  <Church className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-template-heading mb-2 text-[#3e2723]">Ceremony</h3>

                <p className="text-template-body font-bold text-[#3e2723]">{ceremony.time}</p>
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
            )}
            {venue && (
              <div className="bg-white p-8 rounded-lg shadow-soft space-y-6" data-aos="fade-up" data-aos-delay="500">
                <div className="flex items-center justify-center w-full">
                  <PartyPopper className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-template-heading mb-2 text-[#3e2723]">Venue</h3>

                <p className="text-template-body font-bold text-[#3e2723]">{venue.time}</p>
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
            )}
          </div>
        </div>
      </section>

      {/* Gift Cards Section */}
      {giftCards.length > 0 && (
        <section className="py-16 px-4 bg-white" data-aos="fade-up" data-aos-delay="600">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
            <p className="text-center text-template-body mb-8 text-gray-600">
              For those who desire a wedding list is available
            </p>
            <GiftCards giftCards={giftCards} isOwner={isOwner} />
          </div>
        </section>
      )}

      {/* RSVP Section */}
      {(wedding.rsvp_deadline || invitees.length > 0) && (
        <section className="py-16 px-4 bg-white" data-aos="fade-up" data-aos-delay="700">
          <div className="max-w-3xl mx-auto space-y-8">
            <EditableField
              fieldId="rsvp-title"
              text={getFieldValue("rsvp-title", "Join Our Celebration")}
              style={getFieldStyle("rsvp-title")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h2"
              className="text-center text-primary text-3xl md:text-4xl"
            />

            <EditableField
              fieldId="rsvp-message"
              text={getFieldValue(
                "rsvp-message",
                "Please let us know if you can join us on our special day. Your presence would mean the world to us.",
              )}
              style={getFieldStyle("rsvp-message")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-template-body text-center text-gray-600"
            />

            {/* Invitees List with Checkboxes */}
            {invitees.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-gray-300">
                <div className="space-y-4">
                  {invitees.map((invitee: any) => (
                    <div
                      key={invitee.id}
                      className="flex items-center justify-between py-4 px-6 bg-[#faf8f5] rounded-lg border border-gray-200 hover:bg-[#f5f0e8] transition-colors"
                    >
                      <span className="text-xl font-serif text-primary">{invitee.name}</span>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`rsvp-${invitee.id}`}
                          checked={rsvpResponses[invitee.id] === true}
                          onCheckedChange={(checked) => handleRsvpToggle(invitee.id, checked as boolean)}
                          disabled={isRsvpDeadlinePassed}
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor={`rsvp-${invitee.id}`}
                          className={`text-base cursor-pointer font-medium ${
                            isRsvpDeadlinePassed ? "text-gray-400" : "text-[#3e2723]"
                          }`}
                        >
                          {rsvpResponses[invitee.id] === true ? "Attending ✓" : "Will Attend?"}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-300 space-y-4">
                  <p className="text-lg font-semibold text-center text-[#3e2723]">
                    Number of Guests: {numberOfPersons || invitees.length}
                  </p>

                  {isRsvpDeadlinePassed ? (
                    <p className="text-sm text-red-600 text-center font-medium">RSVP deadline has passed</p>
                  ) : (
                    <Button
                      onClick={handleRsvpSubmit}
                      disabled={submittingRsvp}
                      className="w-full text-lg py-6 bg-primary text-white hover:bg-primary/90"
                      size="lg"
                    >
                      {submittingRsvp ? "Submitting..." : "Submit RSVP"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {wedding.rsvp_deadline && (
              <div className="pt-8 border-t border-gray-300">
                <p className="text-template-small text-center mb-2 text-gray-600">
                  {invitees.length > 0 ? "Please RSVP by:" : "Kindly confirm your attendance before this date:"}
                </p>
                <p className="text-template-heading text-primary text-center">
                  {new Date(wedding.rsvp_deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Closing Message */}
      <section className="py-16 px-4 bg-[#faf8f5] text-center" data-aos="fade-up" data-aos-delay="800">
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
    </div>
  );
};
