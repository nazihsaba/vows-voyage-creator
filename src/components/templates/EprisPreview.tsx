import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, ChevronUp, Hand } from "lucide-react";

interface EprisData {
  coupleName1: string;
  coupleName2: string;
  subtitle: string;
  coverImage: string;
  gallery: string[];
  groomFamily: string;
  brideFamily: string;
  ceremonyLocation: string;
  ceremonyTime: string;
  ceremonyCity: string;
  ceremonyMapUrl?: string;
  celebrationLocation: string;
  celebrationTime: string;
  celebrationCity: string;
  celebrationMapUrl?: string;
  weddingDateLabel: string;
  weddingTimeLabel: string;
  rsvpDeadline: string;
  numberOfPersons: number;
  weddingDate: string; // ISO for countdown
  quote?: string;
  invitationText?: string;
}

const defaultData: EprisData = {
  coupleName1: "Chris",
  coupleName2: "Sophie",
  subtitle: "Two Souls, One Love",
  coverImage:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  gallery: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
  ],
  groomFamily: "Mr. & Mrs. Obeid",
  brideFamily: "Mr. & Mrs. Khoury",
  ceremonyLocation: "St Joseph Church",
  ceremonyTime: "6:00 PM",
  ceremonyCity: "Beirut - Lebanon",
  celebrationLocation: "Country Lodge",
  celebrationTime: "8:00 PM",
  celebrationCity: "Bsalim - Lebanon",
  weddingDateLabel: "Saturday, October 10th, 2026",
  weddingTimeLabel: "10:10 AM",
  rsvpDeadline: "October 10, 2026",
  numberOfPersons: 1,
  weddingDate: new Date(Date.now() + 168 * 24 * 60 * 60 * 1000).toISOString(),
  quote: "Therefore what God has joined together, let no one separate.",
  invitationText: "Would be honored by your presence on this special day",
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

const cursive = "'Great Vibes', 'Dancing Script', cursive";

export default function EprisPreview({ data: dataProp }: Props = {}) {
  const data: EprisData = { ...defaultData, ...(dataProp || {}) };
  const [opened, setOpened] = useState(false);
  const [attendance, setAttendance] = useState<"accept" | "decline" | "">("");
  const [name, setName] = useState("");
  const countdown = useCountdown(data.weddingDate);

  return (
    <div className="min-h-screen w-full bg-[#f7f0ea] flex items-center justify-center p-4">
      <div className="relative w-full max-w-[390px] h-[844px] overflow-hidden rounded-[32px] shadow-2xl bg-black">
        <AnimatePresence mode="wait">
          {!opened ? (
            <EnvelopeIntro key="env" onOpen={() => setOpened(true)} initials={`${data.coupleName1[0]} ♥ ${data.coupleName2[0]}`} />
          ) : (
            <SwipeInvite
              key="invite"
              data={data}
              countdown={countdown}
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

/* ============== Envelope Intro ============== */
function EnvelopeIntro({ onOpen, initials }: { onOpen: () => void; initials: string }) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label="Tap to open invitation"
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#fbf6f0] to-[#f1e7da] cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.7 }}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
    >
      {/* Soft envelope card */}
      <motion.div
        className="relative w-[82%] aspect-[3/4] rounded-[18px] bg-white shadow-[0_30px_60px_-20px_rgba(155,122,104,0.4)] border border-[#ecdfd0] overflow-hidden"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9 }}
      >
        {/* Subtle vertical seam suggesting an envelope */}
        <div className="absolute top-0 bottom-0 right-[6%] w-px bg-[#ecdfd0]" />

        {/* Center pearl/sparkle line with wax seal */}
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5">
          {Array.from({ length: 22 }).map((_, i) => {
            const size = i % 5 === 2 ? 7 : i % 3 === 0 ? 5 : 3;
            return (
              <motion.span
                key={i}
                className="rounded-full"
                style={{
                  width: size,
                  height: size,
                  background:
                    i % 4 === 0
                      ? "radial-gradient(circle at 30% 30%, #f4e4d4, #cbb59c)"
                      : "radial-gradient(circle at 30% 30%, #ffffff, #d9c7b3)",
                  boxShadow: "0 1px 2px rgba(155,122,104,0.25)",
                }}
                animate={{ opacity: [0.5, 1, 0.5], y: [0, -2, 0] }}
                transition={{
                  duration: 2 + (i % 3) * 0.4,
                  repeat: Infinity,
                  delay: i * 0.08,
                }}
              />
            );
          })}
        </div>

        {/* Wax seal overlapping the line on the right */}
        <motion.div
          className="absolute right-[18%] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #e0a48a, #b87b5d 60%, #8d4a31)",
            fontFamily: cursive,
            fontSize: 18,
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          {initials}
        </motion.div>

        {/* Tiny hint */}
        <p className="absolute bottom-6 left-0 right-0 text-center text-[#9b7a68] text-[11px] tracking-[0.3em] uppercase">
          Tap to open
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ============== Vertical paged invite ============== */
interface SwipeInviteProps {
  data: EprisData;
  countdown: { days: string; hours: string; minutes: string; seconds: string };
  attendance: "accept" | "decline" | "";
  setAttendance: (a: "accept" | "decline" | "") => void;
  name: string;
  setName: (n: string) => void;
}

function SwipeInvite({
  data,
  countdown,
  attendance,
  setAttendance,
  name,
  setName,
}: SwipeInviteProps) {
  const total = 4;
  const [page, setPage] = useState(0);
  const go = (n: number) => setPage(Math.max(0, Math.min(total - 1, n)));

  const images = data.gallery && data.gallery.length > 0 ? data.gallery : [data.coverImage];
  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const i = setInterval(() => setBgIndex((p) => (p + 1) % images.length), 4500);
    return () => clearInterval(i);
  }, [images.length]);

  // Empty placeholder so children that expect this prop still type-check
  const sectionBg = { backgroundImage: "none" } as const;

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Shared background carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.div
            key={images[bgIndex]}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${images[bgIndex]})` }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute top-0 left-0 right-0"
        style={{ height: `${total * 100}%` }}
        animate={{ y: `-${page * (100 / total)}%` }}
        transition={{ type: "spring", stiffness: 240, damping: 32 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          const threshold = 70;
          if (info.offset.y < -threshold || info.velocity.y < -400) go(page + 1);
          else if (info.offset.y > threshold || info.velocity.y > 400) go(page - 1);
        }}
      >
        {/* HERO */}
        <Page sectionBg={sectionBg}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/65" />
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full border border-white/70 text-white text-xs backdrop-blur-sm hover:bg-white/15 transition"
          >
            EN
          </button>
          <div className="relative z-10 text-center px-8">
            <h1
              className="leading-[0.95] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: cursive, fontSize: 68 }}
            >
              {data.coupleName1}
              <br />
              <span className="text-4xl opacity-95">&amp;</span>
              <br />
              {data.coupleName2}
            </h1>
            <p className="mt-4 text-[11px] tracking-[0.35em] uppercase opacity-90">
              {data.subtitle}
            </p>
            <div className="mt-9 grid grid-cols-4 gap-2 text-center">
              {[
                [countdown.days, "Days"],
                [countdown.hours, "Hours"],
                [countdown.minutes, "Minutes"],
                [countdown.seconds, "Seconds"],
              ].map(([num, label]) => (
                <div key={label as string}>
                  <div className="text-2xl font-light tabular-nums">{num}</div>
                  <div className="text-[9px] uppercase tracking-widest opacity-80 mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SwipeHint />
        </Page>

        {/* QUOTE / INVITATION */}
        <Page sectionBg={sectionBg}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-8 max-w-sm">
            {/* Heart monogram */}
            <div
              className="mx-auto mb-5 w-16 h-16 rounded-full border border-white/70 flex items-center justify-center text-white"
              style={{ fontFamily: cursive, fontSize: 18 }}
            >
              {data.coupleName1[0]} <Heart size={12} className="mx-0.5 fill-white" /> {data.coupleName2[0]}
            </div>

            <p
              className="text-base leading-relaxed italic mb-6"
              style={{ fontFamily: cursive, fontSize: 24 }}
            >
              “{data.quote}”
            </p>

            <div className="flex justify-center gap-6 mb-5 text-[11px] tracking-wider">
              <div>
                <p className="opacity-70 mb-1">Groom's Family</p>
                <p>{data.groomFamily}</p>
              </div>
              <div>
                <p className="opacity-70 mb-1">Bride's Family</p>
                <p>{data.brideFamily}</p>
              </div>
            </div>

            <p className="text-[12px] leading-6 opacity-90 mb-4">
              {data.invitationText}
            </p>

            <p style={{ fontFamily: cursive, fontSize: 36 }} className="leading-tight">
              {data.coupleName1} &amp; {data.coupleName2}
            </p>

            <div className="mt-5 text-[12px] tracking-wide">
              <p>{data.weddingDateLabel}</p>
              <p className="mt-1 opacity-90">{data.weddingTimeLabel}</p>
            </div>
          </div>
          <SwipeHint />
        </Page>

        {/* EVENTS */}
        <Page sectionBg={sectionBg}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center space-y-9 max-w-sm px-8">
            <div>
              <h2 className="mb-3" style={{ fontFamily: cursive, fontSize: 40 }}>
                Wedding Ceremony
              </h2>
              <MapPin className="mx-auto mb-2 opacity-90" size={18} />
              <p className="text-sm">
                {data.ceremonyLocation} - {data.ceremonyTime}
              </p>
              <p className="text-sm opacity-80">{data.ceremonyCity}</p>
              <a
                href={data.ceremonyMapUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
                className="mt-4 inline-block w-full border border-white/70 py-2.5 backdrop-blur-sm hover:bg-white/15 transition text-xs tracking-widest uppercase"
              >
                Map
              </a>
            </div>

            <div className="w-12 h-px bg-white/40 mx-auto" />

            <div>
              <h2 className="mb-3" style={{ fontFamily: cursive, fontSize: 40 }}>
                The Celebration
              </h2>
              <MapPin className="mx-auto mb-2 opacity-90" size={18} />
              <p className="text-sm">
                {data.celebrationLocation} - {data.celebrationTime}
              </p>
              <p className="text-sm opacity-80">{data.celebrationCity}</p>
              <a
                href={data.celebrationMapUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
                className="mt-4 inline-block w-full border border-white/70 py-2.5 backdrop-blur-sm hover:bg-white/15 transition text-xs tracking-widest uppercase"
              >
                Map
              </a>
            </div>
          </div>
          <SwipeHint />
        </Page>

        {/* RSVP */}
        <Page sectionBg={sectionBg}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full text-center max-w-sm px-7">
            <h2 className="mb-2" style={{ fontFamily: cursive, fontSize: 52 }}>
              Be Our Guest
            </h2>
            <p className="text-[11px] tracking-widest uppercase opacity-90">
              Please reply before
            </p>
            <p className="text-sm mt-1 mb-5">{data.rsvpDeadline}</p>

            <div className="rounded-md border border-white/30 bg-white/10 backdrop-blur-md p-5 space-y-4">
              <p className="text-sm">
                Number of persons:{" "}
                <span className="font-medium">{data.numberOfPersons}</span>
              </p>

              <div>
                <p className="mb-2 text-sm">Are you attending?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttendance("accept");
                    }}
                    className={`flex items-center justify-center gap-1 border border-white/70 py-2.5 text-[10px] tracking-wider uppercase backdrop-blur-sm transition ${
                      attendance === "accept" ? "bg-white/30" : "hover:bg-white/15"
                    }`}
                  >
                    <Heart size={11} /> Joyfully Accept
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttendance("decline");
                    }}
                    className={`flex items-center justify-center gap-1 border border-white/70 py-2.5 text-[10px] tracking-wider uppercase backdrop-blur-sm transition ${
                      attendance === "decline" ? "bg-white/30" : "hover:bg-white/15"
                    }`}
                  >
                    <Heart size={11} /> Regretfully Decline
                  </button>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] tracking-widest uppercase mb-2 opacity-90">
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
                className="w-full bg-white/25 border border-white/70 py-3 backdrop-blur-sm hover:bg-white/35 transition text-xs tracking-widest uppercase"
              >
                Submit
              </button>
            </div>
          </div>
        </Page>
      </motion.div>

      {/* Page indicators (vertical, right side) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 pointer-events-none">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`w-1.5 rounded-full transition-all ${
              i === page ? "h-6 bg-white" : "h-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Page({
  sectionBg,
  children,
}: {
  sectionBg: { backgroundImage: string };
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative w-full bg-cover bg-center flex items-center justify-center text-white"
      style={{ height: "25%", ...sectionBg }}
    >
      {children}
    </section>
  );
}

function SwipeHint() {
  return (
    <motion.div
      className="absolute bottom-5 left-0 right-0 flex flex-col items-center text-[10px] opacity-90 z-10 pointer-events-none text-white"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    >
      <Hand size={16} className="mb-1" />
      <ChevronUp size={16} />
      <span className="mt-0.5 tracking-widest uppercase">Swipe to continue</span>
    </motion.div>
  );
}
