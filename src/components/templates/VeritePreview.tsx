import { useState, useEffect } from "react";
import { ChevronDown, PartyPopper, Church } from "lucide-react";
import { Button } from "@/components/ui/button";
import weddingHero from "@/assets/wedding-hero.jpg";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";

const staticWedding = {
  groom_name: "Chris",
  bride_name: "Adele",
  groom_family: "The Johnson Family",
  bride_family: "The Williams Family",
  wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  main_picture_url: weddingHero,
};

const staticLocations = [
  { id: "1", type: "ceremony", location_name: "St.Michel Church", time: "6:00 PM", location_link: "https://maps.app.goo.gl/m9pqWpFKT1yVdkVVA" },
  { id: "2", type: "venue", location_name: "Le Petit Paradis", time: "8:00 PM", location_link: "https://maps.app.goo.gl/FTzJ5FYp5tHdJGyA8" },
];

const staticGallery = [
  { id: "1", image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop" },
  { id: "2", image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop" },
  { id: "3", image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop" },
  { id: "4", image_url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&h=400&fit=crop" },
];

const staticGiftCards = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "123456789" },
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
      <h2 className="text-template-subtitle mb-6">Counting Down To Our Special Day</h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Minutes" },
          { value: timeRemaining.seconds, label: "Seconds" },
        ].map((item, index) => (
          <AnimatedSection key={item.label} delay={index * 100} animation="scale-in">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-bold text-primary">{item.value}</div>
              <div className="text-sm md:text-base text-gray-600 mt-2">{item.label}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};

export const VeritePreview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const ceremony = staticLocations.find((loc) => loc.type === "ceremony");
  const venue = staticLocations.find((loc) => loc.type === "venue");

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("family-section-modal")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="w-full bg-[#faf8f5] text-[#3e2723] font-serif overflow-x-hidden">
      {/* Hero */}
      <section
        className="relative h-screen flex flex-col items-center justify-center text-center text-white"
        style={{ backgroundImage: `url(${staticWedding.main_picture_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 space-y-6 px-4 max-w-2xl animate-fade-in">
          <p className="text-template-small">The Wedding Of</p>
          <div className="space-y-2">
            <h1 className="text-template-title">{staticWedding.groom_name}</h1>
            <p className="text-4xl md:text-5xl">&</p>
            <h1 className="text-template-title">{staticWedding.bride_name}</h1>
          </div>
          <p className="text-template-body tracking-wide">
            {new Date(staticWedding.wedding_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          {!hasStarted && (
            <Button onClick={handleStart} className="mt-8 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm">Tap To Start</Button>
          )}
        </div>
        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </section>

      {/* Family Names */}
      <section id="family-section-modal" className="py-16 px-4 text-center bg-white">
        <AnimatedSection animation="fade-up">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-template-subtitle">{staticWedding.groom_family}</h2>
              <p className="text-2xl">&</p>
              <h2 className="text-template-subtitle">{staticWedding.bride_family}</h2>
            </div>
            <p className="text-template-body">Request the honor of your presence at the wedding of their Son and Daughter</p>
          </div>
        </AnimatedSection>
      </section>

      {/* Gallery */}
      <section className="py-16 px-4 bg-[#faf8f5]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {staticGallery.map((image, index) => (
              <AnimatedSection key={image.id} delay={index * 100} animation="scale-in">
                <div className="aspect-square overflow-hidden rounded-lg shadow-lg">
                  <img src={image.image_url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown */}
      <AnimatedSection animation="fade-up">
        <section className="py-16 px-4 bg-white">
          <StaticCountdownTimer targetDate={staticWedding.wedding_date} />
        </section>
      </AnimatedSection>

      {/* Wedding Events */}
      <section className="py-16 px-4 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <AnimatedSection animation="fade-up">
            <div>
              <h2 className="text-template-subtitle mb-6 text-primary">Wedding Events</h2>
              <p className="text-template-body max-w-2xl mx-auto whitespace-pre-line">
                {"With all humility, we would like\n\nto invite you all to attend our wedding\n\nwhich will be held on:"}
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {ceremony && (
              <AnimatedSection delay={0} animation="fade-in">
                <div className="bg-white p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full"><Church className="w-8 h-8 text-primary" /></div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">Ceremony</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{ceremony.time}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">Event Location</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{ceremony.location_name}</p>
                  </div>
                  <a href={ceremony.location_link} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors">View on Map</a>
                </div>
              </AnimatedSection>
            )}
            {venue && (
              <AnimatedSection delay={200} animation="fade-in">
                <div className="bg-white p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full"><PartyPopper className="w-8 h-8 text-primary" /></div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">Venue</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{venue.time}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">Event Location</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{venue.location_name}</p>
                  </div>
                  <a href={venue.location_link} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors">View on Map</a>
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Image - Full Width */}
      <AnimatedSection animation="fade-in">
        <section className="relative w-full">
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
            <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-[#faf8f5]">
              <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
            </svg>
          </div>

          <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&h=800&fit=crop" alt="Wedding moment" className="w-full h-full object-cover" />
          </div>

          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
            <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-[#faf8f5]">
              <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
            </svg>
          </div>
        </section>
      </AnimatedSection>

      {/* Gift Cards */}
      <AnimatedSection animation="fade-up">
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
            <p className="text-center text-template-body mb-8 text-gray-600">For those who desire a wedding list is available</p>
            <div className="grid gap-4 md:grid-cols-2">
              {staticGiftCards.map((card, index) => (
                <AnimatedSection key={card.id} delay={index * 150} animation="scale-in">
                  <div className="bg-[#faf8f5] p-6 rounded-lg text-center">
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
      <RsvpSection isStatic staticDeadline={staticWedding.rsvp_deadline} />

      {/* Closing */}
      <AnimatedSection animation="fade-in">
        <section className="py-16 px-4 bg-[#faf8f5] text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <p className="text-template-body">We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures, and make wonderful memories with us.</p>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
};

export default VeritePreview;