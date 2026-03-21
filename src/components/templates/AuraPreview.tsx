import { useState, useEffect } from "react";
import { Calendar, Church, Wine, PartyPopper, MapPin, Copy } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import eclatWedding1 from "@/assets/eclat-wedding-1.jpg";
import eclatWedding2 from "@/assets/eclat-wedding-2.jpg";
import eclatWedding3 from "@/assets/eclat-wedding-3.jpg";
import eclatWedding4 from "@/assets/eclat-wedding-4.jpg";
import eclatWedding5 from "@/assets/eclat-wedding-5.jpg";
import eclatWedding6 from "@/assets/eclat-wedding-6.jpg";
import eclatWedding7 from "@/assets/eclat-wedding-7.jpg";

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
      <h2 className="text-template-subtitle mb-6">Counting Down To Our Special Day</h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Minutes" },
          { value: timeRemaining.seconds, label: "Seconds" },
        ].map((item, index) => (
          <AnimatedSection key={item.label} delay={index * 100} animation="fade-in">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-bold text-primary">{item.value}</div>
              <div className="text-sm md:text-base text-muted-foreground mt-2">{item.label}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};

const weddingDate = new Date("2025-08-16");

export const AuraPreview = () => {
  const timelineEvents = [
    {
      id: "ceremony",
      title: "Ceremony",
      time: "7:00 PM",
      location: "Couvent Saint Sauveur - Sarba",
      icon: Church,
    },
    {
      id: "welcome",
      title: "Welcome Drink",
      time: "8:00 PM",
      location: "Carma - Jeita Country Club",
      icon: Wine,
    },
    {
      id: "dinner",
      title: "Dinner & Party",
      time: "9:00 PM",
      location: "Carma - Jeita Country Club",
      icon: PartyPopper,
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-background font-serif text-foreground">
      <div>
        {/* ===== INTRO SECTION ===== */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-muted/30 to-background pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-muted/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 px-6 py-16 max-w-xl mx-auto space-y-10">
            <div className="space-y-3 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.1s_forwards]">
              <div className="w-12 h-px bg-primary/40 mx-auto" />
              <p className="text-template-body italic max-w-sm mx-auto leading-relaxed opacity-80">
                "Two are better than one. For if they fall, one will lift up the other."
              </p>
              <p className="text-template-small mt-1">— Ecclesiastes 4:9-12</p>
              <div className="w-12 h-px bg-primary/40 mx-auto" />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.25s_forwards]">
              <p className="text-template-small tracking-[0.3em]">Together with their families</p>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium tracking-wide">Mr. & Mrs.</p>
                  <p className="text-template-subtitle">Vale</p>
                </div>
                <span className="text-3xl font-light">&</span>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium tracking-wide">Mr. & Mrs.</p>
                  <p className="text-template-subtitle">Maris</p>
                </div>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeIn_0.7s_ease-out_0.55s_forwards]">
              <p className="text-template-body opacity-70 whitespace-pre-line leading-relaxed">
                joyfully invite you to the wedding of their{"\n"}beloved son and daughter
              </p>
            </div>

            <div className="opacity-0 animate-[scaleIn_0.7s_ease-out_0.7s_forwards]">
              <div className="py-4">
                <h1 className="text-template-title text-primary">Adrian & Elena</h1>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.85s_forwards]">
              <div className="space-y-3">
                <div className="w-16 h-px bg-primary/30 mx-auto" />
                <p className="text-template-body font-semibold tracking-wide text-primary">
                  Saturday, August 16th, 2025
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="w-24 h-px mx-auto" />

        {/* ===== COUNTDOWN SECTION ===== */}
        <section className="py-16 px-4 bg-card">
          <StaticCountdownTimer targetDate={weddingDate} />
        </section>

        <div className="w-24 mx-auto mb-16" />

        {/* ===== TIMELINE SECTION ===== */}
        <section className="mb-16">
          <AnimatedSection animation="fade-in">
            <div className="flex items-center justify-center gap-4 mb-12">
              <Calendar className="w-7 h-7 text-primary" />
              <h2 className="text-template-subtitle">16 August</h2>
            </div>
          </AnimatedSection>

          <div className="relative max-w-lg mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <AnimatedSection key={event.id} delay={index * 150} animation="fade-in">
                  <div className="relative flex items-start">
                    <div className="flex-1 text-right pr-8">
                      <h3 className="text-template-body font-medium">{event.title}</h3>
                      <p className="text-template-body font-semibold">{event.time}</p>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full z-10" />
                    <div className="flex-1 pl-8">
                      <event.icon className="w-6 h-6 mb-1 text-primary" />
                      <p className="text-template-small text-muted-foreground leading-snug">{event.location}</p>
                      <a
                        href="#"
                        className="inline-flex items-center gap-1 text-template-small underline mt-1 hover:text-primary transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Location
                      </a>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GALLERY SECTION ===== */}
        <section className="mb-16">
          <AnimatedSection animation="fade-in">
            <h2 className="text-template-subtitle text-center text-primary mb-8">Our Moments</h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[eclatWedding1, eclatWedding3, eclatWedding4, eclatWedding5, eclatWedding6, eclatWedding7].map(
              (src, index) => (
                <AnimatedSection key={index} delay={index * 80} animation="scale-in">
                  <div className="aspect-square overflow-hidden rounded-lg shadow-soft bg-muted">
                    <img
                      src={src}
                      alt={`Wedding moment ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </AnimatedSection>
              ),
            )}
          </div>
        </section>

        {/* ===== GIFTS SECTION ===== */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="fade-in">
              <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
              <p className="text-center text-template-body mb-8 text-muted-foreground">
                For those who desire a wedding list is available
              </p>
            </AnimatedSection>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { id: "1", card_name: "OMT", card_number: "123456789" },
                { id: "2", card_name: "Whish", card_number: "123456789" },
              ].map((card, index) => (
                <AnimatedSection key={card.id} delay={index * 100} animation="scale-in">
                  <div className="bg-background p-6 rounded-lg text-center">
                    <p className="font-semibold text-lg text-foreground">{card.card_name}</p>
                    <p className="text-muted-foreground mt-2">{card.card_number}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FULL-WIDTH GALLERY IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <section className="relative w-full">
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10">
              <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-card">
                <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
              </svg>
            </div>
            <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
              <img src={eclatWedding2} alt="Wedding moment" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-10">
              <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="w-full h-8 fill-background">
                <path d="M0,0V46.29c47.79,22,103.59,29,158,17.39C230.41,50,284,8,339.09,0c54.37-8,104.26,21.7,158.17,36.4C620,62,680,42,740,29c60-13,120-8,180,3,60,11,120,25,180,20V0Z" />
              </svg>
            </div>
          </section>
        </AnimatedSection>

        {/* ===== RSVP SECTION ===== */}
        <RsvpSection staticDeadline={new Date("2025-08-01")} bgClassName="bg-card" />
      </div>
    </div>
  );
};
