import { useState, useEffect } from "react";
import { Calendar, Church, Wine, PartyPopper, MapPin, Heart, Gift } from "lucide-react";

const StaticCountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
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
      <p className="text-template-small mb-2 text-muted-foreground">Save The Date</p>
      <h2 className="text-template-subtitle mb-8 text-foreground">Counting Down To Our Day</h2>
      <div className="flex justify-center gap-3 md:gap-6">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Min" },
          { value: timeRemaining.seconds, label: "Sec" },
        ].map((item) => (
          <div key={item.label} className="bg-background border border-border rounded-2xl px-4 py-5 md:px-6 md:py-6 min-w-[70px] md:min-w-[90px] shadow-sm">
            <div className="text-3xl md:text-5xl font-light text-primary tabular-nums">{item.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Ornament = () => (
  <div className="flex items-center justify-center gap-3 py-8">
    <div className="h-px w-16 bg-border" />
    <Heart className="w-4 h-4 text-primary/40" />
    <div className="h-px w-16 bg-border" />
  </div>
);

const weddingDate = new Date("2025-08-16");

export const AuraPreview = () => {
  const timelineEvents = [
    { id: "ceremony", title: "Ceremony", time: "7:00 PM", location: "Couvent Saint Sauveur - Sarba", icon: Church },
    { id: "welcome", title: "Welcome Drink", time: "8:00 PM", location: "Carma - Jeita Country Club", icon: Wine },
    { id: "dinner", title: "Dinner & Party", time: "9:00 PM", location: "Carma - Jeita Country Club", icon: PartyPopper },
  ];

  return (
    <div className="relative w-full min-h-screen bg-card overflow-y-auto font-serif text-foreground">
      {/* Soft gradient header */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none z-10" />

      <div className="px-6 py-12 max-w-2xl mx-auto">
        {/* ===== INTRO SECTION ===== */}
        <section className="min-h-[85vh] flex flex-col items-center justify-center text-center mb-8">
          <div className="mb-10 animate-fade-in">
            <p className="text-template-body italic max-w-sm mx-auto text-muted-foreground leading-relaxed">
              "Two are better than one. For if they fall, one will lift up the other."
            </p>
            <p className="text-template-small mt-3 text-muted-foreground/70">— Ecclesiastes 4:9-12</p>
          </div>

          <p className="text-template-small mb-8 text-muted-foreground">Together with their families</p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8">
            <div className="text-center">
              <p className="text-primary font-medium text-lg">Mr. Pierre & Mrs. Nayla</p>
              <p className="text-template-heading mt-1">Nawfal</p>
            </div>
            <span className="text-3xl text-primary/40 font-light">&</span>
            <div className="text-center">
              <p className="text-primary font-medium text-lg">Mr. Michel & Mrs. Layla</p>
              <p className="text-template-heading mt-1">Assaker</p>
            </div>
          </div>

          <p className="text-template-body text-muted-foreground mb-8">
            joyfully invite you to the wedding of their beloved son and daughter
          </p>

          <h1 className="text-template-title text-foreground mb-6">Stephan & Chadia</h1>

          <div className="inline-flex items-center gap-3 bg-primary/10 rounded-full px-6 py-3">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-template-body text-primary font-medium">Saturday, August 16th, 2025</p>
          </div>
        </section>

        <Ornament />

        {/* ===== COUNTDOWN SECTION ===== */}
        <section className="py-12">
          <StaticCountdownTimer targetDate={weddingDate} />
        </section>

        <Ornament />

        {/* ===== TIMELINE SECTION ===== */}
        <section className="py-12">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-template-subtitle">16 August</h2>
          </div>

          <div className="relative max-w-lg mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

            <div className="space-y-10">
              {timelineEvents.map((event) => (
                <div key={event.id} className="relative flex items-start">
                  <div className="flex-1 text-right pr-6">
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    <p className="text-primary font-semibold mt-1">{event.time}</p>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-primary/10 border-2 border-primary rounded-full z-10 flex items-center justify-center">
                    <event.icon className="w-3.5 h-3.5 text-primary" />
                  </div>

                  <div className="flex-1 pl-6">
                    <p className="text-sm text-muted-foreground leading-snug mt-1">{event.location}</p>
                    <a href="#" className="inline-flex items-center gap-1.5 text-sm text-primary mt-2 hover:underline transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                      View Location
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Ornament />

        {/* ===== GALLERY SECTION ===== */}
        <section className="py-12">
          <p className="text-template-small text-center mb-2 text-muted-foreground">Captured Memories</p>
          <h2 className="text-template-subtitle text-center text-foreground mb-8">Our Moments</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl mx-auto">
            {[
              "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop",
            ].map((src, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-xl bg-muted group">
                <img src={src} alt={`Wedding moment ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </section>

        <Ornament />

        {/* ===== GIFTS SECTION ===== */}
        <section className="py-12">
          <div className="text-center mb-8">
            <Gift className="w-6 h-6 text-primary mx-auto mb-3" />
            <h2 className="text-template-subtitle text-foreground mb-2">Wedding Gift</h2>
            <p className="text-template-body text-muted-foreground">
              For those who desire, a wedding list is available
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 max-w-md mx-auto">
            {[
              { id: "1", card_name: "OMT", card_number: "123456789" },
              { id: "2", card_name: "Whish", card_number: "123456789" },
            ].map((card) => (
              <div key={card.id} className="bg-background border border-border p-5 rounded-xl text-center hover:border-primary/30 transition-colors">
                <p className="font-semibold text-foreground">{card.card_name}</p>
                <p className="text-muted-foreground text-sm mt-1.5 font-mono">{card.card_number}</p>
              </div>
            ))}
          </div>
        </section>

        <Ornament />

        {/* ===== RSVP SECTION ===== */}
        <section className="py-12">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 md:p-12 text-center max-w-lg mx-auto">
            <h2 className="text-template-subtitle text-foreground mb-4">Join Our Celebration</h2>
            <p className="text-template-body text-muted-foreground mb-8">
              Please let us know if you can join us on our special day. Your presence would mean the world to us.
            </p>
            <div className="pt-6 border-t border-primary/10">
              <p className="text-template-small text-muted-foreground mb-2">
                Kindly confirm your attendance before:
              </p>
              <p className="text-template-heading text-primary">August 1, 2025</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <Heart className="w-5 h-5 text-primary/30 mx-auto" />
        </div>
      </div>
    </div>
  );
};
