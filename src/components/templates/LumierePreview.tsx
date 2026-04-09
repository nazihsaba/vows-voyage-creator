import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Icon } from "@iconify/react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import eclatWedding1 from "@/assets/eclat-wedding-1.jpg";
import eclatWedding2 from "@/assets/eclat-wedding-2.jpg";
import eclatWedding3 from "@/assets/eclat-wedding-3.jpg";
import eclatWedding4 from "@/assets/eclat-wedding-4.jpg";
import eclatWedding5 from "@/assets/eclat-wedding-5.jpg";
import eclatWedding6 from "@/assets/eclat-wedding-6.jpg";
import eclatWedding7 from "@/assets/eclat-wedding-7.jpg";

const StaticCountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const diff = targetDate.getTime() - Date.now();
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
      <p className="text-xs tracking-[0.4em] uppercase text-foreground/40 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Counting Down
      </p>
      <div className="flex justify-center gap-6 md:gap-10">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Minutes" },
          { value: timeRemaining.seconds, label: "Seconds" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-3xl md:text-4xl font-light text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{item.value}</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-foreground/40 mt-2">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const weddingDate = new Date("2025-08-16");

const LumierePreview = () => {
  return (
    <div className="relative w-full min-h-screen bg-white text-foreground lg:px-[25%]">
      <div>
        {/* ===== HERO ===== */}
        <section className="relative w-full">
          <div className="w-full h-[85vh] overflow-hidden">
            <img src={eclatWedding2} alt="Wedding" className="w-full h-full object-cover" />
          </div>
          <div className="py-16 px-6 text-center">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="text-2xl font-light tracking-[0.2em] text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>A</span>
                <div className="w-8 h-px bg-foreground/20" />
                <span className="text-2xl font-light tracking-[0.2em] text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>E</span>
              </div>
              <h1 className="text-template-title text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Adrian & Elena
              </h1>
            </div>
          </div>
        </section>

        {/* ===== INVITATION MESSAGE ===== */}
        <section className="py-20 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-10">
              <div className="w-12 h-px bg-foreground/20 mx-auto" />
              <p className="text-lg italic leading-relaxed text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                "I have found the one whom my soul loves."
              </p>

              <div className="space-y-6">
                <p className="text-xs tracking-[0.35em] uppercase text-foreground/50" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Together with their families
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
                  <div className="text-center space-y-1">
                    <p className="text-xs tracking-widest uppercase text-foreground/50">Mr. & Mrs.</p>
                    <p className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Vale</p>
                  </div>
                  <span className="text-2xl font-extralight text-foreground/30">&</span>
                  <div className="text-center space-y-1">
                    <p className="text-xs tracking-widest uppercase text-foreground/50">Mr. & Mrs.</p>
                    <p className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Maris</p>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-foreground/60 whitespace-pre-line" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                joyfully invite you to the wedding of their{"\n"}beloved son and daughter
              </p>

              <div className="w-12 h-px bg-foreground/20 mx-auto" />
            </div>
          </AnimatedSection>
        </section>

        {/* ===== DATE SECTION ===== */}
        <section className="py-20 px-6 text-center bg-[#faf9f7]">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-6">
              <p className="text-xs tracking-[0.4em] uppercase text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Save the Date
              </p>
              <h2 className="text-4xl md:text-5xl font-light text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Adrian & Elena
              </h2>
              <p className="text-base tracking-widest text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Saturday, August 16th, 2025
              </p>
              <div className="w-16 h-px bg-foreground/15 mx-auto" />
            </div>
          </AnimatedSection>
        </section>

        {/* ===== COUNTDOWN ===== */}
        <section className="py-16 px-4">
          <StaticCountdownTimer targetDate={weddingDate} />
        </section>

        {/* ===== CEREMONY ===== */}
        <section className="py-20 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-6">
              <p className="text-xs tracking-[0.4em] uppercase text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Wedding Ceremony
              </p>
              <Icon icon="material-symbols:church-rounded" className="w-8 h-8 mx-auto text-foreground/30" />
              <p className="text-lg font-light text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Couvent Saint Sauveur - Sarba
              </p>
              <p className="text-sm text-foreground/60" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                7:00 PM
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm border border-foreground/20 rounded-full px-6 py-2.5 text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                <MapPin className="w-4 h-4" />
                Location
              </a>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== DIVIDER IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <div className="w-full h-[50vh] overflow-hidden">
            <img src={eclatWedding1} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </AnimatedSection>

        {/* ===== CELEBRATION ===== */}
        <section className="py-20 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-6">
              <p className="text-xs tracking-[0.4em] uppercase text-foreground/40" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                The Celebration
              </p>
              <Icon icon="solar:confetti-bold" className="w-8 h-8 mx-auto text-foreground/30" />
              <p className="text-lg font-light text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Carma - Jeita Country Club
              </p>
              <p className="text-sm text-foreground/60" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                8:00 PM
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm border border-foreground/20 rounded-full px-6 py-2.5 text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-colors"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                <MapPin className="w-4 h-4" />
                Location
              </a>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== GALLERY ===== */}
        <section className="py-20 px-6 bg-[#faf9f7]">
          <AnimatedSection animation="fade-in">
            <p className="text-xs tracking-[0.4em] uppercase text-foreground/40 text-center mb-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Our Moments
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[eclatWedding3, eclatWedding4, eclatWedding5, eclatWedding6, eclatWedding7, eclatWedding1].map((src, index) => (
              <AnimatedSection key={index} delay={index * 80} animation="scale-in">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={src}
                    alt={`Wedding moment ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* ===== GIFTS ===== */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="fade-in">
              <p className="text-xs tracking-[0.4em] uppercase text-foreground/40 text-center mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Wedding Gift
              </p>
              <p className="text-center text-sm mb-10 text-foreground/50" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                For those who desire a wedding list is available
              </p>
            </AnimatedSection>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { id: "1", card_name: "OMT", card_number: "123456789" },
                { id: "2", card_name: "Whish", card_number: "123456789" },
              ].map((card, index) => (
                <AnimatedSection key={card.id} delay={index * 100} animation="scale-in">
                  <div className="bg-[#faf9f7] p-6 text-center">
                    <p className="font-semibold text-lg text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{card.card_name}</p>
                    <p className="text-foreground/50 mt-2 text-sm">{card.card_number}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== RSVP ===== */}
        <RsvpSection
          staticDeadline={new Date("2025-08-01")}
          bgClassName="bg-[#faf9f7]"
          invitees={[
            { id: "1", name: "Daniel Farah" },
            { id: "2", name: "Sara Mansour" },
          ]}
          rsvpResponses={{ "1": true, "2": false }}
          numberOfPersons={2}
          isPreview
        />

        {/* ===== FOOTER ===== */}
        <section className="py-20 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <p className="text-3xl text-foreground/70" style={{ fontFamily: "'Dancing Script', cursive" }}>
              Happily Ever After
            </p>
            <div className="w-12 h-px bg-foreground/15 mx-auto mt-8" />
          </AnimatedSection>
        </section>

        <TemplatePreviewFooter />
      </div>
    </div>
  );
};

export default LumierePreview;
