import { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, Globe, Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import eclatWedding1 from "@/assets/eclat-wedding-1.jpg";
import eclatWedding2 from "@/assets/eclat-wedding-2.jpg";
import eclatWedding3 from "@/assets/eclat-wedding-3.jpg";
import eclatWedding4 from "@/assets/eclat-wedding-4.jpg";
import eclatWedding5 from "@/assets/eclat-wedding-5.jpg";
import eclatWedding6 from "@/assets/eclat-wedding-6.jpg";
import eclatWedding7 from "@/assets/eclat-wedding-7.jpg";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

const DATE_LOCALES = {
  en: "en-US",
  ar: "ar-SA",
  fr: "fr-FR",
  es: "es-ES",
} as const;

const DEFAULT_TEXTS = {
  quote: "Two are better than one. For if they fall, one will lift up the other.",
  quoteSource: "— Ecclesiastes 4:9-12",
  togetherWithFamilies: "Together with their families",
  mrAndMrs: "Mr. & Mrs.",
  and: "&",
  inviteMessage: "joyfully invite you to the wedding of their\nbeloved son and daughter",
  countdownTitle: "Counting Down To Our Special Day",
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
  ourMoments: "Our Moments",
  weddingGift: "Wedding Gift",
  giftDescription: "For those who desire a wedding list is available",
  location: "Location",
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
  weddingDate: "Saturday, August 16th, 2025",
  dateLabel: "16 August",
};

const DEFAULT_WEDDING_CONTENT = {
  groom_name: "Adrian",
  bride_name: "Elena",
  groom_family: "Vale",
  bride_family: "Maris",
};

const DEFAULT_LOCATIONS = [
  {
    id: "ceremony",
    type: "ceremony",
    title: "Ceremony",
    time: "7:00 PM",
    location_name: "Couvent Saint Sauveur - Sarba",
    icon: "material-symbols:church-rounded",
  },
  {
    id: "welcome",
    type: "welcome",
    title: "Welcome Drink",
    time: "8:00 PM",
    location_name: "Carma - Jeita Country Club",
    icon: "streamline:champagne-party-alcohol-remix",
  },
  {
    id: "dinner",
    type: "dinner",
    title: "Dinner & Party",
    time: "9:00 PM",
    location_name: "Carma - Jeita Country Club",
    icon: "solar:confetti-bold",
  },
];

const DEFAULT_GIFT_CARDS = [
  { id: "1", card_name: "OMT", card_number: "123456789" },
  { id: "2", card_name: "Whish", card_number: "123456789" },
];

const DEFAULT_INVITEES = [
  { id: "1", name: "Daniel Farah" },
  { id: "2", name: "Sara Mansour" },
];

type LocalizedPreviewContent = {
  texts: typeof DEFAULT_TEXTS;
  wedding: typeof DEFAULT_WEDDING_CONTENT;
  locations: typeof DEFAULT_LOCATIONS;
  giftCards: typeof DEFAULT_GIFT_CARDS;
  invitees: typeof DEFAULT_INVITEES;
};

const DEFAULT_TRANSLATED_CONTENT: LocalizedPreviewContent = {
  texts: DEFAULT_TEXTS,
  wedding: DEFAULT_WEDDING_CONTENT,
  locations: DEFAULT_LOCATIONS,
  giftCards: DEFAULT_GIFT_CARDS,
  invitees: DEFAULT_INVITEES,
};

const STATIC_WEDDING = {
  wedding_date: new Date("2025-08-16"),
  rsvp_deadline: new Date("2025-08-01"),
};

// Static Countdown Timer Component
const StaticCountdownTimer = ({ targetDate, texts }: { targetDate: Date; texts: typeof DEFAULT_TEXTS }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      <h2 className="text-template-subtitle mb-6">{texts.countdownTitle}</h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: timeRemaining.days, label: texts.days },
          { value: timeRemaining.hours, label: texts.hours },
          { value: timeRemaining.minutes, label: texts.minutes },
          { value: timeRemaining.seconds, label: texts.seconds },
        ].map((item, index) => (
          <AnimatedSection key={index} delay={index * 100} animation="fade-in">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-bold text-primary">{item.value}</div>
              <div className="text-sm md:text-base text-muted-foreground mt-2">{item.label}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};

export const AuraPreview = () => {
  const [language, setLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [content, setContent] = useState<LocalizedPreviewContent>(DEFAULT_TRANSLATED_CONTENT);
  const [translationCache, setTranslationCache] = useState<Record<string, LocalizedPreviewContent>>({
    en: DEFAULT_TRANSLATED_CONTENT,
  });

  const { texts, wedding, locations, giftCards, invitees } = content;
  const isRtl = language === "ar";
  const dateLocale = DATE_LOCALES[language as keyof typeof DATE_LOCALES] ?? "en-US";

  const translateTexts = useCallback(
    async (targetLang: string) => {
      if (targetLang === "en") {
        setContent(DEFAULT_TRANSLATED_CONTENT);
        return;
      }

      if (translationCache[targetLang]) {
        setContent(translationCache[targetLang]);
        return;
      }

      setIsTranslating(true);
      try {
        const textKeys = Object.keys(DEFAULT_TEXTS) as (keyof typeof DEFAULT_TEXTS)[];
        const weddingKeys = Object.keys(DEFAULT_WEDDING_CONTENT) as (keyof typeof DEFAULT_WEDDING_CONTENT)[];

        const items: { type: string; key?: string; locationId?: string; giftId?: string; inviteeId?: string; value: string }[] = [
          ...textKeys.map((key) => ({ type: "text", key, value: DEFAULT_TEXTS[key] })),
          ...weddingKeys.map((key) => ({ type: "wedding", key, value: DEFAULT_WEDDING_CONTENT[key] })),
          ...DEFAULT_LOCATIONS.flatMap((loc) => [
            { type: "locationTitle", locationId: loc.id, value: loc.title },
            { type: "locationTime", locationId: loc.id, value: loc.time },
            { type: "locationName", locationId: loc.id, value: loc.location_name },
          ]),
          ...DEFAULT_GIFT_CARDS.map((card) => ({
            type: "giftName",
            giftId: card.id,
            value: card.card_name,
          })),
          ...DEFAULT_INVITEES.map((invitee) => ({
            type: "invitee",
            inviteeId: invitee.id,
            value: invitee.name,
          })),
        ];

        const langLabel = LANGUAGES.find((item) => item.code === targetLang)?.label || targetLang;
        const { data, error } = await supabase.functions.invoke("translate-text", {
          body: { texts: items.map((item) => item.value), targetLanguage: langLabel },
        });

        if (error) throw error;

        const translatedTexts = { ...DEFAULT_TEXTS };
        const translatedWedding = { ...DEFAULT_WEDDING_CONTENT };
        const translatedLocations = DEFAULT_LOCATIONS.map((loc) => ({ ...loc }));
        const translatedGiftCards = DEFAULT_GIFT_CARDS.map((card) => ({ ...card }));
        const translatedInvitees = DEFAULT_INVITEES.map((inv) => ({ ...inv }));

        items.forEach((item, index) => {
          const translatedValue = data?.translations?.[index] || item.value;

          switch (item.type) {
            case "text":
              (translatedTexts as any)[item.key!] = translatedValue;
              break;
            case "wedding":
              (translatedWedding as any)[item.key!] = translatedValue;
              break;
            case "locationTitle": {
              const loc = translatedLocations.find((l) => l.id === item.locationId);
              if (loc) loc.title = translatedValue;
              break;
            }
            case "locationTime": {
              const loc = translatedLocations.find((l) => l.id === item.locationId);
              if (loc) loc.time = translatedValue;
              break;
            }
            case "locationName": {
              const loc = translatedLocations.find((l) => l.id === item.locationId);
              if (loc) loc.location_name = translatedValue;
              break;
            }
            case "giftName": {
              const card = translatedGiftCards.find((c) => c.id === item.giftId);
              if (card) card.card_name = translatedValue;
              break;
            }
            case "invitee": {
              const inv = translatedInvitees.find((i) => i.id === item.inviteeId);
              if (inv) inv.name = translatedValue;
              break;
            }
          }
        });

        const result: LocalizedPreviewContent = {
          texts: translatedTexts,
          wedding: translatedWedding,
          locations: translatedLocations,
          giftCards: translatedGiftCards,
          invitees: translatedInvitees,
        };

        setTranslationCache((prev) => ({ ...prev, [targetLang]: result }));
        setContent(result);
      } catch (err: any) {
        console.error("Translation error:", err);
        toast.error(err?.message || "Translation failed. Showing original text.");
        setContent(DEFAULT_TRANSLATED_CONTENT);
      } finally {
        setIsTranslating(false);
      }
    },
    [translationCache],
  );

  useEffect(() => {
    translateTexts(language);
  }, [language, translateTexts]);

  return (
    <div
      className={`relative w-full min-h-screen bg-background font-serif text-foreground lg:px-[25%]`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Language Switcher */}
      <div className="sticky top-0 z-40 flex justify-end p-3">
        {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-primary mr-2 self-center" />}
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-sm border-primary/20">
            <Globe className="w-4 h-4 mr-2 text-primary" />
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

      <div>
        {/* ===== INTRO SECTION ===== */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-muted/30 to-background pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-muted/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 px-6 py-16 max-w-xl mx-auto space-y-10">
            <div className="space-y-3 opacity-0 animate-[fadeInUp_0.7s_ease-out_0.1s_forwards]">
              <div className="w-12 h-px bg-primary/40 mx-auto" />
              <p className="text-template-body italic max-w-sm mx-auto leading-relaxed opacity-80">
                "{texts.quote}"
              </p>
              <p className="text-template-small mt-1">{texts.quoteSource}</p>
              <div className="w-12 h-px bg-primary/40 mx-auto" />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.25s_forwards]">
              <p className="text-template-small tracking-[0.3em]">{texts.togetherWithFamilies}</p>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.4s_forwards]">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14">
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium tracking-wide">{texts.mrAndMrs}</p>
                  <p className="text-template-subtitle">{wedding.groom_family}</p>
                </div>
                <span className="text-3xl font-light">{texts.and}</span>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium tracking-wide">{texts.mrAndMrs}</p>
                  <p className="text-template-subtitle">{wedding.bride_family}</p>
                </div>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeIn_0.7s_ease-out_0.55s_forwards]">
              <p className="text-template-body opacity-70 whitespace-pre-line leading-relaxed">
                {texts.inviteMessage}
              </p>
            </div>

            <div className="opacity-0 animate-[scaleIn_0.7s_ease-out_0.7s_forwards]">
              <div className="py-4">
                <h1 className="text-template-title text-primary">
                  {wedding.groom_name} {texts.and} {wedding.bride_name}
                </h1>
              </div>
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.7s_ease-out_0.85s_forwards]">
              <div className="space-y-3">
                <div className="w-16 h-px bg-primary/30 mx-auto" />
                <p className="text-template-body font-semibold tracking-wide text-primary">
                  {texts.weddingDate}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="w-24 h-px mx-auto" />

        {/* ===== COUNTDOWN SECTION ===== */}
        <section className="py-16 px-4 bg-card">
          <StaticCountdownTimer targetDate={STATIC_WEDDING.wedding_date} texts={texts} />
        </section>

        <div className="w-24 mx-auto mb-16" />

        {/* ===== TIMELINE SECTION ===== */}
        <section className="mb-16">
          <AnimatedSection animation="fade-in">
            <div className="flex items-center justify-center gap-4 mb-12">
              <Calendar className="w-7 h-7 text-primary" />
              <h2 className="text-template-subtitle">{texts.dateLabel}</h2>
            </div>
          </AnimatedSection>

          <div className="relative max-w-lg mx-auto">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

            <div className="space-y-12">
              {locations.map((event, index) => (
                <AnimatedSection key={event.id} delay={index * 150} animation="fade-in">
                  <div className="relative flex items-start">
                    <div className="flex-1 text-right pr-8">
                      <h3 className="text-template-body font-medium">{event.title}</h3>
                      <p className="text-template-body font-semibold">{event.time}</p>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full z-10" />
                    <div className="flex-1 pl-8">
                      <Icon icon={event.icon} className="w-6 h-6 mb-1 text-primary" />
                      <p className="text-template-small text-muted-foreground leading-snug">{event.location_name}</p>
                      <a
                        href="#"
                        className="inline-flex items-center gap-1 text-template-small underline mt-1 hover:text-primary transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        {texts.location}
                      </a>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GALLERY SECTION ===== */}
        <section className="mb-16">
          <AnimatedSection animation="fade-in">
            <h2 className="text-template-subtitle text-center text-primary mb-8">{texts.ourMoments}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[eclatWedding1, eclatWedding3, eclatWedding4, eclatWedding5, eclatWedding6, eclatWedding7].map(
              (src, index) => (
                <AnimatedSection key={index} delay={index * 80} animation="scale-in">
                  <div className="aspect-square overflow-hidden rounded-lg shadow-soft bg-muted">
                    <img
                      src={src}
                      alt={`Wedding moment ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </AnimatedSection>
              ),
            )}
          </div>
        </section>

        {/* ===== GIFTS SECTION ===== */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="fade-in">
              <h2 className="text-template-subtitle text-center mb-12 text-primary">{texts.weddingGift}</h2>
              <p className="text-center text-template-body mb-8 text-muted-foreground">
                {texts.giftDescription}
              </p>
            </AnimatedSection>
            <div className="grid gap-4 md:grid-cols-2">
              {giftCards.map((card, index) => (
                <AnimatedSection key={card.id} delay={index * 100} animation="scale-in">
                  <div className="bg-background p-6 rounded-lg text-center">
                    <p className="font-semibold text-lg text-foreground">{card.card_name}</p>
                    <p className="text-muted-foreground mt-2">{card.card_number}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FULL-WIDTH GALLERY IMAGE ===== */}
        <AnimatedSection animation="fade-in">
          <section className="w-full px-4">
            <div className="max-w-6xl mx-auto">
              <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-lg">
                <img src={eclatWedding2} alt="Wedding moment" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ===== RSVP SECTION ===== */}
        <RsvpSection
          staticDeadline={STATIC_WEDDING.rsvp_deadline}
          bgClassName="bg-card"
          invitees={invitees}
          rsvpResponses={{ "1": true, "2": false }}
          numberOfPersons={2}
          isPreview
          translations={texts}
          dateLocale={dateLocale}
        />

        {/* ===== BRANDED FOOTER ===== */}
        <TemplatePreviewFooter />
      </div>
    </div>
  );
};
