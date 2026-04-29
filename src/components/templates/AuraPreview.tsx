import { useEffect, useState } from "react";
import { Calendar, MapPin, Copy } from "lucide-react";
import { Icon } from "@iconify/react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import TemplateLoader from "@/components/templates/TemplateLoader";
import doree1 from "@/assets/doree1.jpeg";
import doree2 from "@/assets/doree2.jpeg";
import doree3 from "@/assets/doree3.jpeg";
import doree4 from "@/assets/doree4.jpeg";
import doree5 from "@/assets/doree5.jpeg";
import doree6 from "@/assets/doree6.jpeg";
const weddingDate = new Date("2026-08-16");

export const AuraPreview = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const img = new Image();
    img.src = doree1;
    const done = () => setLoading(false);
    img.onload = done;
    img.onerror = done;
    const t = window.setTimeout(done, 4000);
    return () => window.clearTimeout(t);
  }, []);
  const timelineEvents = [
    {
      id: "ceremony",
      title: "Ceremony",
      time: "7:00 PM",
      location: "Couvent Saint Sauveur - Sarba",
      icon: <Icon icon="material-symbols:church-rounded" className="w-6 h-6 mb-1 text-primary" />,
    },
    {
      id: "welcome",
      title: "Welcome Drink",
      time: "8:00 PM",
      location: "Carma - Jeita Country Club",
      icon: <Icon icon="streamline:champagne-party-alcohol-remix" className="w-6 h-6 mb-1 text-primary" />,
    },
    {
      id: "dinner",
      title: "Dinner & Party",
      time: "9:00 PM",
      location: "Carma - Jeita Country Club",
      icon: <Icon icon="solar:confetti-bold" className="w-6 h-6 mb-1 text-primary" />,
    },
  ];

  if (loading) {
    return <TemplateLoader groomName="Adrian" brideName="Elena" />;
  }

  return (
    <div className="relative w-full min-h-screen bg-background font-serif text-foreground lg:px-[25%] animate-fade-in">
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

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.3s_forwards]">
              <p className="text-template-body opacity-70">It is with the greatest pleasure that the</p>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                <div className="text-center space-y-1">
                  <p className="text-template-subtitle">Vale Family</p>
                </div>
                <span className="text-3xl font-light">&</span>
                <div className="text-center space-y-1">
                  <p className="text-template-subtitle">Maris Family</p>
                </div>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeIn_0.7s_ease-out_0.55s_forwards]">
              <p className="text-template-body opacity-70 whitespace-pre-line leading-relaxed">
                Cordially invite you to celebrate the wedding of their son and daughter
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
                  Saturday, August 16th, 2026
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MAIN WEDDING PHOTO ===== */}
        <AnimatedSection animation="fade-in">
          <section className="w-full px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-lg">
                <img src={doree1} alt="Wedding photo" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </div>
          </section>
        </AnimatedSection>

        <div className="w-24 h-px mx-auto" />

        {/* ===== COUNTDOWN SECTION ===== */}
        <section className="py-16 px-4 bg-card">
          <CountdownTimer targetDate={weddingDate} />
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
                      {event.icon}
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
            {[doree1, doree2, doree3, doree4, doree5, doree6].map(
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
                Your presence is our biggest gift. For those who desire a wedding list was set up:
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
          <section className="w-full px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-lg">
                <img src={doree3} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ===== RSVP SECTION ===== */}
        <RsvpSection
          staticDeadline={new Date("2026-08-01")}
          bgClassName="bg-card"
          invitees={[
            { id: "1", name: "Daniel Farah" },
            { id: "2", name: "Sara Mansour" },
          ]}
          rsvpResponses={{ "1": true, "2": false }}
          numberOfPersons={2}
          isPreview
        />

        {/* ===== BRANDED FOOTER ===== */}
        <TemplatePreviewFooter />
      </div>
    </div>
  );
};
