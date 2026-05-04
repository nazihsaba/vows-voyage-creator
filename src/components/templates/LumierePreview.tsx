import { useEffect, useRef, useState } from "react";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LumiereCountdown from "./lumiere/LumiereCountdown";
import LumiereEvents from "./lumiere/LumiereEvents";
import LumiereGallery from "./lumiere/LumiereGallery";
import LumiereGifts from "./lumiere/LumiereGifts";
import LumiereRsvp from "./lumiere/LumiereRsvp";
import LumiereTornCard from "./lumiere/LumiereTornCard";
import lumiereVideo from "@/assets/lumiere-video.mp4";
import TemplateLoader from "@/components/templates/TemplateLoader";
import { BackgroundVideo } from "@/components/templates/BackgroundVideo";
import lumiere1 from "@/assets/lumiere-1.jpg";
import lumiere2 from "@/assets/lumiere-2.jpg";
import lumiere3 from "@/assets/lumiere-3.jpg";
import lumiere4 from "@/assets/lumiere-4.jpg";
import lumiere5 from "@/assets/lumiere-5.jpg";
import lumiere6 from "@/assets/lumiere-6.jpg";

const weddingDate = new Date("2026-08-16");

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

const LumierePreview = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");
    document.body.classList.add("hide-scrollbar");
    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
      document.body.classList.remove("hide-scrollbar");
    };
  }, []);

  useEffect(() => {
    const resumeVideo = () => {
      const video = videoRef.current;
      if (video && video.paused) {
        video.play().catch(() => {});
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") resumeVideo();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", resumeVideo);
    window.addEventListener("pageshow", resumeVideo);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", resumeVideo);
      window.removeEventListener("pageshow", resumeVideo);
    };
  }, []);

  return (
    <>
      {videoLoading && <TemplateLoader groomName="Adrian" brideName="Elena" />}
    <div className="w-full min-h-screen font-serif overflow-x-hidden lg:px-[25%]">
      {/* Layer 1: Fixed background video */}
      <BackgroundVideo
        ref={videoRef}
        src={lumiereVideo}
        className="fixed inset-0 w-full h-[100dvh] object-cover z-0 lg:left-[25%] lg:w-[50%]"
        overlayClassName="fixed inset-0 w-full h-[100dvh] z-0 lg:left-[25%] lg:w-[50%]"
        groomInitial="A"
        brideInitial="L"
        loaderTheme="light"
        onLoadingChange={setVideoLoading}
      />

      {/* Layer 2: Dark overlay */}
      <div className="fixed inset-0 bg-black/30 z-[1] lg:left-[25%] lg:w-[50%]" />

      {/* Layer 3: Scrollable content — hidden until video reveal so animations start fresh */}
      <div
        className="relative z-[2] transition-opacity duration-500"
        style={{ opacity: videoLoading ? 0 : 1, visibility: videoLoading ? "hidden" : "visible" }}
      >
        {/* ===== MONOGRAM SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-template-monogram text-[5rem] md:text-[7rem] font-light text-white tracking-wider opacity-0" style={{ animation: 'slideFromLeft 1.5s ease-out 0.3s forwards' }}>A</span>
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white/70 opacity-0" viewBox="0 0 24 24" fill="currentColor" style={{ animation: 'zoomIn 1.2s ease-out 0.8s forwards' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-template-monogram text-[5rem] md:text-[7rem] font-light text-white tracking-wider opacity-0" style={{ animation: 'slideFromRight 1.5s ease-out 0.3s forwards' }}>E</span>
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

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.3s_forwards]">
              <p className="text-template-body text-white/70">It is with the greatest pleasure that the</p>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                <div className="text-center space-y-1">
                  <p className="text-template-subtitle text-white">Vale Family</p>
                </div>
                <span className="text-template-subtitle font-light text-white/70">&</span>
                <div className="text-center space-y-1">
                  <p className="text-template-subtitle text-white">Maris Family</p>
                </div>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeIn_0.7s_ease-out_0.55s_forwards]">
              <p className="text-template-body text-white/70 whitespace-pre-line leading-relaxed">
                Cordially invite you to celebrate the wedding of their son and daughter
              </p>
            </div>

            <div className="opacity-0 animate-[scaleIn_0.7s_ease-out_0.7s_forwards]">
              <h1 className="text-template-title text-white">Adrian & Elena</h1>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.85s_forwards]">
              <div className="space-y-3">
                <div className="w-16 h-px bg-white/30 mx-auto" />
                <p className="text-template-body font-semibold tracking-wide text-white">Saturday, August 16th, 2026</p>
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
            wedding={{ rsvp_deadline: "2026-08-01" }}
            isPreview
            staticDeadline={new Date("2026-08-01")}
            invitees={[
              { id: "1", name: "Daniel Farah" },
              { id: "2", name: "Sara Mansour" },
            ]}
            rsvpResponses={{ "1": true, "2": false }}
            numberOfPersons={2}
          />
        </div>
        <div className="mt-64">
          <LumiereTornCard>
            <img src={lumiere2} alt="Ending" className="w-full h-auto block" loading="lazy" />
          </LumiereTornCard>
        </div>
        <div className="mt-64">
          <LumiereTornCard>
            <TemplatePreviewFooter />
          </LumiereTornCard>
        </div>
      </div>
    </div>
    </>
  );
};

export default LumierePreview;
