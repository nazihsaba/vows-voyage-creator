import { useState, useEffect, useRef } from "react";
import { CountdownTimerNoBackground } from "@/components/CountdownTimerNoBackground";
import { GiftCardsNoBackground } from "@/components/GiftCardsNoBackground";
import { ChevronDown, PartyPopper, Church } from "lucide-react";
import { Button } from "@/components/ui/button";
import AOS from "aos";
import "aos/dist/aos.css";
import weddingHero from "@/assets/wedding-hero.jpg";

// Static demo data
const staticWedding = {
  groom_name: "Anthony",
  bride_name: "Odile",
  groom_family: "The Johnson Family",
  bride_family: "The Williams Family",
  wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
  rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
  main_picture_url: weddingHero,
};

const staticLocations = [
  {
    id: "1",
    type: "ceremony",
    location_name: "St. Mary's Cathedral",
    time: "2:00 PM",
    location_link: "https://maps.google.com",
  },
  {
    id: "2",
    type: "venue",
    location_name: "The Grand Ballroom",
    time: "6:00 PM",
    location_link: "https://maps.google.com",
  },
];

const staticGallery = [
  { id: "1", image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop" },
  { id: "2", image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop" },
  { id: "3", image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop" },
  { id: "4", image_url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&h=400&fit=crop" },
];

const staticGiftCards = [
  { id: "1", card_name: "OMT", card_number: "****1234", logo_url: null },
  { id: "2", card_name: "Whish", card_number: "****5678", logo_url: null },
];

export const ModernRomancePreview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const ceremony = staticLocations.find((loc) => loc.type === "ceremony");
  const venue = staticLocations.find((loc) => loc.type === "venue");

  const handleStart = () => {
    setHasStarted(true);
    document.getElementById("family-section")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out",
    });
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

  return (
    <div className="w-full bg-[#faf8f5] text-[#3e2723] font-serif">
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
      <section id="family-section" className="py-16 px-4 text-center bg-white" data-aos="fade-up">
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

      {/* Photo Gallery Section */}
      <section className="py-16 px-4 bg-[#faf8f5]" data-aos="fade-up" data-aos-delay="100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {staticGallery.map((image, index) => (
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

      {/* Countdown Section */}
      <section className="py-16 px-4 bg-white" data-aos="fade-up" data-aos-delay="200">
        <CountdownTimerNoBackground targetDate={new Date(staticWedding.wedding_date)} />
      </section>

      {/* Wedding Events Section */}
      <section className="py-16 px-4 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-template-subtitle mb-6 text-[#3e2723]">Wedding Events</h2>
            <p className="text-template-body max-w-2xl mx-auto whitespace-pre-line">
              {"With all humility, we would like\n\nto invite you all to attend our wedding\n\nwhich will be held on:"}
            </p>
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

      {/* Gift Cards Section */}
      <section className="py-16 px-4 bg-white" data-aos="fade-up" data-aos-delay="600">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
          <p className="text-center text-template-body mb-8 text-gray-600">
            For those who desire a wedding list is available
          </p>
          <GiftCardsNoBackground giftCards={staticGiftCards} isOwner={false} />
        </div>
      </section>

      {/* RSVP Section */}
      <section className="py-16 px-4 bg-white" data-aos="fade-up" data-aos-delay="700">
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
              {new Date(staticWedding.rsvp_deadline).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Closing Message */}
      <section className="py-16 px-4 bg-[#faf8f5] text-center" data-aos="fade-up" data-aos-delay="800">
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

export default ModernRomancePreview;
