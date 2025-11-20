import { useEffect, useState } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { EditableField } from '@/components/EditableField';

interface ElegantVideoTemplateProps {
  wedding: any;
  isOwner?: boolean;
  isPreview: boolean;
  onFieldUpdate: (fieldId: string, text: string, style: any) => void;
  getFieldValue: (fieldId: string, defaultValue: string) => string;
  getFieldStyle: (fieldId: string) => any;
}

export const ElegantVideoTemplate = ({
  wedding,
  isOwner = false,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
}: ElegantVideoTemplateProps) => {
  const [showMain, setShowMain] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const videoUrl = wedding.video_url || '';
  const groomName = getFieldValue('groom-name', wedding.groom_name);
  const brideName = getFieldValue('bride-name', wedding.bride_name);
  const initials = getFieldValue('initials', `${groomName.charAt(0)} | ${brideName.charAt(0)}`);

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date(wedding.wedding_date);
      const now = new Date();
      const days = Math.max(0, differenceInDays(targetDate, now));
      const hours = Math.max(0, differenceInHours(targetDate, now) % 24);
      const minutes = Math.max(0, differenceInMinutes(targetDate, now) % 60);
      const seconds = Math.max(0, differenceInSeconds(targetDate, now) % 60);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [wedding.wedding_date]);

  const handleStart = () => {
    setShowMain(true);
  };

  if (showMain) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Main Content Section */}
            <section className="text-center space-y-8">
              <EditableField
                fieldId="main-title"
                text={getFieldValue("main-title", `${groomName} & ${brideName}`)}
                style={getFieldStyle("main-title")}
                onUpdate={onFieldUpdate}
                isPreview={isPreview}
                tag="h1"
                className="text-4xl md:text-6xl font-serif font-bold"
              />
              
              {wedding.main_description && (
                <EditableField
                  fieldId="main-description"
                  text={getFieldValue("main-description", wedding.main_description)}
                  style={getFieldStyle("main-description")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline={true}
                  tag="p"
                  className="text-lg leading-relaxed"
                />
              )}
            </section>

            {/* Event Details */}
            <section className="text-center space-y-4">
              <h2 className="text-3xl font-serif font-bold">Event Details</h2>
              <p className="text-xl">
                {new Date(wedding.wedding_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      {videoUrl && (
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Fallback gradient background if no video */}
      {!videoUrl && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
      )}

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40" />

      {/* Content */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 w-full px-4">
        {/* Logo/Initials */}
        <div className="flex flex-col items-center mb-10 md:mb-12">
          <EditableField
            fieldId="groom-name"
            text={groomName}
            style={getFieldStyle("groom-name")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="div"
            className="text-base md:text-lg tracking-[0.25em] uppercase mb-2"
          />
          
          <EditableField
            fieldId="initials"
            text={initials}
            style={getFieldStyle("initials")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="div"
            className="text-5xl md:text-7xl font-bold tracking-[0.3em] my-3 font-serif"
          />
          
          <EditableField
            fieldId="bride-name"
            text={brideName}
            style={getFieldStyle("bride-name")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="div"
            className="text-base md:text-lg tracking-[0.25em] uppercase mt-2"
          />
        </div>

        {/* Countdown Timer */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-6 md:gap-10">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-semibold mb-1">{timeRemaining.days}</div>
              <div className="text-xs md:text-sm uppercase tracking-[0.2em]">DAYS</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-semibold mb-1">{timeRemaining.hours}</div>
              <div className="text-xs md:text-sm uppercase tracking-[0.2em]">HOURS</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-semibold mb-1">{timeRemaining.minutes}</div>
              <div className="text-xs md:text-sm uppercase tracking-[0.2em]">MINUTES</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl md:text-5xl font-semibold mb-1">{timeRemaining.seconds}</div>
              <div className="text-xs md:text-sm uppercase tracking-[0.2em]">SECONDS</div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="px-8 md:px-12 py-3 md:py-4 border-2 border-white bg-transparent text-lg md:text-xl text-white rounded-lg hover:bg-white/20 transition-all duration-300 tracking-wider"
        >
          START
        </button>
      </div>
    </div>
  );
};
