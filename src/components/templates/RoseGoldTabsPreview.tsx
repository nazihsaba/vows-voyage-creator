import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

// Static Countdown Timer component
const StaticCountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 12,
    minutes: 30,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          days = 0;
          hours = 0;
          minutes = 0;
          seconds = 0;
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-sm text-white/80 tracking-wider uppercase">Counting Down To</p>
        <h2 className="text-2xl md:text-3xl font-serif text-white">Our Special Day</h2>
      </div>
      <div className="flex justify-center gap-3 md:gap-6">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Sec" },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xl md:text-3xl font-bold text-white">
                {String(item.value).padStart(2, "0")}
              </span>
            </div>
            <span className="text-xs md:text-sm text-white/80 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RoseGoldTabsPreview = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Static data
  const wedding = {
    groom_name: "Anthony",
    bride_name: "Odile",
    wedding_date: "2025-03-15",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-through-garden-4437-large.mp4",
    rsvp_deadline: "2025-03-01",
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
    { id: "1", card_name: "Bank Account", card_number: "****1234" },
    { id: "2", card_name: "Gift Registry", card_number: "****5678" },
  ];

  const PAGES = [
    { id: "cover", label: "Cover" },
    { id: "invitation", label: "Invitation" },
    { id: "location", label: "Location" },
    { id: "gifts", label: "Gifts" },
    { id: "rsvp", label: "RSVP" },
  ];

  const goToNextPage = () => {
    if (currentPage < PAGES.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleStartClick = () => {
    setHasStarted(true);
    goToNextPage();
  };

  const renderPage = () => {
    const pageId = PAGES[currentPage].id;

    switch (pageId) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-center text-white">
            <div className="space-y-8 animate-fade-in">
              <p className="text-template-small">The Wedding Of</p>

              <div className="space-y-4">
                <h1 className="text-template-title">{wedding.groom_name}</h1>
                <p className="text-4xl md:text-5xl">&</p>
                <h1 className="text-template-title">{wedding.bride_name}</h1>
              </div>

              <p className="text-template-body tracking-widest">
                {new Date(wedding.wedding_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {!hasStarted && (
              <Button
                onClick={handleStartClick}
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-12 py-6 text-lg rounded-full"
              >
                START
              </Button>
            )}
          </div>
        );

      case "invitation":
        return (
          <div className="space-y-6 text-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <StaticCountdownTimer />
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Wedding Events</h2>
              <p className="text-white/80">Join us in celebrating this special day</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl shadow-2xl overflow-hidden flex bg-white/10 backdrop-blur-sm">
                <div className="w-24 bg-white flex items-center justify-center">
                  <p className="text-[hsl(54,20%,60%)] text-4xl font-cursive transform -rotate-90 whitespace-nowrap">
                    Ceremony
                  </p>
                </div>
                <div className="flex-1 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-white" />
                    <p className="text-white font-bold">{ceremony.time}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl font-bold text-white">Event Location</p>
                    <p className="text-white">{ceremony.location_name}</p>
                  </div>
                  <a
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-full transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="text-white">Google Maps</span>
                  </a>
                </div>
              </div>

              <div className="rounded-xl shadow-2xl overflow-hidden flex bg-white/10 backdrop-blur-sm">
                <div className="w-24 bg-white flex items-center justify-center">
                  <p className="text-[hsl(54,20%,60%)] text-4xl font-cursive transform -rotate-90 whitespace-nowrap">
                    Venue
                  </p>
                </div>
                <div className="flex-1 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-white" />
                    <p className="text-white font-bold">{venue.time}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xl font-bold text-white">Event Location</p>
                    <p className="text-white">{venue.location_name}</p>
                  </div>
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-white px-6 py-3 rounded-full transition-colors text-white"
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="text-white">Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );

      case "gifts":
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Wedding Gift</h2>
              <p className="text-white/80">For those who desire a wedding list is available</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {giftCards.map((card) => (
                <div
                  key={card.id}
                  className="p-6 border border-white/20 rounded-xl bg-white/10 backdrop-blur-sm"
                >
                  <h3 className="font-semibold text-lg mb-2 text-white">{card.card_name}</h3>
                  <p className="text-white/80">{card.card_number}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "rsvp":
        return (
          <div className="space-y-8 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-8">
              <h2 className="text-3xl md:text-4xl font-light text-center text-white">
                Join Our Celebration
              </h2>

              <p className="text-center text-white/90">
                Please let us know if you can join us on our special day. Your presence would
                mean the world to us.
              </p>

              <div className="pt-8 border-t border-white/20">
                <p className="text-sm text-center mb-2 text-white/80">
                  Kindly confirm your attendance before this date:
                </p>
                <p className="text-xl font-semibold text-white text-center">
                  {new Date(wedding.rsvp_deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src={wedding.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 h-full flex flex-col transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-12 flex items-center">
          <div className="w-full max-w-5xl mx-auto">{renderPage()}</div>
        </div>

        {/* Navigation */}
        {hasStarted && (
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-4 md:px-8">
            <Button
              onClick={goToPreviousPage}
              disabled={currentPage === 0 || isTransitioning}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            {/* Page Dots */}
            <div className="flex gap-2">
              {PAGES.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentPage(index);
                        setIsTransitioning(false);
                      }, 300);
                    }
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentPage ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={goToNextPage}
              disabled={currentPage === PAGES.length - 1 || isTransitioning}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
