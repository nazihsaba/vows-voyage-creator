import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Globe, Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import graceVideo from "@/assets/grace-preview-video.mp4";
import previewWedding4 from "@/assets/preview-wedding-4.jpg";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

// All translatable strings keyed for easy lookup
const DEFAULT_TEXTS = {
  theWeddingOf: "The Wedding Of",
  tapToStart: "Tap To Start",
  requestHonor: "Request the honor of your presence at the wedding celebration",
  countdownTitle: "Counting Down To Our Special Day",
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
  weddingEvents: "Wedding Events",
  joinUs: "Join us in celebrating this special day",
  ceremony: "Ceremony",
  venue: "Venue",
  eventLocation: "Event Location",
  viewOnMap: "View on Map",
  weddingGift: "Wedding Gift",
  giftDescription: "For those who desire a wedding list is available",
  closingMessage:
    "We are so excited to share this special day with you! Please enjoy every moment, take lots of pictures, and make wonderful memories with us.",
  joinOurCelebration: "Join Our Celebration",
  rsvpDescription: "Please let us know if you can join us on our special day. Your presence would mean the world to us.",
  attending: "Attending ✓",
  willAttend: "Will Attend?",
  numberOfGuests: "Number of Guests",
  rsvpDeadlinePassed: "RSVP deadline has passed",
  submitting: "Submitting...",
  submitRsvp: "Submit RSVP",
  pleaseRsvpBy: "Please RSVP by:",
  kindlyConfirm: "Kindly confirm your attendance before this date:",
};

const staticWedding = {
  groom_name: "Noah",
  bride_name: "Mia",
  groom_family: "The Elin Family",
  bride_family: "The Soren Family",
  wedding_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  video_url: graceVideo,
};

const staticLocations = [
  {
    id: "1",
    type: "ceremony",
    time: "2:00 PM",
    location_name: "St. Mary's Cathedral",
    location_link: "https://maps.google.com",
  },
  {
    id: "2",
    type: "venue",
    time: "5:00 PM",
    location_name: "Grand Ballroom Hotel",
    location_link: "https://maps.google.com",
  },
];

const staticGiftCards = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "987654321" },
];

const StaticCountdownTimer = ({ targetDate, texts }: { targetDate: Date; texts: typeof DEFAULT_TEXTS }) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      <h2 className="text-template-subtitle mb-6 text-white">{texts.countdownTitle}</h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: timeRemaining.days, label: texts.days },
          { value: timeRemaining.hours, label: texts.hours },
          { value: timeRemaining.minutes, label: texts.minutes },
          { value: timeRemaining.seconds, label: texts.seconds },
        ].map((item, index) => (
          <AnimatedSection key={item.label} delay={index * 100} animation="scale-in">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-bold text-white">{item.value}</div>
              <div className="text-sm md:text-base text-white/70 mt-2">{item.label}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};

export const GracePreview = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [texts, setTexts] = useState(DEFAULT_TEXTS);
  const [translationCache, setTranslationCache] = useState<Record<string, typeof DEFAULT_TEXTS>>({ en: DEFAULT_TEXTS });

  const ceremony = staticLocations.find((loc) => loc.type === "ceremony");
  const venue = staticLocations.find((loc) => loc.type === "venue");

  const translateTexts = useCallback(async (targetLang: string) => {
    if (targetLang === "en") {
      setTexts(DEFAULT_TEXTS);
      return;
    }
    if (translationCache[targetLang]) {
      setTexts(translationCache[targetLang]);
      return;
    }

    setIsTranslating(true);
    try {
      const keys = Object.keys(DEFAULT_TEXTS) as (keyof typeof DEFAULT_TEXTS)[];
      const values = keys.map((k) => DEFAULT_TEXTS[k]);

      const langLabel = LANGUAGES.find((l) => l.code === targetLang)?.label || targetLang;
      const { data, error } = await supabase.functions.invoke("translate-text", {
        body: { texts: values, targetLanguage: langLabel },
      });

      if (error) throw error;

      const translated: Record<string, string> = {};
      keys.forEach((key, i) => {
        translated[key] = data.translations?.[i] || DEFAULT_TEXTS[key];
      });

      const result = translated as typeof DEFAULT_TEXTS;
      setTranslationCache((prev) => ({ ...prev, [targetLang]: result }));
      setTexts(result);
    } catch (err) {
      console.error("Translation error:", err);
      toast.error("Translation failed. Showing original text.");
      setTexts(DEFAULT_TEXTS);
    } finally {
      setIsTranslating(false);
    }
  }, [translationCache]);

  useEffect(() => {
    translateTexts(language);
  }, [language, translateTexts]);
  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      document.getElementById("family-section-grace")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const isRtl = language === "ar";

  return (
    <div className={`w-full text-[#3e2723] font-serif overflow-x-hidden lg:px-[25%] ${isRtl ? "direction-rtl" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-white" />}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[140px] bg-white/90 backdrop-blur-sm border-none shadow-lg">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={staticWedding.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 space-y-6 px-4 max-w-2xl animate-fade-in">
          <p className="text-template-small">{texts.theWeddingOf}</p>
          <div className="space-y-2">
            <h1 className="text-template-title">{staticWedding.groom_name}</h1>
            <p className="text-4xl md:text-5xl">&</p>
            <h1 className="text-template-title">{staticWedding.bride_name}</h1>
          </div>
          <p className="text-template-body tracking-wide">
            {staticWedding.wedding_date.toLocaleDateString(language === "ar" ? "ar-SA" : language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {!hasStarted && (
            <Button
              onClick={handleStart}
              className="mt-8 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm"
            >
              {texts.tapToStart}
            </Button>
          )}
        </div>
        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </section>

      {/* Family Names */}
      <section id="family-section-grace" className="py-16 px-4 text-center bg-white">
        <AnimatedSection animation="fade-up">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-template-subtitle">{staticWedding.groom_family}</h2>
              <p className="text-2xl">&</p>
              <h2 className="text-template-subtitle">{staticWedding.bride_family}</h2>
            </div>
            <p className="text-template-body">{texts.requestHonor}</p>
          </div>
        </AnimatedSection>
      </section>

      {/* Countdown with Video */}
      <section className="relative py-16 px-4 overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={staticWedding.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <StaticCountdownTimer targetDate={staticWedding.wedding_date} texts={texts} />
        </div>
      </section>

      {/* Wedding Events */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <AnimatedSection animation="fade-up">
            <div>
              <h2 className="text-template-subtitle mb-6 text-primary">{texts.weddingEvents}</h2>
              <p className="text-template-body max-w-2xl mx-auto">{texts.joinUs}</p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {ceremony && (
              <AnimatedSection delay={0} animation="fade-in">
                <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <Icon icon="material-symbols:church-rounded" className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">{texts.ceremony}</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{ceremony.time}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">{texts.eventLocation}</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{ceremony.location_name}</p>
                  </div>
                  <a
                    href={ceremony.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors"
                  >
                    {texts.viewOnMap}
                  </a>
                </div>
              </AnimatedSection>
            )}
            {venue && (
              <AnimatedSection delay={200} animation="fade-in">
                <div className="bg-[#faf8f5] p-8 rounded-lg shadow-soft space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <Icon icon="solar:confetti-bold" className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-template-heading mb-2 text-[#3e2723]">{texts.venue}</h3>
                  <p className="text-template-body font-bold text-[#3e2723]">{venue.time}</p>
                  <div className="space-y-2">
                    <p className="text-template-small text-gray-600">{texts.eventLocation}</p>
                    <p className="text-template-body font-medium text-[#3e2723]">{venue.location_name}</p>
                  </div>
                  <a
                    href={venue.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-white px-6 py-2 rounded-md transition-colors"
                  >
                    {texts.viewOnMap}
                  </a>
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Image - Full Width */}
      <AnimatedSection animation="fade-in">
        <section className="relative w-full">
          <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden">
            <img src={previewWedding4} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </section>
      </AnimatedSection>

      {/* Gift Cards */}
      <AnimatedSection animation="fade-up">
        <section className="py-16 px-4 bg-[#faf8f5]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-template-subtitle text-center mb-12 text-primary">{texts.weddingGift}</h2>
            <p className="text-center text-template-body mb-8 text-gray-600">
              {texts.giftDescription}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {staticGiftCards.map((card, index) => (
                <AnimatedSection key={card.id} delay={index * 150} animation="scale-in">
                  <div className="bg-white p-6 rounded-lg text-center">
                    <p className="font-semibold text-lg text-[#3e2723]">{card.card_name}</p>
                    <p className="text-gray-600 mt-2">{card.card_number}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* RSVP */}
      <RsvpSection
        staticDeadline={staticWedding.rsvp_deadline}
        invitees={[
          { id: "1", name: "Noah Elin" },
          { id: "2", name: "Mia Soren" },
        ]}
        rsvpResponses={{ "1": true, "2": false }}
        numberOfPersons={2}
        isPreview
        translations={{
          joinOurCelebration: texts.joinOurCelebration,
          rsvpDescription: texts.rsvpDescription,
          attending: texts.attending,
          willAttend: texts.willAttend,
          numberOfGuests: texts.numberOfGuests,
          rsvpDeadlinePassed: texts.rsvpDeadlinePassed,
          submitting: texts.submitting,
          submitRsvp: texts.submitRsvp,
          pleaseRsvpBy: texts.pleaseRsvpBy,
          kindlyConfirm: texts.kindlyConfirm,
        }}
        dateLocale={language === "ar" ? "ar-SA" : language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US"}
      />

      {/* Closing */}
      <AnimatedSection animation="fade-in">
        <section className="py-16 px-4 bg-[#faf8f5] text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <p className="text-template-body">
              {texts.closingMessage}
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* ===== BRANDED FOOTER ===== */}
      <TemplatePreviewFooter />
    </div>
  );
};

export default GracePreview;
