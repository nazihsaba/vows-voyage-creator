import { applyFadeLoop } from "@/lib/audioFadeLoop";
import { parseLocalDate } from "@/lib/weddingDate";
import { useRef, useState, useEffect } from "react";
import { buildTemplateFontStyle } from "@/components/templateFontDefaults";
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
  handleRsvpToggle?: (inviteeId: string, isAttending: boolean | null) => void;
  handleRsvpSubmit?: (wishesMessage?: string) => void;
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
      className="fixed top-0 left-0 w-[55%] h-full pointer-events-none z-[3] overflow-hidden"
      style={{
        transform: opened ? "translateX(-110%)" : "translateX(0)",
        transition: "transform 2s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <svg viewBox="0 0 220 600" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curtainGradL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 45%, 25%)" />
            <stop offset="20%" stopColor="hsl(36, 50%, 35%)" />
            <stop offset="50%" stopColor="hsl(36, 55%, 45%)" />
            <stop offset="75%" stopColor="hsl(36, 50%, 38%)" />
            <stop offset="100%" stopColor="hsl(36, 45%, 30%)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="curtainHighlightL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 57%, 74%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(36, 57%, 78%)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(36, 57%, 82%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(36, 57%, 74%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="curtainEdgeL" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 40%, 20%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(36, 40%, 20%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Main fabric body */}
        <path d="M0,0 L220,0 C200,40 185,90 170,150 C150,230 135,320 120,410 C105,490 70,555 30,600 L0,600 Z" fill="url(#curtainGradL)" />
        {/* Deep fold shadow */}
        <path d="M0,0 L130,0 C115,60 95,140 80,240 C65,340 45,450 20,600 L0,600 Z" fill="hsl(36, 50%, 28%)" opacity="0.45" />
        {/* Inner fold */}
        <path d="M0,0 L70,0 C60,80 48,180 38,300 C28,420 15,530 0,600 Z" fill="hsl(36, 55%, 22%)" opacity="0.35" />
        {/* Silk highlight streak */}
        <path d="M90,0 C85,100 82,200 80,300 C78,400 70,500 55,600 L75,600 C80,500 85,400 88,300 C91,200 95,100 100,0 Z" fill="url(#curtainHighlightL)" />
        {/* Subtle second highlight */}
        <path d="M155,0 C148,80 142,170 138,270 C134,370 125,480 110,600 L125,600 C132,480 138,370 142,270 C146,170 152,80 160,0 Z" fill="hsl(36, 57%, 74%)" opacity="0.12" />
      </svg>
    </div>

    {/* Right curtain */}
    <div
      className="fixed top-0 right-0 w-[55%] h-full pointer-events-none z-[3] overflow-hidden"
      style={{
        transform: opened ? "translateX(110%)" : "translateX(0)",
        transition: "transform 2s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <svg viewBox="0 0 220 600" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="curtainGradR" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 45%, 25%)" />
            <stop offset="20%" stopColor="hsl(36, 50%, 35%)" />
            <stop offset="50%" stopColor="hsl(36, 55%, 45%)" />
            <stop offset="75%" stopColor="hsl(36, 50%, 38%)" />
            <stop offset="100%" stopColor="hsl(36, 45%, 30%)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="curtainHighlightR" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 57%, 74%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(36, 57%, 78%)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(36, 57%, 82%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(36, 57%, 74%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="curtainEdgeR" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 40%, 20%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(36, 40%, 20%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Main fabric body */}
        <path d="M220,0 L0,0 C20,40 35,90 50,150 C70,230 85,320 100,410 C115,490 150,555 190,600 L220,600 Z" fill="url(#curtainGradR)" />
        {/* Deep fold shadow */}
        <path d="M220,0 L90,0 C105,60 125,140 140,240 C155,340 175,450 200,600 L220,600 Z" fill="hsl(36, 50%, 28%)" opacity="0.45" />
        {/* Inner fold */}
        <path d="M220,0 L150,0 C160,80 172,180 182,300 C192,420 205,530 220,600 Z" fill="hsl(36, 55%, 22%)" opacity="0.35" />
        {/* Silk highlight streak */}
        <path d="M130,0 C135,100 138,200 140,300 C142,400 150,500 165,600 L145,600 C140,500 135,400 132,300 C129,200 125,100 120,0 Z" fill="url(#curtainHighlightR)" />
        {/* Subtle second highlight */}
        <path d="M65,0 C72,80 78,170 82,270 C86,370 95,480 110,600 L95,600 C88,480 82,370 78,270 C74,170 68,80 60,0 Z" fill="hsl(36, 57%, 74%)" opacity="0.12" />
      </svg>
    </div>


    {/* Ambient glow behind curtains */}
    <div
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        background: opened
          ? "transparent"
          : "radial-gradient(ellipse at center, hsl(36, 57%, 74%, 0.08) 0%, transparent 70%)",
        transition: "background 1.5s ease-out",
      }}
    />
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
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [started]);
  const ceremony = locations.find((loc) => loc.type === "ceremony");
  const venue = locations.find((loc) => loc.type === "venue");
  const customLocations = locations
    .filter((loc) => typeof loc.type === "string" && loc.type.startsWith("custom_"))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const orderedEvents: Array<{ kind: "ceremony" | "venue" | "custom"; loc: any }> = [
    ...(ceremony ? [{ kind: "ceremony" as const, loc: ceremony }] : []),
    ...(venue ? [{ kind: "venue" as const, loc: venue }] : []),
    ...customLocations.map((loc) => ({ kind: "custom" as const, loc })),
  ].sort((a, b) => (a.loc.display_order ?? 999) - (b.loc.display_order ?? 999));
  const orderedEventsWithTime = orderedEvents.filter((e) => e.loc.time);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    applyFadeLoop(audio, wedding.audio_start_time || 0, wedding.audio_end_time, 1);
  };

  const handleStart = () => {
    setStarted(true);
    if (audioRef.current) {
      audioRef.current.currentTime = wedding.audio_start_time || 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const weddingDate = parseLocalDate(wedding.wedding_date);
  const hasGiftCards = giftCards && giftCards.length > 0;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="relative w-full min-h-screen bg-white text-[hsl(0,0%,17%)]"
      style={{
        ...buildTemplateFontStyle("opulence-curtain", wedding.template_fonts),
        fontFamily: "var(--font-template-body)",
        overflowX: "hidden",
        overflowY: started ? "auto" : "hidden",
        maxHeight: started ? "none" : "100vh",
      }}
    >
      {wedding.audio_url && (
        <audio ref={audioRef} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
      )}

      {/* Curtains persist across entire template */}
      <CurtainDrapes opened={started} />

      {/* ═══ OPENING SCREEN ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">

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

          {/* Couple names */}
          <div>
            <h1 className="text-5xl md:text-7xl leading-tight" style={{ fontFamily: 'var(--font-template-title)', fontWeight: 300 }}>
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
                wedding.main_description || "Cordially invite you to celebrate the wedding of their son and daughter"
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
              <p className="text-6xl md:text-8xl font-light" style={{ fontFamily: 'var(--font-template-heading)' }}>
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

            {orderedEventsWithTime.map(({ kind, loc }) => {
              const label =
                kind === "ceremony"
                  ? "Ceremony"
                  : kind === "venue"
                  ? "Reception"
                  : loc.custom_title || "Event";
              return (
                <div key={loc.id || loc.type} className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] opacity-50">{label}</p>
                  <p className="text-xl font-light">{formatTimeTo12Hour(loc.time)}</p>
                </div>
              );
            })}
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
            <h2 className="text-3xl md:text-4xl font-light" style={{ fontFamily: 'var(--font-template-heading)' }}>
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

            {orderedEvents.map(({ kind, loc }, idx) => {
              const label =
                kind === "ceremony"
                  ? "Ceremony"
                  : kind === "venue"
                  ? "Reception"
                  : loc.custom_title || "Event";
              return (
                <div key={loc.id || loc.type} className="space-y-3">
                  {idx > 0 && (
                    <div className="w-8 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />
                  )}
                  <p className="text-xs uppercase tracking-[0.3em] opacity-50">{label}</p>
                  {kind === "custom" && loc.time && (
                    <p className="text-sm font-light opacity-70">{formatTimeTo12Hour(loc.time)}</p>
                  )}
                  {loc.location_name && (
                    <p className="text-xl font-light">{loc.location_name}</p>
                  )}
                  {loc.location_link && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-full border-[hsl(36,57%,74%)] text-[hsl(0,0%,17%)] hover:bg-[hsl(36,57%,74%)] hover:text-white"
                    >
                      <a href={loc.location_link} target="_blank" rel="noopener noreferrer">
                        <MapPin className="w-3.5 h-3.5 mr-1.5" />
                        View on Map
                      </a>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ GALLERY ═══ */}
      {gallery && gallery.length > 0 && (
        <section className="py-16 px-4" style={{ background: "hsl(45, 29%, 96%)" }}>
          <AnimatedSection animation="fade-in">
            <h2 className="text-3xl md:text-4xl font-light text-center mb-10" style={{ fontFamily: 'var(--font-template-heading)' }}>
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
                    style={{ objectPosition: `50% ${Math.min(100, Math.max(0, image.position_y ?? 50))}%` }}
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
              <h2 className="text-3xl md:text-4xl font-light text-center mb-4" style={{ fontFamily: 'var(--font-template-heading)' }}>
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
