import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { MapPin } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import RoyaleEnvelope from "./royale/RoyaleEnvelope";
import RoyaleOrnament from "./royale/RoyaleOrnament";
import RoyaleSectionTitle from "./royale/RoyaleSectionTitle";
import RoyaleCard from "./royale/RoyaleCard";
import royale1 from "@/assets/royale-1.jpg";

const GOLD = "#b08a3e";
const GOLD_DEEP = "#7e5e1a";
const INK = "#3a2a14";
const PAPER = "#fbf6ec";
const PAPER_DEEP = "#f1e6cc";

const previewDate = new Date("2026-09-12");

const RoyalePreview = () => {
  // Make sure font is loaded for the preview, too.
  useEffect(() => {
    const id = "royale-google-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&display=swap";
    document.head.appendChild(link);
  }, []);

  const [showEnvelope, setShowEnvelope] = useState(true);

  const events = [
    {
      id: "ceremony",
      title: "Ceremony",
      time: "5:00 PM",
      location: "Saint Anne Chapel — Beirut",
      icon: "material-symbols:church-rounded",
    },
    {
      id: "welcome",
      title: "Welcome Drink",
      time: "7:00 PM",
      location: "La Maison Blanche",
      icon: "streamline:champagne-party-alcohol-remix",
    },
    {
      id: "dinner",
      title: "Dinner & Party",
      time: "8:00 PM",
      location: "La Maison Blanche",
      icon: "solar:confetti-bold",
    },
  ];

  const Page = (
    <div
      className="relative w-full min-h-screen lg:px-[25%]"
      style={{
        backgroundColor: PAPER,
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(176,138,62,0.10), transparent 60%),
          radial-gradient(ellipse 60% 40% at 100% 100%, rgba(176,138,62,0.08), transparent 70%),
          radial-gradient(ellipse 60% 40% at 0% 60%, rgba(176,138,62,0.06), transparent 70%)
        `,
        color: INK,
        fontFamily: "'Cormorant Garamond', serif",
      }}
    >
      {/* HERO */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 py-16">
        <p
          className="text-[11px] sm:text-xs uppercase tracking-[0.5em] mb-6"
          style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
        >
          Together with their families
        </p>
        <RoyaleOrnament color={GOLD} width={220} className="mb-6" />
        <h1 className="text-5xl sm:text-6xl md:text-7xl italic leading-[1.05]" style={{ color: INK }}>
          Adrian
        </h1>
        <p className="my-4 text-3xl sm:text-4xl" style={{ color: GOLD_DEEP }}>&amp;</p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl italic leading-[1.05]" style={{ color: INK }}>
          Elena
        </h1>
        <div className="mt-10">
          <RoyaleOrnament color={GOLD} width={180} />
        </div>
        <p
          className="mt-6 text-sm sm:text-base tracking-[0.3em] uppercase"
          style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
        >
          Saturday, September 12, 2026
        </p>
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase opacity-60"
          style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
        >
          ↓ Scroll
        </div>
      </section>

      {/* QUOTE */}
      <section className="px-6 py-20">
        <AnimatedSection animation="fade-up">
          <div className="max-w-2xl mx-auto">
            <RoyaleCard goldColor={GOLD}>
              <div className="text-center">
                <Icon icon="ph:quotes-fill" className="mx-auto mb-4" width={28} height={28} style={{ color: GOLD }} />
                <p className="italic text-lg sm:text-xl leading-relaxed">
                  And in their eyes, two souls became one — a love written in time, sealed with grace.
                </p>
                <div className="mt-6 flex justify-center">
                  <RoyaleOrnament color={GOLD} width={140} />
                </div>
              </div>
            </RoyaleCard>
          </div>
        </AnimatedSection>
      </section>

      {/* MAIN PHOTO */}
      <section className="px-6 pb-12">
        <AnimatedSection animation="fade-in">
          <div className="max-w-2xl mx-auto">
            <div
              className="relative overflow-hidden rounded-sm"
              style={{
                border: `1px solid ${GOLD}55`,
                boxShadow: "0 18px 40px -22px rgba(80,55,15,0.4)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-2 rounded-sm z-10"
                style={{ border: `1px solid ${GOLD}33` }}
              />
              <img
                src={royale1}
                alt="Royale"
                loading="lazy"
                className="w-full h-[55vh] sm:h-[60vh] object-cover"
              />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* COUNTDOWN */}
      <section className="px-6 py-20" style={{ backgroundColor: PAPER_DEEP }}>
        <AnimatedSection animation="fade-up">
          <RoyaleSectionTitle eyebrow="Counting the days" title="Until We Say I Do" goldColor={GOLD} />
        </AnimatedSection>
        <div className="max-w-3xl mx-auto">
          <CountdownTimer targetDate={previewDate.toISOString()} />
        </div>
      </section>

      {/* TIMELINE */}
      <section className="px-6 py-20">
        <AnimatedSection animation="fade-up">
          <RoyaleSectionTitle eyebrow="The day" title="Order of Events" goldColor={GOLD} />
        </AnimatedSection>
        <div className="max-w-2xl mx-auto space-y-6">
          {events.map((event, idx) => (
            <AnimatedSection key={event.id} animation="fade-up" delay={idx * 120}>
              <RoyaleCard goldColor={GOLD}>
                <div className="flex items-start gap-5">
                  <div
                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, #d8b461, ${GOLD} 70%, ${GOLD_DEEP})`,
                      boxShadow: "inset 0 1px 2px rgba(255,255,255,.4), 0 4px 10px rgba(80,55,15,.25)",
                    }}
                  >
                    <Icon icon={event.icon} width={22} height={22} style={{ color: "#fbe9b8" }} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-[11px] tracking-[0.35em] uppercase"
                      style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
                    >
                      {event.time}
                    </p>
                    <h3 className="text-2xl sm:text-3xl italic mt-1" style={{ color: INK }}>
                      {event.title}
                    </h3>
                    <p className="mt-1 text-sm sm:text-base opacity-80" style={{ color: INK }}>
                      {event.location}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 mt-2 text-xs"
                      style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      View location
                    </span>
                  </div>
                </div>
              </RoyaleCard>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <div className="py-10">
        <RoyaleOrnament color={GOLD} width={200} />
      </div>
      <TemplatePreviewFooter />
    </div>
  );

  return (
    <>
      {showEnvelope ? (
        <RoyaleEnvelope groomName="Adrian" brideName="Elena" weddingDate="2026-09-12">
          {Page}
        </RoyaleEnvelope>
      ) : (
        Page
      )}
      {/* Re-trigger envelope (preview-only convenience) */}
      {!showEnvelope && (
        <button
          onClick={() => setShowEnvelope(true)}
          className="fixed bottom-4 right-4 z-50 text-[10px] tracking-[0.3em] uppercase px-3 py-2 rounded-sm"
          style={{ background: GOLD, color: "#fffaf0", fontFamily: "Inter, sans-serif" }}
        >
          Replay envelope
        </button>
      )}
    </>
  );
};

export default RoyalePreview;
