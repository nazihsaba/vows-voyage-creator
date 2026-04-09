import { useState } from "react";
import { MapPin } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import eclatWedding1 from "@/assets/eclat-wedding-1.jpg";

const previewVideoUrl = "/videos/lumiere-preview.mp4";

/* Torn paper SVG filter is defined inline below */

const LumierePreview = () => {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="relative w-full min-h-screen text-foreground">
      {/* ===== LAYER 1 — Fixed fullscreen background video ===== */}
      <div className="fixed inset-0 z-0 w-full h-full">
        {!videoFailed ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
            className="w-full h-full object-cover"
          >
            <source src={previewVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <img src={eclatWedding1} alt="Wedding" className="w-full h-full object-cover" />
        )}
      </div>

      {/* ===== LAYER 2 — Dark overlay for readability ===== */}
      <div className="fixed inset-0 z-[1] bg-black/40" />

      {/* ===== LAYER 3 — Scrollable content ===== */}
      <div className="relative z-[2] lg:px-[25%]">
        {/* ===== HERO ===== */}
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            <p className="text-xl tracking-widest text-white/80 mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              A<span className="text-white/50 mx-1">♥</span>E
            </p>
            <div className="space-y-1">
              <p className="text-5xl md:text-6xl text-white" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Adrian
              </p>
              <p className="text-2xl text-white/50" style={{ fontFamily: "'Dancing Script', cursive" }}>
                &
              </p>
              <p className="text-5xl md:text-6xl text-white" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Elena
              </p>
            </div>
            <p className="text-lg tracking-wide text-white/80 mt-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Saturday, August 16th, 2025
            </p>
          </div>
        </section>

        {/* ===== INVITATION MESSAGE ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-8 p-8 md:p-10" style={brushCardStyle}>
              <p className="text-lg italic leading-relaxed text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                I have found the one whom my soul loves.
              </p>

              <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Mr. & Mrs. Vale
                </p>
                <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Mr. & Mrs. Maris
                </p>
              </div>

              <p className="text-base leading-relaxed text-foreground/70 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Kindly join us as we unite in marriage.
              </p>

              <p className="text-sm italic text-foreground/50 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                The wedding day has arrived!
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== CEREMONY ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-5 p-8 md:p-10 text-center" style={brushCardStyle}>
              <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Wedding Ceremony
              </h2>
              <MapPin className="w-6 h-6 mx-auto text-foreground/80 fill-foreground/80" />
              <div className="space-y-1">
                <p className="text-base text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Couvent Saint Sauveur - Sarba - 07:00 PM
                </p>
                <p className="text-base text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Jounieh, Lebanon
                </p>
              </div>
              <a
                href="#"
                className="inline-block text-sm border border-foreground/30 px-8 py-2.5 text-foreground/70 hover:text-foreground hover:border-foreground/50 transition-colors"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Map
              </a>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== CELEBRATION ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-5 p-8 md:p-10 text-center" style={brushCardStyle}>
              <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                The Celebration
              </h2>
              <MapPin className="w-6 h-6 mx-auto text-foreground/80 fill-foreground/80" />
              <div className="space-y-1">
                <p className="text-base text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Carma - Jeita Country Club - 08:00 PM
                </p>
                <p className="text-base text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Jeita, Lebanon
                </p>
              </div>
              <a
                href="#"
                className="inline-block text-sm border border-foreground/30 px-8 py-2.5 text-foreground/70 hover:text-foreground hover:border-foreground/50 transition-colors"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Map
              </a>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== GIFT REGISTRY ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-6 p-8 md:p-10 text-center" style={brushCardStyle}>
              <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Gift Registry
              </h2>
              <p className="text-base leading-relaxed text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Your love, laughter and presence are all we could wish for on our special day. For those who wish, a wedding list is available
              </p>

              <div className="space-y-6 pt-4">
                {[
                  { id: "1", card_name: "Bank Account", card_number: "IBAN: 20249265" },
                  { id: "2", card_name: "Whish", card_number: "#123456" },
                ].map((card) => (
                  <div key={card.id} className="space-y-1">
                    <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {card.card_name}
                    </p>
                    <p className="text-foreground/60 text-sm">{card.card_number}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== RSVP ===== */}
        <div className="px-6 py-16">
          <div className="max-w-md mx-auto" style={brushCardStyle}>
            <RsvpSection
              staticDeadline={new Date("2025-08-01")}
              bgClassName="bg-transparent"
              invitees={[
                { id: "1", name: "Daniel Farah" },
                { id: "2", name: "Sara Mansour" },
              ]}
              rsvpResponses={{ "1": true, "2": false }}
              numberOfPersons={2}
              isPreview
            />
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <section className="py-16 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <p className="text-xl text-white/80" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              ♡ Happily ever after ♡
            </p>
          </AnimatedSection>
        </section>

        <TemplatePreviewFooter />
      </div>
    </div>
  );
};

export default LumierePreview;
