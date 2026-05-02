import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { buildTemplateFontStyle } from "@/components/templateFontDefaults";
import { EditableField } from "@/components/EditableField";
import { GiftCards } from "@/components/GiftCards";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WeddingGallery } from "@/components/WeddingGallery";
import { RsvpSection } from "@/components/templates/RsvpSection";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { formatTimeTo12Hour } from "@/lib/formatTime";

interface VeronaTemplateProps {
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

const CREAM = "rgb(248, 240, 222)";
const CREAM_DEEP = "rgb(243, 233, 210)";
const TEXT = "#3a2a14";
const GOLD = "#865814";
const DARK_BG_TOP = "hsl(20, 14%, 10%)";
const DARK_BG_BOTTOM = "hsl(20, 14%, 4%)";

/* ── Reusable hairline divider ── */
const Hairline = ({ width = "44%" }: { width?: string }) => (
  <div
    aria-hidden
    style={{
      width,
      height: "1px",
      margin: "0 auto",
      background:
        "linear-gradient(to right, transparent, rgba(134,88,20,0.45), transparent)",
    }}
  />
);

/* ── Eyebrow label (uppercase Cormorant Upright) ── */
const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <p
    className={className}
    style={{
      fontFamily:
        "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
      textTransform: "uppercase",
      letterSpacing: "0.46em",
      color: GOLD,
      fontWeight: 500,
      fontSize: "clamp(10px, 2.6vw, 12px)",
    }}
  >
    {children}
  </p>
);

/* ── Section title in italic display serif ── */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2
    style={{
      fontFamily: "var(--font-template-heading)",
      fontStyle: "italic",
      fontWeight: 400,
      color: TEXT,
      fontSize: "clamp(28px, 6.5vw, 44px)",
      lineHeight: 1.15,
      margin: 0,
    }}
  >
    {children}
  </h2>
);

/* ── A small gold heart glyph ── */
const Heart: React.FC<{ size?: number; className?: string }> = ({
  size = 12,
  className = "",
}) => (
  <span
    aria-hidden
    className={className}
    style={{
      color: GOLD,
      fontSize: size,
      lineHeight: 1,
      display: "inline-block",
    }}
  >
    ♥
  </span>
);

/* ── Format date as "30 · JULY · 2026" ── */
const formatVeronaDate = (date: Date) => {
  const day = date.getDate();
  const month = date
    .toLocaleDateString("en-US", { month: "long" })
    .toUpperCase();
  const year = date.getFullYear();
  return `${day} · ${month} · ${year}`;
};

export const VeronaTemplate = ({
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
}: VeronaTemplateProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  // Auto-play audio with fallback to first user interaction
  useEffect(() => {
    if (!wedding?.audio_url || audioStarted) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = wedding.audio_start_time || 0;
    audio.play().then(() => setAudioStarted(true)).catch(() => {
      const start = () => {
        audio.play().then(() => setAudioStarted(true)).catch(() => {});
        window.removeEventListener("click", start);
        window.removeEventListener("touchstart", start);
      };
      window.addEventListener("click", start, { once: true });
      window.addEventListener("touchstart", start, { once: true });
    });
  }, [wedding?.audio_url, wedding?.audio_start_time, audioStarted]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && wedding.audio_end_time && audio.currentTime >= wedding.audio_end_time) {
      audio.currentTime = wedding.audio_start_time || 0;
    }
  };

  const ceremony = locations.find((l) => l.type === "ceremony");
  const venue = locations.find((l) => l.type === "venue");
  const welcomeDrink = locations.find((l) => l.type === "welcome_drink");
  const customSchedule = locations.filter((l) =>
    typeof l.type === "string" && l.type.startsWith("custom_")
  );

  const weddingDate = wedding?.wedding_date ? new Date(wedding.wedding_date) : null;
  const formattedDate = weddingDate ? formatVeronaDate(weddingDate) : "";

  const hasGallery = gallery && gallery.length > 0;
  const hasGifts = giftCards && giftCards.length > 0;
  const hasStory = !!(wedding?.main_description && wedding.main_description.trim());
  const hasOpening = !!(wedding?.opening_message && wedding.opening_message.trim());
  const hasDressCode = !!(wedding?.dress_code && wedding.dress_code.trim());
  const hasTravel = !!(wedding?.travel_info && wedding.travel_info.trim());
  const hasGiftMessage = !!(wedding?.gift_message && wedding.gift_message.trim());

  const hasSchedule =
    !!(ceremony && ceremony.time) ||
    !!(welcomeDrink && welcomeDrink.time) ||
    !!(venue && venue.time) ||
    customSchedule.some((c) => c.time || c.location_name);

  const hasRsvp = !!(wedding?.rsvp_deadline) || invitees.length > 0;

  return (
    <div
      dir="ltr"
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{
        ...buildTemplateFontStyle("verona-stationery", wedding.template_fonts),
        fontFamily: "var(--font-template-body)",
        backgroundColor: CREAM,
        color: TEXT,
        // Subtle paper grain via layered radial gradients (no external assets)
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(134,88,20,0.04), transparent 40%), radial-gradient(circle at 80% 70%, rgba(134,88,20,0.035), transparent 45%), radial-gradient(circle at 50% 50%, rgba(58,42,20,0.025), transparent 60%)",
      }}
    >
      {wedding?.audio_url && (
        <audio
          ref={audioRef}
          src={wedding.audio_url}
          preload="auto"
          loop
          onTimeUpdate={handleTimeUpdate}
        />
      )}

      {/* ═══════════ 1. WELCOME / HERO ═══════════ */}
      <section className="px-6 pt-24 pb-20 md:pt-32 md:pb-24 text-center">
        <AnimatedSection animation="fade-in">
          <div className="max-w-xl mx-auto space-y-7">
            <Eyebrow>Together with their families</Eyebrow>

            <Hairline />

            {/* Names — first on its own line, oversized & on its own line, second on its own line */}
            <div className="space-y-2 md:space-y-3">
              <p
                style={{
                  fontFamily: "var(--font-template-title)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: TEXT,
                  fontSize: "clamp(40px, 10vw, 76px)",
                  lineHeight: 1.05,
                  letterSpacing: "0.01em",
                }}
              >
                {wedding?.groom_name || "Alessandro"}
              </p>
              <p
                aria-hidden
                style={{
                  fontFamily: "var(--font-template-title)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: GOLD,
                  fontSize: "clamp(48px, 12vw, 96px)",
                  lineHeight: 1,
                }}
              >
                &amp;
              </p>
              <p
                style={{
                  fontFamily: "var(--font-template-title)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: TEXT,
                  fontSize: "clamp(40px, 10vw, 76px)",
                  lineHeight: 1.05,
                  letterSpacing: "0.01em",
                }}
              >
                {wedding?.bride_name || "Isabella"}
              </p>
            </div>

            <Hairline />

            {formattedDate && (
              <p
                style={{
                  fontFamily:
                    "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                  color: GOLD,
                  letterSpacing: "0.46em",
                  fontWeight: 500,
                  fontSize: "clamp(13px, 3vw, 16px)",
                }}
              >
                {formattedDate}
              </p>
            )}

            {(wedding?.city || wedding?.venue_subtitle) && (
              <Eyebrow>
                {wedding?.city || wedding?.venue_subtitle}
              </Eyebrow>
            )}
          </div>
        </AnimatedSection>
      </section>

      <Hairline />

      {/* ═══════════ 2. SHORT OPENING LINE ═══════════ */}
      {hasOpening && (
        <>
          <section className="px-6 py-16 md:py-20 text-center">
            <AnimatedSection animation="fade-in">
              <div className="max-w-2xl mx-auto">
                <EditableField
                  fieldId="verona-opening"
                  text={getFieldValue("verona-opening", wedding.opening_message)}
                  style={getFieldStyle("verona-opening")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline
                  tag="p"
                  className="whitespace-pre-line"
                  customStyle={{
                    fontFamily: "var(--font-template-body)",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: TEXT,
                    fontSize: "clamp(18px, 4.2vw, 24px)",
                    lineHeight: 1.7,
                  }}
                />
                <div className="mt-6 flex justify-center">
                  <Heart size={14} />
                </div>
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ 3. OUR STORY ═══════════ */}
      {hasStory && (
        <>
          <section className="px-6 py-20 md:py-24 text-center">
            <AnimatedSection animation="fade-up">
              <div className="max-w-2xl mx-auto space-y-8">
                <Eyebrow>Our Story</Eyebrow>
                <SectionTitle>How it began</SectionTitle>

                {gallery && gallery[0] && (
                  <div className="mx-auto" style={{ maxWidth: 360 }}>
                    <div
                      className="overflow-hidden"
                      style={{ aspectRatio: "4 / 5", backgroundColor: CREAM_DEEP }}
                    >
                      <img
                        src={gallery[0].image_url}
                        alt={gallery[0].alt_text || "Our story"}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: `50% ${Math.min(100, Math.max(0, gallery[0].position_y ?? 50))}%`,
                          filter: "sepia(0.08) saturate(0.95)",
                        }}
                      />
                    </div>
                  </div>
                )}

                <EditableField
                  fieldId="verona-story"
                  text={getFieldValue("verona-story", wedding.main_description)}
                  style={getFieldStyle("verona-story")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline
                  tag="p"
                  className="whitespace-pre-line"
                  customStyle={{
                    fontFamily: "var(--font-template-body)",
                    fontWeight: 400,
                    color: TEXT,
                    fontSize: "clamp(15px, 3.6vw, 18px)",
                    lineHeight: 1.75,
                  }}
                />
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ 4 + 5. CEREMONY & RECEPTION ═══════════ */}
      {(ceremony || venue) && (
        <>
          <section className="px-6 py-20 md:py-24">
            <AnimatedSection animation="fade-in">
              <div className="max-w-3xl mx-auto text-center space-y-16">
                {ceremony && (
                  <div className="space-y-4">
                    <Eyebrow>Ceremony</Eyebrow>
                    <SectionTitle>The vows</SectionTitle>
                    <div className="flex justify-center">
                      <Heart size={12} />
                    </div>
                    {ceremony.time && (
                      <p
                        style={{
                          fontFamily:
                            "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                          color: GOLD,
                          letterSpacing: "0.4em",
                          fontWeight: 500,
                          fontSize: "clamp(12px, 2.8vw, 14px)",
                          textTransform: "uppercase",
                        }}
                      >
                        {formatTimeTo12Hour(ceremony.time)}
                      </p>
                    )}
                    {ceremony.location_name && (
                      <p
                        style={{
                          fontFamily: "var(--font-template-body)",
                          fontStyle: "italic",
                          fontSize: "clamp(20px, 4.6vw, 26px)",
                          color: TEXT,
                          lineHeight: 1.4,
                        }}
                      >
                        {ceremony.location_name}
                      </p>
                    )}
                    {ceremony.address && (
                      <p
                        style={{
                          fontFamily: "var(--font-template-body)",
                          fontSize: "clamp(14px, 3.4vw, 16px)",
                          color: TEXT,
                          opacity: 0.75,
                          lineHeight: 1.6,
                        }}
                      >
                        {ceremony.address}
                      </p>
                    )}
                    {ceremony.location_link && (
                      <div className="pt-2">
                        <a
                          href={ceremony.location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                          style={{
                            fontFamily:
                              "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                            color: GOLD,
                            letterSpacing: "0.32em",
                            textTransform: "uppercase",
                            fontSize: "clamp(11px, 2.6vw, 12px)",
                            borderBottom: "1px solid rgba(134,88,20,0.5)",
                            paddingBottom: 4,
                          }}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          View on Map
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {ceremony && venue && <Hairline width="22%" />}

                {venue && (
                  <div className="space-y-4">
                    <Eyebrow>Reception</Eyebrow>
                    <SectionTitle>The celebration</SectionTitle>
                    <div className="flex justify-center">
                      <Heart size={12} />
                    </div>
                    {venue.time && (
                      <p
                        style={{
                          fontFamily:
                            "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                          color: GOLD,
                          letterSpacing: "0.4em",
                          fontWeight: 500,
                          fontSize: "clamp(12px, 2.8vw, 14px)",
                          textTransform: "uppercase",
                        }}
                      >
                        {formatTimeTo12Hour(venue.time)}
                      </p>
                    )}
                    {venue.location_name && (
                      <p
                        style={{
                          fontFamily: "var(--font-template-body)",
                          fontStyle: "italic",
                          fontSize: "clamp(20px, 4.6vw, 26px)",
                          color: TEXT,
                          lineHeight: 1.4,
                        }}
                      >
                        {venue.location_name}
                      </p>
                    )}
                    {venue.address && (
                      <p
                        style={{
                          fontFamily: "var(--font-template-body)",
                          fontSize: "clamp(14px, 3.4vw, 16px)",
                          color: TEXT,
                          opacity: 0.75,
                          lineHeight: 1.6,
                        }}
                      >
                        {venue.address}
                      </p>
                    )}
                    {venue.location_link && (
                      <div className="pt-2">
                        <a
                          href={venue.location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                          style={{
                            fontFamily:
                              "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                            color: GOLD,
                            letterSpacing: "0.32em",
                            textTransform: "uppercase",
                            fontSize: "clamp(11px, 2.6vw, 12px)",
                            borderBottom: "1px solid rgba(134,88,20,0.5)",
                            paddingBottom: 4,
                          }}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          View on Map
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ COUNTDOWN (subtle, between sections) ═══════════ */}
      {weddingDate && (
        <>
          <section className="px-6 py-16 md:py-20" style={{ backgroundColor: CREAM_DEEP }}>
            <AnimatedSection animation="fade-in">
              <div className="max-w-2xl mx-auto text-center space-y-8">
                <Eyebrow>Counting the Days</Eyebrow>
                <CountdownTimer targetDate={wedding.wedding_date} />
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ 6. SCHEDULE / TIMELINE ═══════════ */}
      {hasSchedule && (
        <>
          <section className="px-6 py-20 md:py-24">
            <AnimatedSection animation="fade-up">
              <div className="max-w-xl mx-auto text-center space-y-10">
                <div className="space-y-3">
                  <Eyebrow>Order of the Day</Eyebrow>
                  <SectionTitle>Schedule</SectionTitle>
                </div>

                <ul className="space-y-6 text-left">
                  {ceremony && ceremony.time && (
                    <li className="flex items-baseline gap-4">
                      <Heart size={11} className="mt-1 shrink-0" />
                      <div className="flex-1 flex items-baseline gap-4 border-b border-dotted" style={{ borderColor: "rgba(134,88,20,0.35)" }}>
                        <span
                          style={{
                            fontFamily:
                              "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                            color: GOLD,
                            letterSpacing: "0.32em",
                            textTransform: "uppercase",
                            fontSize: "clamp(11px, 2.6vw, 13px)",
                            minWidth: 90,
                          }}
                        >
                          {formatTimeTo12Hour(ceremony.time)}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-template-body)",
                            fontStyle: "italic",
                            color: TEXT,
                            fontSize: "clamp(15px, 3.8vw, 18px)",
                            lineHeight: 1.5,
                            flex: 1,
                            paddingBottom: 8,
                          }}
                        >
                          Ceremony{ceremony.location_name ? ` · ${ceremony.location_name}` : ""}
                        </span>
                      </div>
                    </li>
                  )}
                  {welcomeDrink && welcomeDrink.time && (
                    <li className="flex items-baseline gap-4">
                      <Heart size={11} className="mt-1 shrink-0" />
                      <div className="flex-1 flex items-baseline gap-4 border-b border-dotted" style={{ borderColor: "rgba(134,88,20,0.35)" }}>
                        <span
                          style={{
                            fontFamily:
                              "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                            color: GOLD,
                            letterSpacing: "0.32em",
                            textTransform: "uppercase",
                            fontSize: "clamp(11px, 2.6vw, 13px)",
                            minWidth: 90,
                          }}
                        >
                          {formatTimeTo12Hour(welcomeDrink.time)}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-template-body)",
                            fontStyle: "italic",
                            color: TEXT,
                            fontSize: "clamp(15px, 3.8vw, 18px)",
                            lineHeight: 1.5,
                            flex: 1,
                            paddingBottom: 8,
                          }}
                        >
                          Welcome drink
                        </span>
                      </div>
                    </li>
                  )}
                  {venue && venue.time && (
                    <li className="flex items-baseline gap-4">
                      <Heart size={11} className="mt-1 shrink-0" />
                      <div className="flex-1 flex items-baseline gap-4 border-b border-dotted" style={{ borderColor: "rgba(134,88,20,0.35)" }}>
                        <span
                          style={{
                            fontFamily:
                              "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                            color: GOLD,
                            letterSpacing: "0.32em",
                            textTransform: "uppercase",
                            fontSize: "clamp(11px, 2.6vw, 13px)",
                            minWidth: 90,
                          }}
                        >
                          {formatTimeTo12Hour(venue.time)}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-template-body)",
                            fontStyle: "italic",
                            color: TEXT,
                            fontSize: "clamp(15px, 3.8vw, 18px)",
                            lineHeight: 1.5,
                            flex: 1,
                            paddingBottom: 8,
                          }}
                        >
                          Reception{venue.location_name ? ` · ${venue.location_name}` : ""}
                        </span>
                      </div>
                    </li>
                  )}
                  {customSchedule.map((c) => (
                    (c.time || c.location_name) && (
                      <li key={c.id || c.type} className="flex items-baseline gap-4">
                        <Heart size={11} className="mt-1 shrink-0" />
                        <div className="flex-1 flex items-baseline gap-4 border-b border-dotted" style={{ borderColor: "rgba(134,88,20,0.35)" }}>
                          <span
                            style={{
                              fontFamily:
                                "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                              color: GOLD,
                              letterSpacing: "0.32em",
                              textTransform: "uppercase",
                              fontSize: "clamp(11px, 2.6vw, 13px)",
                              minWidth: 90,
                            }}
                          >
                            {c.time ? formatTimeTo12Hour(c.time) : ""}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-template-body)",
                              fontStyle: "italic",
                              color: TEXT,
                              fontSize: "clamp(15px, 3.8vw, 18px)",
                              lineHeight: 1.5,
                              flex: 1,
                              paddingBottom: 8,
                            }}
                          >
                            {c.location_name || ""}
                          </span>
                        </div>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ 7. DRESS CODE ═══════════ */}
      {hasDressCode && (
        <>
          <section className="px-6 py-20 md:py-24 text-center">
            <AnimatedSection animation="fade-in">
              <div className="max-w-xl mx-auto space-y-6">
                <Eyebrow>Attire</Eyebrow>
                <SectionTitle>Dress code</SectionTitle>
                <div className="flex justify-center">
                  <Heart size={12} />
                </div>
                <EditableField
                  fieldId="verona-dress-code"
                  text={getFieldValue("verona-dress-code", wedding.dress_code)}
                  style={getFieldStyle("verona-dress-code")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline
                  tag="p"
                  className="whitespace-pre-line"
                  customStyle={{
                    fontFamily: "var(--font-template-body)",
                    fontStyle: "italic",
                    color: TEXT,
                    fontSize: "clamp(16px, 3.8vw, 19px)",
                    lineHeight: 1.7,
                  }}
                />
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ 8. GALLERY ═══════════ */}
      {hasGallery && (
        <>
          <section className="px-6 py-20 md:py-24" style={{ backgroundColor: CREAM_DEEP }}>
            <AnimatedSection animation="fade-in">
              <div className="max-w-3xl mx-auto text-center space-y-10">
                <div className="space-y-3">
                  <Eyebrow>Memories</Eyebrow>
                  <SectionTitle>Our gallery</SectionTitle>
                </div>
                <WeddingGallery images={gallery} />
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ 9. RSVP — dark band moment ═══════════ */}
      {hasRsvp && (
        <>
          <div
            id="verona-rsvp"
            style={{
              background: `radial-gradient(ellipse at center, ${DARK_BG_TOP} 0%, ${DARK_BG_BOTTOM} 100%)`,
            }}
          >
            <div className="px-6 pt-16 pb-4 text-center">
              <p
                style={{
                  fontFamily:
                    "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                  color: GOLD,
                  letterSpacing: "0.46em",
                  fontWeight: 500,
                  fontSize: "clamp(10px, 2.6vw, 12px)",
                  textTransform: "uppercase",
                }}
              >
                Kindly Reply
              </p>
            </div>
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
              bgClassName="bg-transparent"
              cardBgClassName="bg-[rgba(248,240,222,0.05)]"
              accentColorClass="text-[#d6b76a]"
            />
          </div>
          <Hairline />
        </>
      )}

      {/* ═══════════ 10. TRAVEL & ACCOMMODATIONS ═══════════ */}
      {hasTravel && (
        <>
          <section className="px-6 py-20 md:py-24 text-center">
            <AnimatedSection animation="fade-in">
              <div className="max-w-2xl mx-auto space-y-6">
                <Eyebrow>For our guests</Eyebrow>
                <SectionTitle>Travel & stay</SectionTitle>
                <div className="flex justify-center">
                  <Heart size={12} />
                </div>
                <EditableField
                  fieldId="verona-travel"
                  text={getFieldValue("verona-travel", wedding.travel_info)}
                  style={getFieldStyle("verona-travel")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline
                  tag="p"
                  className="whitespace-pre-line"
                  customStyle={{
                    fontFamily: "var(--font-template-body)",
                    color: TEXT,
                    fontSize: "clamp(15px, 3.6vw, 18px)",
                    lineHeight: 1.75,
                  }}
                />
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ 11. GIFT REGISTRY ═══════════ */}
      {hasGifts && (
        <>
          <section className="px-6 py-20 md:py-24" style={{ backgroundColor: CREAM_DEEP }}>
            <AnimatedSection animation="fade-in">
              <div className="max-w-2xl mx-auto text-center space-y-8">
                <Eyebrow>With Gratitude</Eyebrow>
                <SectionTitle>Gift registry</SectionTitle>
                <div className="flex justify-center">
                  <Heart size={12} />
                </div>
                {hasGiftMessage ? (
                  <EditableField
                    fieldId="verona-gift-message"
                    text={getFieldValue("verona-gift-message", wedding.gift_message)}
                    style={getFieldStyle("verona-gift-message")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline
                    tag="p"
                    className="whitespace-pre-line"
                    customStyle={{
                      fontFamily: "var(--font-template-body)",
                      fontStyle: "italic",
                      color: TEXT,
                      fontSize: "clamp(15px, 3.6vw, 18px)",
                      lineHeight: 1.7,
                      opacity: 0.85,
                    }}
                  />
                ) : (
                  <p
                    style={{
                      fontFamily: "var(--font-template-body)",
                      fontStyle: "italic",
                      color: TEXT,
                      fontSize: "clamp(15px, 3.6vw, 18px)",
                      lineHeight: 1.7,
                      opacity: 0.75,
                    }}
                  >
                    Your presence is the greatest gift of all.
                  </p>
                )}
                <div className="pt-2">
                  <GiftCards giftCards={giftCards} isOwner={isOwner} />
                </div>
              </div>
            </AnimatedSection>
          </section>
          <Hairline />
        </>
      )}

      {/* ═══════════ 12. FOOTER — full-bleed dark walnut field ═══════════ */}
      <footer
        className="px-6 py-20 md:py-24 text-center"
        style={{
          background: `radial-gradient(ellipse at center, ${DARK_BG_TOP} 0%, ${DARK_BG_BOTTOM} 100%)`,
          color: CREAM,
        }}
      >
        <AnimatedSection animation="fade-in">
          <div className="max-w-xl mx-auto space-y-8">
            <p
              style={{
                fontFamily: "var(--font-template-body)",
                fontStyle: "italic",
                color: CREAM,
                fontSize: "clamp(18px, 4.4vw, 24px)",
                lineHeight: 1.7,
                opacity: 0.92,
              }}
            >
              {wedding?.closing_message || "With all our love, we await your company."}
            </p>
            <div className="flex justify-center">
              <Heart size={14} />
            </div>
            <div
              style={{
                width: "44%",
                height: 1,
                margin: "0 auto",
                background:
                  "linear-gradient(to right, transparent, rgba(214,183,106,0.5), transparent)",
              }}
            />
            <div className="space-y-2">
              <p
                style={{
                  fontFamily: "var(--font-template-title)",
                  fontStyle: "italic",
                  color: CREAM,
                  fontSize: "clamp(20px, 4.6vw, 26px)",
                  lineHeight: 1.3,
                }}
              >
                {wedding?.groom_name || "Alessandro"}{" "}
                <span style={{ color: "#d6b76a", fontStyle: "italic" }}>&amp;</span>{" "}
                {wedding?.bride_name || "Isabella"}
              </p>
              {formattedDate && (
                <p
                  style={{
                    fontFamily:
                      "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                    color: "#d6b76a",
                    letterSpacing: "0.46em",
                    fontWeight: 500,
                    fontSize: "clamp(11px, 2.6vw, 13px)",
                    textTransform: "uppercase",
                  }}
                >
                  {formattedDate}
                </p>
              )}
            </div>
          </div>
        </AnimatedSection>
      </footer>
    </div>
  );
};

export default VeronaTemplate;
