import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { MapPin } from "lucide-react";
import { EditableField } from "@/components/EditableField";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GiftCards } from "@/components/GiftCards";
import { RsvpSection } from "@/components/templates/RsvpSection";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { EnvelopeAnimation } from "@/components/EnvelopeAnimation";
import RoyaleOrnament from "./royale/RoyaleOrnament";
import RoyaleSectionTitle from "./royale/RoyaleSectionTitle";
import RoyaleCard from "./royale/RoyaleCard";

interface RoyaleTemplateProps {
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
  rsvpResponses?: Record<string, boolean>;
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean) => void;
  handleRsvpSubmit?: () => void;
  numberOfPersons?: number;
  isRsvpDeadlinePassed?: boolean;
  submittingRsvp?: boolean;
}

// Brand highlight color (matches EnvelopeAnimation accent).
const GOLD = "#865814";
const GOLD_LIGHT = "#b8893f";
const GOLD_DEEP = "#5e3d0e";
const INK = "#3a2a14";
const PAPER = "#fbf6ec";
const PAPER_DEEP = "#f1e6cc";

/**
 * Royale — premium luxury wedding template with built-in envelope entry,
 * warm gold & cream palette, paper texture background, and editorial
 * serif typography. All sub-sections use bespoke Royale components and
 * are NOT shared with other templates.
 */
export const RoyaleTemplate = ({
  wedding,
  locations,
  gallery,
  giftCards,
  isOwner = false,
  isPreview,
  onFieldUpdate,
  getFieldValue,
  getFieldStyle,
  invitees = [],
  rsvpResponses = {},
  handleRsvpToggle = () => {},
  handleRsvpSubmit = () => {},
  numberOfPersons = 0,
  isRsvpDeadlinePassed = false,
  submittingRsvp = false,
}: RoyaleTemplateProps) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");
  const welcomeDrinkLoc = locations.find((loc) => loc.type === "welcome_drink");

  // Load Cormorant Garamond once.
  useEffect(() => {
    const id = "royale-google-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&display=swap";
    document.head.appendChild(link);
  }, []);

  // Audio autoplay (mirrors Aura behavior).
  useEffect(() => {
    if (wedding.audio_url && audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = wedding.audio_start_time || 0;
      audio.loop = true;
      audio.volume = 0.5;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          const playOnInteraction = () => {
            audio.play().catch(() => {});
            document.removeEventListener("click", playOnInteraction);
            document.removeEventListener("touchstart", playOnInteraction);
          };
          document.addEventListener("click", playOnInteraction);
          document.addEventListener("touchstart", playOnInteraction);
        });
      }
    }
  }, [wedding.audio_url, wedding.audio_start_time]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && wedding.audio_end_time && audio.currentTime >= wedding.audio_end_time) {
      audio.currentTime = wedding.audio_start_time || 0;
    }
  };

  const orderOf = (loc: any) =>
    typeof loc?.display_order === "number" ? loc.display_order : 999;

  const rawTimelineEntries: Array<{ order: number; event: any }> = [];
  if (ceremony) {
    rawTimelineEntries.push({
      order: orderOf(ceremony),
      event: {
        id: "ceremony",
        title: t("events.ceremony"),
        time: formatTimeTo12Hour(ceremony.time) || "7:00 PM",
        location: ceremony.location_name,
        link: ceremony.location_link,
        icon: ceremony.icon || "material-symbols:church-rounded",
      },
    });
  }
  if (venue) {
    if (welcomeDrinkLoc) {
      rawTimelineEntries.push({
        order: orderOf(welcomeDrinkLoc),
        event: {
          id: "welcome-drink",
          title: t("events.welcomeDrink"),
          time: formatTimeTo12Hour(welcomeDrinkLoc.time || venue.time) || "8:00 PM",
          location: venue.location_name,
          link: venue.location_link,
          icon: "streamline:champagne-party-alcohol-remix",
        },
      });
    }
    rawTimelineEntries.push({
      order: orderOf(venue),
      event: {
        id: "dinner-party",
        title: t("events.dinnerParty"),
        time: formatTimeTo12Hour(venue.time) || "8:30 PM",
        location: venue.location_name,
        link: venue.location_link,
        icon: venue.icon || "solar:confetti-bold",
      },
    });
  }
  locations
    .filter((loc: any) => typeof loc.type === "string" && loc.type.startsWith("custom_"))
    .forEach((loc: any) => {
      rawTimelineEntries.push({
        order: orderOf(loc),
        event: {
          id: loc.type,
          title: loc.custom_title || "Event",
          time: formatTimeTo12Hour(loc.time) || "",
          location: loc.location_name || "",
          link: loc.location_link,
          icon: loc.icon || "solar:confetti-bold",
        },
      });
    });
  const hasAnyOrder = rawTimelineEntries.some((e) => e.order > 0);
  if (hasAnyOrder) rawTimelineEntries.sort((a, b) => a.order - b.order);
  const timelineEvents = rawTimelineEntries.map((e) => e.event);

  // Subtle paper background with gold radial accents.
  const pageStyle: React.CSSProperties = {
    backgroundColor: PAPER,
    backgroundImage: `
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(176,138,62,0.10), transparent 60%),
      radial-gradient(ellipse 60% 40% at 100% 100%, rgba(176,138,62,0.08), transparent 70%),
      radial-gradient(ellipse 60% 40% at 0% 60%, rgba(176,138,62,0.06), transparent 70%),
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.16  0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")
    `,
    backgroundBlendMode: "normal, normal, normal, multiply",
    color: INK,
    fontFamily: "'Cormorant Garamond', serif",
  };

  const Page = (
    <div className="relative w-full min-h-screen lg:px-[25%]" style={pageStyle}>
      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* ===== HERO ===== */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 py-16">
        <AnimatedSection animation="fade-in">
          <p
            className="text-[11px] sm:text-xs uppercase tracking-[0.5em] mb-6"
            style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
          >
            {getFieldValue("royale-eyebrow", "Together with their families")}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={120}>
          <RoyaleOrnament color={GOLD} width={220} className="mb-6" />
        </AnimatedSection>

        <AnimatedSection animation="scale-in" delay={250}>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl leading-[1.05] italic"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: INK }}
          >
            <EditableField
              fieldId="groom-name"
              text={getFieldValue("groom-name", wedding.groom_name)}
              style={getFieldStyle("groom-name")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="span"
            />
          </h1>
          <p
            className="my-4 text-3xl sm:text-4xl"
            style={{ color: GOLD_DEEP, fontFamily: "'Cormorant Garamond', serif" }}
          >
            &amp;
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl leading-[1.05] italic"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: INK }}
          >
            <EditableField
              fieldId="bride-name"
              text={getFieldValue("bride-name", wedding.bride_name)}
              style={getFieldStyle("bride-name")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="span"
            />
          </h1>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={420}>
          <div className="mt-10">
            <RoyaleOrnament color={GOLD} width={180} />
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={500}>
          <p
            className="mt-6 text-sm sm:text-base tracking-[0.3em] uppercase"
            style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
          >
            <EditableField
              fieldId="wedding-date-formatted"
              text={getFieldValue(
                "wedding-date-formatted",
                new Date(wedding.wedding_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              )}
              style={getFieldStyle("wedding-date-formatted")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="span"
            />
          </p>
        </AnimatedSection>

        {/* Scroll cue */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] uppercase opacity-60"
          style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
        >
          ↓ Scroll
        </div>
      </section>

      {/* ===== QUOTE / STORY ===== */}
      <section className="px-6 py-20">
        <AnimatedSection animation="fade-up">
          <div className="max-w-2xl mx-auto">
            <RoyaleCard goldColor={GOLD}>
              <div className="text-center">
                <Icon
                  icon="ph:quotes-fill"
                  className="mx-auto mb-4"
                  width={28}
                  height={28}
                  style={{ color: GOLD }}
                />
                <EditableField
                  fieldId="royale-quote"
                  text={getFieldValue(
                    "royale-quote",
                    wedding.main_description ||
                      "And in their eyes, two souls became one — a love written in time, sealed with grace."
                  )}
                  style={getFieldStyle("royale-quote")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline
                  tag="p"
                  className="italic text-lg sm:text-xl leading-relaxed"
                />
                <div className="mt-6 flex justify-center">
                  <RoyaleOrnament color={GOLD} width={140} />
                </div>
              </div>
            </RoyaleCard>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== FAMILY SECTION ===== */}
      <section className="px-6 py-16">
        <AnimatedSection animation="fade-up">
          <RoyaleSectionTitle eyebrow="Together with their families" title="The Families" goldColor={GOLD} />
        </AnimatedSection>
        <AnimatedSection animation="fade-up" delay={120}>
          <div className="max-w-2xl mx-auto">
            <RoyaleCard goldColor={GOLD}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
                <div className="flex-1">
                  <p
                    className="text-[10px] tracking-[0.4em] uppercase mb-2"
                    style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
                  >
                    {t("family.groomFamily", "Groom's Family")}
                  </p>
                  <EditableField
                    fieldId="groom-family-name"
                    text={getFieldValue(
                      "groom-family-name",
                      wedding.groom_family || (wedding.groom_name?.split(" ").pop() ?? "Family")
                    )}
                    style={getFieldStyle("groom-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-2xl sm:text-3xl italic"
                  />
                </div>
                <div
                  className="text-3xl"
                  style={{ color: GOLD, fontFamily: "'Cormorant Garamond', serif" }}
                >
                  &amp;
                </div>
                <div className="flex-1">
                  <p
                    className="text-[10px] tracking-[0.4em] uppercase mb-2"
                    style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
                  >
                    {t("family.brideFamily", "Bride's Family")}
                  </p>
                  <EditableField
                    fieldId="bride-family-name"
                    text={getFieldValue(
                      "bride-family-name",
                      wedding.bride_family || (wedding.bride_name?.split(" ").pop() ?? "Family")
                    )}
                    style={getFieldStyle("bride-family-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="p"
                    className="text-2xl sm:text-3xl italic"
                  />
                </div>
              </div>
            </RoyaleCard>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== MAIN PHOTO ===== */}
      {wedding.main_picture_url && (
        <section className="px-6 pb-12">
          <AnimatedSection animation="fade-in">
            <div className="max-w-2xl mx-auto">
              <div
                className="relative overflow-hidden rounded-sm"
                style={{
                  border: `1px solid ${GOLD}55`,
                  boxShadow: "0 18px 40px -22px rgba(80,55,15,0.4)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-2 rounded-sm z-10"
                  style={{ border: `1px solid ${GOLD}33` }}
                />
                <img
                  src={wedding.main_picture_url}
                  alt="Couple"
                  loading="lazy"
                  className="w-full h-[55vh] sm:h-[60vh] object-cover"
                  style={{
                    objectPosition: `50% ${Math.min(100, Math.max(0, (wedding as any).main_picture_position_y ?? 50))}%`,
                  }}
                />
              </div>
            </div>
          </AnimatedSection>
        </section>
      )}

      {/* ===== COUNTDOWN ===== */}
      <section className="px-6 py-20" style={{ backgroundColor: PAPER_DEEP }}>
        <AnimatedSection animation="fade-up">
          <RoyaleSectionTitle eyebrow="Counting the days" title="Until We Say I Do" goldColor={GOLD} />
        </AnimatedSection>
        <AnimatedSection animation="fade-up" delay={150}>
          <div className="max-w-3xl mx-auto">
            <CountdownTimer targetDate={wedding.wedding_date} />
          </div>
        </AnimatedSection>
      </section>

      {/* ===== TIMELINE ===== */}
      {timelineEvents.length > 0 && (
        <section className="px-6 py-20">
          <AnimatedSection animation="fade-up">
            <RoyaleSectionTitle eyebrow="The day" title="Order of Events" goldColor={GOLD} />
          </AnimatedSection>

          <div className="max-w-2xl mx-auto space-y-6">
            {timelineEvents.map((event, idx) => (
              <AnimatedSection key={event.id} animation="fade-up" delay={idx * 120}>
                <RoyaleCard goldColor={GOLD}>
                  <div className="flex items-start gap-5">
                    <div
                      className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: `radial-gradient(circle at 35% 30%, #d8b461, ${GOLD} 70%, ${GOLD_DEEP})`,
                        boxShadow: "inset 0 1px 2px rgba(255,255,255,.4), 0 4px 10px rgba(80,55,15,.25)",
                      }}
                    >
                      <Icon icon={event.icon} width={22} height={22} style={{ color: "#fbe9b8" }} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-[11px] tracking-[0.35em] uppercase"
                        style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
                      >
                        {event.time}
                      </p>
                      <h3
                        className="text-2xl sm:text-3xl italic mt-1"
                        style={{ color: INK }}
                      >
                        {event.title}
                      </h3>
                      {event.location && (
                        <p className="mt-1 text-sm sm:text-base opacity-80" style={{ color: INK }}>
                          {event.location}
                        </p>
                      )}
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs underline hover:opacity-80"
                          style={{ color: GOLD_DEEP, fontFamily: "Inter, sans-serif" }}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {t("events.location")}
                        </a>
                      )}
                    </div>
                  </div>
                </RoyaleCard>
              </AnimatedSection>
            ))}
          </div>
        </section>
      )}

      {/* ===== GALLERY ===== */}
      {gallery && gallery.length > 0 && (
        <section className="px-6 py-20" style={{ backgroundColor: PAPER_DEEP }}>
          <AnimatedSection animation="fade-up">
            <RoyaleSectionTitle eyebrow="Captured moments" title="Our Story in Pictures" goldColor={GOLD} />
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {gallery.map((image: any, index: number) => (
              <AnimatedSection key={image.id || index} animation="scale-in" delay={index * 80}>
                <div
                  className="relative aspect-square overflow-hidden rounded-sm"
                  style={{ border: `1px solid ${GOLD}55` }}
                >
                  <div
                    className="pointer-events-none absolute inset-1 rounded-sm z-10"
                    style={{ border: `1px solid ${GOLD}33` }}
                  />
                  <img
                    src={image.image_url}
                    alt={image.alt_text || `Moment ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    style={{
                      objectPosition: `50% ${Math.min(100, Math.max(0, image.position_y ?? 50))}%`,
                    }}
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>
      )}

      {/* ===== GIFTS ===== */}
      {giftCards && giftCards.length > 0 && (
        <section className="px-6 py-20">
          <AnimatedSection animation="fade-up">
            <RoyaleSectionTitle eyebrow="With gratitude" title="Gifts of Love" goldColor={GOLD} />
            <p
              className="text-center max-w-xl mx-auto mb-10 text-sm sm:text-base opacity-80"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {t("gifts.subtitle")}
            </p>
          </AnimatedSection>
          <div className="max-w-3xl mx-auto">
            <GiftCards giftCards={giftCards} isOwner={isOwner} />
          </div>
        </section>
      )}

      {/* ===== RSVP ===== */}
      {(wedding.rsvp_deadline || invitees.length > 0) && (
        <div style={{ backgroundColor: PAPER_DEEP }}>
          <AnimatedSection animation="fade-up">
            <div className="pt-16">
              <RoyaleSectionTitle eyebrow="Kindly respond" title="Will you join us?" goldColor={GOLD} />
            </div>
          </AnimatedSection>
          <RsvpSection
            wedding={wedding}
            isPreview={isPreview}
            invitees={invitees}
            rsvpResponses={rsvpResponses}
            handleRsvpToggle={handleRsvpToggle}
            handleRsvpSubmit={handleRsvpSubmit}
            numberOfPersons={numberOfPersons}
            isRsvpDeadlinePassed={isRsvpDeadlinePassed}
            submittingRsvp={submittingRsvp}
            bgClassName=""
            cardBgClassName="bg-[#fbf6ec]"
          />
        </div>
      )}

      {/* Footer ornament + brand footer */}
      <div className="py-10">
        <RoyaleOrnament color={GOLD} width={200} />
      </div>
      <TemplatePreviewFooter />
    </div>
  );

  // Envelope is BUILT-IN — always shown for the Royale template, never an option.
  // Skip during owner edit mode so editing isn't blocked.
  if (isPreview) {
    return Page;
  }

  return (
    <EnvelopeAnimation
      groomName={wedding.groom_name}
      brideName={wedding.bride_name}
      weddingDate={wedding.wedding_date}
    >
      {Page}
    </EnvelopeAnimation>
  );
};

export default RoyaleTemplate;
