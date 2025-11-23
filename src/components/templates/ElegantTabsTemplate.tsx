import { useState, useRef, useEffect } from "react";
import { EditableField } from "@/components/EditableField";
import { EventLocation } from "@/components/EventLocation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftCardsNoBackground } from "@/components/GiftCardsNoBackground";
import { ChevronLeft, ChevronRight, Heart, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ElegantTabsTemplateProps {
  wedding: any;
  locations: any[];
  gallery: any[];
  GiftCardsNoBackground: any[];
  isOwner?: boolean;
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
  invitees?: any[];
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
  handleRsvpSubmit?: () => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
}

// PAGES array is now dynamic and built in the component

export const ElegantTabsTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isOwner = false,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
}: ElegantTabsTemplateProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
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
    if (!isTransitioning) {
      const swipeDistance = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 50;

      if (swipeDistance > minSwipeDistance) {
        // Swiped left - go to next page
        goToNextPage();
      } else if (swipeDistance < -minSwipeDistance) {
        // Swiped right - go to previous page
        goToPreviousPage();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        goToNextPage();
      } else if (e.key === "ArrowLeft") {
        goToPreviousPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, isTransitioning]);

  const renderPage = () => {
    const pageId = PAGES[currentPage].id;

    switch (pageId) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-center text-white">
            <div className="space-y-8 animate-fade-in">
              <EditableField
                fieldId="hero-subtitle"
                text={getFieldValue("hero-subtitle", "The Wedding Of")}
                style={getFieldStyle("hero-subtitle")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-small"
              />

              <div className="space-y-4">
                <EditableField
                  fieldId="groom-name"
                  text={getFieldValue("groom-name", wedding.groom_name)}
                  style={getFieldStyle("groom-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h1"
                  className="text-template-title"
                />
                <p className="text-4xl md:text-5xl">&</p>
                <EditableField
                  fieldId="bride-name"
                  text={getFieldValue("bride-name", wedding.bride_name)}
                  style={getFieldStyle("bride-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h1"
                  className="text-template-title"
                />
              </div>

              <EditableField
                fieldId="wedding-date-display"
                text={getFieldValue(
                  "wedding-date-display",
                  new Date(wedding.wedding_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                )}
                style={getFieldStyle("wedding-date-display")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="p"
                className="text-template-body tracking-widest"
              />
            </div>

            <Button
              onClick={goToNextPage}
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-12 py-6 text-lg rounded-full"
            >
              START
            </Button>
          </div>
        );

      case "invitation":
        return (
          <div className="space-y-6 text-center text-white">
            <div className="bg-white rounded-xl">
              <CountdownTimer targetDate={wedding.wedding_date} />
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
              {ceremony && (
                <div className="rounded-xl shadow-2xl overflow-hidden flex bg-white/10 backdrop-blur-sm">
                  <div className="w-24 bg-[hsl(54,20%,60%)] flex items-center justify-center">
                    <p className="text-white text-4xl font-cursive transform -rotate-90 whitespace-nowrap">Ceremony</p>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6" />
                      <p className="text-white font-bold">{ceremony.time}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-bold text-white">Event Location</p>
                      <p className="text-white">{ceremony.location_name}</p>
                    </div>
                    {ceremony.location_link && (
                      <a
                        href={ceremony.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-[hsl(54,20%,60%)] text-white px-6 py-3 rounded-full transition-colors hover:bg-[hsl(54,20%,60%)] hover:text-white"
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="text-white">Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
              {venue && (
                <div className="rounded-xl shadow-2xl overflow-hidden flex bg-white/10 backdrop-blur-sm">
                  <div className="w-24 bg-[hsl(54,20%,60%)] flex items-center justify-center">
                    <p className="text-white text-4xl font-cursive transform -rotate-90 whitespace-nowrap">Venue</p>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6" />
                      <p className="text-white font-bold">{venue.time}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-bold text-white">Event Location</p>
                      <p className="text-white">{venue.location_name}</p>
                    </div>
                    {venue.location_link && (
                      <a
                        href={venue.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-[hsl(54,20%,60%)] px-6 py-3 rounded-full transition-colors hover:bg-[hsl(54,20%,60%)] hover:text-white text-white"
                      >
                        <MapPin className="w-5 h-5" />
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
          <div className="space-y-6">
            <GiftCardsNoBackground giftCards={giftCards} isOwner={isOwner} />
          </div>
        );
      case "rsvp":
        return (
          <div className="space-y-8 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-8">
              <EditableField
                fieldId="rsvp-title"
                text={getFieldValue("rsvp-title", "Join Our Celebration")}
                style={getFieldStyle("rsvp-title")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-3xl md:text-4xl font-light text-center text-white"
              />

              <EditableField
                fieldId="rsvp-message"
                text={getFieldValue(
                  "rsvp-message",
                  "Please let us know if you can join us on our special day. Your presence would mean the world to us.",
                )}
                style={getFieldStyle("rsvp-message")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-center text-white/90"
              />

              {/* Invitees List with Checkboxes */}
              {invitees.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-white/20">
                  <p className="text-lg font-semibold text-center text-white">
                    This invitation is specially prepared for:
                  </p>
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
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Container */}
      <div
        className={`relative z-10 w-full h-full transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full h-full flex flex-col">
          {/* Page Content */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8 overflow-y-auto">
            <div className="max-w-3xl w-full py-8">{renderPage()}</div>
          </div>

          {/* Navigation */}
          {currentPage > 0 && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4 px-4">
              <Button
                onClick={goToPreviousPage}
                variant="ghost"
                size="icon"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 rounded-full w-12 h-12"
                disabled={isTransitioning}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="flex gap-2">
                {PAGES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isTransitioning) {
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setCurrentPage(index);
                          setIsTransitioning(false);
                        }, 300);
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPage ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"
                    }`}
                    disabled={isTransitioning}
                  />
                ))}
              </div>

              {currentPage < PAGES.length - 1 && (
                <Button
                  onClick={goToNextPage}
                  variant="ghost"
                  size="icon"
                  className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 rounded-full w-12 h-12"
                  disabled={isTransitioning}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
