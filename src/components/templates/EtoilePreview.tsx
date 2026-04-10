import { useEffect, useState, useCallback } from "react";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LumiereCountdown from "./lumiere/LumiereCountdown";
import LumiereEvents from "./lumiere/LumiereEvents";
import LumiereGallery from "./lumiere/LumiereGallery";
import LumiereGifts from "./lumiere/LumiereGifts";
import LumiereRsvp from "./lumiere/LumiereRsvp";
import lumiere1 from "@/assets/lumiere-1.jpg";
import lumiere2 from "@/assets/lumiere-2.jpg";
import lumiere3 from "@/assets/lumiere-3.jpg";
import lumiere4 from "@/assets/lumiere-4.jpg";
import lumiere5 from "@/assets/lumiere-5.jpg";
import lumiere6 from "@/assets/lumiere-6.jpg";

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
  { id: "1", image_url: lumiere1, alt_text: "Moment 1" },
  { id: "2", image_url: lumiere2, alt_text: "Moment 2" },
  { id: "3", image_url: lumiere3, alt_text: "Moment 3" },
  { id: "4", image_url: lumiere4, alt_text: "Moment 4" },
  { id: "5", image_url: lumiere5, alt_text: "Moment 5" },
  { id: "6", image_url: lumiere6, alt_text: "Moment 6" },
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
        {/* ===== MONOGRAM SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center">
          <div className="opacity-0 animate-[scaleIn_0.7s_ease-out_0.3s_forwards]">
            <div className="flex items-center gap-4 md:gap-6">
              <span className="text-[5rem] md:text-[7rem] font-light text-white tracking-wider">A</span>
              <svg className="w-8 h-8 md:w-10 md:h-10 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-[5rem] md:text-[7rem] font-light text-white tracking-wider">E</span>
            </div>
          </div>
        </section>

        {/* ===== HERO ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center">
          <div className="px-6 py-16 max-w-xl mx-auto space-y-10">
            <div className="space-y-3 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.1s_forwards]">
              <div className="w-12 h-px bg-white/40 mx-auto" />
              <p className="text-template-body italic max-w-sm mx-auto leading-relaxed text-white/80">
                "Two are better than one. For if they fall, one will lift up the other."
              </p>
              <p className="text-template-small text-white/60 mt-1">— Ecclesiastes 4:9-12</p>
              <div className="w-12 h-px bg-white/40 mx-auto" />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.25s_forwards]">
              <p className="text-template-small tracking-[0.3em] text-white/70">Together with their families</p>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                <div className="text-center space-y-1">
                  <p className="text-template-small font-medium tracking-wide text-white/90">Mr. & Mrs.</p>
                  <p className="text-template-subtitle text-white">Vale</p>
                </div>
                <span className="text-template-subtitle font-light text-white/70">&</span>
                <div className="text-center space-y-1">
                  <p className="text-template-small font-medium tracking-wide text-white/90">Mr. & Mrs.</p>
                  <p className="text-template-subtitle text-white">Maris</p>
                </div>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeIn_0.7s_ease-out_0.55s_forwards]">
              <p className="text-template-body text-white/70 whitespace-pre-line leading-relaxed">
                joyfully invite you to the wedding of their{"\n"}beloved son and daughter
              </p>
            </div>

            <div className="opacity-0 animate-[scaleIn_0.7s_ease-out_0.7s_forwards]">
              <h1 className="text-template-title text-white">Adrian & Elena</h1>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.85s_forwards]">
              <div className="space-y-3">
                <div className="w-16 h-px bg-white/30 mx-auto" />
                <p className="text-template-body font-semibold tracking-wide text-white">Saturday, August 16th, 2025</p>
              </div>
            </div>
          </div>
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
