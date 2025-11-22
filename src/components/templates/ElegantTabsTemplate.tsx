import { useState } from 'react';
import { EditableField } from '@/components/EditableField';
import { EventLocation } from '@/components/EventLocation';
import { CountdownTimer } from '@/components/CountdownTimer';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

const PAGES = [
  { id: "cover", label: "Cover" },
  { id: "invitation", label: "Invitation" },
  { id: "details", label: "Details" },
  { id: "location", label: "Location" },
  { id: "rsvp", label: "RSVP" },
];

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
}: ElegantTabsTemplateProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');

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
              Together with their families,
            </p>
            <div className="text-3xl md:text-4xl space-y-2">
              <div>
                <EditableField
                  fieldId="groom-name"
                  text={getFieldValue("groom-name", wedding.groom_name)}
                  style={getFieldStyle("groom-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="span"
                  className="font-light tracking-wide"
                />
              </div>
              <div className="text-2xl">&amp;</div>
              <div>
                <EditableField
                  fieldId="bride-name"
                  text={getFieldValue("bride-name", wedding.bride_name)}
                  style={getFieldStyle("bride-name")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="span"
                  className="font-light tracking-wide"
                />
              </div>
            </div>
            <div className="pt-4 space-y-3 max-w-2xl mx-auto">
              <EditableField
                fieldId="invitation-text-1"
                text={getFieldValue("invitation-text-1", "kindly request the pleasure of your company to celebrate their wedding.")}
                style={getFieldStyle("invitation-text-1")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-white/90 text-lg"
              />
              <EditableField
                fieldId="invitation-text-2"
                text={getFieldValue("invitation-text-2", "Join us for an evening of love, joy, and celebration.")}
                style={getFieldStyle("invitation-text-2")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
                className="text-white/80"
              />
            </div>
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
          <div className="space-y-6 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-white/80 mb-4">
                Venue
              </h3>
              {venue ? (
                <div className="space-y-2">
                  <EventLocation
                    type="venue"
                    locationName={venue.location_name}
                    locationLink={venue.location_link}
                    time={venue.time}
                  />
                  <EditableField
                    fieldId="venue-note"
                    text={getFieldValue("venue-note", "Exact address and directions will be provided with your final invitation.")}
                    style={getFieldStyle("venue-note")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline={true}
                    tag="p"
                    className="mt-2 text-sm text-white/70"
                  />
                </div>
              ) : (
                <p className="text-sm text-white/70">No venue details available</p>
              )}
            </div>
            {venue?.location_link && (
              <div className="h-64 rounded-2xl border border-white/20 bg-white/10 overflow-hidden">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.location_name)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        );
      case "rsvp":
        return (
          <div className="space-y-6 text-white bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
            {wedding.rsvp_deadline && (
              <EditableField
                fieldId="rsvp-deadline-text"
                text={getFieldValue("rsvp-deadline-text", `Kindly confirm your presence by ${new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`)}
                style={getFieldStyle("rsvp-deadline-text")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                multiline={true}
                tag="p"
              />
            )}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4 max-w-md mx-auto"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/30 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Number of Guests
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-xl border border-white/30 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20"
                  placeholder="e.g. 2"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/90">
                  Message (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-white/30 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder-white/50 outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20"
                  placeholder="Any notes or dietary preferences"
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 rounded-full py-6 text-base font-medium"
              >
                Send RSVP
              </Button>
            </form>
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
      <div className={`relative z-10 w-full h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full h-full flex flex-col">
          {/* Page Content */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-8">
            <div className="max-w-3xl w-full">
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