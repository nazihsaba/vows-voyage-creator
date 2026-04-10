import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LumiereCountdown from "./lumiere/LumiereCountdown";
import LumiereEvents from "./lumiere/LumiereEvents";
import LumiereGallery from "./lumiere/LumiereGallery";
import LumiereGifts from "./lumiere/LumiereGifts";
import LumiereRsvp from "./lumiere/LumiereRsvp";
import lumiereVideo from "@/assets/grace-preview-video.mp4";
import eclatWedding1 from "@/assets/eclat-wedding-1.jpg";
import eclatWedding3 from "@/assets/eclat-wedding-3.jpg";
import eclatWedding4 from "@/assets/eclat-wedding-4.jpg";
import eclatWedding5 from "@/assets/eclat-wedding-5.jpg";
import eclatWedding6 from "@/assets/eclat-wedding-6.jpg";
import eclatWedding7 from "@/assets/eclat-wedding-7.jpg";

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
  { id: "1", image_url: eclatWedding1, alt_text: "Moment 1" },
  { id: "2", image_url: eclatWedding3, alt_text: "Moment 2" },
  { id: "3", image_url: eclatWedding4, alt_text: "Moment 3" },
  { id: "4", image_url: eclatWedding5, alt_text: "Moment 4" },
  { id: "5", image_url: eclatWedding6, alt_text: "Moment 5" },
  { id: "6", image_url: eclatWedding7, alt_text: "Moment 6" },
];

const sampleGifts = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "123456789" },
];

const LumierePreview = () => {
  return (
    <div className="w-full min-h-screen font-serif overflow-x-hidden lg:px-[25%]">
      {/* Layer 1: Fixed background video */}
      <video
        className="fixed inset-0 w-full h-[100dvh] object-cover z-0 lg:left-[25%] lg:w-[50%]"
        src={lumiereVideo}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Layer 2: Dark overlay */}
      <div className="fixed inset-0 bg-black/30 z-[1] lg:left-[25%] lg:w-[50%]" />

      {/* Layer 3: Scrollable content */}
      <div className="relative z-[2]">
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
    </div>
  );
};

export default LumierePreview;
