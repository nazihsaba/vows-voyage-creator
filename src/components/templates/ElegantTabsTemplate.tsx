import { useState, useRef, useEffect } from 'react';
import { EditableField } from '@/components/EditableField';
import { EventLocation } from '@/components/EventLocation';
import { CountdownTimer } from '@/components/CountdownTimer';
import { ChevronLeft, ChevronRight, Heart, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ElegantTabsTemplateProps {
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
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
  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');

  // Build pages dynamically
  const PAGES = [
    { id: "cover", label: "Cover" },
    { id: "invitation", label: "Invitation" },
    { id: "details", label: "Details" },
    { id: "location", label: "Location" },
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
      if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isTransitioning]);

  const renderPage = () => {
    const pageId = PAGES[currentPage].id;
    
    switch (pageId) {
      case "cover":
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl md:text-8xl font-light tracking-wider text-white">
                <EditableField
                  fieldId="cover-groom-initial"
                  text={getFieldValue("cover-groom-initial", wedding.groom_name?.[0] || "E")}
                  style={getFieldStyle("cover-groom-initial")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="span"
                />
                <Heart className="inline-block mx-4 w-12 h-12 md:w-16 md:h-16" fill="white" />
                <EditableField
                  fieldId="cover-bride-initial"
                  text={getFieldValue("cover-bride-initial", wedding.bride_name?.[0] || "M")}
                  style={getFieldStyle("cover-bride-initial")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="span"
                />
              </div>
            </div>

            <div className="py-8">
              <CountdownTimer targetDate={wedding.wedding_date} />
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
            <p className="text-sm tracking-[0.25em] uppercase text-white/80">
              Wedding Invitation
            </p>
            <p className="text-lg text-white/90">
              You are cordially invited to celebrate with us
            </p>
          </div>
        );
      case "details":
        return (
          <div className="grid gap-8 md:grid-cols-2 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-white/80 mb-4">
                Ceremony
              </h3>
              {ceremony ? (
                <div className="space-y-2">
                  <EditableField
                    fieldId="ceremony-date"
                    text={getFieldValue("ceremony-date", new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }))}
                    style={getFieldStyle("ceremony-date")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="font-medium"
                  />
                  <EditableField
                    fieldId="ceremony-time"
                    text={getFieldValue("ceremony-time", ceremony.time || "5:30 PM")}
                    style={getFieldStyle("ceremony-time")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                  />
                  <EditableField
                    fieldId="ceremony-note"
                    text={getFieldValue("ceremony-note", "Please arrive 20 minutes earlier to be seated.")}
                    style={getFieldStyle("ceremony-note")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline={true}
                    tag="p"
                    className="mt-2 text-sm text-white/70"
                  />
                </div>
              ) : (
                <p className="text-sm text-white/70">No ceremony details available</p>
              )}
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-white/80 mb-4">
                Reception
              </h3>
              {venue ? (
                <div className="space-y-2">
                  <EditableField
                    fieldId="reception-timing"
                    text={getFieldValue("reception-timing", "Following the Ceremony")}
                    style={getFieldStyle("reception-timing")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="font-medium"
                  />
                  <EditableField
                    fieldId="reception-time"
                    text={getFieldValue("reception-time", venue.time || "7:30 PM – Late")}
                    style={getFieldStyle("reception-time")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                  />
                  <EditableField
                    fieldId="reception-note"
                    text={getFieldValue("reception-note", "Dinner, music, and celebration to follow.")}
                    style={getFieldStyle("reception-note")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline={true}
                    tag="p"
                    className="mt-2 text-sm text-white/70"
                  />
                </div>
              ) : (
                <p className="text-sm text-white/70">No reception details available</p>
              )}
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
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex">
                  <div className="w-24 bg-[hsl(340,82%,52%)] flex items-center justify-center">
                    <p className="text-white text-4xl font-cursive transform -rotate-90 whitespace-nowrap">
                      Ceremony
                    </p>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-foreground" />
                      <p className="text-foreground font-bold">{ceremony.time}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-bold text-foreground">Event Location</p>
                      <p className="text-foreground">{ceremony.location_name}</p>
                    </div>
                    {ceremony.location_link && (
                      <a
                        href={ceremony.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-[hsl(340,82%,52%)] text-foreground px-6 py-3 rounded-full transition-colors hover:bg-[hsl(340,82%,52%)] hover:text-white"
                      >
                        <MapPin className="w-5 h-5" />
                        <span>Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
              {venue && (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex">
                  <div className="w-24 bg-[hsl(340,82%,52%)] flex items-center justify-center">
                    <p className="text-white text-4xl font-cursive transform -rotate-90 whitespace-nowrap">Venue</p>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-foreground" />
                      <p className="text-foreground font-bold">{venue.time}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-bold text-foreground">Event Location</p>
                      <p className="text-foreground">{venue.location_name}</p>
                    </div>
                    {venue.location_link && (
                      <a
                        href={venue.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border-2 border-[hsl(340,82%,52%)] text-foreground px-6 py-3 rounded-full transition-colors hover:bg-[hsl(340,82%,52%)] hover:text-white"
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
                  "Please let us know if you can join us on our special day. Your presence would mean the world to us."
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
                      <p className="text-sm text-red-400 text-center font-medium">
                        RSVP deadline has passed
                      </p>
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
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={wedding.video_url} type="video/mp4" />
          </video>
        ) : wedding.main_picture_url ? (
          <img
            src={wedding.main_picture_url}
            alt="Wedding background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Container */}
      <div 
        className={`relative z-10 w-full h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full h-full flex flex-col">
          {/* Page Content */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8 overflow-y-auto">
            <div className="max-w-3xl w-full py-8">
              {renderPage()}
            </div>
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
                      index === currentPage
                        ? 'bg-white w-8'
                        : 'bg-white/40 hover:bg-white/60'
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