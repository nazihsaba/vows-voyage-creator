import { useState, useEffect } from "react";
import { ChevronDown, PartyPopper, Church } from "lucide-react";
import { Button } from "@/components/ui/button";
import weddingHero from "@/assets/wedding-hero.jpg";

// Static demo data
const staticWedding = {
  groom_name: "Chris",
  bride_name: "Adele",
  groom_family: "The Johnson Family",
  bride_family: "The Williams Family",
  wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
  rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  main_picture_url: weddingHero,
};

const staticLocations = [
  {
    id: "1",
    type: "ceremony",
    location_name: "St.Michel Church",
    time: "6:00 PM",
    location_link: "https://maps.app.goo.gl/m9pqWpFKT1yVdkVVA",
  },
  {
    id: "2",
    type: "venue",
    location_name: "Le Petit Paradis",
    time: "8:00 PM",
    location_link: "https://maps.app.goo.gl/FTzJ5FYp5tHdJGyA8",
  },
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

// Static Countdown Timer Component
const StaticCountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      <h2 className="text-2xl md:text-3xl font-serif mb-8 text-[#3e2723]">Counting Down To Our Special Day</h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Minutes" },
          { value: timeRemaining.seconds, label: "Seconds" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-3xl md:text-5xl font-bold text-primary">{item.value}</div>
            <div className="text-sm md:text-base text-gray-600 mt-2">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ClassicRomancePreview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const ceremony = staticLocations.find((loc) => loc.type === "ceremony");
  const venue = staticLocations.find((loc) => loc.type === "venue");

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("family-section-classic")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="w-full bg-white text-[#3e2723] font-serif">
      {/* Hero Section - Fullscreen */}
      <section
        className="relative h-screen flex flex-col items-center justify-center text-center text-white"
        style={{
          backgroundImage: `url(${staticWedding.main_picture_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 space-y-6 px-4 max-w-2xl">
          <p className="text-template-small">The Wedding Of</p>

          <div className="space-y-2">
            <h1 className="text-template-title">{staticWedding.groom_name}</h1>
            <p className="text-4xl md:text-5xl">&</p>
            <h1 className="text-template-title">{staticWedding.bride_name}</h1>
          </div>

          <p className="text-template-body tracking-wide">
            {new Date(staticWedding.wedding_date).toLocaleDateString("en-US", {
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

      {/* Family Names Section */}
      <section id="family-section-classic" className="py-16 px-4 text-center bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-template-subtitle">{staticWedding.groom_family}</h2>
            <p className="text-2xl">&</p>
            <h2 className="text-template-subtitle">{staticWedding.bride_family}</h2>
          </div>

          <p className="text-template-body">
            Request the honor of your presence at the wedding of their Son and Daughter
          </p>
        </div>
      </section>

      {/* Gallery Image 1 - Full Width */}
      <section className="relative w-full">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>

        <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={staticGallery[0].image_url} alt="Gallery 1" className="w-full h-full object-cover" />
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-16 px-4 bg-white">
        <StaticCountdownTimer targetDate={staticWedding.wedding_date} />
      </section>

      {/* Gallery Image 2 - Full Width */}
      <section className="relative w-full">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>

        <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={staticGallery[1].image_url} alt="Gallery 2" className="w-full h-full object-cover" />
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>
      </section>

      {/* Wedding Events Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-template-subtitle mb-6 text-[#3e2723]">Wedding Events</h2>
            <p className="text-template-body max-w-2xl mx-auto whitespace-pre-line">
              {"With all humility, we would like\n\nto invite you all to attend our wedding\n\nwhich will be held on:"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {ceremony && (
              <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                <div className="flex items-center justify-center w-full">
                  <Church className="w-8 h-8 text-primary" />
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
            )}
            {venue && (
              <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                <div className="flex items-center justify-center w-full">
                  <PartyPopper className="w-8 h-8 text-primary" />
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
            )}
          </div>
        </div>
      </section>

      {/* Gallery Image 3 - Full Width */}
      <section className="relative w-full">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>

        <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={staticGallery[2].image_url} alt="Gallery 3" className="w-full h-full object-cover" />
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>
      </section>

      {/* Gift Cards Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
          <p className="text-center text-template-body mb-8 text-gray-600">
            For those who desire a wedding list is available
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {staticGiftCards.map((card) => (
              <div key={card.id} className="bg-[#faf8f5] p-6 rounded-lg text-center">
                <p className="font-semibold text-lg text-[#3e2723]">{card.card_name}</p>
                <p className="text-gray-600 mt-2">{card.card_number}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Image 4 - Full Width */}
      <section className="relative w-full">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>

        <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={staticGallery[3].image_url} alt="Gallery 4" className="w-full h-full object-cover" />
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-white">
            <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
          </svg>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-center text-primary text-3xl md:text-4xl">Join Our Celebration</h2>

          <p className="text-template-body text-center text-gray-600">
            Please let us know if you can join us on our special day. Your presence would mean the world to us.
          </p>

          <div className="pt-8 border-t border-gray-300">
            <p className="text-template-small text-center mb-2 text-gray-600">
              Kindly confirm your attendance before this date:
            </p>
            <p className="text-template-heading text-primary text-center">
              {staticWedding.rsvp_deadline.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Closing Message */}
      <section className="py-16 px-4 bg-[#faf8f5] text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <p className="text-template-body">
            We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures, and
            make wonderful memories with us.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ClassicRomancePreview;
