import { useState } from "react";
import { MapPin } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import eclatWedding1 from "@/assets/eclat-wedding-1.jpg";

const previewVideoUrl = "/videos/lumiere-preview.mp4";

/* ── Deckled / torn-paper edge via SVG filter ── */
const DeckledEdgeFilter = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <filter id="deckled-edge">
        <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" seed="2" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

/* ── Card wrapper that applies deckled edge ONLY to the silhouette ── */
const DeckledCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative ${className}`}>
    {/* Background shape with deckled edges */}
    <div
      className="absolute inset-0 -left-4 -right-4"
      style={{
        background: "rgba(255, 255, 255, 0.92)",
        filter: "url(#deckled-edge)",
      }}
    />
    {/* Clean content on top — no filter */}
    <div className="relative" style={{ padding: "2rem" }}>
      {children}
    </div>
  </div>
);

/* ── Simple card style kept for non-deckled uses ── */
const cardStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.92)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.06)",
  padding: "2rem",
};

const LumierePreview = () => {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="relative w-full min-h-screen text-foreground overflow-hidden lg:max-w-[600px] lg:mx-auto">
      <DeckledEdgeFilter />
      {/* ===== LAYER 1 — Fixed fullscreen background video ===== */}
      <div className="absolute inset-0 z-0 w-full h-full">
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
      <div className="absolute inset-0 z-[1] bg-black/40" />

      {/* ===== LAYER 3 — Scrollable content ===== */}
      <div className="relative z-[2]">
        {/* ===== HERO ===== */}
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            <p className="text-xl tracking-widest text-white/80 mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
            <p className="text-lg tracking-wide text-white/80 mt-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Saturday, August 16th, 2025
            </p>
          </div>
        </section>

        {/* ===== INVITATION MESSAGE ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <DeckledCard className="w-full">
              <div className="space-y-8 text-center">
                <p className="text-lg italic leading-relaxed text-foreground/70" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  I have found the one whom my soul loves.
                </p>

                <div className="flex flex-col items-center gap-1">
                  <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Mr. & Mrs. Vale
                  </p>
                  <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Mr. & Mrs. Maris
                  </p>
                </div>

                <p className="text-base leading-relaxed text-foreground/70 text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Kindly join us as we unite in marriage.
                </p>

                <p className="text-sm italic text-foreground/50 text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  The wedding day has arrived!
                </p>
              </div>
            </DeckledCard>
          </AnimatedSection>
        </section>

        {/* ===== CEREMONY ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <DeckledCard className="w-full">
              <div className="space-y-5 text-center">
                <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Wedding Ceremony
                </h2>
                <MapPin className="w-6 h-6 mx-auto text-foreground/80 fill-foreground/80" />
                <div className="space-y-1">
                  <p className="text-base text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Couvent Saint Sauveur - Sarba - 07:00 PM
                  </p>
                  <p className="text-base text-foreground/70" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Jounieh, Lebanon
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-block text-sm border border-foreground/30 px-8 py-2.5 text-foreground/70 hover:text-foreground hover:border-foreground/50 transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Map
                </a>
              </div>
            </DeckledCard>
          </AnimatedSection>
        </section>

        {/* ===== CELEBRATION ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <DeckledCard className="w-full">
              <div className="space-y-5 text-center">
                <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  The Celebration
                </h2>
                <MapPin className="w-6 h-6 mx-auto text-foreground/80 fill-foreground/80" />
                <div className="space-y-1">
                  <p className="text-base text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Carma - Jeita Country Club - 08:00 PM
                  </p>
                  <p className="text-base text-foreground/70" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Jeita, Lebanon
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-block text-sm border border-foreground/30 px-8 py-2.5 text-foreground/70 hover:text-foreground hover:border-foreground/50 transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Map
                </a>
              </div>
            </DeckledCard>
          </AnimatedSection>
        </section>

        {/* ===== GIFT REGISTRY ===== */}
        <section className="py-16 px-6 flex justify-center">
          <AnimatedSection animation="fade-in">
            <DeckledCard className="w-full">
              <div className="space-y-6 text-center">
                <h2 className="text-3xl md:text-4xl text-foreground" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Gift Registry
                </h2>
                <p className="text-base leading-relaxed text-foreground/70" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Your love, laughter and presence are all we could wish for on our special day. For those who wish, a wedding list is available
                </p>

                <div className="space-y-6 pt-4">
                  {[
                    { id: "1", card_name: "Bank Account", card_number: "IBAN: 20249265" },
                    { id: "2", card_name: "Whish", card_number: "#123456" },
                  ].map((card) => (
                    <div key={card.id} className="space-y-1">
                      <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {card.card_name}
                      </p>
                      <p className="text-foreground/60 text-sm">{card.card_number}</p>
                    </div>
                  ))}
                </div>
              </div>
            </DeckledCard>
          </AnimatedSection>
        </section>

        {/* ===== RSVP ===== */}
        <div className="px-6 py-16">
          <DeckledCard className="w-full">
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
          </DeckledCard>
        </div>

        {/* ===== FOOTER ===== */}
        <section className="py-16 px-6 text-center">
          <AnimatedSection animation="fade-in">
            <p className="text-xl text-white/80" style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
