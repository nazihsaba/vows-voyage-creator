import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Heart, Gift } from "lucide-react";

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
          <div key={item.label} className="bg-background border border-border rounded-2xl px-4 py-5 md:px-6 md:py-6 min-w-[70px] md:min-w-[90px]">
            <div className="text-3xl md:text-5xl font-light text-primary tabular-nums">{item.value}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-2 uppercase tracking-wider">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GracePreview = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const wedding = {
    groom_name: "Anthony",
    bride_name: "Odile",
    wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    groom_family: "The Johnson Family",
    bride_family: "The Williams Family",
    video_url: "https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4",
    rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  };

  const ceremony = { time: "2:00 PM", location_name: "St. Mary's Cathedral", location_link: "#" };
  const venue = { time: "5:00 PM", location_name: "Grand Ballroom Hotel", location_link: "#" };
  const giftCards = [
    { id: "1", card_name: "OMT", card_number: "123456789" },
    { id: "2", card_name: "Whish", card_number: "987654321" },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollHeight = container.scrollHeight - container.clientHeight;
      setScrollProgress(scrollHeight > 0 ? (container.scrollTop / scrollHeight) * 100 : 0);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const handleStartClick = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("family-section-video-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-y-auto">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={wedding.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-white/10 z-50">
        <div className="h-full bg-white/60 transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center text-white">
          <div className="space-y-8 animate-fade-in">
            <p className="text-template-small text-white/70">The Wedding Of</p>
            <div className="space-y-3">
              <h1 className="text-template-title">{wedding.groom_name}</h1>
              <p className="text-3xl md:text-4xl font-light opacity-50">&</p>
              <h1 className="text-template-title">{wedding.bride_name}</h1>
            </div>
            <p className="text-template-body tracking-widest text-white/70">
              {wedding.wedding_date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            {!hasStarted && (
              <Button onClick={handleStartClick} className="mt-8 bg-white/15 hover:bg-white/25 text-white border border-white/40 px-10 py-6 text-lg backdrop-blur-md rounded-full">
                Open Invitation
              </Button>
            )}
          </div>
        </section>

        {/* Family Names */}
        <section id="family-section-video-preview" className="flex items-center justify-center px-4 py-8">
          <div className="max-w-xl w-full bg-card/95 backdrop-blur-xl rounded-3xl p-8 md:p-14 shadow-2xl border border-border/50">
            <div className="space-y-8 text-center">
              <p className="text-template-small text-muted-foreground">Together With Their Families</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-template-small text-muted-foreground mb-2">Groom's Family</p>
                  <h2 className="text-template-heading text-foreground">{wedding.groom_family}</h2>
                </div>
                <div>
                  <p className="text-template-small text-muted-foreground mb-2">Bride's Family</p>
                  <h2 className="text-template-heading text-foreground">{wedding.bride_family}</h2>
                </div>
              </div>
              <div className="pt-6 border-t border-border">
                <p className="text-template-body text-muted-foreground">
                  Request the honor of your presence at the wedding celebration
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Countdown */}
        <section className="min-h-[65vh] flex items-center justify-center px-4 py-8">
          <div className="max-w-xl w-full bg-card/95 backdrop-blur-xl rounded-3xl p-8 md:p-14 shadow-2xl border border-border/50">
            <StaticCountdownTimer targetDate={wedding.wedding_date} />
          </div>
        </section>

        {/* Events */}
        <section className="flex items-center justify-center px-4 py-8">
          <div className="max-w-3xl w-full space-y-4">
            <div className="text-center bg-card/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-border/50 mb-4">
              <p className="text-template-small text-muted-foreground mb-2">The Celebration</p>
              <h2 className="text-template-subtitle text-foreground">Wedding Events</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Ceremony", ...ceremony, icon: "🕊️" },
                { label: "Venue", ...venue, icon: "🎉" },
              ].map((event) => (
                <div key={event.label} className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-8 text-center space-y-4">
                  <span className="text-3xl">{event.icon}</span>
                  <h3 className="text-template-heading text-foreground">{event.label}</h3>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <p className="font-medium">{event.time}</p>
                  </div>
                  <p className="text-muted-foreground">{event.location_name}</p>
                  <a href={event.location_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                    <MapPin className="w-4 h-4" /> View on Map
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gift Cards */}
        <section className="min-h-[60vh] flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full bg-card/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-border/50 text-center">
            <Gift className="w-6 h-6 text-primary mx-auto mb-3" />
            <h2 className="text-template-subtitle text-foreground mb-2">Wedding Gift</h2>
            <p className="text-template-body text-muted-foreground mb-8">
              For those who desire, a wedding list is available
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {giftCards.map((card) => (
                <div key={card.id} className="bg-background border border-border p-5 rounded-xl hover:border-primary/30 transition-colors">
                  <p className="font-semibold text-foreground">{card.card_name}</p>
                  <p className="text-muted-foreground text-sm mt-1.5 font-mono">{card.card_number}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RSVP */}
        <section className="flex items-center justify-center px-4 py-8 pb-16">
          <div className="max-w-lg w-full bg-card/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-border/50 text-center">
            <h2 className="text-template-subtitle text-foreground mb-4">Join Our Celebration</h2>
            <p className="text-template-body text-muted-foreground mb-8">
              Your presence would mean the world to us.
            </p>
            <div className="pt-6 border-t border-border">
              <p className="text-template-small text-muted-foreground mb-2">Kindly confirm before:</p>
              <p className="text-template-heading text-primary">
                {wedding.rsvp_deadline.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <Heart className="w-5 h-5 text-white/30 mx-auto" />
        </div>
      </div>
    </div>
  );
};
