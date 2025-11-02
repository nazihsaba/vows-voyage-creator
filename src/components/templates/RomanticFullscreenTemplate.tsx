import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Play, Pause, MapPin } from 'lucide-react';
import { Template } from '@/types/templates';
import { EditableField } from '@/components/EditableField';
import { CountdownTimer } from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';

interface RomanticFullscreenTemplateProps {
  template: Template;
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
}

export const RomanticFullscreenTemplate = ({
  template,
  wedding,
  locations,
  gallery,
  giftCards,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: RomanticFullscreenTemplateProps) => {
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');
  
  const style = template.style;

  const handleStart = () => {
    setStarted(true);
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.fullscreen-section');
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      sections.forEach((section, index) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!started) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: wedding.main_image_url ? `url(${wedding.main_image_url})` : 'none',
          backgroundColor: style.colorScheme.accent,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white px-4">
          <p 
            className="text-lg md:text-xl mb-4 tracking-widest uppercase"
            style={{ fontFamily: style.fontSecondary }}
          >
            The Wedding Of
          </p>
          <h1 
            className="text-5xl md:text-7xl mb-6"
            style={{ fontFamily: style.fontPrimary }}
          >
            {wedding.groom_name} & {wedding.bride_name}
          </h1>
          <p 
            className="text-xl md:text-2xl mb-12"
            style={{ fontFamily: style.fontSecondary }}
          >
            {new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-2 border-white backdrop-blur-sm"
          >
            Tap To Start
          </Button>
          <div className="mt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 mx-auto" />
          </div>
        </div>
        {wedding.audio_url && (
          <audio ref={audioRef} loop>
            <source src={wedding.audio_url} type="audio/mpeg" />
          </audio>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Audio Control */}
      {wedding.audio_url && (
        <button
          onClick={toggleAudio}
          className="fixed bottom-8 right-8 z-50 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-lg hover:bg-white transition-colors"
          style={{ color: style.colorScheme.primary }}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
      )}

      {/* Family Section */}
      <section 
        className="fullscreen-section min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: style.colorScheme.background }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <EditableField
            fieldId="family-groom"
            text={getFieldValue("family-groom", "Groom's Family")}
            style={getFieldStyle("family-groom")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="h2"
            className="text-3xl md:text-4xl mb-8"
          />
          <div 
            className="text-6xl md:text-8xl mb-8"
            style={{ 
              fontFamily: style.fontPrimary,
              color: style.colorScheme.primary 
            }}
          >
            &
          </div>
          <EditableField
            fieldId="family-bride"
            text={getFieldValue("family-bride", "Bride's Family")}
            style={getFieldStyle("family-bride")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="h2"
            className="text-3xl md:text-4xl mb-12"
          />
          <EditableField
            fieldId="family-invitation"
            text={getFieldValue("family-invitation", "Request the honor of your presence at the wedding of their Son and Daughter")}
            style={getFieldStyle("family-invitation")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-xl md:text-2xl"
            multiline={true}
          />
        </div>
      </section>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section 
          className="fullscreen-section min-h-screen flex items-center justify-center px-4 py-16"
          style={{ backgroundColor: style.colorScheme.accent }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.slice(0, 4).map((img, idx) => (
                <div 
                  key={idx} 
                  className="aspect-square overflow-hidden rounded-lg shadow-lg"
                >
                  <img 
                    src={img.image_url} 
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Countdown Section */}
      <section 
        className="fullscreen-section min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: style.colorScheme.background }}
      >
        <CountdownTimer targetDate={wedding.wedding_date} />
      </section>

      {/* Events Section */}
      <section 
        className="fullscreen-section min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: style.colorScheme.accent }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className="text-4xl md:text-5xl mb-6"
            style={{ 
              fontFamily: style.fontPrimary,
              color: style.colorScheme.primary 
            }}
          >
            Wedding Events
          </h2>
          <p 
            className="text-lg md:text-xl mb-16 max-w-2xl mx-auto"
            style={{ fontFamily: style.fontSecondary }}
          >
            With all humility, we would like to invite you all to attend our wedding which will be held on:
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {ceremony && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 
                  className="text-2xl md:text-3xl mb-4"
                  style={{ 
                    fontFamily: style.fontPrimary,
                    color: style.colorScheme.primary 
                  }}
                >
                  Ceremony
                </h3>
                <p className="text-xl mb-4">{ceremony.time}</p>
                <p className="text-lg font-semibold mb-2">Event Location</p>
                <p className="text-md mb-4">{ceremony.location_name}</p>
                {ceremony.location_link && (
                  <a 
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <MapPin className="w-4 h-4" />
                    Google Maps
                  </a>
                )}
              </div>
            )}
            
            {venue && (
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 
                  className="text-2xl md:text-3xl mb-4"
                  style={{ 
                    fontFamily: style.fontPrimary,
                    color: style.colorScheme.primary 
                  }}
                >
                  Venue
                </h3>
                <p className="text-xl mb-4">{venue.time}</p>
                <p className="text-lg font-semibold mb-2">Event Location</p>
                <p className="text-md mb-4">{venue.location_name}</p>
                {venue.location_link && (
                  <a 
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <MapPin className="w-4 h-4" />
                    Google Maps
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gift Section */}
      {giftCards.length > 0 && (
        <section 
          className="fullscreen-section min-h-screen flex items-center justify-center px-4 py-16"
          style={{ backgroundColor: style.colorScheme.background }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 
              className="text-4xl md:text-5xl mb-6"
              style={{ 
                fontFamily: style.fontPrimary,
                color: style.colorScheme.primary 
              }}
            >
              Wedding Gift
            </h2>
            <p className="text-lg md:text-xl mb-12">
              For those who desire a wedding list is available
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {giftCards.map((card) => (
                <div key={card.id} className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4">{card.title}</h3>
                  {card.description && <p className="text-md mb-4">{card.description}</p>}
                  {card.link && (
                    <a 
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 inline-block"
                    >
                      Visit Registry
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      <section 
        className="fullscreen-section min-h-screen flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: style.colorScheme.accent }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <img 
            src={gallery[0]?.image_url || wedding.main_image_url}
            alt="Wedding"
            className="w-full h-64 object-cover rounded-lg shadow-lg mb-8"
          />
          <p className="text-lg md:text-xl mb-8">
            We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures, and make wonderful memories with us.
          </p>
          <h3 
            className="text-2xl md:text-3xl mb-4"
            style={{ 
              fontFamily: style.fontPrimary,
              color: style.colorScheme.primary 
            }}
          >
            Kindly Confirm Your Presence By
          </h3>
          <p className="text-xl font-semibold">
            {wedding.rsvp_deadline ? new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Please RSVP'}
          </p>
        </div>
      </section>
    </div>
  );
};
