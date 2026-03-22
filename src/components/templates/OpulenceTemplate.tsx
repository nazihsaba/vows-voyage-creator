import { useRef, useState, useEffect } from "react";
import { EditableField } from "@/components/EditableField";
import { GiftCards } from "@/components/GiftCards";
import { CountdownTimer } from "@/components/CountdownTimer";
import { MapPin, Calendar, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";
import { formatTimeTo12Hour } from "@/lib/formatTime";

interface OpulenceTemplateProps {
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

/* ── Confetti Canvas ── */
const ConfettiCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !visible) setVisible(true); },
      { threshold: 0.3 }
    );
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    const colors = [
      "hsla(36, 55%, 40%, 0.85)",   // burgundy
      "hsla(36, 57%, 74%, 0.9)",   // champagne
      "hsla(36, 55%, 50%, 0.7)",    // lighter burgundy
      "hsla(36, 57%, 84%, 0.8)",   // light gold
      "hsla(45, 29%, 96%, 0.9)",   // ivory
    ];

    interface Particle {
      x: number; y: number; r: number; color: string;
      vx: number; vy: number; rot: number; vr: number; life: number;
      shape: "circle" | "rect" | "line";
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: -Math.random() * H * 0.5,
        r: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2 + 1,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.08,
        life: 1,
        shape: (["circle", "rect", "line"] as const)[Math.floor(Math.random() * 3)],
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      particles.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.02;
        if (p.y > H) p.life -= 0.02;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
        } else {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-p.r, 0);
          ctx.lineTo(p.r, 0);
          ctx.stroke();
        }

        ctx.restore();
      });
      frame++;
      if (alive && frame < 300) requestAnimationFrame(animate);
    };
    animate();
  }, [visible]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ opacity: 0.9 }}
    />
  );
};

/* ── Curtain SVG Drape ── */
const CurtainDrapes = ({ opened }: { opened: boolean }) => (
  <>
    {/* Left curtain */}
    <div
      className="absolute top-0 left-0 w-[55%] h-full pointer-events-none z-[3] overflow-hidden"
      style={{
        transform: opened ? "translateX(-110%)" : "translateX(0)",
        transition: "transform 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <svg viewBox="0 0 200 600" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curtainGradL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 50%, 32%)" />
            <stop offset="40%" stopColor="hsl(36, 50%, 40%)" />
            <stop offset="70%" stopColor="hsl(36, 45%, 48%)" />
            <stop offset="100%" stopColor="hsl(36, 50%, 38%)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path d="M0,0 L200,0 C180,60 160,100 140,180 C120,260 110,340 100,420 C90,500 60,560 30,600 L0,600 Z" fill="url(#curtainGradL)" />
        <path d="M0,0 L120,0 C100,80 80,160 70,260 C60,360 40,460 20,600 L0,600 Z" fill="hsl(36, 55%, 35%)" opacity="0.4" />
        <path d="M0,0 L60,0 C50,100 40,200 30,320 C20,440 10,540 0,600 Z" fill="hsl(36, 60%, 28%)" opacity="0.3" />
      </svg>
    </div>
    {/* Right curtain */}
    <div
      className="absolute top-0 right-0 w-[55%] h-full pointer-events-none z-[3] overflow-hidden"
      style={{
        transform: opened ? "translateX(110%)" : "translateX(0)",
        transition: "transform 1.8s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <svg viewBox="0 0 200 600" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curtainGradR" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 50%, 32%)" />
            <stop offset="40%" stopColor="hsl(36, 50%, 40%)" />
            <stop offset="70%" stopColor="hsl(36, 45%, 48%)" />
            <stop offset="100%" stopColor="hsl(36, 50%, 38%)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path d="M200,0 L0,0 C20,60 40,100 60,180 C80,260 90,340 100,420 C110,500 140,560 170,600 L200,600 Z" fill="url(#curtainGradR)" />
        <path d="M200,0 L80,0 C100,80 120,160 130,260 C140,360 160,460 180,600 L200,600 Z" fill="hsl(36, 55%, 35%)" opacity="0.4" />
        <path d="M200,0 L140,0 C150,100 160,200 170,320 C180,440 190,540 200,600 Z" fill="hsl(36, 60%, 28%)" opacity="0.3" />
      </svg>
    </div>
    {/* Top valance */}
    <div
      className="absolute top-0 left-0 right-0 h-8 pointer-events-none z-[4]"
      style={{ opacity: opened ? 0 : 1, transition: "opacity 0.8s ease-out 0.5s" }}
    >
      <svg viewBox="0 0 400 30" className="w-full h-full" preserveAspectRatio="none">
        <rect width="400" height="12" fill="hsl(36, 55%, 35%)" />
        <path d="M0,12 Q50,28 100,12 Q150,28 200,12 Q250,28 300,12 Q350,28 400,12 L400,30 L0,30 Z" fill="hsl(36, 50%, 40%)" opacity="0.6" />
      </svg>
    </div>
  </>
);

/* ── Quick Nav Circle ── */
const NavCircle = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-[10px] md:text-xs uppercase tracking-wider font-medium transition-all duration-300 hover:scale-105"
    style={{
      background: "linear-gradient(135deg, hsl(36, 57%, 82%), hsl(36, 57%, 72%))",
      color: "hsl(0, 0%, 17%)",
      boxShadow: "0 4px 16px hsl(36 57% 74% / 0.35)",
    }}
  >
    {label}
  </button>
);

/* ── Main Template ── */
export const OpulenceTemplate = ({
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
}: OpulenceTemplateProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [started, setStarted] = useState(false);

  // Lock body scroll until started
  useEffect(() => {
    if (!started) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [started]);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && wedding.audio_end_time && audio.currentTime >= wedding.audio_end_time) {
      audio.currentTime = wedding.audio_start_time || 0;
    }
  };

  const handleStart = () => {
    setStarted(true);
    if (audioRef.current) {
      audioRef.current.currentTime = wedding.audio_start_time || 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const weddingDate = new Date(wedding.wedding_date);
  const hasGiftCards = giftCards && giftCards.length > 0;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="relative w-full min-h-screen bg-white text-[hsl(0,0%,17%)]"
      style={{
        fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
        overflowX: "hidden",
        overflowY: started ? "auto" : "hidden",
        maxHeight: started ? "none" : "100vh",
      }}
    >
      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* ═══ OPENING SCREEN ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <CurtainDrapes opened={started} />

        {/* Tap to Start overlay — shown before curtains open */}
        {!started && (
          <div className="absolute inset-0 z-[20] flex items-center justify-center">
            <button
              onClick={handleStart}
              className="relative px-8 py-3 rounded-full text-sm uppercase tracking-[0.3em] font-medium transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
              style={{
                background: "linear-gradient(135deg, hsl(36, 57%, 82%), hsl(36, 57%, 68%))",
                color: "hsl(0, 0%, 17%)",
                boxShadow: "0 6px 24px hsl(36 57% 74% / 0.4)",
              }}
            >
              Tap to Start
            </button>
          </div>
        )}

        {/* Content revealed after start */}
        <div
          className={`relative z-10 px-6 py-16 max-w-lg mx-auto space-y-8 transition-opacity duration-1000 ${!started ? 'pointer-events-none' : ''}`}
          style={{ opacity: started ? 1 : 0, transitionDelay: started ? "1s" : "0s" }}
        >
          {/* Decorative top line */}
          <div>
            <div className="w-16 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />
          </div>

          {/* Invitation text */}
          <div>
            <EditableField
              fieldId="opulence-invitation-text"
              text={getFieldValue("opulence-invitation-text", "Together with their families")}
              style={getFieldStyle("opulence-invitation-text")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="text-sm uppercase tracking-[0.35em] opacity-60"
            />
          </div>

          {/* Couple names */}
          <div>
            <h1 className="text-5xl md:text-7xl leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}>
              {wedding.groom_name}
              <span className="block text-3xl md:text-4xl my-2 italic opacity-50">&</span>
              {wedding.bride_name}
            </h1>
          </div>

          {/* Formal message */}
          <div>
            <EditableField
              fieldId="opulence-formal-message"
              text={getFieldValue(
                "opulence-formal-message",
                wedding.main_description || "Request the honour of your presence\nat the celebration of their marriage"
              )}
              style={getFieldStyle("opulence-formal-message")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline
              tag="p"
              className="text-base md:text-lg leading-relaxed opacity-70 whitespace-pre-line italic"
            />
          </div>

          {/* Decorative bottom line */}
          <div>
            <div className="w-16 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />
          </div>

          {/* Scroll hint */}
          <div className="pt-4">
            <ChevronDown className="w-5 h-5 mx-auto animate-bounce opacity-40" />
          </div>
        </div>
      </section>

      {/* ═══ QUICK NAVIGATION CIRCLES ═══ */}
      <section className="py-12 px-4">
        <AnimatedSection animation="fade-in">
          <div className="flex justify-center gap-4 md:gap-6 flex-wrap max-w-md mx-auto">
            <NavCircle label="Date" onClick={() => scrollTo("opulence-details")} />
            <NavCircle label="Venue" onClick={() => scrollTo("opulence-venue")} />
            {hasGiftCards && <NavCircle label="Gifts" onClick={() => scrollTo("opulence-gifts")} />}
            {(wedding.rsvp_deadline || invitees.length > 0) && (
              <NavCircle label="RSVP" onClick={() => scrollTo("opulence-rsvp")} />
            )}
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ THIN SEPARATOR ═══ */}
      <div className="w-20 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />

      {/* ═══ DATE & TIME DETAILS ═══ */}
      <section id="opulence-details" className="py-20 px-6">
        <AnimatedSection animation="fade-in">
          <div className="max-w-sm mx-auto text-center space-y-8">
            <div className="space-y-2">
              <p className="text-6xl md:text-8xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {weddingDate.getDate()}
              </p>
              <p className="text-xl md:text-2xl uppercase tracking-[0.3em] font-light">
                {weddingDate.toLocaleDateString("en-US", { month: "long" })}
              </p>
              <p className="text-lg tracking-[0.2em] opacity-60">
                {weddingDate.getFullYear()}
              </p>
            </div>

            <div className="w-12 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />

            {ceremony && ceremony.time && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] opacity-50">Ceremony</p>
                <p className="text-xl font-light">{formatTimeTo12Hour(ceremony.time)}</p>
              </div>
            )}

            {venue && venue.time && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] opacity-50">Reception</p>
                <p className="text-xl font-light">{formatTimeTo12Hour(venue.time)}</p>
              </div>
            )}
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="py-12 px-4" style={{ background: "hsl(45, 29%, 96%)" }}>
        <CountdownTimer targetDate={wedding.wedding_date} />
      </section>

      {/* ═══ CONFETTI REVEAL + VENUE ═══ */}
      <section id="opulence-venue" className="relative py-20 px-6">
        <ConfettiCanvas />
        <AnimatedSection animation="fade-in">
          <div className="relative z-20 max-w-md mx-auto text-center space-y-10">
            <h2 className="text-3xl md:text-4xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              The Venue
            </h2>

            {/* Line-art venue illustration */}
            <div className="mx-auto w-32 h-32 opacity-30">
              <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="0.8">
                {/* Building body */}
                <rect x="25" y="40" width="70" height="50" rx="1" />
                {/* Roof */}
                <path d="M20 40 L60 10 L100 40" />
                {/* Door */}
                <path d="M50 90 L50 65 Q60 58 70 65 L70 90" />
                {/* Windows */}
                <rect x="33" y="50" width="10" height="12" rx="5" />
                <rect x="77" y="50" width="10" height="12" rx="5" />
                {/* Cross on top */}
                <line x1="60" y1="5" x2="60" y2="15" />
                <line x1="56" y1="10" x2="64" y2="10" />
                {/* Steps */}
                <line x1="45" y1="90" x2="75" y2="90" />
                <line x1="43" y1="93" x2="77" y2="93" />
                <line x1="41" y1="96" x2="79" y2="96" />
              </svg>
            </div>

            {ceremony && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] opacity-50">Ceremony</p>
                <p className="text-xl font-light">{ceremony.location_name}</p>
                {ceremony.location_link && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[hsl(36,57%,74%)] text-[hsl(0,0%,17%)] hover:bg-[hsl(36,57%,74%)] hover:text-white"
                  >
                    <a href={ceremony.location_link} target="_blank" rel="noopener noreferrer">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      View on Map
                    </a>
                  </Button>
                )}
              </div>
            )}

            {venue && (
              <div className="space-y-3">
                <div className="w-8 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />
                <p className="text-xs uppercase tracking-[0.3em] opacity-50">Reception</p>
                <p className="text-xl font-light">{venue.location_name}</p>
                {venue.location_link && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full border-[hsl(36,57%,74%)] text-[hsl(0,0%,17%)] hover:bg-[hsl(36,57%,74%)] hover:text-white"
                  >
                    <a href={venue.location_link} target="_blank" rel="noopener noreferrer">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      View on Map
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ GALLERY ═══ */}
      {gallery && gallery.length > 0 && (
        <section className="py-16 px-4" style={{ background: "hsl(45, 29%, 96%)" }}>
          <AnimatedSection animation="fade-in">
            <h2 className="text-3xl md:text-4xl font-light text-center mb-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Our Moments
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {gallery.map((image: any, index: number) => (
              <AnimatedSection key={image.id || index} delay={index * 80} animation="scale-in">
                <div className="aspect-square overflow-hidden rounded-sm">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || `Wedding moment ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>
      )}

      {/* ═══ GIFTS ═══ */}
      {hasGiftCards && (
        <section id="opulence-gifts" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection animation="fade-in">
              <h2 className="text-3xl md:text-4xl font-light text-center mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Wedding Gift
              </h2>
              <p className="text-center text-sm opacity-60 mb-10 tracking-wide">
                Your presence is our greatest gift
              </p>
            </AnimatedSection>
            <GiftCards giftCards={giftCards} isOwner={isOwner} />
          </div>
        </section>
      )}

      {/* ═══ RSVP ═══ */}
      {(wedding.rsvp_deadline || invitees.length > 0) && (
        <div id="opulence-rsvp">
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
            bgClassName="bg-[hsl(45,29%,96%)]"
            cardBgClassName="bg-white"
          />
        </div>
      )}

      {/* ═══ CLOSING ═══ */}
      <section className="py-16 px-6 text-center">
        <AnimatedSection animation="fade-in">
          <EditableField
            fieldId="opulence-closing"
            text={getFieldValue("opulence-closing", wedding.closing_message || "We look forward to celebrating with you")}
            style={getFieldStyle("opulence-closing")}
            onUpdate={onFieldUpdate}
            isPreview={isPreview}
            tag="p"
            className="text-lg italic opacity-60 max-w-sm mx-auto"
          />
          <div className="w-16 h-px mx-auto mt-8" style={{ background: "hsl(36, 57%, 74%)" }} />
        </AnimatedSection>
      </section>
    </div>
  );
};
