import { useState, useEffect } from "react";
import { ChevronDown, PartyPopper, Church, MapPin, Clock, Heart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import weddingHero from "@/assets/wedding-hero.jpg";

const staticWedding = {
  groom_name: "Chris",
  bride_name: "Adele",
  groom_family: "The Johnson Family",
  bride_family: "The Williams Family",
  wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  main_picture_url: weddingHero,
};

const staticLocations = [
  { id: "1", type: "ceremony", location_name: "St.Michel Church", time: "6:00 PM", location_link: "#" },
  { id: "2", type: "venue", location_name: "Le Petit Paradis", time: "8:00 PM", location_link: "#" },
];

const staticGallery = [
  { id: "1", image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop" },
  { id: "2", image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop" },
  { id: "3", image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop" },
  { id: "4", image_url: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&h=600&fit=crop" },
];

const staticGiftCards = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "123456789" },
];

const StaticCountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      <p className="text-template-small mb-2 text-muted-foreground">Save The Date</p>
      <h2 className="text-template-subtitle mb-8 text-foreground">Counting Down</h2>
      <div className="flex justify-center gap-3 md:gap-5">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Min" },
          { value: timeRemaining.seconds, label: "Sec" },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-2xl px-4 py-5 md:px-6 md:py-6 min-w-[70px] md:min-w-[90px] shadow-sm">
            <div className="text-3xl md:text-5xl font-light text-primary tabular-nums">{item.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Ornament = () => (
  <div className="flex items-center justify-center gap-3 py-6">
    <div className="h-px w-16 bg-border" />
    <Heart className="w-4 h-4 text-primary/40" />
    <div className="h-px w-16 bg-border" />
  </div>
);

export const EclatPreview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const ceremony = staticLocations.find((loc) => loc.type === "ceremony");
  const venue = staticLocations.find((loc) => loc.type === "venue");

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("family-section-classic")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="w-full bg-card text-foreground font-serif">
      {/* Hero Section */}
      <section
        className="relative h-screen flex flex-col items-center justify-center text-center text-white"
        style={{ backgroundImage: `url(${staticWedding.main_picture_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />

        <div className="relative z-10 space-y-6 px-4 max-w-2xl">
          <p className="text-template-small text-white/80">The Wedding Of</p>
          <div className="space-y-3">
            <h1 className="text-template-title">{staticWedding.groom_name}</h1>
            <p className="text-3xl md:text-4xl font-light opacity-60">&</p>
            <h1 className="text-template-title">{staticWedding.bride_name}</h1>
          </div>
          <p className="text-template-body tracking-widest text-white/80">
            {staticWedding.wedding_date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          {!hasStarted && (
            <Button onClick={handleStart} className="mt-8 bg-white/15 hover:bg-white/25 text-white border border-white/40 px-10 py-6 text-lg backdrop-blur-md rounded-full">
              Open Invitation
            </Button>
          )}
        </div>

        <div className="absolute bottom-8 animate-bounce opacity-60">
          <ChevronDown className="w-6 h-6 text-white" />
        </div>
      </section>

      {/* Family Names */}
      <section id="family-section-classic" className="py-20 px-4 text-center bg-card">
        <div className="max-w-xl mx-auto space-y-6">
          <p className="text-template-small text-muted-foreground">Together With Their Families</p>
          <h2 className="text-template-heading text-foreground">{staticWedding.groom_family}</h2>
          <span className="block text-2xl text-primary/40 font-light">&</span>
          <h2 className="text-template-heading text-foreground">{staticWedding.bride_family}</h2>
          <p className="text-template-body text-muted-foreground pt-4">
            Request the honor of your presence at the wedding celebration
          </p>
        </div>
      </section>

      {/* Gallery Strip */}
      <section className="relative">
        <div className="h-[45vh] md:h-[55vh] overflow-hidden">
          <img src={staticGallery[0].image_url} alt="Gallery" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Countdown */}
      <section className="py-20 px-4 bg-card">
        <StaticCountdownTimer targetDate={staticWedding.wedding_date} />
      </section>

      {/* Gallery Strip 2 */}
      <section className="relative">
        <div className="h-[45vh] md:h-[55vh] overflow-hidden">
          <img src={staticGallery[1].image_url} alt="Gallery" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Wedding Events */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-template-small text-muted-foreground mb-2">The Celebration</p>
            <h2 className="text-template-subtitle text-foreground">Wedding Events</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { data: ceremony, icon: Church, label: "Ceremony" },
              { data: venue, icon: PartyPopper, label: "Venue" },
            ].map(({ data, icon: Icon, label }) => data && (
              <div key={data.id} className="bg-background border border-border rounded-2xl p-8 text-center space-y-4 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-template-heading text-foreground">{label}</h3>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="font-medium">{data.time}</p>
                </div>
                <p className="text-muted-foreground">{data.location_name}</p>
                <a href={data.location_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                  <MapPin className="w-4 h-4" /> View on Map
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Strip 3 */}
      <section className="relative">
        <div className="h-[45vh] md:h-[55vh] overflow-hidden">
          <img src={staticGallery[2].image_url} alt="Gallery" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Gift Cards */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-md mx-auto text-center">
          <Gift className="w-6 h-6 text-primary mx-auto mb-3" />
          <h2 className="text-template-subtitle text-foreground mb-2">Wedding Gift</h2>
          <p className="text-template-body text-muted-foreground mb-8">
            For those who desire, a wedding list is available
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {staticGiftCards.map((card) => (
              <div key={card.id} className="bg-background border border-border p-5 rounded-xl hover:border-primary/30 transition-colors">
                <p className="font-semibold text-foreground">{card.card_name}</p>
                <p className="text-muted-foreground text-sm mt-1.5 font-mono">{card.card_number}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Strip 4 */}
      <section className="relative">
        <div className="h-[45vh] md:h-[55vh] overflow-hidden">
          <img src={staticGallery[3].image_url} alt="Gallery" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* RSVP */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-lg mx-auto">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-template-subtitle text-foreground mb-4">Join Our Celebration</h2>
            <p className="text-template-body text-muted-foreground mb-8">
              Please let us know if you can join us. Your presence would mean the world to us.
            </p>
            <div className="pt-6 border-t border-primary/10">
              <p className="text-template-small text-muted-foreground mb-2">Kindly confirm before:</p>
              <p className="text-template-heading text-primary">
                {staticWedding.rsvp_deadline.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-16 px-4 bg-background text-center">
        <div className="max-w-lg mx-auto">
          <Ornament />
          <p className="text-template-body text-muted-foreground italic">
            We are so excited to share this special day with you! Please enjoy every moment and make wonderful memories with us.
          </p>
          <div className="mt-6">
            <Heart className="w-5 h-5 text-primary/30 mx-auto" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default EclatPreview;
