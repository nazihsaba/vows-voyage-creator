import { useRef, useEffect, useState, useCallback, ReactNode } from "react";
import { parseLocalDate } from "@/lib/weddingDate";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { RsvpSection } from "@/components/templates/RsvpSection";
import { EventIcon } from "@/components/templates/EventIcon";
import LanguageToggle from "@/components/templates/LanguageToggle";
import aureaLogo from "@/assets/aureaLogoFullColored.png";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { useArabicContent } from "@/hooks/useArabicContent";
import { applyFadeLoop } from "@/lib/audioFadeLoop";

interface SoireeTemplateProps {
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
  rsvpResponses?: Record<string, boolean | null>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean | null) => void;
  handleRsvpSubmit?: (wishesMessage?: string) => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
}

/**
 * Soirée — Horizontal swipe storytelling template.
 * Neutral ivory / beige / black palette. Mobile-first.
 */
export const SoireeTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isPreview,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
}: SoireeTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, getLocalizedValue } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ceremony = locations.find((l) => l.type === "ceremony");
  const venue = locations.find((l) => l.type === "venue");
  const heroMedia: string | undefined = wedding.video_url || wedding.hero_media || gallery?.[0]?.image_url;
  const isVideo = !!(wedding.video_url || (heroMedia && /\.(mp4|webm|mov)$/i.test(heroMedia)));

  const dateLocale = isArabic ? "ar-SA-u-ca-gregory" : "en-US";
  const weddingDate = parseLocalDate(wedding.wedding_date);
  const dateFormatted = weddingDate.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const brideName = getLocalizedValue("bride_name", wedding.bride_name) || "Bride";
  const groomName = getLocalizedValue("groom_name", wedding.groom_name) || "Groom";
  const quoteText =
    getLocalizedValue("aura_quote", (wedding as any).aura_quote) ||
    wedding.main_description ||
    "";
  const quoteReference = getLocalizedValue("aura_reference", (wedding as any).aura_reference) || "";

  // Embla horizontal
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    duration: 55,
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    setTotalSlides(emblaApi.scrollSnapList().length);
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setTotalSlides(emblaApi.scrollSnapList().length);
      onSelect();
    });
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") scrollNext();
      if (e.key === "ArrowLeft") scrollPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollNext, scrollPrev]);

  // Lock vertical scroll while on this template
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // Audio
  useEffect(() => {
    if (!wedding.audio_url || !audioRef.current) return;
    const audio = audioRef.current;
    audio.currentTime = wedding.audio_start_time || 0;
    audio.loop = true;
    audio.volume = 0.5;
    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();
    const unlock = () => {
      tryPlay();
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("click", unlock);
    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, [wedding.audio_url, wedding.audio_start_time]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    applyFadeLoop(audio, wedding.audio_start_time || 0, wedding.audio_end_time, 0.5);
  };

  const namesBg = gallery?.[1]?.image_url || gallery?.[0]?.image_url || heroMedia;
  const countdownBg = gallery?.[2]?.image_url || gallery?.[gallery.length - 1]?.image_url || heroMedia;
  const eventsBg = gallery?.[3]?.image_url || gallery?.[1]?.image_url || heroMedia;

  const slides: { id: string; node: ReactNode }[] = [
    {
      id: "welcome",
      node: <WelcomeSlide media={heroMedia} isVideo={isVideo} />,
    },
    {
      id: "names",
      node: (
        <NamesSlide
          bride={brideName}
          groom={groomName}
          date={dateFormatted}
          backgroundImage={namesBg}
        />
      ),
    },
  ];

  if (quoteText) {
    slides.push({
      id: "quote",
      node: <QuoteSlide quote={quoteText} reference={quoteReference} />,
    });
  }

  slides.push({
    id: "events",
    node: (
      <EventsSlide
        ceremony={ceremony}
        venue={venue}
        ceremonyName={getLocalizedValue("ceremony_location", ceremony?.location_name)}
        venueName={getLocalizedValue("venue_location", venue?.location_name)}
        dateFormatted={dateFormatted}
        backgroundImage={eventsBg}
      />
    ),
  });

  slides.push({
    id: "countdown",
    node: <CountdownSlide date={wedding.wedding_date} backgroundImage={countdownBg} />,
  });

  if (gallery && gallery.length > 0) {
    slides.push({
      id: "gallery",
      node: <GallerySlide images={gallery} />,
    });
  }

  slides.push({
    id: "rsvp",
    node: (
      <RsvpSlide
        wedding={wedding}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
        isPreview={isPreview}
      />
    ),
  });

  slides.push({
    id: "footer",
    node: <FooterSlide />,
  });

  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#f6f1ea] text-[#1a1a1a]"
      style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
    >
      {/* Audio */}
      {wedding.audio_url && (
        <audio
          ref={audioRef}
          src={wedding.audio_url}
          onTimeUpdate={handleTimeUpdate}
          playsInline
          className="hidden"
        />
      )}

      {/* Embla viewport — paper-fold like transition */}
      <div
        className="w-full h-full overflow-hidden"
        ref={emblaRef}
        style={{ perspective: "1800px" }}
      >
        <div className="flex h-full" style={{ transformStyle: "preserve-3d" }}>
          {slides.map((s, i) => {
            const distance = i - selected;
            const isActive = i === selected;
            // Paper-opening: incoming page rotates from the right edge,
            // outgoing page softly recedes.
            const rotateY = distance === 0 ? 0 : distance > 0 ? 35 : -12;
            const translateX = distance === 0 ? 0 : distance > 0 ? 40 : -20;
            const scale = isActive ? 1 : 0.96;
            const opacity = Math.abs(distance) > 1 ? 0 : isActive ? 1 : 0.4;
            return (
              <div
                key={s.id}
                className="relative flex-[0_0_100%] h-full"
                aria-hidden={!isActive}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: distance > 0 ? "left center" : "right center",
                  transform: `perspective(1800px) rotateY(${rotateY}deg) translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  transition:
                    "transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease",
                  willChange: "transform, opacity",
                  boxShadow: isActive
                    ? "0 30px 60px -30px rgba(0,0,0,0.35)"
                    : "0 10px 30px -10px rgba(0,0,0,0.25)",
                }}
              >
                {/* subtle paper crease shadow on the leading edge of incoming page */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-12"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0))",
                    opacity: distance > 0 ? 0.9 : 0,
                    transition: "opacity 700ms ease",
                  }}
                />
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, filter: "blur(6px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(4px)" }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 w-full h-full"
                    >
                      {s.node}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side arrows (desktop / tablet) */}
      <button
        onClick={scrollPrev}
        disabled={selected === 0}
        aria-label="Previous"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/60 backdrop-blur-md border border-black/10 items-center justify-center text-black/70 hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed z-30"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        disabled={selected === totalSlides - 1}
        aria-label="Next"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/60 backdrop-blur-md border border-black/10 items-center justify-center text-black/70 hover:bg-white transition disabled:opacity-30 disabled:cursor-not-allowed z-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === selected ? "w-8 bg-black/70" : "w-4 bg-black/25 hover:bg-black/40"
            }`}
          />
        ))}
      </div>

      {/* Swipe hint on first slide */}
      <AnimatePresence>
        {selected === 0 && (
          <motion.div
            initial={{ opacity: 0, x: "-50%", y: 8 }}
            animate={{ opacity: 1, x: "-50%", y: 0 }}
            exit={{ opacity: 0, x: "-50%" }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="absolute bottom-16 left-1/2 text-[10px] tracking-[0.4em] uppercase text-white/90 mix-blend-difference z-30 select-none text-center"
          >
            ← swipe ←
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language toggle / footer */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageToggle />
      </div>

    </div>
  );
};

/* ------------------ Slides ------------------ */

const slideContainer =
  "absolute inset-0 w-full h-full flex flex-col items-center justify-center px-6 md:px-14";

const WelcomeSlide = ({ media, isVideo }: { media?: string; isVideo: boolean }) => (
  <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
    {media ? (
      isVideo ? (
        <video
          src={media}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <motion.img
          src={media}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )
    ) : (
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#3a3a3a]" />
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="text-[10px] md:text-xs tracking-[0.5em] uppercase opacity-80"
      >
        You're Invited
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1.1 }}
        className="mt-5 text-5xl md:text-7xl italic font-light tracking-wide"
      >
        Our Wedding
      </motion.h1>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 56 }}
        transition={{ delay: 1.2, duration: 0.9 }}
        className="h-[1px] bg-white/70 mt-6"
      />
    </div>
  </div>
);

const NamesSlide = ({
  bride,
  groom,
  date,
  backgroundImage,
}: {
  bride: string;
  groom: string;
  date: string;
  backgroundImage?: string;
}) => (
  <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#f6f1ea]">
    {backgroundImage && (
      <motion.img
        src={backgroundImage}
        alt=""
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
    <div className={`${slideContainer} text-white`}>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.9 }}
        className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/80"
      >
        Together with their families
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-10 text-5xl md:text-7xl italic font-light text-center leading-[1.1]"
      >
        {bride}
      </motion.h2>

      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="my-6 text-3xl md:text-4xl italic font-light text-white/80"
      >
        &amp;
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="text-5xl md:text-7xl italic font-light text-center leading-[1.1]"
      >
        {groom}
      </motion.h2>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 64 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="h-[1px] bg-white/70 mt-10"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7, duration: 0.8 }}
        className="mt-6 text-xs md:text-sm tracking-[0.35em] uppercase text-white/85"
      >
        {date}
      </motion.p>
    </div>
  </div>
);

const QuoteSlide = ({ quote, reference }: { quote: string; reference?: string }) => {
  const petals = Array.from({ length: 14 }).map((_, i) => ({
    left: `${(i * 7.3) % 100}%`,
    delay: (i % 7) * 0.6,
    duration: 9 + (i % 5) * 1.6,
    size: 6 + (i % 4) * 2,
    drift: (i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 14),
  }));

  return (
    <div className={`${slideContainer} bg-[#efe7dc] relative overflow-hidden`}>
      {/* Soft golden glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(212,175,108,0.18), transparent 60%)",
        }}
      />

      {/* Floating petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {petals.map((p, i) => (
          <motion.span
            key={i}
            className="absolute block rounded-full"
            style={{
              left: p.left,
              top: "-5%",
              width: p.size,
              height: p.size,
              background:
                "radial-gradient(circle at 30% 30%, #f3d9b1, #c79a55 70%, transparent)",
              opacity: 0.75,
            }}
            initial={{ y: "-10%", x: 0, rotate: 0, opacity: 0 }}
            animate={{
              y: "115%",
              x: [0, p.drift, -p.drift / 2, p.drift / 3],
              rotate: [0, 180, 360],
              opacity: [0, 0.85, 0.85, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Interlocking wedding rings */}
      <motion.svg
        viewBox="0 0 200 100"
        className="absolute top-[14%] left-1/2 -translate-x-1/2 w-44 md:w-56 pointer-events-none"
        initial="hidden"
        animate="visible"
      >
        <defs>
          <linearGradient id="shimmerGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="80" cy="50" r="34" fill="none" stroke="#b8862f" strokeWidth="1.2"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 1.8, ease: "easeInOut", delay: 0.2 } },
          }}
        />
        <motion.circle
          cx="120" cy="50" r="34" fill="none" stroke="#d4af6c" strokeWidth="1.2"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 1.8, ease: "easeInOut", delay: 0.8 } },
          }}
        />
        <motion.rect
          x="0" y="0" width="40" height="100" fill="url(#shimmerGrad)"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 220, opacity: [0, 0.6, 0] }}
          transition={{ duration: 2.8, delay: 2.2, repeat: Infinity, repeatDelay: 4 }}
        />
      </motion.svg>

      {/* Ornamental flourish — top */}
      <motion.svg
        viewBox="0 0 200 20"
        className="absolute top-[34%] left-1/2 -translate-x-1/2 w-56 md:w-72 pointer-events-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}
      >
        <motion.path
          d="M0 10 Q50 0 100 10 T200 10"
          fill="none" stroke="#b8862f" strokeWidth="0.8"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 1.2, ease: "easeInOut" }}
        />
        <motion.circle
          cx="100" cy="10" r="1.8" fill="#b8862f"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 2.6, duration: 0.5 }}
        />
      </motion.svg>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="max-w-xl text-center relative z-10 px-6"
      >
        <p className="text-5xl md:text-6xl italic font-light leading-none text-black/40 mb-4">
          &ldquo;
        </p>
        <p className="text-xl md:text-2xl italic font-light leading-relaxed text-black/85">
          {quote}
        </p>
        {reference && (
          <p className="mt-8 text-[10px] md:text-xs tracking-[0.4em] uppercase text-black/55">
            — {reference}
          </p>
        )}
      </motion.div>

      {/* Ornamental flourish — bottom (mirrored) */}
      <motion.svg
        viewBox="0 0 200 20"
        className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-56 md:w-72 pointer-events-none rotate-180"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }}
      >
        <motion.path
          d="M0 10 Q50 0 100 10 T200 10"
          fill="none" stroke="#b8862f" strokeWidth="0.8"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 1.6, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
};

const EventsSlide = ({
  ceremony,
  venue,
  ceremonyName,
  venueName,
  dateFormatted,
  backgroundImage,
}: {
  ceremony?: any;
  venue?: any;
  ceremonyName?: string;
  venueName?: string;
  dateFormatted?: string;
  backgroundImage?: string;
}) => {
  const events = [
    ceremony && {
      id: "ceremony",
      title: "Ceremony",
      time: formatTimeTo12Hour(ceremony.time) || "—",
      location: ceremonyName || "",
      link: ceremony.location_link,
      icon: ceremony.icon || "material-symbols:church-rounded",
    },
    venue && {
      id: "venue",
      title: "Reception",
      time: formatTimeTo12Hour(venue.time) || "—",
      location: venueName || "",
      link: venue.location_link,
      icon: venue.icon || "solar:confetti-bold",
    },
  ].filter(Boolean) as Array<{
    id: string;
    title: string;
    time: string;
    location: string;
    link?: string;
    icon: string;
  }>;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#f6f1ea]">
      {backgroundImage && (
        <motion.img
          src={backgroundImage}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f6f1ea]/85 via-[#f6f1ea]/80 to-[#f6f1ea]/95" />
      <div className={`${slideContainer} overflow-y-auto`}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-black/60"
        >
          The Day
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="mt-3 text-4xl md:text-5xl italic font-light"
        >
          Events
        </motion.h3>
        {dateFormatted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-3 text-xs tracking-[0.35em] uppercase text-black/65"
          >
            {dateFormatted}
          </motion.p>
        )}

        <div className="relative mt-10 w-full max-w-md">
          <div className="absolute left-1/2 top-2 bottom-2 w-px bg-black/25 -translate-x-1/2" />
          <div className="space-y-12">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.2, duration: 0.8 }}
                className="relative flex items-start"
              >
                <div className="flex-1 pr-6 text-right">
                  <p className="text-[10px] tracking-[0.4em] uppercase text-black/55 mb-1">
                    {event.title}
                  </p>
                  <p className="text-2xl italic font-light">{event.time}</p>
                </div>
                <div className="absolute left-1/2 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-black z-10 ring-4 ring-[#f6f1ea]" />
                <div className="flex-1 pl-6 text-left">
                  <EventIcon icon={event.icon} className="w-5 h-5 mb-1 text-black/70" />
                  {event.location && (
                    <p className="text-sm text-black/75 leading-snug">{event.location}</p>
                  )}
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-[10px] tracking-[0.3em] uppercase border-b border-black/40 pb-0.5"
                    >
                      View Map
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CountdownSlide = ({ date, backgroundImage }: { date: string; backgroundImage?: string }) => (
  <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#1a1a1a] text-white">
    {backgroundImage && (
      <motion.img
        src={backgroundImage}
        alt=""
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 6, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />
    <div className={`${slideContainer} text-white`}>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/75"
      >
        Counting the moments
      </motion.p>
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
        className="mt-3 text-4xl md:text-5xl italic font-light"
      >
        Until We Say I Do
      </motion.h3>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-10 [&_*]:text-white"
      >
        <CountdownTimer targetDate={date} />
      </motion.div>
    </div>
  </div>
);

const GallerySlide = ({ images }: { images: any[] }) => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setActive((a) => (a + 1) % images.length),
      4200,
    );
    return () => window.clearInterval(id);
  }, [images.length]);
  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={active}
          src={images[active]?.image_url}
          alt=""
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
      <div className="absolute bottom-16 left-0 right-0 text-center text-white px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-[10px] tracking-[0.5em] uppercase opacity-85"
        >
          Moments
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="mt-2 text-3xl md:text-4xl italic font-light"
        >
          Our Story in Frames
        </motion.h3>
      </div>
    </div>
  );
};

const RsvpSlide = ({
  wedding,
  invitees,
  rsvpResponses,
  handleRsvpToggle,
  handleRsvpSubmit,
  numberOfPersons,
  isRsvpDeadlinePassed,
  submittingRsvp,
  isPreview,
}: any) => (
  <div className="absolute inset-0 w-full h-full bg-[#f6f1ea] overflow-y-auto">
    <div className="min-h-full flex flex-col justify-center py-16">
      <RsvpSection
        wedding={wedding}
        invitees={invitees}
        rsvpResponses={rsvpResponses}
        handleRsvpToggle={handleRsvpToggle}
        handleRsvpSubmit={handleRsvpSubmit}
        numberOfPersons={numberOfPersons}
        isRsvpDeadlinePassed={isRsvpDeadlinePassed}
        submittingRsvp={submittingRsvp}
        isPreview={isPreview}
        bgClassName="bg-transparent"
        cardBgClassName="bg-white/70 backdrop-blur"
        accentColorClass="text-black"
      />
    </div>
  </div>
);

const FooterSlide = () => (
  <div className={`${slideContainer} bg-[#f6f1ea]`}>
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="flex flex-col items-center justify-center gap-3"
    >
      <p className="text-[10px] tracking-[0.4em] uppercase text-black/55">
        Made for love, by
      </p>
      <a href="https://aureainvites.com" target="_blank" rel="noopener noreferrer">
        <img src={aureaLogo} alt="Auréa Invites" loading="lazy" className="h-9 object-contain" />
      </a>
      <a
        href="https://www.instagram.com/aureainvites?igsh=MXJjYmJrejF3ejI3eQ=="
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 text-black/50 hover:text-black transition-colors"
      >
        <Instagram className="h-5 w-5" />
      </a>
    </motion.div>
  </div>
);

export default SoireeTemplate;
