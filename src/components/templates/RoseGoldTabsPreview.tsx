import { useState, useRef, useEffect } from "react";
import { CountdownTimerNoBackground } from "@/components/CountdownTimerNoBackground";
import { GiftCardsNoBackground } from "@/components/GiftCardsNoBackground";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import weddingHero from "@/assets/wedding-hero.jpg";

interface RoseGoldTabsPreviewProps {
  wedding?: any;
  locations?: any[];
  gallery?: any[];
  giftCards?: any[];
  isOwner?: boolean;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
  handleRsvpSubmit?: () => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
}

export const RoseGoldTabsPreview = ({
  wedding: weddingProp,
  locations: locationsProp,
  gallery = [],
  giftCards: giftCardsProp,
  isOwner = false,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
}: RoseGoldTabsPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Default static data for preview mode
  const weddingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const rsvpDeadline = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);

  const defaultWedding = {
    groom_name: "Anthony",
    bride_name: "Odile",
    wedding_date: weddingDate.toISOString(),
    main_picture_url: weddingHero,
    rsvp_deadline: rsvpDeadline.toISOString(),
    audio_url: null,
    audio_start_time: null,
    audio_end_time: null,
    video_url: null,
  };

  const defaultLocations = [
    {
      type: "ceremony",
      time: "2:00 PM",
      location_name: "St. Mary's Cathedral",
      location_link: "https://maps.google.com",
    },
    {
      type: "venue",
      time: "5:00 PM",
      location_name: "Grand Ballroom Hotel",
      location_link: "https://maps.google.com",
    },
  ];

  const defaultGiftCards = [
    { id: "1", card_name: "OMT", card_number: "123456789" },
    { id: "2", card_name: "Whish", card_number: "987654321" },
  ];

  // Use props or defaults
  const wedding = weddingProp || defaultWedding;
  const locations = locationsProp || defaultLocations;
  const giftCards = giftCardsProp || defaultGiftCards;

  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  // Build pages dynamically
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

  // Handle audio time updates to loop within trimmed range
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && wedding.audio_end_time && audio.currentTime >= wedding.audio_end_time) {
      audio.currentTime = wedding.audio_start_time || 0;
    }
  };

  // Handle start button click
  const handleStartClick = async () => {
    setHasStarted(true);
    goToNextPage();

    // Play audio if available
    if (wedding.audio_url && audioRef.current) {
      const audio = audioRef.current;
      const startTime = wedding.audio_start_time || 0;

      if (startTime > 0) {
        audio.currentTime = startTime;
        await new Promise<void>((resolve) => {
          audio.addEventListener("seeked", () => resolve(), { once: true });
        });
      }

      try {
        await audio.play();
      } catch (err) {
        console.log("Audio playback failed:", err);
      }
    }
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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl">
              <CountdownTimerNoBackground targetDate={new Date(wedding.wedding_date)} />
            </div>
          </div>
        );

      case "location":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-template-subtitle mb-6 text-white">Wedding Events</h2>
              <p className="text-white/80">Join us in celebrating this special day</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {ceremony && (
                <div className="rounded-xl shadow-2xl overflow-hidden flex bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-24 bg-white flex items-center justify-center">
                    <p className="text-amber-600 text-4xl font-cursive transform -rotate-90 whitespace-nowrap">
                      Ceremony
                    </p>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-white" />
                      <p className="text-white font-bold text-lg">{ceremony.time}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-bold text-white">Event Location</p>
                      <p className="text-white/90 text-lg">{ceremony.location_name}</p>
                    </div>
                    {ceremony.location_link && (
                      <a
                        href={ceremony.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <MapPin className="w-5 h-5" />
                        <span>Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
              {venue && (
                <div className="rounded-xl shadow-2xl overflow-hidden flex bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="w-24 bg-white flex items-center justify-center">
                    <p className="text-amber-600 text-4xl font-cursive transform -rotate-90 whitespace-nowrap">Venue</p>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-white" />
                      <p className="text-white font-bold text-lg">{venue.time}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-bold text-white">Event Location</p>
                      <p className="text-white/90 text-lg">{venue.location_name}</p>
                    </div>
                    {venue.location_link && (
                      <a
                        href={venue.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <MapPin className="w-5 h-5" />
                        <span>Google Maps</span>
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
          <div className="space-y-6">
            <GiftCardsNoBackground giftCards={giftCards} isOwner={isOwner} />
          </div>
        );

      case "rsvp":
        return (
          <div className="space-y-8 text-white animate-fade-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-8">
              <h2 className="text-template-subtitle text-center mb-12 text-white">Join Our Celebration</h2>

              <p className="text-center text-white/90">
                Please let us know if you can join us on our special day. Your presence would mean the world to us.
              </p>

              {/* Invitees List with Checkboxes */}
              {invitees.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-white/20">
                  <div className="space-y-4">
                    {invitees.map((invitee: any) => (
                      <div
                        key={invitee.id}
                        className="flex items-center justify-between py-4 px-6 bg-white/5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-xl font-serif text-white">{invitee.name}</span>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`rsvp-${invitee.id}`}
                            checked={rsvpResponses[invitee.id] === true}
                            onCheckedChange={(checked) => handleRsvpToggle(invitee.id, checked as boolean)}
                            disabled={isRsvpDeadlinePassed}
                            className="h-5 w-5"
                          />
                          <Label
                            htmlFor={`rsvp-${invitee.id}`}
                            className={`text-base cursor-pointer font-medium ${
                              isRsvpDeadlinePassed ? "text-white/50" : "text-white"
                            }`}
                          >
                            {rsvpResponses[invitee.id] === true ? "Attending ✓" : "Will Attend?"}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/20 space-y-4">
                    <p className="text-lg font-semibold text-center text-white">
                      Number of Guests: {numberOfPersons || invitees.length}
                    </p>

                    {isRsvpDeadlinePassed ? (
                      <p className="text-sm text-red-400 text-center font-medium">RSVP deadline has passed</p>
                    ) : (
                      <Button
                        onClick={handleRsvpSubmit}
                        disabled={submittingRsvp}
                        className="w-full text-lg py-6 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                        size="lg"
                      >
                        {submittingRsvp ? "Submitting..." : "Submit RSVP"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {wedding.rsvp_deadline && (
                <div className="pt-8 border-t border-white/20">
                  <p className="text-sm text-center mb-2 text-white/80">
                    {invitees.length > 0 ? "Please RSVP by:" : "Kindly confirm your attendance before this date:"}
                  </p>
                  <p className="text-xl font-semibold text-white text-center">
                    {new Date(wedding.rsvp_deadline).toLocaleDateString("en-US", {
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
      {/* Hidden audio element for background music */}
      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* Video/Image Background */}
      <div className="absolute inset-0 z-0">
        {wedding.video_url ? (
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src={wedding.video_url} type="video/mp4" />
          </video>
        ) : wedding.main_picture_url ? (
          <img src={wedding.main_picture_url} alt="Wedding background" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50" />
        )}
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
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 md:py-12 flex items-center">
          <div className="w-full max-w-5xl mx-auto">{renderPage()}</div>
        </div>

        {/* Hidden Navigation Arrows - Middle of screen */}
        {hasStarted && (
          <>
            {/* Left Arrow */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0 || isTransitioning}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-24 flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity disabled:pointer-events-none z-20"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === PAGES.length - 1 || isTransitioning}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-24 flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity disabled:pointer-events-none z-20"
              aria-label="Next page"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Page Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
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
          </>
        )}
      </div>
    </div>
  );
};
