import { useState, useRef, useEffect } from "react";
import { CountdownTimerNoBackground } from "@/components/CountdownTimerNoBackground";
import { GiftCardsNoBackground } from "@/components/GiftCardsNoBackground";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AOS from "aos";
import "aos/dist/aos.css";
import weddingHero from "@/assets/wedding-hero.jpg";

export const RoseGoldTabsPreview = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Static data
  const weddingDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const rsvpDeadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  const wedding = {
    groom_name: "Anthony",
    bride_name: "Odile",
    wedding_date: weddingDate,
    main_picture_url: weddingHero,
    rsvp_deadline: rsvpDeadline,
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

  // Build pages dynamically (same as ElegantTabsTemplate)
  const PAGES = [
    { id: "cover", label: "Cover" },
    { id: "invitation", label: "Invitation" },
    { id: "location", label: "Location" },
    ...(giftCards && giftCards.length > 0 ? [{ id: "gifts", label: "Gifts" }] : []),
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isTransitioning && hasStarted) {
      const swipeDistance = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 50;

      if (swipeDistance > minSwipeDistance) {
        goToNextPage();
      } else if (swipeDistance < -minSwipeDistance) {
        goToPreviousPage();
      }
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out",
    });
  }, []);

  const handleStartClick = () => {
    setHasStarted(true);
    goToNextPage();
  };

  // Lock/unlock scroll based on hasStarted
  useEffect(() => {
    if (!hasStarted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [hasStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasStarted) {
        if (e.key === "ArrowRight") {
          goToNextPage();
        } else if (e.key === "ArrowLeft") {
          goToPreviousPage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, isTransitioning, hasStarted]);

  const renderPage = () => {
    const pageId = PAGES[currentPage].id;

    switch (pageId) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 md:space-y-8 text-center text-white">
            <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in">
              <p className="text-xs sm:text-sm md:text-base tracking-widest">The Wedding Of</p>

              <div className="space-y-2 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light">{wedding.groom_name}</h1>
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">&</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light">{wedding.bride_name}</h1>
              </div>

              <p className="text-sm sm:text-base md:text-lg tracking-widest">
                {wedding.wedding_date.toLocaleDateString("en-US", {
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
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg rounded-full"
              >
                START
              </Button>
            )}
          </div>
        );

      case "invitation":
        return (
          <div className="space-y-4 sm:space-y-6 text-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6">
              <CountdownTimerNoBackground targetDate={wedding.wedding_date} />
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2 sm:mb-4">Wedding Events</h2>
              <p className="text-sm sm:text-base text-white/80">Join us in celebrating this special day</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {ceremony && (
                <div
                  className="rounded-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row bg-white/10 backdrop-blur-sm"
                  data-aos="fade-left"
                  data-aos-delay="100"
                >
                  <div className="w-full sm:w-20 md:w-24 h-12 sm:h-auto bg-white flex items-center justify-center py-2 sm:py-0">
                    <p className="text-[hsl(54,20%,60%)] text-xl sm:text-2xl md:text-4xl font-cursive sm:transform sm:-rotate-90 whitespace-nowrap">
                      Ceremony
                    </p>
                  </div>
                  <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      <p className="text-white font-bold text-sm sm:text-base">{ceremony.time}</p>
                    </div>
                    <div className="space-y-1 sm:space-y-2 md:space-y-3">
                      <p className="text-base sm:text-lg md:text-xl font-bold text-white">Event Location</p>
                      <p className="text-sm sm:text-base text-white">{ceremony.location_name}</p>
                    </div>
                    {ceremony.location_link && (
                      <a
                        href={ceremony.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-colors text-sm sm:text-base"
                      >
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-white">Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
              {venue && (
                <div
                  className="rounded-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row bg-white/10 backdrop-blur-sm"
                  data-aos="fade-right"
                  data-aos-delay="200"
                >
                  <div className="w-full sm:w-20 md:w-24 h-12 sm:h-auto bg-white flex items-center justify-center py-2 sm:py-0">
                    <p className="text-[hsl(54,20%,60%)] text-xl sm:text-2xl md:text-4xl font-cursive sm:transform sm:-rotate-90 whitespace-nowrap">
                      Venue
                    </p>
                  </div>
                  <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      <p className="text-white font-bold text-sm sm:text-base">{venue.time}</p>
                    </div>
                    <div className="space-y-1 sm:space-y-2 md:space-y-3">
                      <p className="text-base sm:text-lg md:text-xl font-bold text-white">Event Location</p>
                      <p className="text-sm sm:text-base text-white">{venue.location_name}</p>
                    </div>
                    {venue.location_link && (
                      <a
                        href={venue.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-white px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-colors text-white text-sm sm:text-base"
                      >
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-white">Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "gifts":
        return (
          <div className="space-y-4 sm:space-y-6">
            <GiftCardsNoBackground giftCards={giftCards} isOwner={true} />
          </div>
        );

      case "rsvp":
        return (
          <div className="space-y-4 sm:space-y-6 md:space-y-8 text-white">
            <div
              className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 space-y-4 sm:space-y-6 md:space-y-8"
              data-aos="fade-up"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-center text-white">
                Join Our Celebration
              </h2>

              <p className="text-center text-sm sm:text-base text-white/90">
                Please let us know if you can join us on our special day. Your presence would mean the world to us.
              </p>

              {wedding.rsvp_deadline && (
                <div className="pt-4 sm:pt-6 md:pt-8 border-t border-white/20">
                  <p className="text-xs sm:text-sm text-center mb-1 sm:mb-2 text-white/80">
                    Kindly confirm your attendance before this date:
                  </p>
                  <p className="text-lg sm:text-xl font-semibold text-white text-center">
                    {wedding.rsvp_deadline.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Image Background */}
      <div className="absolute inset-0 z-0">
        <img src={wedding.main_picture_url} alt="Wedding background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 h-full flex flex-col transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12 flex items-center">
          <div className="w-full max-w-5xl mx-auto">{renderPage()}</div>
        </div>

        {/* Navigation */}
        {hasStarted && (
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-0 right-0 flex items-center justify-between px-3 sm:px-4 md:px-8">
            <Button
              onClick={goToPreviousPage}
              disabled={currentPage === 0 || isTransitioning}
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            {/* Page Dots */}
            <div className="flex gap-1.5 sm:gap-2">
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
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
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
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
