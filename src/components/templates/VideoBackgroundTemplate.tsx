import { useState, useEffect, useRef } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { EventLocation } from '@/components/EventLocation';
import { GiftCards } from '@/components/GiftCards';
import { EditableField } from '@/components/EditableField';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PlayCircle, PauseCircle, Heart, Calendar, MapPin, Gift as GiftIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoBackgroundTemplateProps {
  wedding: any;
  locations: any[];
  gallery: any[];
  giftCards: any[];
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
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: VideoBackgroundTemplateProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const ceremony = locations.find(loc => loc.type === 'ceremony');
  const venue = locations.find(loc => loc.type === 'venue');

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Fixed Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          poster={wedding.main_picture_url}
        >
          {/* Fallback to image if no video URL is provided */}
          {wedding.video_url && <source src={wedding.video_url} type="video/mp4" />}
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        
        {/* Animated particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Video Controls */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-8 right-8 z-40 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
        onClick={toggleVideo}
      >
        {isPlaying ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
      </Button>

      {/* Content Sections */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-block">
                <Badge variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white px-6 py-2 text-sm">
                  {new Date(wedding.wedding_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Badge>
              </div>
              
              <EditableField
                fieldId="hero-title"
                text={getFieldValue("hero-title", "We're Getting Married")}
                style={getFieldStyle("hero-title")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h1"
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white drop-shadow-2xl"
              />

              <div className="flex items-center justify-center gap-6 text-white">
                <EditableField
                  fieldId="groom-name-hero"
                  text={wedding.groom_name}
                  style={getFieldStyle("groom-name-hero")}
                  onUpdate={onFieldUpdate}
                  isPreview={false}
                  isLocked={true}
                  tag="h2"
                  className="text-3xl md:text-5xl font-script"
                />
                <Heart className="w-8 h-8 md:w-12 md:h-12 fill-rose-500 text-rose-500 animate-pulse" />
                <EditableField
                  fieldId="bride-name-hero"
                  text={wedding.bride_name}
                  style={getFieldStyle("bride-name-hero")}
                  onUpdate={onFieldUpdate}
                  isPreview={false}
                  isLocked={true}
                  tag="h2"
                  className="text-3xl md:text-5xl font-script"
                />
              </div>
            </div>

            <div className="pt-12 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
                <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        {wedding.main_description && (
          <section className="min-h-screen flex items-center justify-center px-4 py-20">
            <Card className="max-w-3xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <div className="p-8 md:p-12 space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-rose-400 mb-4">
                    <div className="w-12 h-px bg-rose-400"></div>
                    <Heart className="w-5 h-5" />
                    <div className="w-12 h-px bg-rose-400"></div>
                  </div>
                  <EditableField
                    fieldId="story-title"
                    text={getFieldValue("story-title", "Our Love Story")}
                    style={getFieldStyle("story-title")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="h2"
                    className="text-4xl md:text-5xl font-serif font-bold text-white mb-8"
                  />
                </div>
                
                <EditableField
                  fieldId="story-content"
                  text={getFieldValue("story-content", wedding.main_description)}
                  style={getFieldStyle("story-content")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline={true}
                  tag="p"
                  className="text-lg md:text-xl leading-relaxed text-white/90 text-center"
                />
              </div>
            </Card>
          </section>
        )}

        {/* Countdown Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl w-full space-y-8">
            <div className="text-center">
              <EditableField
                fieldId="countdown-title"
                text={getFieldValue("countdown-title", "Counting Down To Forever")}
                style={getFieldStyle("countdown-title")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h2"
                className="text-4xl md:text-5xl font-serif font-bold text-white mb-4"
              />
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <CountdownTimer targetDate={wedding.wedding_date} />
            </div>
          </div>
        </section>

        {/* Location Section */}
        {(ceremony || venue) && (
          <section className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="max-w-5xl w-full space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-rose-400 mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <EditableField
                  fieldId="location-title"
                  text={getFieldValue("location-title", "Join Us At")}
                  style={getFieldStyle("location-title")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h2"
                  className="text-4xl md:text-5xl font-serif font-bold text-white mb-4"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {ceremony && (
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden shadow-2xl hover:shadow-rose-500/20 transition-all duration-300">
                    <div className="p-8">
                      <EventLocation
                        type="ceremony"
                        locationName={ceremony.location_name}
                        locationLink={ceremony.location_link}
                        time={ceremony.time}
                      />
                    </div>
                  </Card>
                )}
                {venue && (
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden shadow-2xl hover:shadow-rose-500/20 transition-all duration-300">
                    <div className="p-8">
                      <EventLocation
                        type="venue"
                        locationName={venue.location_name}
                        locationLink={venue.location_link}
                        time={venue.time}
                      />
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Gift Cards Section */}
        {giftCards.length > 0 && (
          <section className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="max-w-5xl w-full space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-rose-400 mb-4">
                  <GiftIcon className="w-6 h-6" />
                </div>
                <EditableField
                  fieldId="gifts-title"
                  text={getFieldValue("gifts-title", "Your Presence Is The Best Gift")}
                  style={getFieldStyle("gifts-title")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="h2"
                  className="text-4xl md:text-5xl font-serif font-bold text-white mb-4"
                />
                <EditableField
                  fieldId="gifts-subtitle"
                  text={getFieldValue("gifts-subtitle", "But if you wish to honor us with a gift, we'd be grateful")}
                  style={getFieldStyle("gifts-subtitle")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  tag="p"
                  className="text-lg text-white/80"
                />
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                <GiftCards giftCards={giftCards} />
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <section className="min-h-[50vh] flex items-center justify-center px-4 py-20">
          <div className="text-center space-y-6">
            <Heart className="w-16 h-16 mx-auto text-rose-500 animate-pulse" />
            <EditableField
              fieldId="footer-message"
              text={getFieldValue("footer-message", "We Can't Wait To Celebrate With You")}
              style={getFieldStyle("footer-message")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="h3"
              className="text-3xl md:text-4xl font-serif text-white"
            />
            <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
              <span>{wedding.groom_name}</span>
              <span>•</span>
              <span>{wedding.bride_name}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
