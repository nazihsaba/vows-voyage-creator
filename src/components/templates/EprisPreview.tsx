import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, ChevronDown } from "lucide-react";

interface EprisData {
  coupleName1: string;
  coupleName2: string;
  subtitle: string;
  coverImage: string;
  ceremonyLocation: string;
  ceremonyTime: string;
  ceremonyCity: string;
  ceremonyMapUrl?: string;
  celebrationLocation: string;
  celebrationTime: string;
  celebrationCity: string;
  celebrationMapUrl?: string;
  rsvpDeadline: string;
  numberOfPersons: number;
  weddingDate: string; // ISO date for countdown
  quote?: string;
  invitationText?: string;
}

const defaultData: EprisData = {
  coupleName1: "Chris",
  coupleName2: "Sophie",
  subtitle: "Two Souls, One Love",
  coverImage:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  ceremonyLocation: "St Joseph Church",
  ceremonyTime: "6:00 PM",
  ceremonyCity: "Beirut - Lebanon",
  celebrationLocation: "Country Lodge",
  celebrationTime: "8:00 PM",
  celebrationCity: "Bsalim - Lebanon",
  rsvpDeadline: "October 10, 2026",
  numberOfPersons: 1,
  weddingDate: new Date(Date.now() + 168 * 24 * 60 * 60 * 1000).toISOString(),
  quote: "The story that God has joined together, let no one separate.",
  invitationText:
    "Mr. & Mrs. Families are pleased to invite you to celebrate the marriage of their son and daughter.",
};

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  return useMemo(() => {
    const diff = Math.max(0, new Date(targetIso).getTime() - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      days: pad(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
    };
  }, [targetIso, now]);
}

interface Props {
  data?: Partial<EprisData>;
}

export default function EprisPreview({ data: dataProp }: Props = {}) {
  const data: EprisData = { ...defaultData, ...(dataProp || {}) };
  const [opened, setOpened] = useState(false);
  const [attendance, setAttendance] = useState<"accept" | "decline" | "">("");
  const [name, setName] = useState("");
  const countdown = useCountdown(data.weddingDate);

  const cursive = "'Great Vibes', 'Dancing Script', cursive";

  return (
    <div className="min-h-screen w-full bg-[#f7f0ea] flex items-center justify-center p-4">
      <div className="relative w-full max-w-[390px] h-[844px] overflow-hidden rounded-[32px] shadow-2xl bg-black">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="envelope"
              role="button"
              tabIndex={0}
              aria-label="Tap to open invitation"
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#fbf6f0] to-[#f1e7da] cursor-pointer select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.7 }}
              onClick={() => setOpened(true)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpened(true)}
            >
              {/* Floating sparkles across whole envelope area */}
              {[...Array(14)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-[#d9c7b3]"
                  style={{
                    left: `${10 + ((i * 53) % 80)}%`,
                    top: `${15 + ((i * 37) % 70)}%`,
                  }}
                  animate={{ opacity: [0.2, 1, 0.2], y: [0, -6, 0] }}
                  transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.15 }}
                />
              ))}

              <div className="relative w-[78%] aspect-[3/4]">
                {/* Envelope body */}
                <motion.div
                  className="absolute inset-0 rounded-[24px] bg-[#fffaf3] shadow-[0_30px_60px_-20px_rgba(155,122,104,0.45)] border border-[#ecdfd0]"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.9 }}
                />
                {/* Flap */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[55%] origin-top"
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: [0, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ perspective: 800 }}
                >
                  <div
                    className="w-full h-full rounded-t-[24px] bg-gradient-to-b from-[#f6ead9] to-[#eddcc6] shadow-inner"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 50% 92%)",
                    }}
                  />
                </motion.div>

                {/* Wax seal on the right */}
                <motion.div
                  className="absolute right-[-6px] top-[44%] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, #c98a6b, #8d4a31 70%)",
                    fontFamily: cursive,
                    fontSize: 26,
                  }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  A
                </motion.div>

                {/* Couple initials line */}
                <div
                  className="absolute left-0 right-0 top-[68%] text-center text-[#9b7a68]"
                  style={{ fontFamily: cursive, fontSize: 30 }}
                >
                  {data.coupleName1[0]} &amp; {data.coupleName2[0]}
                </div>

                <p className="absolute bottom-[-44px] left-0 right-0 text-center text-[#9b7a68] text-sm tracking-[0.2em] uppercase">
                  Tap to open
                </p>
              </div>
            </motion.div>
          ) : (
            <SwipeInvite
              key="invite"
              data={data}
              countdown={countdown}
              cursive={cursive}
              attendance={attendance}
              setAttendance={setAttendance}
              name={name}
              setName={setName}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface SwipeInviteProps {
  data: EprisData;
  countdown: { days: string; hours: string; minutes: string; seconds: string };
  cursive: string;
  attendance: "accept" | "decline" | "";
  setAttendance: (a: "accept" | "decline" | "") => void;
  name: string;
  setName: (n: string) => void;
}

function SwipeInvite({
  data,
  countdown,
  cursive,
  attendance,
  setAttendance,
  name,
  setName,
}: SwipeInviteProps) {
  const [page, setPage] = useState(0);
  const total = 4;
  const go = (n: number) => setPage(Math.max(0, Math.min(total - 1, n)));

  const sectionBg = {
    backgroundImage: `url(${data.coverImage})`,
  } as const;

  return (
    <motion.div
      key="invite"
      className="absolute inset-0 overflow-hidden touch-pan-y"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex h-full"
        style={{ width: `${total * 100}%` }}
        animate={{ x: `-${page * (100 / total)}%` }}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          const threshold = 60;
          if (info.offset.x < -threshold || info.velocity.x < -400) go(page + 1);
          else if (info.offset.x > threshold || info.velocity.x > 400) go(page - 1);
        }}
      >
        {/* HERO */}
        <section
          className="relative h-full bg-cover bg-center flex flex-col items-center justify-center text-white px-8"
          style={{ width: `${100 / total}%`, ...sectionBg }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/15 to-black/70" />
          <button
            type="button"
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full border border-white/70 text-white text-xs backdrop-blur-sm hover:bg-white/15 transition"
          >
            EN
          </button>
          <div className="relative z-10 text-center">
            <h1
              className="leading-[0.95] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: cursive, fontSize: 72 }}
            >
              {data.coupleName1}
              <br />
              <span className="text-5xl opacity-90">&amp;</span>
              <br />
              {data.coupleName2}
            </h1>
            <p className="mt-4 text-sm tracking-[0.3em] uppercase opacity-90">
              {data.subtitle}
            </p>
            <div className="mt-10 grid grid-cols-4 gap-2 text-center">
              {[
                [countdown.days, "Days"],
                [countdown.hours, "Hours"],
                [countdown.minutes, "Minutes"],
                [countdown.seconds, "Seconds"],
              ].map(([num, label]) => (
                <div key={label as string}>
                  <div className="text-2xl font-light tabular-nums">{num}</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-80 mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <motion.div
              className="mt-12 flex flex-col items-center text-xs opacity-90"
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <ChevronDown size={22} className="-rotate-90" />
              <span className="mt-1 tracking-widest uppercase">Swipe to continue</span>
            </motion.div>
          </div>
        </section>

        {/* QUOTE */}
        <section
          className="relative h-full bg-cover bg-center flex items-center justify-center text-white px-8"
          style={{ width: `${100 / total}%`, ...sectionBg }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center space-y-6 max-w-sm">
            <Heart className="mx-auto opacity-80" size={20} />
            <p className="text-2xl leading-relaxed italic" style={{ fontFamily: cursive }}>
              “{data.quote}”
            </p>
            <div className="w-12 h-px bg-white/50 mx-auto" />
            <p className="text-sm leading-7 opacity-90">{data.invitationText}</p>
          </div>
        </section>

        {/* EVENTS */}
        <section
          className="relative h-full bg-cover bg-center flex flex-col items-center justify-center text-white px-8 py-12"
          style={{ width: `${100 / total}%`, ...sectionBg }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center space-y-10 max-w-sm">
            <div>
              <h2 className="mb-4" style={{ fontFamily: cursive, fontSize: 44 }}>
                Wedding Ceremony
              </h2>
              <MapPin className="mx-auto mb-3 opacity-90" size={20} />
              <p className="text-sm">
                {data.ceremonyLocation} — {data.ceremonyTime}
              </p>
              <p className="text-sm opacity-80">{data.ceremonyCity}</p>
              <a
                href={data.ceremonyMapUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-5 inline-block w-full border border-white/70 py-2.5 backdrop-blur-sm hover:bg-white/15 transition text-sm tracking-widest uppercase rounded-sm"
              >
                Map
              </a>
            </div>
            <div className="w-12 h-px bg-white/40 mx-auto" />
            <div>
              <h2 className="mb-4" style={{ fontFamily: cursive, fontSize: 44 }}>
                The Celebration
              </h2>
              <MapPin className="mx-auto mb-3 opacity-90" size={20} />
              <p className="text-sm">
                {data.celebrationLocation} — {data.celebrationTime}
              </p>
              <p className="text-sm opacity-80">{data.celebrationCity}</p>
              <a
                href={data.celebrationMapUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-5 inline-block w-full border border-white/70 py-2.5 backdrop-blur-sm hover:bg-white/15 transition text-sm tracking-widest uppercase rounded-sm"
              >
                Map
              </a>
            </div>
          </div>
        </section>

        {/* RSVP */}
        <section
          className="relative h-full bg-cover bg-center flex items-center justify-center text-white px-7 py-10"
          style={{ width: `${100 / total}%`, ...sectionBg }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center max-w-sm">
            <h2 className="mb-3" style={{ fontFamily: cursive, fontSize: 56 }}>
              Be Our Guest
            </h2>
            <p className="text-xs tracking-widest uppercase opacity-90">
              Please reply before
            </p>
            <p className="text-sm mt-1 mb-6">{data.rsvpDeadline}</p>
            <div className="rounded-md border border-white/30 bg-white/10 backdrop-blur-md p-5 space-y-5">
              <p className="text-sm">
                Number of persons:{" "}
                <span className="font-medium">{data.numberOfPersons}</span>
              </p>
              <div>
                <p className="mb-3 text-sm">Are you attending?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttendance("accept");
                    }}
                    className={`flex items-center justify-center gap-1 border border-white/70 py-2.5 text-[11px] tracking-wider uppercase backdrop-blur-sm transition ${
                      attendance === "accept" ? "bg-white/30" : "hover:bg-white/15"
                    }`}
                  >
                    <Heart size={12} /> Joyfully Accept
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttendance("decline");
                    }}
                    className={`flex items-center justify-center gap-1 border border-white/70 py-2.5 text-[11px] tracking-wider uppercase backdrop-blur-sm transition ${
                      attendance === "decline" ? "bg-white/30" : "hover:bg-white/15"
                    }`}
                  >
                    <Heart size={12} /> Regretfully Decline
                  </button>
                </div>
              </div>
              <div className="text-left">
                <label className="block text-xs tracking-widest uppercase mb-2 opacity-90">
                  Name of the person attending
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  className="w-full bg-white/10 border border-white/70 px-4 py-3 text-white placeholder-white/60 outline-none backdrop-blur-sm text-sm"
                  placeholder="Your name"
                />
              </div>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white/25 border border-white/70 py-3 backdrop-blur-sm hover:bg-white/35 transition text-sm tracking-widest uppercase"
              >
                Submit
              </button>
            </div>
          </div>
        </section>
      </motion.div>

      {/* Page indicators */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === page ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

