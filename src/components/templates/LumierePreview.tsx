import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
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

/* ── Watercolor / brush-stroke edge mask applied to divider images ── */
const brushMaskStyle: React.CSSProperties = {
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%), " +
    "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
  WebkitMaskComposite: "source-in" as any,
  maskImage:
    "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%), " +
    "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
  maskComposite: "intersect" as any,
};

const weddingDate = new Date("2025-08-16");
const previewVideoUrl = "/videos/lumiere-preview.mp4";

const LumierePreview = () => {
  const dividerImages = [eclatWedding2, eclatWedding3, eclatWedding4, eclatWedding5, eclatWedding6, eclatWedding7];

  const dividerMedia = (index: number) => (
    <AnimatedSection animation="fade-in">
      <div className="w-full h-[55vh] overflow-hidden my-4" style={brushMaskStyle}>
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src={previewVideoUrl} type="video/mp4" />
        </video>
      </div>
    </AnimatedSection>
  );

  return (
    <div className="relative w-full min-h-screen bg-white text-foreground lg:px-[25%]">
      <div>
        {/* ===== HERO — full-width video with brush edges ===== */}
        <section className="relative w-full">
          <div className="w-full h-[85vh] overflow-hidden" style={brushMaskStyle}>
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src={previewVideoUrl} type="video/mp4" />
            </video>
          </div>

          {/* Monogram with heart */}
          <div className="py-14 px-6 text-center">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
              <p className="text-xl tracking-widest text-foreground/80 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                A<span className="text-foreground/50 mx-1">♥</span>E
              </p>
            </div>
          </div>
        </section>

        {/* ===== INVITATION MESSAGE ===== */}
        <section className="py-10 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-8">
              <p className="text-lg italic leading-relaxed text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                I have found the one whom my soul loves.
              </p>

              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-1">
                  <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Mr. & Mrs. Vale
                  </p>
                  <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Mr. & Mrs. Maris
                  </p>
                </div>
              </div>

              <p className="text-base leading-relaxed text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Kindly join us as we unite in marriage.
              </p>

              {/* Couple names in script */}
              <div className="space-y-1">
                <p className="text-4xl md:text-5xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Adrian
                </p>
                <p className="text-2xl text-foreground/40" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  &
                </p>
                <p className="text-4xl md:text-5xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Elena
                </p>
              </div>

              {/* Date */}
              <p className="text-lg tracking-wide text-foreground" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Saturday, August 16th, 2025
              </p>

              <p className="text-sm italic text-foreground/50" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                The wedding day has arrived!
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== DIVIDER IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <div className="w-full h-[55vh] overflow-hidden my-4" style={brushMaskStyle}>
            <img src={dividerImages[0]} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </AnimatedSection>

        {/* ===== CEREMONY ===== */}
        <section className="py-16 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-5">
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

        {/* ===== DIVIDER IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <div className="w-full h-[55vh] overflow-hidden my-4" style={brushMaskStyle}>
            <img src={dividerImages[1]} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </AnimatedSection>

        {/* ===== CELEBRATION ===== */}
        <section className="py-16 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-5">
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

        {/* ===== DIVIDER IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <div className="w-full h-[55vh] overflow-hidden my-4" style={brushMaskStyle}>
            <img src={dividerImages[2]} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </AnimatedSection>

        {/* ===== GIFT REGISTRY ===== */}
        <section className="py-16 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <div className="max-w-md mx-auto space-y-6">
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

        {/* ===== DIVIDER IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <div className="w-full h-[55vh] overflow-hidden my-4" style={brushMaskStyle}>
            <img src={dividerImages[3]} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </AnimatedSection>

        {/* ===== RSVP ===== */}
        <RsvpSection
          staticDeadline={new Date("2025-08-01")}
          bgClassName="bg-white"
          invitees={[
            { id: "1", name: "Daniel Farah" },
            { id: "2", name: "Sara Mansour" },
          ]}
          rsvpResponses={{ "1": true, "2": false }}
          numberOfPersons={2}
          isPreview
        />

        {/* ===== DIVIDER IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <div className="w-full h-[55vh] overflow-hidden my-4" style={brushMaskStyle}>
            <img src={dividerImages[4]} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </AnimatedSection>

        {/* ===== FOOTER ===== */}
        <section className="py-16 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <p className="text-xl text-foreground/70" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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
