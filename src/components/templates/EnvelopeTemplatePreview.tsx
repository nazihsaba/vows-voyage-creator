import { useState, useRef } from "react";
import { Calendar, Church, Wine, PartyPopper, MapPin, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EnvelopeTemplatePreviewProps {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
}

export const EnvelopeTemplatePreview = ({
  groomName = "Michael",
  brideName = "Jessica",
  weddingDate = "2025-06-15",
}: EnvelopeTemplatePreviewProps) => {
  const [envelopeState, setEnvelopeState] = useState<"closed" | "opening" | "fading" | "open">("closed");

  const handleEnvelopeClick = () => {
    if (envelopeState === "closed") {
      setEnvelopeState("opening");
      setTimeout(() => {
        setEnvelopeState("fading");
      }, 1000);
      setTimeout(() => {
        setEnvelopeState("open");
      }, 2000);
    }
  };

  // Get couple initials for wax seal
  const groomInitial = groomName?.charAt(0)?.toUpperCase() || "M";
  const brideInitial = brideName?.charAt(0)?.toUpperCase() || "J";

  const isOpening = envelopeState === "opening" || envelopeState === "fading";
  const isFading = envelopeState === "fading";

  const weddingDateObj = new Date(weddingDate);
  const dateFormatted = weddingDateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });

  const timelineEvents = [
    {
      id: "ceremony",
      title: "Ceremony",
      time: "4:00 PM",
      location: "St. Mary's Cathedral",
      icon: Church,
    },
    {
      id: "welcome",
      title: "Welcome Drink",
      time: "5:30 PM",
      location: "The Grand Ballroom",
      icon: Wine,
    },
    {
      id: "dinner",
      title: "Dinner & Party",
      time: "7:00 PM",
      location: "The Grand Ballroom",
      icon: PartyPopper,
    },
  ];

  const sampleGiftCards = [
    { id: "1", card_name: "Wedding Fund", card_number: "1234-5678-9012-3456" },
    { id: "2", card_name: "Honeymoon Fund", card_number: "9876-5432-1098-7654" },
  ];

  const handleCopyCard = (cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber);
    toast.success("Card number copied!");
  };

  const renderEnvelopeScreen = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer`}
      onClick={handleEnvelopeClick}
      style={{
        background: "linear-gradient(145deg, #f5f0e6 0%, #e8dfd0 50%, #ddd4c5 100%)",
        opacity: isFading ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Closed Envelope - Full Screen */}
      <div className="relative w-full h-full">
        {/* Envelope body */}
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background: "linear-gradient(180deg, #f0e6d8 0%, #e5d9c8 50%, #d8cbb8 100%)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        />

        {/* Envelope flap (opens slightly) */}
        <div
          className="absolute top-0 left-0 right-0 h-[55%]"
          style={{
            background: "linear-gradient(180deg, #ebe1d3 0%, #e0d4c2 100%)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            boxShadow: isOpening ? "0 8px 20px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.08)",
            transformOrigin: "top center",
            transform: isOpening ? "rotateX(-45deg)" : "rotateX(0deg)",
            transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
            zIndex: 10,
          }}
        />

        {/* Wax Seal - Centered */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 20 }}>
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center shadow-xl"
            style={{
              background: "radial-gradient(circle at 35% 35%, #e8dfd0 0%, #d8cfc0 30%, #c8bfb0 70%, #b8afa0 100%)",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.2), inset 0 -2px 8px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.3)",
            }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: "128px",
                height: "128px",
                background: "radial-gradient(circle at 40% 40%, #e0d7c8 0%, #d0c7b8 50%, #c5bca8 100%)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <span
                className="text-3xl tracking-wide"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  color: "#8a7a6a",
                  textShadow: "0 1px 1px rgba(255,255,255,0.4)",
                }}
              >
                {groomInitial}&{brideInitial}
              </span>
            </div>
          </div>
        </div>

        {/* Tap to open hint */}
        <div className="absolute bottom-16 left-0 right-0 text-center" style={{ zIndex: 12 }}>
          <p className="text-sm text-[#8a7a6a] animate-pulse">Tap to open</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-white font-serif text-[#3e2723]">
      {/* Envelope Screen - Show if not fully open */}
      {envelopeState !== "open" && renderEnvelopeScreen()}

      {/* Main Content - Only show after envelope is opened */}
      {envelopeState === "open" && (
        <div className="overflow-y-auto min-h-screen">
          {/* Watercolor Header Effect */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#d4e5f7]/60 via-[#e8f0f7]/30 to-transparent pointer-events-none z-10" />

          {/* Scrollable Content */}
          <div className="px-6 py-12">
            {/* ===== INTRO SECTION ===== */}
            <section className="min-h-[80vh] flex flex-col items-center justify-center text-center mb-16 relative">
              {/* Bible Verse Quote */}
              <div className="mb-8 animate-fade-in">
                <p className="text-template-body max-w-md mx-auto">
                  "Two are better than one. For if they fall, one will lift up the other."
                </p>
                <p className="text-template-small mt-2">- Ecclesiastes 4:9-12</p>
              </div>

              {/* Together with their families */}
              <div className="mb-6">
                <p className="text-template-body">Together with their families</p>
              </div>

              {/* Parents Names */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mb-6">
                <div className="text-center">
                  <p className="text-primary font-semibold">Mr. & Mrs. Smith</p>
                  <p className="text-template-subtitle">Smith</p>
                </div>

                <span className="text-2xl text-gray-400">&</span>

                <div className="text-center">
                  <p className="text-primary font-semibold">Mr. & Mrs. Johnson</p>
                  <p className="text-template-subtitle">Johnson</p>
                </div>
              </div>

              {/* Invitation Text */}
              <div className="mb-6">
                <p className="text-template-body whitespace-pre-line">
                  joyfully invite you to the wedding of their{"\n"}beloved son and daughter
                </p>
              </div>

              {/* Couple Names */}
              <div className="mb-6">
                <h1 className="text-template-title">
                  {groomName} & {brideName}
                </h1>
              </div>

              {/* Wedding Date */}
              <div>
                <p className="text-template-body text-primary font-semibold">
                  {new Date(weddingDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Corner Decorations */}
              <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-gray-300 rounded-br-lg" />
            </section>

            {/* Divider */}
            <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

            {/* ===== TIMELINE SECTION ===== */}
            <section className="mb-16">
              {/* Date Header */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <Calendar className="w-7 h-7 text-primary" />
                <h2 className="text-template-subtitle">{dateFormatted}</h2>
              </div>

              {/* Vertical Timeline */}
              <div className="relative max-w-lg mx-auto">
                {/* Vertical Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2" />

                {/* Timeline Events */}
                <div className="space-y-12">
                  {timelineEvents.map((event) => (
                    <div key={event.id} className="relative flex items-start">
                      {/* Left Side - Event Name & Time */}
                      <div className="flex-1 text-right pr-8">
                        <h3 className="text-template-body font-medium">{event.title}</h3>
                        <p className="text-template-body font-semibold">{event.time}</p>
                      </div>

                      {/* Center Dot */}
                      <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full z-10" />

                      {/* Right Side - Icon, Location & Link */}
                      <div className="flex-1 pl-8">
                        <event.icon className="w-6 h-6 mb-1 text-primary" />
                        <p className="text-template-small text-gray-600 leading-snug">{event.location}</p>
                        <a
                          href="#"
                          className="inline-flex items-center gap-1 text-template-small underline mt-1 hover:text-primary transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                          Location
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

            {/* ===== GALLERY SECTION ===== */}
            <section className="mb-16">
              <h2 className="text-template-subtitle text-center text-primary mb-8">Our Moments</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=400&fit=crop",
                  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop",
                ].map((src, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-soft bg-gray-200">
                    <img src={src} alt={`Wedding moment ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>

            {/* Divider */}
            <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

            {/* ===== GIFTS SECTION ===== */}
            <section className="py-16 px-4 bg-white">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
                <p className="text-center text-template-body mb-8 text-gray-600">
                  For those who desire a wedding list is available
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {sampleGiftCards.map((card) => (
                    <div key={card.id} className="bg-[#faf8f5] p-6 rounded-lg text-center">
                      <p className="font-semibold text-lg text-[#3e2723]">{card.card_name}</p>
                      <p className="text-gray-600 mt-2">{card.card_number}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="w-24 h-0.5 bg-gray-300 mx-auto mb-16" />

            {/* ===== RSVP SECTION ===== */}
            <section className="py-16 px-4 bg-white">
              <div className="max-w-3xl mx-auto space-y-8">
                <h2 className="text-template-subtitle text-center mb-12 text-primary">Join Our Celebration</h2>

                <p className="text-template-body text-center text-gray-600">
                  Please let us know if you can join us on our special day. Your presence would mean the world to us.
                </p>

                <div className="pt-8 border-t border-gray-300">
                  <p className="text-template-small text-center mb-2 text-gray-600">
                    Kindly confirm your attendance before this date:
                  </p>
                  <p className="text-template-heading text-primary text-center">May 15, 2025</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
