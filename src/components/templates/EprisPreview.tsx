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
