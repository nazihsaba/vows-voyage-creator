import { useState, useEffect, useRef } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { GiftCards } from '@/components/GiftCards';
import { EditableField } from '@/components/EditableField';

interface VideoBackgroundTemplateProps {
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

export const VideoBackgroundTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isOwner = false,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: VideoBackgroundTemplateProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Fixed Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={wedding.video_url || "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-through-garden-4437-large.mp4"} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/20 z-50">
        <div 
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center text-white">
          <div className="space-y-8 animate-fade-in">
            <EditableField
              fieldId="hero-subtitle"
              text={getFieldValue("hero-subtitle", "The Wedding Of")}
              style={getFieldStyle("hero-subtitle")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-lg md:text-xl tracking-[0.3em] uppercase opacity-90"
            />
            
            <div className="space-y-4">
              <EditableField
                fieldId="groom-name"
                text={getFieldValue("groom-name", wedding.groom_name)}
                style={getFieldStyle("groom-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h1"
                className="text-6xl md:text-8xl font-script"
              />
              <p className="text-4xl md:text-5xl">&</p>
              <EditableField
                fieldId="bride-name"
                text={getFieldValue("bride-name", wedding.bride_name)}
                style={getFieldStyle("bride-name")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h1"
                className="text-6xl md:text-8xl font-script"
              />
            </div>

            <EditableField
              fieldId="wedding-date-display"
              text={getFieldValue("wedding-date-display", new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }))}
              style={getFieldStyle("wedding-date-display")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-xl md:text-2xl tracking-widest"
            />
          </div>
        </section>

        {/* Family Names Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl w-full bg-white rounded-2xl p-8 md:p-16 shadow-2xl">
            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-widest opacity-70">Groom's Family</p>
                  <EditableField
                    fieldId="groom-family"
                    text={getFieldValue("groom-family", wedding.groom_family || "Groom's Family")}
                    style={getFieldStyle("groom-family")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="h2"
                    className="text-3xl md:text-4xl font-script"
                  />
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-widest opacity-70">Bride's Family</p>
                  <EditableField
                    fieldId="bride-family"
                    text={getFieldValue("bride-family", wedding.bride_family || "Bride's Family")}
                    style={getFieldStyle("bride-family")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="h2"
                    className="text-3xl md:text-4xl font-script"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <EditableField
                  fieldId="invitation-text"
                  text={getFieldValue("invitation-text", "Request the honor of your presence at the wedding celebration")}
                  style={getFieldStyle("invitation-text")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline={true}
                  tag="p"
                  className="text-lg md:text-xl leading-relaxed text-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Countdown Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="max-w-4xl w-full bg-white rounded-2xl p-8 md:p-16 shadow-2xl">
            <CountdownTimer targetDate={wedding.wedding_date} />
          </div>
        </section>

        {/* Wedding Events Section */}
        {(ceremony || venue) && (
          <section className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="max-w-5xl w-full">
              <div className="text-center mb-12 bg-white rounded-2xl p-8 shadow-2xl">
                <h2 className="text-4xl md:text-5xl font-script mb-6">Wedding Events</h2>
                <EditableField
                  fieldId="events-subtitle"
                  text={getFieldValue("events-subtitle", "Join us in celebrating this special day")}
                  style={getFieldStyle("events-subtitle")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline={true}
                  tag="p"
                  className="text-lg opacity-90"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {ceremony && (
                  <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                    <h3 className="text-3xl font-script mb-4">Ceremony</h3>
                    <p className="text-2xl font-bold">{ceremony.time}</p>
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-wider opacity-70">Location</p>
                      <p className="text-lg">{ceremony.location_name}</p>
                    </div>
                    {ceremony.location_link && (
                      <a
                        href={ceremony.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors"
                      >
                        View on Map
                      </a>
                    )}
                  </div>
                )}
                {venue && (
                  <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                    <h3 className="text-3xl font-script mb-4">Reception</h3>
                    <p className="text-2xl font-bold">{venue.time}</p>
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-wider opacity-70">Location</p>
                      <p className="text-lg">{venue.location_name}</p>
                    </div>
                    {venue.location_link && (
                      <a
                        href={venue.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors"
                      >
                        View on Map
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Gift Cards Section */}
        {giftCards.length > 0 && (
          <section className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="max-w-4xl w-full bg-white rounded-2xl p-8 md:p-16 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-script text-center mb-12">Wedding Gift</h2>
              <GiftCards giftCards={giftCards} isOwner={isOwner} />
            </div>
          </section>
        )}

        {/* Closing Message */}
        <section className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="max-w-3xl w-full bg-white rounded-2xl p-8 md:p-16 text-center shadow-2xl space-y-8">
            <EditableField
              fieldId="closing-message"
              text={getFieldValue("closing-message", "We can't wait to celebrate with you! Thank you for being part of our special day.")}
              style={getFieldStyle("closing-message")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-lg md:text-xl leading-relaxed"
            />

            {wedding.rsvp_deadline && (
              <div className="pt-8 border-t border-border">
                <p className="text-lg uppercase tracking-widest mb-2 opacity-70">
                  RSVP By
                </p>
                <p className="text-2xl font-script">
                  {new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};