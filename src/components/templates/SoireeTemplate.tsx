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
import DayProgramme, { type DayEvent } from "@/components/templates/DayProgramme";

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

  // Lock for the timeline slide: prevents Embla drag until all events revealed
  const timelineLockRef = useRef(false);
  const timelineSlideIdRef = useRef<string>("events");
  const selectedRef = useRef(0);

  // Embla horizontal
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    duration: 55,
    skipSnaps: false,
    watchDrag: (_api, _evt) => {
      // While on the timeline slide, DayProgramme owns the swipe entirely
      // and will call scrollNext/scrollPrev when crossing a boundary.
      return !timelineLockRef.current;
    },
  });
  const [selected, setSelected] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const i = emblaApi.selectedScrollSnap();
      setSelected(i);
      selectedRef.current = i;
    };
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

  const slidesIdsRef = useRef<string[]>([]);
  // Entry direction into the timeline slide ("forward" from previous, "backward" from next)
  const prevSelectedRef = useRef(0);
  const [timelineEntry, setTimelineEntry] = useState<{ dir: "forward" | "backward"; nonce: number }>({
    dir: "forward",
    nonce: 0,
  });
  useEffect(() => {
    const current = slidesIdsRef.current[selected];
    const prev = prevSelectedRef.current;
    if (current === timelineSlideIdRef.current && selected !== prev) {
      const dir: "forward" | "backward" = selected > prev ? "forward" : "backward";
      setTimelineEntry((e) => ({ dir, nonce: e.nonce + 1 }));
    }
    prevSelectedRef.current = selected;
  }, [selected]);
  // Lock Embla drag whenever we're sitting on the timeline slide; DayProgramme
  // will programmatically trigger scrollNext/scrollPrev once it's done.
  useEffect(() => {
    const current = slidesIdsRef.current[selected];
    timelineLockRef.current = current === timelineSlideIdRef.current;
  }, [selected]);


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
        entryDirection={timelineEntry.dir}
        entryNonce={timelineEntry.nonce}
        onRequestNext={scrollNext}
        onRequestPrev={scrollPrev}
      />
    ),
  });

  slides.push({
    id: "countdown",
    node: (
      <CountdownSlide
        date={wedding.wedding_date}
        backgroundImage={countdownBg}
      />
    ),
  });

  if (gallery && gallery.length > 0) {
    slides.push({
      id: "gallery",
      node: <GallerySlide images={gallery} />,
    });
  }

  if (giftCards && giftCards.length > 0) {
    slides.push({
      id: "gifts",
      node: <GiftsSlide giftCards={giftCards} backgroundImage={namesBg} />,
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

  slidesIdsRef.current = slides.map((s) => s.id);


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
          style={{ opacity: 1 }}
        />
      ) : (
        <motion.img
          src={media}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.55 }}
        />
      )
    ) : (
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#3a3a3a]" />
    )}
    <div className="absolute inset-1 bg-black/40 pointer-events-none" />
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
        style={{ opacity: 0.55 }}
      />
    )}
    <div className="absolute inset-0 bg-black/40 pointer-events-none" />
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
          <linearGradient id="ringGoldA" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f3d9a4" />
            <stop offset="50%" stopColor="#b8862f" />
            <stop offset="100%" stopColor="#7a5618" />
          </linearGradient>
          <linearGradient id="ringGoldB" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f7e3b3" />
            <stop offset="50%" stopColor="#d4af6c" />
            <stop offset="100%" stopColor="#8a6a2a" />
          </linearGradient>
          <linearGradient id="shimmerGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Left ring — gold band */}
        <motion.circle
          cx="80" cy="50" r="30" fill="none"
          stroke="url(#ringGoldA)" strokeWidth="5"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 1.8, ease: "easeInOut", delay: 0.2 } },
          }}
        />
        {/* inner highlight line for jewelry depth */}
        <motion.circle
          cx="80" cy="50" r="27" fill="none"
          stroke="#fff4d8" strokeOpacity="0.55" strokeWidth="0.6"
          initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 2, duration: 0.8 }}
        />

        {/* Right ring — gold band with tiny diamond */}
        <motion.circle
          cx="120" cy="50" r="30" fill="none"
          stroke="url(#ringGoldB)" strokeWidth="5"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { pathLength: 1, opacity: 1, transition: { duration: 1.8, ease: "easeInOut", delay: 0.8 } },
          }}
        />
        <motion.circle
          cx="120" cy="50" r="27" fill="none"
          stroke="#fff4d8" strokeOpacity="0.55" strokeWidth="0.6"
          initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 2.6, duration: 0.8 }}
        />
        {/* Diamond on top of right ring */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.6, ease: "backOut" }}
          style={{ transformOrigin: "120px 20px" }}
        >
          <polygon points="120,15 124,20 120,27 116,20" fill="#fff8e1" stroke="#b8862f" strokeWidth="0.5" />
          <motion.circle
            cx="120" cy="20" r="1.2" fill="#ffffff"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* Shimmer sweep across the rings */}
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

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const parseHourPhrase = (time?: string): { hour: number; phrase: string } | null => {
  if (!time) return null;
  const m = /^(\d{1,2}):?(\d{2})?/.exec(time.trim());
  if (!m) return null;
  const h24 = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  if (Number.isNaN(h24)) return null;
  let hour = h24 % 12;
  if (hour === 0) hour = 12;
  const phrase = h24 >= 12 ? "PM" : "AM";
  const display = min > 0 ? `:${min.toString().padStart(2, "0")} ${phrase}` : phrase;
  return { hour, phrase: display };
};

const EventsSlide = ({
  ceremony,
  venue,
  ceremonyName,
  venueName,
  dateFormatted,
  backgroundImage,
  entryDirection,
  entryNonce,
  onRequestNext,
  onRequestPrev,
}: {
  ceremony?: any;
  venue?: any;
  ceremonyName?: string;
  venueName?: string;
  dateFormatted?: string;
  backgroundImage?: string;
  entryDirection?: "forward" | "backward";
  entryNonce?: number;
  onRequestNext?: () => void;
  onRequestPrev?: () => void;
}) => {
  const programmeEvents: DayEvent[] = [
    ceremony && {
      raw: ceremony,
      label: "Ceremony",
      name: ceremonyName,
      isHero: true,
    },
    venue && {
      raw: venue,
      label: "Reception",
      name: venueName,
      isHero: true,
    },
  ]
    .filter(Boolean)
    .map((e: any, idx: number) => {
      const parsed = parseHourPhrase(e.raw.time);
      return {
        id: `${idx}`,
        hour: parsed?.hour ?? 12,
        minutePhrase: parsed?.phrase,
        romanNumeral: ROMAN[idx] || `${idx + 1}`,
        label: e.label,
        venue: e.name || "",
        city: "",
        mapUrl: e.raw.location_link,
        isHero: e.isHero,
      } as DayEvent;
    });

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
          style={{ opacity: 0.55 }}
        />
      )}
      {/* Dark overlay to improve timeline readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <DayProgramme
        date={dateFormatted || ""}
        events={programmeEvents}
        entryDirection={entryDirection}
        entryNonce={entryNonce}
        onRequestNext={onRequestNext}
        onRequestPrev={onRequestPrev}
      />
    </div>
  );
};


const useCountdown = (target: string) => {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);
  return t;
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const CountdownSlide = ({
  date,
  backgroundImage,
}: {
  date: string;
  backgroundImage?: string;
}) => {
  const { d, h, m, s } = useCountdown(date);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#1a1a1a] text-white">
      {backgroundImage && (
        <motion.img
          src={backgroundImage}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 6, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.55 }}
        />
      )}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />


      <div className="absolute inset-0 flex items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[640px] rounded-[14px] overflow-hidden"
          style={{
            padding: "28px 36px",
            fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif",
          }}
        >

          {/* Grid */}
          <div
            className="grid items-center relative z-10"
            style={{
              gridTemplateColumns: "1fr 1px 0.5fr",
              gap: "22px",
              minHeight: "240px",
            }}
          >
            {/* Days hero */}
            <div className="text-left relative">
              <div
                className="inline-block"
                style={{
                  minHeight: "clamp(140px, 30vw, 220px)",
                  paddingTop: "0.15em",
                  paddingBottom: "0.25em",
                  paddingLeft: "0.05em",
                  paddingRight: "0.1em",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={d}
                    initial={{ y: -16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 16, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    className="inline-block"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 500,
                      lineHeight: 1.05,
                      letterSpacing: "-0.03em",
                      fontSize: "clamp(110px, 26vw, 190px)",
                      color: "#ffffff",
                      textShadow: "0 2px 18px rgba(255,255,255,0.15)",

                      WebkitFontSmoothing: "antialiased",
                      MozOsxFontSmoothing: "grayscale",
                    }}
                  >
                    {d}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div
                className="mt-3"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "9px",
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Days remaining
              </div>
            </div>

            {/* Divider */}
            <div
              className="relative mx-auto overflow-visible"
              style={{
                width: "1px",
                height: "220px",
                background:
                  "linear-gradient(180deg,transparent 0%,rgba(255,255,255,0.5) 18%,rgba(255,255,255,0.85) 50%,rgba(255,255,255,0.5) 82%,transparent 100%)",

              }}
            >
              {[24, 50, 76].map((top) => (
                <span
                  key={top}
                  className="absolute"
                  style={{
                    top: `${top}%`,
                    left: "-3px",
                    width: "7px",
                    height: "0.5px",
                    background: "rgba(255,255,255,0.7)",
                    opacity: 0.55,
                  }}
                />
              ))}
              <span
                className="absolute"
                style={{
                  top: "-50px",
                  left: "-1.5px",
                  width: "4px",
                  height: "50px",
                  background:
                    "linear-gradient(180deg,transparent,rgba(255,255,255,0.95),transparent)",
                  animation: "auTravel 6s ease-in-out infinite",
                  filter: "blur(0.5px)",
                }}
              />
            </div>

            {/* Seconds column */}
            <div className="flex flex-col gap-5">
              {[
                { v: pad(h), label: "Hours" },
                { v: pad(m), label: "Minutes" },
                { v: pad(s), label: "Seconds", pulse: true },
              ].map((u) => (
                <div key={u.label} className="flex items-baseline gap-3 relative">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={u.v}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="inline-block text-right"
                      style={{
                        fontStyle: "italic",
                        fontWeight: 400,
                        fontSize: "clamp(28px, 7vw, 44px)",
                        lineHeight: 1,
                        color: "#ffffff",
                        minWidth: "52px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {u.v}
                    </motion.span>
                  </AnimatePresence>
                  <span
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      fontSize: "8px",
                      letterSpacing: "0.38em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {u.label}
                  </span>
                </div>
              ))}
            </div>
          </div>



          {/* Footer */}
          <div className="relative z-10 text-center mt-7 pt-5">
            <span
              className="absolute top-0"
              style={{
                left: "25%",
                right: "25%",
                height: "0.5px",
                background:
                  "linear-gradient(90deg,transparent,rgba(255,255,255,0.7) 50%,transparent)",
              }}
            />
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "15px",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              until{" "}
              <span style={{ color: "rgba(255,255,255,0.7)", margin: "0 10px", fontSize: "8px" }}>
                ◆
              </span>{" "}
              we say{" "}
              <span style={{ color: "rgba(255,255,255,0.7)", margin: "0 10px", fontSize: "8px" }}>
                ◆
              </span>{" "}
              I do
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes auShim {0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes auTravel {0%{top:-50px;opacity:0}15%{opacity:1}85%{opacity:1}100%{top:220px;opacity:0}}
        @keyframes auPulse {0%{transform:scale(1);opacity:1}50%{transform:scale(2);opacity:.3}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
};
const GiftsSlide = ({
  giftCards,
  backgroundImage,
}: {
  giftCards: any[];
  backgroundImage?: string;
}) => {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
    } catch {
      /* ignore */
    }
  };

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
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />

      <div className={`${slideContainer} text-white`}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-white/80"
        >
          {t("gifts.subtitle", "With Love & Gratitude")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-4 text-4xl md:text-5xl italic font-light tracking-wide text-center"
        >
          {t("gifts.title", "Gift Registry")}
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="h-[1px] bg-white/70 mt-5"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-5 text-xs md:text-sm tracking-wider text-white/75 text-center max-w-sm"
        >
          {t(
            "gifts.tap_to_copy",
            "Tap a card to copy the number",
          )}
        </motion.p>

        <div className="mt-8 w-full max-w-md grid gap-3">
          {giftCards.map((card, index) => {
            const id = card.id ?? String(index);
            const isCopied = copiedId === id;
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => copyToClipboard(card.card_number, id)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.12, duration: 0.7 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full text-left bg-white/95 hover:bg-white text-[#1a1a1a] rounded-xl px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-colors"
              >
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#6b6b6b]">
                  {card.card_name}
                </p>
                <p className="mt-2 text-lg md:text-xl font-light tracking-wider tabular-nums break-all">
                  {card.card_number}
                </p>
                <span
                  className={`absolute top-3 right-4 text-[10px] tracking-[0.3em] uppercase transition-opacity ${
                    isCopied ? "opacity-100 text-[#1a1a1a]" : "opacity-40 group-hover:opacity-70 text-[#6b6b6b]"
                  }`}
                >
                  {isCopied ? t("gifts.copied", "Copied") : t("gifts.copy", "Copy")}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


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
}: any) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#f6f1ea] overflow-y-auto">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft warm glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] h-[60%] opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,175,108,0.18) 0%, rgba(212,175,108,0.05) 45%, transparent 70%)",
          }}
        />

        {/* Top-left ornamental sprig */}
        <motion.svg
          viewBox="0 0 120 80"
          className="absolute top-6 left-6 w-24 h-16 md:w-32 md:h-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        >
          <motion.path
            d="M5 70 Q 30 60, 50 40 T 110 10"
            fill="none"
            stroke="#b8862f"
            strokeWidth="0.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
          {[
            { cx: 25, cy: 62, r: 2.2 },
            { cx: 45, cy: 46, r: 1.8 },
            { cx: 70, cy: 30, r: 2 },
            { cx: 95, cy: 16, r: 1.6 },
          ].map((leaf, idx) => (
            <motion.ellipse
              key={idx}
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.r * 2.2}
              ry={leaf.r}
              fill="#d4af6c"
              opacity="0.55"
              transform={`rotate(${-30 + idx * 8} ${leaf.cx} ${leaf.cy})`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.55, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 + idx * 0.15 }}
            />
          ))}
        </motion.svg>

        {/* Bottom-right ornamental sprig (mirrored) */}
        <motion.svg
          viewBox="0 0 120 80"
          className="absolute bottom-6 right-6 w-24 h-16 md:w-32 md:h-20"
          style={{ transform: "scale(-1, -1)" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: "easeOut" }}
        >
          <motion.path
            d="M5 70 Q 30 60, 50 40 T 110 10"
            fill="none"
            stroke="#b8862f"
            strokeWidth="0.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: 0.3, ease: "easeInOut" }}
          />
          {[
            { cx: 25, cy: 62, r: 2.2 },
            { cx: 45, cy: 46, r: 1.8 },
            { cx: 70, cy: 30, r: 2 },
            { cx: 95, cy: 16, r: 1.6 },
          ].map((leaf, idx) => (
            <motion.ellipse
              key={idx}
              cx={leaf.cx}
              cy={leaf.cy}
              rx={leaf.r * 2.2}
              ry={leaf.r}
              fill="#d4af6c"
              opacity="0.55"
              transform={`rotate(${-30 + idx * 8} ${leaf.cx} ${leaf.cy})`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.55, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.5 + idx * 0.15 }}
            />
          ))}
        </motion.svg>
      </div>

      <div className="relative h-full flex flex-col justify-center px-4 py-6">
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
};

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
