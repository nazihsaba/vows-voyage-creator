import { useEffect, useState, useCallback } from "react";
import { ChevronDown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LumiereTornCard from "./lumiere/LumiereTornCard";
import LumiereCountdown from "./lumiere/LumiereCountdown";
import LumiereEvents from "./lumiere/LumiereEvents";
import LumiereGallery from "./lumiere/LumiereGallery";
import LumiereGifts from "./lumiere/LumiereGifts";
import LumiereRsvp from "./lumiere/LumiereRsvp";
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
    icon: "material-symbols:church-rounded",
  },
  {
    id: "welcome",
    title: "Welcome Drink",
    time: "8:00 PM",
    location: "Carma - Jeita Country Club",
    icon: "streamline:champagne-party-alcohol-remix",
  },
  {
    id: "dinner",
    title: "Dinner & Party",
    time: "9:00 PM",
    location: "Carma - Jeita Country Club",
    icon: "solar:confetti-bold",
  },
];

const sampleGallery = [
  { id: "1", image_url: etoile5, alt_text: "Moment 1" },
  { id: "2", image_url: etoile6, alt_text: "Moment 2" },
  { id: "3", image_url: etoile4, alt_text: "Moment 3" },
  { id: "4", image_url: etoile1, alt_text: "Moment 4" },
  { id: "5", image_url: etoile3, alt_text: "Moment 5" },
  { id: "6", image_url: etoile2, alt_text: "Moment 6" },
];

const sampleGifts = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "123456789" },
];

const EtoilePreview = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
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

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("family-section-etoile")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

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
        {/* ===== HERO SECTION (Vérité-style) ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center text-white">
          <div className="relative z-10 space-y-6 px-4 max-w-2xl animate-fade-in">
            <p className="text-template-small">The Wedding Of</p>
            <div className="space-y-2">
              <h1 className="text-template-title">Adrian</h1>
              <p className="text-4xl md:text-5xl">&</p>
              <h1 className="text-template-title">Elena</h1>
            </div>
            <p className="text-template-body tracking-wide">Saturday, August 16, 2025</p>
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

        {/* ===== FAMILY NAMES with ripped borders ===== */}
        <section id="family-section-etoile">
          <LumiereTornCard>
            <div className="py-16 px-4 text-center">
              <AnimatedSection animation="fade-up">
                <div className="max-w-3xl mx-auto space-y-8">
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
          </LumiereTornCard>
        </section>

        {/* ===== SECTIONS ===== */}
        <div className="mt-64">
          <LumiereCountdown targetDate={weddingDate.toISOString()} />
        </div>
        <div className="mt-64">
          <LumiereEvents events={sampleEvents} dateFormatted="16 August" />
        </div>
        <div className="mt-64">
          <LumiereGallery images={sampleGallery} />
        </div>
        <div className="mt-64">
          <LumiereGifts giftCards={sampleGifts} />
        </div>
        <div className="mt-64">
          <LumiereRsvp
            wedding={{ rsvp_deadline: "2025-08-01" }}
            isPreview
            staticDeadline={new Date("2025-08-01")}
            invitees={[
              { id: "1", name: "Daniel Farah" },
              { id: "2", name: "Sara Mansour" },
            ]}
            rsvpResponses={{ "1": true, "2": false }}
            numberOfPersons={2}
          />
        </div>
        <div className="mt-64">
          <TemplatePreviewFooter />
        </div>
      </div>
    </div>
  );
};

export default EtoilePreview;
