import { useEffect, useState, useCallback } from "react";
import { ChevronDown, Heart } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import EtoileTornCard from "./etoile/EtoileTornCard";
import EtoileCountdown from "./etoile/EtoileCountdown";
import EtoileEvents from "./etoile/EtoileEvents";
import EtoileGallery from "./etoile/EtoileGallery";
import EtoileGifts from "./etoile/EtoileGifts";
import EtoileRsvp from "./etoile/EtoileRsvp";
import etoile1 from "@/assets/etoile-1.jpg";
import etoile2 from "@/assets/etoile-2.jpg";
import etoile3 from "@/assets/etoile-3.jpg";
import etoile4 from "@/assets/etoile-4.jpg";
import etoile5 from "@/assets/etoile-5.jpg";
import etoile6 from "@/assets/etoile-6.jpg";

const weddingDate = new Date("2025-08-16");

const sampleEvents = [
  {
    id: "ceremony",
    title: "Ceremony",
    time: "7:00 PM",
    location: "Couvent Saint Sauveur - Sarba",
    link: "https://maps.google.com/?q=Couvent+Saint+Sauveur+Sarba",
    icon: "material-symbols:church-rounded",
  },
  {
    id: "welcome",
    title: "Welcome Drink",
    time: "8:00 PM",
    location: "Carma - Jeita Country Club",
    link: "https://maps.google.com/?q=Carma+Jeita+Country+Club",
    icon: "streamline:champagne-party-alcohol-remix",
  },
  {
    id: "dinner",
    title: "Dinner & Party",
    time: "9:00 PM",
    location: "Carma - Jeita Country Club",
    link: "https://maps.google.com/?q=Carma+Jeita+Country+Club",
    icon: "solar:confetti-bold",
  },
];

const sampleGallery = [
  { id: "1", image_url: etoile3, alt_text: "Moment 1" },
  { id: "2", image_url: etoile6, alt_text: "Moment 2" },
  { id: "3", image_url: etoile1, alt_text: "Moment 3" },
  { id: "4", image_url: etoile4, alt_text: "Moment 4" },
  { id: "5", image_url: etoile5, alt_text: "Moment 5" },
  { id: "6", image_url: etoile2, alt_text: "Moment 6" },
];

const sampleGifts = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "123456789" },
];

const EtoilePreview = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = sampleGallery.map((g) => g.image_url);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");
    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  return (
    <div className="w-full min-h-screen font-serif overflow-x-hidden lg:px-[25%]">
      {/* Layer 1: Fixed background carousel */}
      <div className="fixed inset-0 z-0 lg:left-[25%] lg:w-[50%]">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: index === currentSlide ? 1 : 0 }}
          />
        ))}
      </div>

      {/* Layer 2: Dark overlay */}
      <div className="fixed inset-0 bg-black/30 z-[1] lg:left-[25%] lg:w-[50%]" />

      {/* Layer 3: Scrollable content */}
      <div className="relative z-[2]">
        {/* ===== HERO SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center text-white">
          <div className="relative z-10 px-4 max-w-2xl">
            <span
              className="text-lg md:text-xl tracking-[0.3em] uppercase"
              style={{ animation: "gentleFadeUp 1.2s ease-out both" }}
            >
              The Wedding Of
            </span>
            <div className="space-y-4 mt-[9rem] mb-[9rem]">
              <h1
                className="text-template-title text-left pl-4 md:pl-12"
                style={{ animation: "slideFromLeft 1.5s ease-out 0.3s both" }}
              >
                Adrian
              </h1>
              <Heart
                className="w-8 h-8 mx-auto text-transparent fill-white"
                style={{ animation: "heartPulseIn 1.2s ease-out 0.8s both" }}
              />
              <h1
                className="text-template-title text-right pr-4 md:pr-12"
                style={{ animation: "slideFromRight 1.5s ease-out 0.3s both" }}
              >
                Elena
              </h1>
            </div>
            <span
              className="text-xl md:text-2xl tracking-[0.2em]"
              style={{ animation: "gentleFadeUp 1.2s ease-out 1.2s both" }}
            >
              Saturday, August 16, 2025
            </span>
          </div>
          <div className="absolute bottom-8 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white" />
          </div>
        </section>

        {/* ===== FAMILY NAMES — slides from LEFT ===== */}
        <section id="family-section-etoile">
          <EtoileTornCard align="left">
            <div className="py-16 px-4 text-center">
              <AnimatedSection animation="fade-up">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="space-y-3">
                    <div className="w-12 h-px bg-[#3e2723]/40 mx-auto" />
                    <p className="text-template-body italic text-[#3e2723]/80">
                      "Two are better than one. For if they fall, one will lift up the other."
                    </p>
                    <p className="text-sm text-[#3e2723]/60">— Ecclesiastes 4:9-12</p>
                    <div className="w-12 h-px bg-[#3e2723]/40 mx-auto" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-template-subtitle text-[#3e2723]">The Vale Family</h2>
                    <p className="text-2xl text-[#3e2723]">&</p>
                    <h2 className="text-template-subtitle text-[#3e2723]">The Maris Family</h2>
                  </div>
                  <p className="text-template-body text-[#3e2723]">
                    Request the honor of your presence at the wedding of their beloved Son and Daughter
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </EtoileTornCard>
        </section>

        {/* ===== COUNTDOWN — slides from RIGHT ===== */}
        <div className="mt-64">
          <EtoileCountdown targetDate={weddingDate.toISOString()} align="right" />
        </div>

        {/* ===== EVENTS — slides from LEFT ===== */}
        <div className="mt-64">
          <EtoileEvents events={sampleEvents} dateFormatted="16 August" align="left" />
        </div>

        {/* ===== GALLERY — slides from RIGHT ===== */}
        <div className="mt-64">
          <EtoileGallery images={sampleGallery} align="right" />
        </div>

        {/* ===== GIFTS — slides from LEFT ===== */}
        <div className="mt-64">
          <EtoileGifts giftCards={sampleGifts} align="left" />
        </div>

        {/* ===== RSVP — slides from RIGHT ===== */}
        <div className="mt-64">
          <EtoileRsvp
            wedding={{ rsvp_deadline: "2025-08-01" }}
            isPreview
            staticDeadline={new Date("2025-08-01")}
            invitees={[
              { id: "1", name: "Daniel Farah" },
              { id: "2", name: "Sara Mansour" },
            ]}
            rsvpResponses={{ "1": true, "2": false }}
            numberOfPersons={2}
            align="right"
          />
        </div>

        {/* ===== FOOTER — slides from LEFT ===== */}
        <div className="mt-64">
          <div className="bg-white w-full">
            <TemplatePreviewFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtoilePreview;
