import { useState, useEffect, useRef } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { EventLocation } from '@/components/EventLocation';
import { GiftCards } from '@/components/GiftCards';
import { EditableField } from '@/components/EditableField';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnthonyOdileTemplateProps {
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
}

export const AnthonyOdileTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: AnthonyOdileTemplateProps) => {
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');

  const handleStart = () => {
    setHasStarted(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
    // Smooth scroll to next section
    document.getElementById('family-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Pause audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="w-full bg-[#faf8f5] text-[#3e2723] font-serif">
      {/* Hidden audio element */}
      <audio ref={audioRef} loop>
        <source src="/wedding-music.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Hero Section - Fullscreen */}
      <section 
        className="relative h-screen flex flex-col items-center justify-center text-center text-white"
        style={{
          backgroundImage: wedding.main_picture_url 
            ? `url(${wedding.main_picture_url})` 
            : 'linear-gradient(135deg, #c9a6a6 0%, #e8c4c4 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative z-10 space-y-6 px-4 max-w-2xl">
          <EditableField
            fieldId="hero-subtitle"
            text={getFieldValue("hero-subtitle", "The Wedding Of")}
            style={getFieldStyle("hero-subtitle")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-lg md:text-xl tracking-widest uppercase opacity-90"
          />
          
          <div className="space-y-2">
            <EditableField
              fieldId="groom-name"
              text={getFieldValue("groom-name", wedding.groom_name)}
              style={getFieldStyle("groom-name")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h1"
              className="text-5xl md:text-7xl font-script"
            />
            <p className="text-4xl md:text-5xl">&</p>
            <EditableField
              fieldId="bride-name"
              text={getFieldValue("bride-name", wedding.bride_name)}
              style={getFieldStyle("bride-name")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h1"
              className="text-5xl md:text-7xl font-script"
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
            className="text-xl md:text-2xl tracking-wide"
          />

          {!hasStarted && (
            <Button
              onClick={handleStart}
              className="mt-8 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm"
            >
              Tap To Start
            </Button>
          )}
        </div>

        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </section>

      {/* Family Names Section */}
      <section id="family-section" className="py-16 px-4 text-center bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <EditableField
              fieldId="groom-family"
              text={getFieldValue("groom-family", wedding.groom_family || "Groom's Family")}
              style={getFieldStyle("groom-family")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h2"
              className="text-3xl md:text-4xl font-script"
            />
            
            <p className="text-2xl">&</p>
            
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

          <EditableField
            fieldId="invitation-text"
            text={getFieldValue("invitation-text", "Request the honor of your presence at the wedding of their Son and Daughter")}
            style={getFieldStyle("invitation-text")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            multiline={true}
            tag="p"
            className="text-lg md:text-xl leading-relaxed"
          />
        </div>
      </section>

      {/* Photo Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-16 px-4 bg-[#faf8f5]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.slice(0, 4).map((image, index) => (
                <div 
                  key={image.id} 
                  className="aspect-square overflow-hidden rounded-lg shadow-lg"
                >
                  <img 
                    src={image.image_url} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Countdown Section */}
      <section className="py-16 px-4 bg-white">
        <CountdownTimer targetDate={wedding.wedding_date} />
      </section>

      {/* Wedding Events Section */}
      <section className="py-16 px-4 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-script mb-6 text-[#3e2723]">Wedding Events</h2>
            <EditableField
              fieldId="events-subtitle"
              text={getFieldValue("events-subtitle", "With all humility, we would like\n\nto invite you all to attend our wedding\n\nwhich will be held on:")}
              style={getFieldStyle("events-subtitle")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline={true}
              tag="p"
              className="text-lg max-w-2xl mx-auto whitespace-pre-line"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {ceremony && (
              <div className="bg-white p-8 rounded-lg shadow-soft space-y-6">
                <h3 className="text-3xl font-script mb-2 text-[#3e2723]">Ceremony</h3>
                <p className="text-2xl font-bold text-[#3e2723]">{ceremony.time}</p>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-wider text-gray-600">Event Location</p>
                  <p className="text-lg font-medium text-[#3e2723]">{ceremony.location_name}</p>
                </div>
                {ceremony.location_link && (
                  <a
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#c9a6a6] hover:bg-[#b89595] text-white px-6 py-2 rounded-md transition-colors"
                  >
                    View on Map
                  </a>
                )}
              </div>
            )}
            {venue && (
              <div className="bg-white p-8 rounded-lg shadow-soft space-y-6">
                <h3 className="text-3xl font-script mb-2 text-[#3e2723]">Venue</h3>
                <p className="text-2xl font-bold text-[#3e2723]">{venue.time}</p>
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-wider text-gray-600">Event Location</p>
                  <p className="text-lg font-medium text-[#3e2723]">{venue.location_name}</p>
                </div>
                {venue.location_link && (
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#c9a6a6] hover:bg-[#b89595] text-white px-6 py-2 rounded-md transition-colors"
                  >
                    View on Map
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gift Cards Section */}
      {giftCards.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-script text-center mb-12 text-[#3e2723]">Wedding Gift</h2>
            <p className="text-center text-lg mb-8 text-gray-600">For those who desire a wedding list is available</p>
            <GiftCards giftCards={giftCards} />
          </div>
        </section>
      )}

      {/* Closing Message */}
      <section className="py-16 px-4 bg-[#faf8f5] text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <EditableField
            fieldId="closing-message"
            text={getFieldValue("closing-message", "We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures, and make wonderful memories with us.")}
            style={getFieldStyle("closing-message")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            multiline={true}
            tag="p"
            className="text-lg md:text-xl leading-relaxed"
          />

          <div className="pt-8 border-t border-gray-300">
            <EditableField
              fieldId="rsvp-text"
              text={getFieldValue("rsvp-text", "Kindly Confirm Your Presence By")}
              style={getFieldStyle("rsvp-text")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-xl font-semibold mb-2"
            />
            <EditableField
              fieldId="rsvp-date"
              text={getFieldValue("rsvp-date", new Date(new Date(wedding.wedding_date).getTime() - 20 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }))}
              style={getFieldStyle("rsvp-date")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-2xl font-script"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
