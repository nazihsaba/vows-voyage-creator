import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import graceVideo from "@/assets/grace-preview-video.mp4";
import previewWedding4 from "@/assets/preview-wedding-4.jpg";

const staticWedding = {
  groom_name: "Noah",
  bride_name: "Mia",
  groom_family: "Elin",
  bride_family: "Soren",
  wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  video_url: graceVideo,
};

const staticLocations = [
  {
    id: "1",
    type: "ceremony",
    time: "2:00 PM",
    location_name: "St. Mary's Cathedral",
    location_link: "https://maps.google.com",
  },
  {
    id: "2",
    type: "venue",
    time: "5:00 PM",
    location_name: "Grand Ballroom Hotel",
    location_link: "https://maps.google.com",
  },
];

const staticGiftCards = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "987654321" },
];

const StaticCountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      <h2 className="text-template-subtitle mb-6 text-white">Counting Down To Our Special Day</h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Minutes" },
          { value: timeRemaining.seconds, label: "Seconds" },
        ].map((item, index) => (
          <AnimatedSection key={item.label} delay={index * 100} animation="scale-in">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-bold text-white">{item.value}</div>
              <div className="text-sm md:text-base text-white/70 mt-2">{item.label}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};

export const GracePreview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const ceremony = staticLocations.find((loc) => loc.type === "ceremony");
  const venue = staticLocations.find((loc) => loc.type === "venue");

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("family-section-grace")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="w-full text-[#3e2723] font-serif overflow-x-hidden lg:px-[25%]">
      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={staticWedding.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 space-y-6 px-4 max-w-2xl animate-fade-in">
          <p className="text-template-small">The Wedding Of</p>
          <div className="space-y-2">
            <h1 className="text-template-title">{staticWedding.groom_name}</h1>
            <p className="text-4xl md:text-5xl">&</p>
            <h1 className="text-template-title">{staticWedding.bride_name}</h1>
          </div>
          <p className="text-template-body tracking-wide">
            {staticWedding.wedding_date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
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

      {/* Family Names */}
      <section id="family-section-grace" className="py-16 px-4 text-center bg-white">
        <AnimatedSection animation="fade-up">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-template-subtitle">{staticWedding.groom_family}'s Family</h2>
              <p className="text-2xl">&</p>
              <h2 className="text-template-subtitle">{staticWedding.bride_family}'s Family</h2>
            </div>
            <p className="text-template-body">Request the honor of your presence at the wedding celebration</p>
          </div>
        </AnimatedSection>
      </section>

      {/* Countdown with Video */}
      <section className="relative py-16 px-4 overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={staticWedding.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <StaticCountdownTimer targetDate={staticWedding.wedding_date} />
        </div>
      </section>

      {/* Wedding Events */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <AnimatedSection animation="fade-up">
            <div>
              <h2 className="text-template-subtitle mb-6 text-primary">Wedding Events</h2>
              <p className="text-template-body max-w-2xl mx-auto">Join us in celebrating this special day</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {ceremony && (
              <AnimatedSection delay={0} animation="fade-in">
                <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <Icon icon="material-symbols:church-rounded" className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">Ceremony</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{ceremony.time}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">Event Location</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{ceremony.location_name}</p>
                  </div>
                  <a
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors"
                  >
                    View on Map
                  </a>
                </div>
              </AnimatedSection>
            )}
            {venue && (
              <AnimatedSection delay={200} animation="fade-in">
                <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <Icon icon="solar:confetti-bold" className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">Venue</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{venue.time}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">Event Location</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{venue.location_name}</p>
                  </div>
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors"
                  >
                    View on Map
                  </a>
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Image - Full Width */}
      <AnimatedSection animation="fade-in">
        <section className="relative w-full">
          <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
            <img src={previewWedding4} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </section>
      </AnimatedSection>

      {/* Gift Cards */}
      <AnimatedSection animation="fade-up">
        <section className="py-16 px-4 bg-[#faf8f5]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
            <p className="text-center text-template-body mb-8 text-gray-600">
              For those who desire a wedding list is available
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {staticGiftCards.map((card, index) => (
                <AnimatedSection key={card.id} delay={index * 150} animation="scale-in">
                  <div className="bg-white p-6 rounded-lg text-center">
                    <p className="font-semibold text-lg text-[#3e2723]">{card.card_name}</p>
                    <p className="text-gray-600 mt-2">{card.card_number}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* RSVP */}
      <RsvpSection
        staticDeadline={staticWedding.rsvp_deadline}
        invitees={[
          { id: "1", name: "Noah Elin" },
          { id: "2", name: "Mia Soren" },
        ]}
        rsvpResponses={{ "1": true, "2": false }}
        numberOfPersons={2}
        isPreview
      />

      {/* Closing */}
      <AnimatedSection animation="fade-in">
        <section className="py-16 px-4 bg-[#faf8f5] text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <p className="text-template-body">
              We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures,
              and make wonderful memories with us.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ===== BRANDED FOOTER ===== */}
      <TemplatePreviewFooter />
    </div>
  );
};

export default GracePreview;
