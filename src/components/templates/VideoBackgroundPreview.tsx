import { useState, useEffect, useRef } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftCards } from "@/components/GiftCards";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";

export const VideoBackgroundPreview = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Static data
  const wedding = {
    groom_name: "Anthony",
    bride_name: "Odile",
    wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    groom_family: "The Johnson Family",
    bride_family: "The Williams Family",
    video_url: "https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4",
    rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  };

  const ceremony = {
    type: "ceremony",
    time: "2:00 PM",
    location_name: "St. Mary's Cathedral",
    location_link: "https://maps.google.com",
  };

  const venue = {
    type: "venue",
    time: "5:00 PM",
    location_name: "Grand Ballroom Hotel",
    location_link: "https://maps.google.com",
  };

  const giftCards = [
    { id: "1", card_name: "OMT", card_number: "123456789" },
    { id: "2", card_name: "Whish", card_number: "987654321" },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Video autoplay prevented:", error);
      });
    }
  }, []);

  const handleStartClick = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("family-section-video-preview")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-y-auto">
      {/* Fixed Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={wedding.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div className="h-full bg-white transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center text-white">
          <div className="space-y-8 animate-fade-in">
            <p className="text-template-small">The Wedding Of</p>

            <div className="space-y-4">
              <h1 className="text-template-title">{wedding.groom_name}</h1>
              <p className="text-4xl md:text-5xl">&</p>
              <h1 className="text-template-title">{wedding.bride_name}</h1>
            </div>

            <p className="text-template-body tracking-widest">
              {wedding.wedding_date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {!hasStarted && (
              <Button
                onClick={handleStartClick}
                className="mt-8 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm animate-fade-in"
              >
                Tap To Start
              </Button>
            )}
          </div>
        </section>

        {/* Family Names Section */}
        <section id="family-section-video-preview" className="flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl w-full bg-white rounded-2xl p-8 md:p-16 shadow-2xl">
            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div className="space-y-4">
                  <p className="text-template-small">Groom's Family</p>
                  <h2 className="text-template-subtitle">{wedding.groom_family}</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-template-small">Bride's Family</p>
                  <h2 className="text-template-subtitle">{wedding.bride_family}</h2>
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <p className="text-template-body text-center">
                  Request the honor of your presence at the wedding celebration
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Countdown Section */}
        <section className="min-h-[75vh] flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl w-full bg-white rounded-2xl p-8 md:p-16 shadow-2xl">
            <CountdownTimer targetDate={wedding.wedding_date} />
          </div>
        </section>

        {/* Wedding Events Section */}
        <section className="flex items-center justify-center px-4 py-8">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-12 bg-white rounded-2xl p-8 shadow-2xl">
              <h2 className="text-template-subtitle mb-6 text-primary">Wedding Events</h2>
              <p className="text-template-subtitle mb-6 text-[#3e2723] opacity-90">
                Join us in celebrating this special day
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex">
                <div className="w-24 bg-primary/90 flex items-center justify-center">
                  <p className="text-white text-4xl font-cursive transform -rotate-90 whitespace-nowrap">Ceremony</p>
                </div>
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <p className="text-template-body font-bold text-base">{ceremony.time}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-bold">Event Location</p>
                    <p className="text-template-body text-base">{ceremony.location_name}</p>
                  </div>
                  <a
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-primary text-foreground px-6 py-3 rounded-full transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex">
                <div className="w-24 bg-primary/90 flex items-center justify-center">
                  <p className="text-white text-4xl font-cursive transform -rotate-90 whitespace-nowrap">Venue</p>
                </div>
                <div className="flex-1 p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <p className="text-template-body font-bold text-base">{venue.time}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-bold">Event Location</p>
                    <p className="text-template-body text-base">{venue.location_name}</p>
                  </div>
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-primary text-foreground px-6 py-3 rounded-full transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gift Cards Section */}
        <section className="min-h-[75vh] flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl w-full bg-white rounded-2xl px-2 py-8 md:p-8 shadow-2xl">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">Wedding Gift</h2>
            <p className="text-center text-template-body mb-8 text-gray-600">
              For those who desire a wedding list is available
            </p>
            <GiftCards giftCards={giftCards} isOwner={false} />
          </div>
        </section>

        {/* RSVP Section */}
        <section className="flex items-center justify-center px-4 py-8 pb-16">
          <div className="max-w-3xl w-full bg-white rounded-2xl p-8 md:p-16 shadow-2xl space-y-8">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">Join Our Celebration</h2>

            <p className="text-template-body text-center">
              Please let us know if you can join us on our special day. Your presence would mean the world to us.
            </p>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-center mb-2">Kindly confirm your attendance before:</p>
              <p className="text-xl font-semibold text-center">
                {wedding.rsvp_deadline.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
