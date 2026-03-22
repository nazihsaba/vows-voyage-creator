import { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { RsvpSection } from "@/components/templates/RsvpSection";

/* ── Static Countdown ── */
const StaticCountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [targetDate]);

  return (
    <div className="text-center">
      <h2 className="text-3xl md:text-4xl font-light mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Counting Down
      </h2>
      <div className="flex justify-center gap-6 md:gap-10">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Min" },
          { value: timeRemaining.seconds, label: "Sec" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-3xl md:text-4xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {String(item.value).padStart(2, "0")}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Curtain Drapes ── */
const CurtainDrapes = ({ opened }: { opened: boolean }) => (
  <>
    {/* Left curtain */}
    <div
      className="absolute top-0 left-0 w-[55%] h-full pointer-events-none z-[3] overflow-hidden"
      style={{
        transform: opened ? "translateX(-110%)" : "translateX(0)",
        transition: "transform 2s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <svg viewBox="0 0 220 600" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pCurtainGradL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 45%, 25%)" />
            <stop offset="20%" stopColor="hsl(36, 50%, 35%)" />
            <stop offset="50%" stopColor="hsl(36, 55%, 45%)" />
            <stop offset="75%" stopColor="hsl(36, 50%, 38%)" />
            <stop offset="100%" stopColor="hsl(36, 45%, 30%)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="pCurtainHighlightL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 57%, 74%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(36, 57%, 78%)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(36, 57%, 82%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(36, 57%, 74%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pCurtainEdgeL" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 40%, 20%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(36, 40%, 20%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,0 L220,0 C200,40 185,90 170,150 C150,230 135,320 120,410 C105,490 70,555 30,600 L0,600 Z" fill="url(#pCurtainGradL)" />
        <path d="M0,0 L130,0 C115,60 95,140 80,240 C65,340 45,450 20,600 L0,600 Z" fill="hsl(36, 50%, 28%)" opacity="0.45" />
        <path d="M0,0 L70,0 C60,80 48,180 38,300 C28,420 15,530 0,600 Z" fill="hsl(36, 55%, 22%)" opacity="0.35" />
        <path d="M90,0 C85,100 82,200 80,300 C78,400 70,500 55,600 L75,600 C80,500 85,400 88,300 C91,200 95,100 100,0 Z" fill="url(#pCurtainHighlightL)" />
        <path d="M155,0 C148,80 142,170 138,270 C134,370 125,480 110,600 L125,600 C132,480 138,370 142,270 C146,170 152,80 160,0 Z" fill="hsl(36, 57%, 74%)" opacity="0.12" />
        
      </svg>
    </div>

    {/* Right curtain */}
    <div
      className="absolute top-0 right-0 w-[55%] h-full pointer-events-none z-[3] overflow-hidden"
      style={{
        transform: opened ? "translateX(110%)" : "translateX(0)",
        transition: "transform 2s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <svg viewBox="0 0 220 600" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pCurtainGradR" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 45%, 25%)" />
            <stop offset="20%" stopColor="hsl(36, 50%, 35%)" />
            <stop offset="50%" stopColor="hsl(36, 55%, 45%)" />
            <stop offset="75%" stopColor="hsl(36, 50%, 38%)" />
            <stop offset="100%" stopColor="hsl(36, 45%, 30%)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="pCurtainHighlightR" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 57%, 74%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(36, 57%, 78%)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(36, 57%, 82%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(36, 57%, 74%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pCurtainEdgeR" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(36, 40%, 20%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(36, 40%, 20%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M220,0 L0,0 C20,40 35,90 50,150 C70,230 85,320 100,410 C115,490 150,555 190,600 L220,600 Z" fill="url(#pCurtainGradR)" />
        <path d="M220,0 L90,0 C105,60 125,140 140,240 C155,340 175,450 200,600 L220,600 Z" fill="hsl(36, 50%, 28%)" opacity="0.45" />
        <path d="M220,0 L150,0 C160,80 172,180 182,300 C192,420 205,530 220,600 Z" fill="hsl(36, 55%, 22%)" opacity="0.35" />
        <path d="M130,0 C135,100 138,200 140,300 C142,400 150,500 165,600 L145,600 C140,500 135,400 132,300 C129,200 125,100 120,0 Z" fill="url(#pCurtainHighlightR)" />
        <path d="M65,0 C72,80 78,170 82,270 C86,370 95,480 110,600 L95,600 C88,480 82,370 78,270 C74,170 68,80 60,0 Z" fill="hsl(36, 57%, 74%)" opacity="0.12" />
        
      </svg>
    </div>


    {/* Ambient glow */}
    <div
      className="absolute inset-0 pointer-events-none z-[2]"
      style={{
        background: opened
          ? "transparent"
          : "radial-gradient(ellipse at center, hsl(36, 57%, 74%, 0.08) 0%, transparent 70%)",
        transition: "background 1.5s ease-out",
      }}
    />
  </>
);

/* ── Nav Circle ── */
const NavCircle = ({ label }: { label: string }) => (
  <div
    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-[10px] md:text-xs uppercase tracking-wider font-medium"
    style={{
      background: "linear-gradient(135deg, hsl(36, 57%, 82%), hsl(36, 57%, 72%))",
      color: "hsl(0, 0%, 17%)",
      boxShadow: "0 4px 16px hsl(36 57% 74% / 0.35)",
    }}
  >
    {label}
  </div>
);

const OpulencePreview = () => {
  const staticWeddingDate = new Date("2025-09-15");
  const staticRsvpDeadline = new Date("2025-08-15");
  const [started, setStarted] = useState(false);

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

      {/* ═══ OPENING SCREEN ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <CurtainDrapes opened={started} />

        {/* Tap to Start */}
        {!started && (
          <div className="absolute inset-0 z-[20] flex items-center justify-center">
            <button
              onClick={() => setStarted(true)}
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

        <div
          className={`relative z-10 px-6 py-16 max-w-lg mx-auto space-y-8 transition-opacity duration-1000 ${!started ? 'pointer-events-none' : ''}`}
          style={{ opacity: started ? 1 : 0, transitionDelay: started ? "1s" : "0s" }}
        >
          <div>
            <div className="w-16 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.35em] opacity-60">Together with their families</p>
          </div>

          <div>
            <h1 className="text-5xl md:text-7xl leading-tight" style={{ fontWeight: 300 }}>
              Alexander
              <span className="block text-3xl md:text-4xl my-2 italic opacity-50">&</span>
              Victoria
            </h1>
          </div>

          <div>
            <p className="text-base md:text-lg leading-relaxed opacity-70 italic whitespace-pre-line">
              {"Request the honour of your presence\nat the celebration of their marriage"}
            </p>
          </div>

          <div>
            <div className="w-16 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />
          </div>

          <div className="pt-4">
            <ChevronDown className="w-5 h-5 mx-auto animate-bounce opacity-40" />
          </div>
        </div>
      </section>

      {/* ═══ NAV CIRCLES ═══ */}
      <section className="py-12 px-4">
        <AnimatedSection animation="fade-in">
          <div className="flex justify-center gap-4 md:gap-6 flex-wrap max-w-md mx-auto">
            <NavCircle label="Date" />
            <NavCircle label="Venue" />
            <NavCircle label="Gifts" />
            <NavCircle label="RSVP" />
          </div>
        </AnimatedSection>
      </section>

      <div className="w-20 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />

      {/* ═══ DATE DETAILS ═══ */}
      <section className="py-20 px-6">
        <AnimatedSection animation="fade-in">
          <div className="max-w-sm mx-auto text-center space-y-8">
            <div className="space-y-2">
              <p className="text-6xl md:text-8xl font-light">15</p>
              <p className="text-xl md:text-2xl uppercase tracking-[0.3em] font-light">September</p>
              <p className="text-lg tracking-[0.2em] opacity-60">2025</p>
            </div>
            <div className="w-12 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] opacity-50">Ceremony</p>
              <p className="text-xl font-light">5:00 PM</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] opacity-50">Reception</p>
              <p className="text-xl font-light">7:00 PM</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ COUNTDOWN ═══ */}
      <section className="py-12 px-4" style={{ background: "hsl(45, 29%, 96%)" }}>
        <StaticCountdownTimer targetDate={staticWeddingDate} />
      </section>

      {/* ═══ VENUE ═══ */}
      <section className="relative py-20 px-6">
        <AnimatedSection animation="fade-in">
          <div className="max-w-md mx-auto text-center space-y-10">
            <h2 className="text-3xl md:text-4xl font-light">The Venue</h2>

            <div className="mx-auto w-32 h-32 opacity-30">
              <svg viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="0.8">
                <rect x="25" y="40" width="70" height="50" rx="1" />
                <path d="M20 40 L60 10 L100 40" />
                <path d="M50 90 L50 65 Q60 58 70 65 L70 90" />
                <rect x="33" y="50" width="10" height="12" rx="5" />
                <rect x="77" y="50" width="10" height="12" rx="5" />
                <line x1="60" y1="5" x2="60" y2="15" />
                <line x1="56" y1="10" x2="64" y2="10" />
                <line x1="45" y1="90" x2="75" y2="90" />
                <line x1="43" y1="93" x2="77" y2="93" />
                <line x1="41" y1="96" x2="79" y2="96" />
              </svg>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] opacity-50">Ceremony</p>
              <p className="text-xl font-light">St. Mary's Cathedral</p>
              <p className="text-sm opacity-50">123 Cathedral Lane, City</p>
            </div>

            <div className="w-8 h-px mx-auto" style={{ background: "hsl(36, 57%, 74%)" }} />

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] opacity-50">Reception</p>
              <p className="text-xl font-light">The Grand Ballroom</p>
              <p className="text-sm opacity-50">456 Grand Avenue, City</p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ RSVP ═══ */}
      <RsvpSection
        staticDeadline={staticRsvpDeadline}
        isPreview={true}
        bgClassName="bg-[hsl(45,29%,96%)]"
        cardBgClassName="bg-white"
      />

      {/* ═══ CLOSING ═══ */}
      <section className="py-16 px-6 text-center">
        <AnimatedSection animation="fade-in">
          <p className="text-lg italic opacity-60 max-w-sm mx-auto">
            We look forward to celebrating with you
          </p>
          <div className="w-16 h-px mx-auto mt-8" style={{ background: "hsl(36, 57%, 74%)" }} />
        </AnimatedSection>
      </section>
    </div>
  );
};

export default OpulencePreview;
