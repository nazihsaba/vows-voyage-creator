import { useState, useEffect } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import VideoBackground from "@/components/templates/shared/VideoBackground";
import graceVideo from "@/assets/grace-preview-video.mp4";

const staticWedding = {
  groom_name: "Chris",
  bride_name: "Karen",
  groom_family: "Mr. & Mrs. Bitar",
  bride_family: "Mr. & Mrs. Khoury",
  wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
};

const staticLocations = [
  { id: "1", type: "ceremony", time: "5:30 PM", location_name: "St. Mary's Cathedral", location_link: "https://maps.google.com" },
  { id: "2", type: "venue", time: "8:30 PM", location_name: "Grand Ballroom Hotel", location_link: "https://maps.google.com" },
];

const staticGiftCards = [
  { id: "1", card_name: "Bank Account", card_number: "IBAN: 20249265" },
  { id: "2", card_name: "Whish", card_number: "#123456" },
];

/* Torn / deckled edge SVG */
const TornEdgeTop = () => (
  <div className="relative w-full -mt-px">
    <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="block w-full h-[30px] md:h-[40px]">
      <path
        d="M0,40 C60,38 90,10 120,12 C150,14 180,35 240,32 C300,29 330,8 390,10 C450,12 480,30 540,28 C600,26 630,6 690,8 C750,10 780,32 840,30 C900,28 930,5 990,8 C1050,11 1080,28 1140,26 C1200,24 1230,8 1290,10 C1350,12 1380,30 1440,28 L1440,40 L0,40 Z"
        fill="white"
      />
    </svg>
  </div>
);

const TornEdgeBottom = () => (
  <div className="relative w-full -mb-px">
    <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="block w-full h-[30px] md:h-[40px]">
      <path
        d="M0,0 C60,2 90,30 120,28 C150,26 180,5 240,8 C300,11 330,32 390,30 C450,28 480,10 540,12 C600,14 630,34 690,32 C750,30 780,8 840,10 C900,12 930,35 990,32 C1050,29 1080,12 1140,14 C1200,16 1230,32 1290,30 C1350,28 1380,10 1440,12 L1440,0 L0,0 Z"
        fill="white"
      />
    </svg>
  </div>
);

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
      <VideoBackground videoUrl={graceVideo} overlayOpacity={0.3} fixed />

      {/* Scrollable Foreground */}
      <div className="relative z-10">
        {/* Hero — video shows through */}
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
                weekday: "long", year: "numeric", month: "long", day: "numeric",
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

        {/* ─── White Section: Story / Family ─── */}
        <TornEdgeTop />
        <section id="lumiere-preview-story" className="bg-white py-16 text-center text-[#3e2723]">
          <AnimatedSection animation="fade-up">
            <div className="max-w-xl mx-auto px-6 space-y-8">
              <p className="text-template-body text-gray-600 italic">I have found the one whom my soul loves.</p>
              <div className="space-y-2">
                <h2 className="text-template-subtitle font-bold">{staticWedding.groom_family}</h2>
                <h2 className="text-template-subtitle font-bold">{staticWedding.bride_family}</h2>
              </div>
              <p className="text-template-body text-gray-600">Kindly join us as we unite in marriage.</p>
              <div className="space-y-1">
                <h2 className="text-template-title text-[#3e2723]">{staticWedding.groom_name}</h2>
                <p className="text-2xl">&</p>
                <h2 className="text-template-title text-[#3e2723]">{staticWedding.bride_name}</h2>
              </div>
              <p className="text-template-body">
                {staticWedding.wedding_date.toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </AnimatedSection>
        </section>
        <TornEdgeBottom />

        {/* Video gap — countdown */}
        <section className="py-16 px-4">
          <StaticCountdownTimer targetDate={staticWedding.wedding_date} />
        </section>

        {/* ─── White Section: Ceremony ─── */}
        {ceremony && (
          <>
            <TornEdgeTop />
            <section className="bg-white py-16 text-center text-[#3e2723]">
              <AnimatedSection animation="fade-up">
                <div className="max-w-xl mx-auto px-6 space-y-6">
                  <h2 className="text-template-title">Wedding Ceremony</h2>
                  <MapPin className="w-6 h-6 mx-auto text-[#3e2723]" />
                  <p className="text-template-body">
                    {ceremony.location_name} - {ceremony.time}
                  </p>
                  <a
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border border-[#3e2723] text-[#3e2723] px-8 py-2 rounded-sm transition-colors hover:bg-[#3e2723] hover:text-white"
                  >
                    Map
                  </a>
                </div>
              </AnimatedSection>
            </section>
            <TornEdgeBottom />
          </>
        )}

        {/* ─── White Section: Venue ─── */}
        {venue && (
          <>
            <TornEdgeTop />
            <section className="bg-white py-16 text-center text-[#3e2723]">
              <AnimatedSection animation="fade-up">
                <div className="max-w-xl mx-auto px-6 space-y-6">
                  <h2 className="text-template-title">The Celebration</h2>
                  <MapPin className="w-6 h-6 mx-auto text-[#3e2723]" />
                  <p className="text-template-body">
                    {venue.location_name} - {venue.time}
                  </p>
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border border-[#3e2723] text-[#3e2723] px-8 py-2 rounded-sm transition-colors hover:bg-[#3e2723] hover:text-white"
                  >
                    Map
                  </a>
                </div>
              </AnimatedSection>
            </section>
            <TornEdgeBottom />
          </>
        )}

        {/* ─── White Section: Gift Cards ─── */}
        <TornEdgeTop />
        <section className="bg-white py-16 text-center text-[#3e2723]">
          <AnimatedSection animation="fade-up">
            <div className="max-w-xl mx-auto px-6 space-y-6">
              <h2 className="text-template-title">Gift Registry</h2>
              <p className="text-template-body text-gray-600">
                Your love, laughter and presence are all we could wish for on our special day. For those who wish, a wedding list is available
              </p>
              {staticGiftCards.map((card) => (
                <div key={card.id} className="space-y-1">
                  <p className="font-semibold text-lg">{card.card_name}</p>
                  <p className="text-gray-600">{card.card_number}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </section>
        <TornEdgeBottom />

        {/* ─── White Section: RSVP ─── */}
        <TornEdgeTop />
        <div className="bg-white">
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
        </div>
        <TornEdgeBottom />

        {/* Closing — over video */}
        <AnimatedSection animation="fade-in">
          <section className="py-16 px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <p className="text-template-body text-white">♡ Happily ever after ♡</p>
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
