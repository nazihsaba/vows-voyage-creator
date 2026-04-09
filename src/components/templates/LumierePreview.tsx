import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import VideoBackground from "@/components/templates/shared/VideoBackground";
import graceVideo from "@/assets/grace-preview-video.mp4";
import previewWedding4 from "@/assets/preview-wedding-4.jpg";
import verite1 from "@/assets/verite-preview-1.jpg";
import verite2 from "@/assets/verite-preview-2.jpg";

const staticWedding = {
  groom_name: "Noah",
  bride_name: "Mia",
  groom_family: "The Elin Family",
  bride_family: "The Soren Family",
  wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
};

const staticLocations = [
  { id: "1", type: "ceremony", time: "2:00 PM", location_name: "St. Mary's Cathedral", location_link: "https://maps.google.com" },
  { id: "2", type: "venue", time: "5:00 PM", location_name: "Grand Ballroom Hotel", location_link: "https://maps.google.com" },
];

const staticGiftCards = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "987654321" },
];

const staticGallery = [
  { id: "1", image_url: previewWedding4 },
  { id: "2", image_url: verite1 },
  { id: "3", image_url: verite2 },
];

const StaticCountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff > 0) {
        setTime({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="text-center">
      <h2 className="text-template-subtitle mb-6 text-white">Counting Down To Our Special Day</h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: time.days, label: "Days" },
          { value: time.hours, label: "Hours" },
          { value: time.minutes, label: "Minutes" },
          { value: time.seconds, label: "Seconds" },
        ].map((item, i) => (
          <AnimatedSection key={item.label} delay={i * 100} animation="scale-in">
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

export const LumierePreview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const ceremony = staticLocations.find((l) => l.type === "ceremony");
  const venue = staticLocations.find((l) => l.type === "venue");

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("lumiere-preview-story")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="w-full overflow-x-hidden font-serif">
      {/* Fixed Video Background */}
      <VideoBackground videoUrl={graceVideo} overlayOpacity={0.45} fixed />

      {/* Scrollable Foreground */}
      <div className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center text-white px-4">
          <div className="space-y-6 max-w-2xl animate-fade-in">
            <p className="text-template-small text-white/80">The Wedding Of</p>
            <div className="space-y-2">
              <h1 className="text-template-title">{staticWedding.groom_name}</h1>
              <p className="text-4xl md:text-5xl text-white/90">&</p>
              <h1 className="text-template-title">{staticWedding.bride_name}</h1>
            </div>
            <p className="text-template-body tracking-wide text-white/90">
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

        {/* Family / Story */}
        <section id="lumiere-preview-story" className="py-20 px-4 text-center">
          <AnimatedSection animation="fade-up">
            <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 space-y-8">
              <div className="space-y-4">
                <h2 className="text-template-subtitle text-white">{staticWedding.groom_family}</h2>
                <p className="text-2xl text-white/80">&</p>
                <h2 className="text-template-subtitle text-white">{staticWedding.bride_family}</h2>
              </div>
              <p className="text-template-body text-white/90">
                Request the honor of your presence at the wedding celebration
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* Countdown */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <StaticCountdownTimer targetDate={staticWedding.wedding_date} />
          </div>
        </section>

        {/* Events */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <AnimatedSection animation="fade-up">
              <h2 className="text-template-subtitle mb-6 text-white">Wedding Events</h2>
              <p className="text-template-body max-w-2xl mx-auto text-white/80">
                Join us in celebrating this special day
              </p>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              {ceremony && (
                <AnimatedSection delay={0} animation="fade-in">
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 space-y-6">
                    <Icon icon="material-symbols:church-rounded" className="w-8 h-8 text-white mx-auto" />
                    <h3 className="text-template-heading mb-2 text-white">Ceremony</h3>
                    <p className="text-template-body font-bold text-white">{ceremony.time}</p>
                    <div className="space-y-2">
                      <p className="text-template-small text-white/60">Event Location</p>
                      <p className="text-template-body font-medium text-white">{ceremony.location_name}</p>
                    </div>
                    <a
                      href={ceremony.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-md transition-colors border border-white/30"
                    >
                      View on Map
                    </a>
                  </div>
                </AnimatedSection>
              )}
              {venue && (
                <AnimatedSection delay={200} animation="fade-in">
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 space-y-6">
                    <Icon icon="solar:confetti-bold" className="w-8 h-8 text-white mx-auto" />
                    <h3 className="text-template-heading mb-2 text-white">Venue</h3>
                    <p className="text-template-body font-bold text-white">{venue.time}</p>
                    <div className="space-y-2">
                      <p className="text-template-small text-white/60">Event Location</p>
                      <p className="text-template-body font-medium text-white">{venue.location_name}</p>
                    </div>
                    <a
                      href={venue.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-md transition-colors border border-white/30"
                    >
                      View on Map
                    </a>
                  </div>
                </AnimatedSection>
              )}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection animation="fade-up">
              <h2 className="text-template-subtitle text-center mb-10 text-white">Gallery</h2>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {staticGallery.map((img, i) => (
                <AnimatedSection key={img.id} delay={i * 100} animation="scale-in">
                  <div className="aspect-square overflow-hidden rounded-xl border border-white/20">
                    <img src={img.image_url} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Gift Cards */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-template-subtitle text-center mb-12 text-white">Wedding Gift</h2>
            <p className="text-center text-template-body mb-8 text-white/70">
              For those who desire a wedding list is available
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {staticGiftCards.map((card, i) => (
                <AnimatedSection key={card.id} delay={i * 150} animation="scale-in">
                  <div className="bg-white/10 p-6 rounded-lg text-center border border-white/20">
                    <p className="font-semibold text-lg text-white">{card.card_name}</p>
                    <p className="text-white/70 mt-2">{card.card_number}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* RSVP */}
        <div className="py-8 px-4">
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
            <RsvpSection
              staticDeadline={staticWedding.rsvp_deadline}
              invitees={[
                { id: "1", name: "Noah Elin" },
                { id: "2", name: "Mia Soren" },
              ]}
              rsvpResponses={{ "1": true, "2": false }}
              numberOfPersons={2}
              isPreview
              bgClassName="bg-transparent"
              cardBgClassName="bg-white/10"
            />
          </div>
        </div>

        {/* Closing */}
        <AnimatedSection animation="fade-in">
          <section className="py-16 px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <p className="text-template-body text-white/90">
                We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures,
                and make wonderful memories with us.
              </p>
            </div>
          </section>
        </AnimatedSection>

        {/* Footer */}
        <div className="bg-white">
          <TemplatePreviewFooter />
        </div>
      </div>
    </div>
  );
};

export default LumierePreview;
