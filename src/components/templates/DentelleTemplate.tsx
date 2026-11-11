import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditableField } from "@/components/EditableField";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { RsvpSection } from "@/components/templates/RsvpSection";
import { Check, Copy } from "lucide-react";
import { EventIcon } from "@/components/templates/EventIcon";
import { formatTimeTo12Hour } from "@/lib/formatTime";
import { formatLocalizedDate } from "@/lib/formatDate";
import { parseLocalDate } from "@/lib/weddingDate";
import { useArabicContent } from "@/hooks/useArabicContent";
import { useTemplateAudio } from "@/hooks/useTemplateAudio";
import { applyFadeLoop } from "@/lib/audioFadeLoop";
import TapToPlayMusic from "@/components/templates/TapToPlayMusic";
import { buildTemplateFontStyle } from "@/components/templateFontDefaults";
import TemplateLoader from "@/components/templates/TemplateLoader";
import { useHeroLoader } from "@/hooks/useHeroLoader";
import {
  DrawOnView,
  EFFECTS_CSS,
  HeartTap,
  Petals,
  type PetalsHandle,
  Reveal,
  RollingNumber,
  prefersReducedMotion,
  useInView,
} from "@/components/templates/dentelle/DentelleEffects";
import { DentelleLace } from "./dentelle/DentelleLace";

/**
 * Dentelle — romantic lace invitation.
 * Opens from a paper envelope sealed with wax, then an ivory card on linen,
 * mocha bands with a fine lace trim, and a vertical "The Day" timeline built
 * from the events.
 */

interface DentelleTemplateProps {
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

// ---------- Palette ----------
const IVORY = "#faf6f1";
const LACE_BG = "#f3ebe4";
const LACE_LINE = "#d8c6ba";
const COCOA = "#6a5047";
const COCOA_DEEP = "#4f3b34";
// Text and details on the mocha bands
const BAND_TEXT = "#efe4d8";
const BAND_TITLE = "#f8f1e8";
const BAND_NUMBER = "#fffaf3";
const BAND_ACCENT = "#dcc5a6";
const BAND_MUTED = "#cdb596";
const BAND_LINE = "#a58d74";
const INK = "#2f2626";
const MUTED = "#7b6c66";
const CHAMPAGNE = "#b79c78";

const FONT_TITLE = "var(--font-template-title)";
const FONT_HEADING = "var(--font-template-heading)";
const FONT_BODY = "var(--font-template-body)";
const FONT_COUNTDOWN = "var(--font-template-countdown)";
const FONT_MONOGRAM = "var(--font-template-monogram)";

const SMALL_CAPS: React.CSSProperties = {
  fontFamily: FONT_BODY,
  fontSize: 11,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
};

/**
 * A fine lace trim between sections: small ivory scallops outlined in a champagne
 * thread, with a pearl in each scallop and a picot dot below it.
 * `band` is the colour of the section the trim sits on.
 */
const LaceEdge = ({
  lace = IVORY,
  band = COCOA,
  thread = CHAMPAGNE,
  flip = false,
}: {
  lace?: string;
  band?: string;
  thread?: string;
  flip?: boolean;
}) => {
  const id = `lace-${useId().replace(/:/g, "")}`;
  return (
    <svg
      aria-hidden
      width="100%"
      height="18"
      style={{ display: "block", background: band, transform: flip ? "scaleY(-1)" : undefined }}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={id} width="26" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 0 H26 V5 A13 7 0 0 1 0 5 Z" fill={lace} />
          <path d="M26 5 A13 7 0 0 1 0 5" fill="none" stroke={thread} strokeWidth="0.8" />
          <circle cx="13" cy="7.6" r="1.25" fill={thread} opacity="0.55" />
          <circle cx="13" cy="15.2" r="0.95" fill={thread} opacity="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="18" fill={`url(#${id})`} />
    </svg>
  );
};

/** Fine-line ribbon bow. */
const Bow = ({ color, width = 120 }: { color: string; width?: number }) => (
  <svg aria-hidden width={width} height={width * 0.62} viewBox="0 0 120 74" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round">
    <path pathLength={1} d="M60 28 C44 6 14 6 18 24 C21 38 46 36 60 28 Z" />
    <path pathLength={1} d="M60 28 C76 6 106 6 102 24 C99 38 74 36 60 28 Z" />
    <path pathLength={1} d="M54 25 C42 17 30 16 26 22" opacity="0.6" />
    <path pathLength={1} d="M66 25 C78 17 90 16 94 22" opacity="0.6" />
    <ellipse pathLength={1} cx="60" cy="28" rx="5.5" ry="6.5" />
    <path pathLength={1} d="M57 34 C52 46 46 56 36 68 L44 66 L42 72" />
    <path pathLength={1} d="M63 34 C68 46 74 56 84 68 L76 66 L78 72" />
  </svg>
);

/** Fine-line ornaments, one per section; drawn stroke by stroke by <DrawOnView>. */
const Ornament = ({ color, width, children }: { color: string; width: number; children: React.ReactNode }) => (
  <svg
    aria-hidden
    width={width}
    height={(width * 80) / 120}
    viewBox="0 0 120 80"
    fill="none"
    stroke={color}
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

/** Invitation: a letter in an envelope, closed with a heart seal. */
const LoveLetter = ({ color, width = 112 }: { color: string; width?: number }) => (
  <Ornament color={color} width={width}>
    <path pathLength={1} d="M31 30 V11 H89 V30" />
    <path pathLength={1} d="M39 17 H81 M45 22.5 H75" opacity="0.5" />
    <path pathLength={1} d="M22 28 H98 V74 H22 Z" />
    <path pathLength={1} d="M22 28 L60 54 L98 28" />
    <path pathLength={1} d="M22 74 L50 50 M98 74 L70 50" opacity="0.55" />
    <path pathLength={1} d="M60 62 C52 56 50 50 54 47.5 C57 45.5 60 48 60 50 C60 48 63 45.5 66 47.5 C70 50 68 56 60 62 Z" />
  </Ornament>
);

/** Countdown: a pocket watch on its chain. */
const PocketWatch = ({ color, width = 118 }: { color: string; width?: number }) => (
  <Ornament color={color} width={width}>
    <ellipse pathLength={1} cx="66" cy="10" rx="4.6" ry="4" />
    <path pathLength={1} d="M63 17 H69 V21 H63 Z" />
    <circle pathLength={1} cx="66" cy="45" r="24" />
    <circle pathLength={1} cx="66" cy="45" r="20" opacity="0.45" />
    <path pathLength={1} d="M66 27.5 V30.5 M83.5 45 H80.5 M66 62.5 V59.5 M48.5 45 H51.5" />
    <path pathLength={1} d="M66 45 V32.5 M66 45 L75 49.5" />
    <circle pathLength={1} cx="66" cy="45" r="1.3" />
    <path pathLength={1} d="M61.5 9 C46 6 32 14 24 28 C20 35 18 42 19 50" opacity="0.6" />
    <circle pathLength={1} cx="19.5" cy="53.5" r="3" opacity="0.6" />
  </Ornament>
);

/** Location: a little chapel. */
const Chapel = ({ color, width = 104 }: { color: string; width?: number }) => (
  <Ornament color={color} width={width}>
    <path pathLength={1} d="M28 76 H92" />
    <path pathLength={1} d="M42 76 V47 H78 V76" />
    <path pathLength={1} d="M38 49 L60 33 L82 49" />
    <path pathLength={1} d="M53 37.5 V22 H67 V37.5" />
    <path pathLength={1} d="M51 22.5 L60 10 L69 22.5" />
    <path pathLength={1} d="M60 10 V2.5 M57 5.2 H63" />
    <circle pathLength={1} cx="60" cy="29" r="2.6" />
    <path pathLength={1} d="M55 76 V66 C55 60.5 65 60.5 65 66 V76" />
    <path pathLength={1} d="M47 63 V57 C47 53.5 52 53.5 52 57 V63 Z M68 63 V57 C68 53.5 73 53.5 73 57 V63 Z" opacity="0.7" />
    <path pathLength={1} d="M30 76 C27 69 33 64 37 70 M90 76 C93 69 87 64 83 70" opacity="0.6" />
  </Ornament>
);

/** The Day: two champagne flutes clinking. */
const Toast = ({ color, width = 104 }: { color: string; width?: number }) => {
  const flute = (
    <>
      <path pathLength={1} d="M-7.5 0 C-7.5 15 -4.5 25 0 27 C4.5 25 7.5 15 7.5 0 Z" />
      <path pathLength={1} d="M-6.8 8 H6.8" opacity="0.55" />
      <path pathLength={1} d="M0 27 V46" />
      <path pathLength={1} d="M-8.5 48.5 C-4 46 4 46 8.5 48.5" />
    </>
  );
  return (
    <Ornament color={color} width={width}>
      <g transform="translate(51.5 20) rotate(14)">{flute}</g>
      <g transform="translate(68.5 20) rotate(-14)">{flute}</g>
      <path pathLength={1} d="M60 12 V5 M53.5 13 L49.5 8 M66.5 13 L70.5 8" opacity="0.7" />
      <circle pathLength={1} cx="49" cy="36" r="0.9" opacity="0.6" />
      <circle pathLength={1} cx="52" cy="31" r="0.7" opacity="0.6" />
      <circle pathLength={1} cx="71" cy="36" r="0.9" opacity="0.6" />
      <circle pathLength={1} cx="68" cy="31" r="0.7" opacity="0.6" />
    </Ornament>
  );
};

/** Wedding gift: a box tied with a ribbon bow. */
const GiftBox = ({ color, width = 96 }: { color: string; width?: number }) => (
  <Ornament color={color} width={width}>
    <path pathLength={1} d="M34 42 H86 V76 H34 Z" />
    <path pathLength={1} d="M30 33 H90 V42 H30 Z" />
    <path pathLength={1} d="M56.5 33 V76 M63.5 33 V76" />
    <path pathLength={1} d="M60 33 C50 17 37 19 43 30 C46 34 54 34 60 33 Z" />
    <path pathLength={1} d="M60 33 C70 17 83 19 77 30 C74 34 66 34 60 33 Z" />
    <path pathLength={1} d="M58 34 L51 45 M62 34 L69 45" opacity="0.7" />
  </Ornament>
);

/** RSVP: a quill and an inkwell. */
const Quill = ({ color, width = 100 }: { color: string; width?: number }) => (
  <Ornament color={color} width={width}>
    <path pathLength={1} d="M38 76 H66" />
    <path pathLength={1} d="M41 76 V64 C41 59.5 45 57 52 57 C59 57 63 59.5 63 64 V76" />
    <path pathLength={1} d="M47.5 57 V52.5 H56.5 V57" />
    <path pathLength={1} d="M52 53 L93 6" />
    <path pathLength={1} d="M93 6 C81 9 69 22 63 39 C70 31 80 22 93 6 Z" />
    <path pathLength={1} d="M93 6 C91 19 82 31 69 40" opacity="0.7" />
    <path pathLength={1} d="M80 19 L75 25 M86 13 L82 18.5 M73 27 L69.5 32" opacity="0.5" />
  </Ornament>
);

/** Two interlaced wedding rings. */
const Rings = ({ color }: { color: string }) => (
  <svg aria-hidden width="96" height="70" viewBox="0 0 120 88" fill="none" stroke={color} strokeWidth="1.3">
    <circle pathLength={1} cx="48" cy="54" r="24" />
    <circle pathLength={1} cx="48" cy="54" r="20.5" opacity="0.45" />
    <circle pathLength={1} cx="74" cy="50" r="24" />
    <circle pathLength={1} cx="74" cy="50" r="20.5" opacity="0.45" />
    <path pathLength={1} d="M68 24 L74 16 L80 24 L74 31 Z" />
    <path pathLength={1} d="M68 24 H80 M71 24 L74 31 L77 24" opacity="0.6" />
  </svg>
);

/** Fine paper grain as a tiling background image. */
const grain = (alpha = 0.5) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
<feColorMatrix values='0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0 0.21  0 0 0 ${alpha} 0'/></filter>
<rect width='180' height='180' filter='url(#n)'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/** Warm linen backdrop: soft light from above, fine weave, grain and a gentle vignette. */
const LINEN: React.CSSProperties = {
  backgroundColor: "#e9e1d7",
  backgroundImage: [
    "radial-gradient(120% 75% at 50% 28%, rgba(255,251,246,.75) 0%, rgba(255,251,246,0) 62%)",
    "radial-gradient(140% 110% at 50% 50%, rgba(0,0,0,0) 58%, rgba(92,70,58,.16) 100%)",
    grain(0.42),
    "repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 1px, rgba(255,255,255,0) 1px 3px)",
    "repeating-linear-gradient(90deg, rgba(110,88,72,.05) 0 1px, rgba(110,88,72,0) 1px 4px)",
  ].join(","),
  backgroundSize: "auto, auto, 180px 180px, auto, auto",
};

/** Ivory cotton card stock. */
/** SVG filter that adds paper grain inside whatever it is applied to. */
const PaperGrain = ({ id, amount = 0.2 }: { id: string; amount?: number }) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="t" />
    <feColorMatrix in="t" values={`0 0 0 0 0.33  0 0 0 0 0.26  0 0 0 0 0.2  0 0 0 ${amount} 0`} result="n" />
    <feComposite in="n" in2="SourceGraphic" operator="in" result="g" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="g" />
    </feMerge>
  </filter>
);

/** Mocha wax seal with a pressed rim, a small laurel and the couple's initials. */
const WaxSeal = ({ initials, size = 96 }: { initials: string; size?: number }) => {
  const id = `wax-${useId().replace(/:/g, "")}`;
  const edge = useMemo(() => {
    const pts: string[] = [];
    const n = 90;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wob = 1 + Math.sin(a * 7 + 0.4) * 0.03 + Math.sin(a * 3 + 1.3) * 0.025 + Math.cos(a * 11) * 0.012;
      pts.push(`${(60 + Math.cos(a) * 52 * wob).toFixed(2)} ${(60 + Math.sin(a) * 52 * wob).toFixed(2)}`);
    }
    return `M${pts.join(" L")} Z`;
  }, []);
  const leaves = useMemo(() => {
    const out: string[] = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const a = Math.PI / 2 + side * (0.5 + i * 0.27);
        const x = 60 + Math.cos(a) * 30;
        const y = 60 + Math.sin(a) * 30;
        const rot = (a * 180) / Math.PI + (side > 0 ? 35 : -35);
        out.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="1.8" ry="4" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
      }
    }
    return out.join("");
  }, []);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${id}-g`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#957a6f" />
          <stop offset="55%" stopColor="#6a5047" />
          <stop offset="100%" stopColor="#47352f" />
        </radialGradient>
        <radialGradient id={`${id}-in`} cx="60%" cy="65%" r="70%">
          <stop offset="0%" stopColor="#7a5f55" />
          <stop offset="100%" stopColor="#5a433b" />
        </radialGradient>
        <filter id={`${id}-s`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.4" floodColor="#2e211c" floodOpacity="0.45" />
        </filter>
      </defs>
      <path d={edge} fill={`url(#${id}-g)`} filter={`url(#${id}-s)`} />
      {/* pressed well with a raised rim */}
      <circle cx="60" cy="60" r="39" fill={`url(#${id}-in)`} />
      <circle cx="60" cy="60" r="39" fill="none" stroke="#3b2b25" strokeWidth="2" opacity="0.7" />
      <circle cx="59.3" cy="59.2" r="40.6" fill="none" stroke="#b39a8e" strokeWidth="1" opacity="0.65" />
      {/* laurel */}
      <g fill="#8c7166" stroke="#4a3731" strokeWidth="0.4" dangerouslySetInnerHTML={{ __html: leaves }} />
      {/* initials, embossed */}
      <g style={{ fontFamily: FONT_MONOGRAM }} fontSize="25" textAnchor="middle">
        <text x="60.8" y="65" fill="#3a2a24">{initials}</text>
        <text x="59.4" y="63.6" fill="#b49c90" opacity="0.8">{initials}</text>
        <text x="60" y="64.3" fill="#7d6258">{initials}</text>
      </g>
      {/* wax sheen */}
      <ellipse cx="44" cy="36" rx="17" ry="9" fill="#fff" opacity="0.13" transform="rotate(-32 44 36)" />
    </svg>
  );
};

/**
 * A paper envelope, sealed with wax, that fills the opening screen. The invitation
 * card underneath sits inside it: tapping lifts the seal and folds the flap back so
 * the card shows through, then the envelope slides away, leaving the card.
 */
const Envelope = ({
  initials,
  cardRef,
  opening,
  onOpen,
  label,
}: {
  initials: string;
  /** The invitation card below the envelope; the envelope leaves a window where it sits. */
  cardRef: React.RefObject<HTMLDivElement>;
  opening: boolean;
  onOpen: () => void;
  label: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const uid = useId().replace(/:/g, "");
  // h: the envelope's full height (the whole first section); vh: the part of it that fits on screen
  const [size, setSize] = useState({ w: 390, h: 844, vh: 844 });
  const [card, setCard] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight || 844;
      setSize({ w: el.clientWidth || 390, h, vh: Math.min(h, window.innerHeight || h) });
      const c = cardRef.current;
      if (c) {
        const o = el.getBoundingClientRect();
        const r = c.getBoundingClientRect();
        setCard({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (cardRef.current) ro.observe(cardRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [cardRef]);

  const reducedMotion = prefersReducedMotion();
  // 0 closed · 1 seal lifts · 2 flap opens · 3 flap behind · 4 envelope slides away
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!opening || reducedMotion) return;
    const steps: Array<[number, number]> = [[1, 0], [2, 380], [3, 830], [4, 1350]];
    const timers = steps.map(([p, ms]) => window.setTimeout(() => setPhase(p), ms));
    return () => timers.forEach(clearTimeout);
  }, [opening, reducedMotion]);

  // Geometry, in px. The envelope covers the whole first section; the flap and seal are
  // placed against the visible screen so the seal stays centred when the section is taller.
  const { w, h, vh } = size;
  const flapH = Math.round(vh * 0.54);
  const meetY = vh * 0.5;
  const bottomTop = vh * 0.47;
  const seal = Math.round(Math.min(Math.max(Math.min(w, vh) * 0.26, 84), 132));
  const tipR = Math.max(12, Math.min(w, vh) * 0.035);
  const sideLen = Math.hypot(w / 2, flapH);
  const ux = w / 2 / sideLen;
  const uy = flapH / sideLen;
  const tipL = `${(w / 2 - ux * tipR).toFixed(1)} ${(flapH - uy * tipR).toFixed(1)}`;
  const tipRt = `${(w / 2 + ux * tipR).toFixed(1)} ${(flapH - uy * tipR).toFixed(1)}`;
  const flapPath = `M0 0 H${w} L${tipRt} Q${w / 2} ${flapH} ${tipL} Z`;
  const flapEdge = `M0 0 L${tipL} Q${w / 2} ${flapH} ${tipRt} L${w} 0`;
  const bottomCtrlY = bottomTop + (h - bottomTop) * 0.32;
  const bottomEdge = `M0 ${h} Q${w * 0.27} ${bottomCtrlY} ${w / 2} ${bottomTop} Q${w * 0.73} ${bottomCtrlY} ${w} ${h}`;
  const bottomPath = `${bottomEdge} Z`;
  // Inside of the envelope: plain paper, a shade deeper than the outside.
  const inside: React.CSSProperties = { backgroundColor: "#ece4d9", backgroundImage: grain(0.3), backgroundSize: "180px 180px" };

  // Inside of the envelope, around the window where the card sits.
  const strips = card
    ? [
        { x: 0, y: 0, w, h: card.y },
        { x: 0, y: card.y + card.h, w, h: h - card.y - card.h },
        { x: 0, y: card.y, w: card.x, h: card.h },
        { x: card.x + card.w, y: card.y, w: w - card.x - card.w, h: card.h },
      ].filter((s) => s.w > 0 && s.h > 0)
    : [{ x: 0, y: 0, w, h }];

  const ease = "cubic-bezier(.55,0,.25,1)";
  return (
    <div
      ref={ref}
      className="absolute inset-0 z-20 overflow-hidden"
      style={{
        perspective: 2200,
        opacity: reducedMotion && opening ? 0 : 1,
        transition: "opacity .5s ease",
        pointerEvents: opening ? "none" : "auto",
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={label}
        className="absolute inset-0 block focus-visible:outline-none"
        style={{ width: "100%", height: "100%", background: "none", border: 0, padding: 0, cursor: "pointer" }}
      >
        {/* everything that slides away with the envelope */}
        <span
          aria-hidden
          className="dt-anim absolute inset-0 block"
          style={{ zIndex: 2, transform: phase >= 4 ? "translateY(105%)" : "none", transition: `transform 1.1s ${ease}` }}
        >
          {strips.map((s, i) => (
            <span
              key={i}
              className="absolute block"
              style={{
                left: s.x,
                top: s.y,
                width: s.w,
                height: s.h,
                ...inside,
                backgroundPosition: `${-s.x}px ${-s.y}px`,
              }}
            />
          ))}
          {/* front pocket: two side flaps under a bottom flap */}
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id={`${uid}-l`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#f3ece2" />
                <stop offset="1" stopColor="#ebe2d6" />
              </linearGradient>
              <linearGradient id={`${uid}-r`} x1="1" y1="0" x2="0" y2="0">
                <stop offset="0" stopColor="#f1e9df" />
                <stop offset="1" stopColor="#e9e0d3" />
              </linearGradient>
              <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f7f1e8" />
                <stop offset="1" stopColor="#ede4d8" />
              </linearGradient>
              <filter id={`${uid}-soft`} x="-10%" y="-20%" width="120%" height="140%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
              <PaperGrain id={`${uid}-gp`} />
            </defs>
            <g filter={`url(#${uid}-gp)`}>
              <path d={`M0 0 L${w / 2} ${meetY} L0 ${h} Z`} fill={`url(#${uid}-l)`} />
              <path d={`M${w} 0 L${w / 2} ${meetY} L${w} ${h} Z`} fill={`url(#${uid}-r)`} />
              {/* soft shade where the bottom flap overlaps */}
              <path d={bottomEdge} fill="none" stroke="rgba(70,48,38,.2)" strokeWidth="7" filter={`url(#${uid}-soft)`} />
              <path d={bottomPath} fill={`url(#${uid}-b)`} />
            </g>
            <path d={`M0 0 L${w / 2} ${meetY} L${w} 0`} fill="none" stroke="#fffdf9" strokeWidth="1.2" opacity="0.7" />
            <path d={bottomEdge} fill="none" stroke="#fffdf9" strokeWidth="1.3" opacity="0.85" />
          </svg>
        </span>

        {/* top flap — closed it sits on top; opened it folds back out of view */}
        <span
          aria-hidden
          className="dt-anim absolute left-0 top-0 block"
          style={{
            width: w,
            height: flapH,
            zIndex: phase >= 3 ? 1 : 4,
            transformOrigin: "50% 0",
            transformStyle: "preserve-3d",
            transform: phase >= 2 ? "rotateX(180deg)" : "rotateX(0deg)",
            transition: `transform .95s ${ease}`,
          }}
        >
          <svg
            width={w}
            height={flapH}
            viewBox={`0 0 ${w} ${flapH}`}
            className="absolute inset-0"
            style={{ overflow: "visible", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <defs>
              <linearGradient id={`${uid}-flap`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f7f1e9" />
                <stop offset="1" stopColor="#f1e9de" />
              </linearGradient>
              <filter id={`${uid}-blur`} x="-10%" y="-10%" width="120%" height="140%">
                <feGaussianBlur stdDeviation="3.2" />
              </filter>
              <PaperGrain id={`${uid}-gf`} />
            </defs>
            <path d={flapPath} transform="translate(0 4)" fill="rgba(70,48,38,.28)" filter={`url(#${uid}-blur)`} />
            <path d={flapPath} fill={`url(#${uid}-flap)`} filter={`url(#${uid}-gf)`} />
            <path d={flapEdge} fill="none" stroke="#fffdf9" strokeWidth="1.3" opacity="0.85" />
          </svg>
          <span
            className="absolute inset-0 block"
            style={{
              transform: "rotateX(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              clipPath: `path("${flapPath}")`,
              ...inside,
            }}
          />
        </span>

        {/* wax seal on the flap tip */}
        <span
          className="dt-anim absolute block"
          style={{
            left: w / 2 - seal / 2,
            top: flapH - seal * 0.6,
            width: seal,
            height: seal,
            zIndex: 5,
            transform: phase >= 1 ? "translateY(-16px) scale(1.06) rotate(-4deg)" : "none",
            opacity: phase >= 1 ? 0 : 1,
            transition: "transform .5s cubic-bezier(.2,.7,.2,1), opacity .4s ease .05s",
          }}
        >
          <span className="block" style={{ animation: opening ? undefined : "dt-breathe 3.4s ease-in-out infinite" }}>
            <WaxSeal initials={initials} size={seal} />
          </span>
        </span>
        <span
          className="dt-anim absolute left-0 right-0 block text-center"
          style={{
            top: flapH + seal * 0.48 + 20,
            zIndex: 5,
            fontFamily: FONT_HEADING,
            fontStyle: "italic",
            fontSize: 17,
            color: "#6f5f57",
            opacity: opening ? 0 : 1,
            transition: "opacity .3s ease",
            animation: opening ? undefined : "dt-hint 2.6s ease-in-out infinite",
          }}
        >
          {label}
        </span>
      </button>
    </div>
  );
};

/**
 * Gift details for Dentelle: each provider's name in small caps, the number set
 * in the heading serif, and a small copy pill, separated by a fine ornament.
 */
const DentelleGiftCards = ({ giftCards }: { giftCards: Array<{ id: string; card_name: string; card_number: string }> }) => {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = (id: string, value: string) => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => {
        setCopiedId(id);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopiedId(null), 1800);
      })
      .catch(() => {});
  };
  return (
    <ul className="flex flex-col items-center" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {giftCards.map((card, i) => {
        const copied = copiedId === card.id;
        return (
          <li key={card.id} className="flex w-full flex-col items-center text-center">
            {i > 0 && (
              <span aria-hidden className="flex items-center justify-center" style={{ gap: 8, margin: "22px 0" }}>
                <span style={{ width: 38, height: 1, background: LACE_LINE }} />
                <span style={{ width: 4, height: 4, borderRadius: 999, background: CHAMPAGNE }} />
                <span style={{ width: 38, height: 1, background: LACE_LINE }} />
              </span>
            )}
            <p style={{ ...SMALL_CAPS, fontSize: 10.5, letterSpacing: "0.3em", color: CHAMPAGNE }}>{card.card_name}</p>
            <p
              dir="ltr"
              style={{
                fontFamily: FONT_HEADING,
                fontSize: "clamp(24px, 7vw, 30px)",
                lineHeight: 1.2,
                letterSpacing: "0.08em",
                color: INK,
                marginTop: 6,
                whiteSpace: "pre-line",
                overflowWrap: "anywhere",
              }}
            >
              {card.card_number}
            </p>
            <button
              type="button"
              onClick={() => copy(card.id, card.card_number)}
              aria-label={`${t("dentelle.copy", "Copy")} ${card.card_name}`}
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b79c78]"
              style={{
                ...SMALL_CAPS,
                fontSize: 10,
                letterSpacing: "0.24em",
                gap: 8,
                marginTop: 14,
                padding: "9px 18px",
                borderRadius: 999,
                border: `1px solid ${COCOA}`,
                background: copied ? COCOA : "transparent",
                color: copied ? BAND_NUMBER : COCOA,
                transition: "background .25s ease, color .25s ease",
                cursor: "pointer",
              }}
            >
              {copied ? <Check aria-hidden className="h-3.5 w-3.5" /> : <Copy aria-hidden className="h-3.5 w-3.5" />}
              <span aria-live="polite">{copied ? t("dentelle.copied", "Copied") : t("dentelle.copy", "Copy")}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

/** A timeline row that lights up once the guest scrolls to it. */
const TimelineRow = ({ children }: { children: (lit: boolean) => React.ReactNode }) => {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: "0px 0px -35% 0px", threshold: 0 });
  return (
    <div ref={ref} className="relative grid items-start" style={{ gridTemplateColumns: "42% 58%" }}>
      {children(inView || prefersReducedMotion())}
    </div>
  );
};

const KEYFRAMES = `
@keyframes dt-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes dt-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
@keyframes dt-reveal { from { opacity: 0; filter: blur(6px); } to { opacity: 1; filter: blur(0); } }
@keyframes dt-hint { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .dt-anim { animation: none !important; transition: opacity .4s ease !important; transform: none !important; }
}
`;

export const DentelleTemplate = ({
  wedding,
  locations,
  giftCards,
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
}: DentelleTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, hasArabic, arabicOnly, getLocalizedValue, formatFamily } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ceremony = locations.find((l) => l.type === "ceremony");
  const venue = locations.find((l) => l.type === "venue");
  const welcomeDrink = locations.find((l) => l.type === "welcome_drink");
  const mainPlace = venue || ceremony;

  const groomName = getLocalizedValue("groom_name", wedding.groom_name || "");
  const brideName = getLocalizedValue("bride_name", wedding.bride_name || "");
  const initials = `${(wedding.groom_name || "A").trim().charAt(0)}&${(wedding.bride_name || "A").trim().charAt(0)}`.toUpperCase();

  const weddingDate = parseLocalDate(wedding.wedding_date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const numericDate = `${pad(weddingDate.getDate())}.${pad(weddingDate.getMonth() + 1)}.${weddingDate.getFullYear()}`;
  const longDate = formatLocalizedDate(weddingDate, { day: "numeric", month: "long", year: "numeric" }, isArabic);

  const { showLoader, fadingOut } = useHeroLoader({ imageUrl: wedding.main_picture_url });
  const { showTapToPlay, handleTapToPlay, isMusicUnlocked, setAudioElement } = useTemplateAudio(
    audioRef,
    wedding.audio_url,
    wedding.audio_start_time,
  );
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    applyFadeLoop(audio, wedding.audio_start_time || 0, wedding.audio_end_time, 0.5);
  };

  // ---------- Opening: envelope with wax seal ----------
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const openInvitation = () => {
    if (opening) return;
    setOpening(true);
    audioRef.current?.play().catch(() => {});
    window.setTimeout(() => setOpened(true), prefersReducedMotion() ? 600 : 2500);
  };

  const heroCardRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // No scrolling until the envelope has been opened and the card animation has finished.
  // Locks the page and, when the template sits in a scrolling box (dashboard preview), that box too.
  useEffect(() => {
    if (opened) return;
    const root = rootRef.current;
    let box: HTMLElement | null = root?.parentElement ?? null;
    while (box && box !== document.body) {
      const oy = getComputedStyle(box).overflowY;
      if (oy === "auto" || oy === "scroll") break;
      box = box.parentElement;
    }
    if (box === document.body) box = null;

    const html = document.documentElement;
    const body = document.body;
    const prev = {
      html: html.style.overflow,
      body: body.style.overflow,
      touch: body.style.touchAction,
      box: box?.style.overflowY ?? "",
    };
    window.scrollTo(0, 0);
    if (box) box.scrollTop = 0;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    if (box) box.style.overflowY = "hidden";

    const block = (e: Event) => e.preventDefault();
    const scrollKeys = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);
    const blockKeys = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (scrollKeys.has(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);

    return () => {
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
      body.style.touchAction = prev.touch;
      if (box) box.style.overflowY = prev.box;
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [opened]);

  const rsvpPetals = useRef<PetalsHandle>(null);
  const submitRsvp = (wishes?: string) => {
    handleRsvpSubmit(wishes);
    if (!isRsvpDeadlinePassed) rsvpPetals.current?.burst(undefined, undefined, 64);
  };

  // ---------- Countdown ----------
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  let diff = Math.max(0, weddingDate.getTime() - now);
  const days = Math.floor(diff / 864e5);
  diff -= days * 864e5;
  const hrs = Math.floor(diff / 36e5);
  diff -= hrs * 36e5;
  const mins = Math.floor(diff / 6e4);
  diff -= mins * 6e4;
  const secs = Math.floor(diff / 1e3);
  const countdownUnits = [
    { value: String(days), label: t("countdown.days", "Days") },
    { value: pad(hrs), label: t("countdown.hours", "Hours") },
    { value: pad(mins), label: t("countdown.minutes", "Minutes") },
    { value: pad(secs), label: t("countdown.seconds", "Seconds") },
  ];

  // ---------- The Day (from the couple's events) ----------
  const orderOf = (loc: any) => (typeof loc?.display_order === "number" ? loc.display_order : 999);
  type DayEntry = { key: string; order: number; time: string; title: string; place: string; note: string; icon?: string; fallbackIcon: string };
  const dayEntries: DayEntry[] = [];
  if (ceremony)
    dayEntries.push({
      key: "ceremony",
      order: orderOf(ceremony),
      time: formatTimeTo12Hour(ceremony.time) || "",
      title: t("events.ceremony"),
      place: getLocalizedValue("ceremony_location", ceremony.location_name || ""),
      note: t("dentelle.ceremonyNote", "We say “I do” surrounded by the people we love."),
      icon: ceremony.icon,
      fallbackIcon: "material-symbols:church-rounded",
    });
  if (welcomeDrink)
    dayEntries.push({
      key: "welcome_drink",
      order: orderOf(welcomeDrink),
      time: formatTimeTo12Hour(welcomeDrink.time) || "",
      title: t("events.welcomeDrink"),
      place: getLocalizedValue("venue_location", welcomeDrink.location_name || venue?.location_name || ""),
      note: t("dentelle.welcomeNote", "Drinks and warm hugs as the evening begins."),
      icon: welcomeDrink.icon,
      fallbackIcon: "asset:cheers",
    });
  if (venue)
    dayEntries.push({
      key: "venue",
      order: orderOf(venue),
      time: formatTimeTo12Hour(venue.time) || "",
      title: t("events.dinnerParty"),
      place: getLocalizedValue("venue_location", venue.location_name || ""),
      note: t("dentelle.venueNote", "Dinner, toasts and dancing until late."),
      icon: venue.icon,
      fallbackIcon: "solar:confetti-bold",
    });
  locations
    .filter((l: any) => typeof l.type === "string" && l.type.startsWith("custom_"))
    .forEach((l: any) =>
      dayEntries.push({
        key: l.type,
        order: orderOf(l),
        time: formatTimeTo12Hour(l.time) || "",
        title: getLocalizedValue(`custom_title_${l.type}`, l.custom_title || "Event"),
        place: getLocalizedValue(`custom_location_${l.type}`, l.location_name || ""),
        note: l.note ? getLocalizedValue(`custom_note_${l.type}`, l.note) : "",
        icon: l.icon,
        fallbackIcon: "mdi:heart-outline",
      }),
    );
  dayEntries.sort((a, b) => a.order - b.order);

  // Google Calendar link for the day (Beirut time, from the first event).
  const calendarUrl = (() => {
    const first = [...dayEntries].sort((a, b) => a.order - b.order)[0];
    const firstLoc = locations.find((l: any) => l.type === first?.key) || ceremony || venue;
    const [hh, mm] = String(firstLoc?.time || "18:00").split(":").map(Number);
    const y = weddingDate.getFullYear();
    const m = weddingDate.getMonth();
    const d = weddingDate.getDate();
    const fmt = (dt: Date) =>
      `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
    const start = new Date(y, m, d, hh || 18, mm || 0);
    const end = new Date(start.getTime() + 6 * 3600e3);
    const title = `${wedding.groom_name || ""} & ${wedding.bride_name || ""}`.trim();
    const where = mainPlace?.location_name || "";
    return (
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(`${title} — Wedding`)}` +
      `&dates=${fmt(start)}/${fmt(end)}&ctz=Asia/Beirut` +
      (where ? `&location=${encodeURIComponent(where)}` : "")
    );
  })();

  const placesWithDirections = [ceremony, venue].filter(Boolean) as any[];

  // ---------- Shared bits ----------
  const sectionTitle = (text: string, color = INK) => (
    <h2
      style={{
        fontFamily: FONT_HEADING,
        fontWeight: 400,
        fontSize: "clamp(40px, 11vw, 60px)",
        lineHeight: 1.05,
        color,
        letterSpacing: "0.005em",
      }}
    >
      {text}
    </h2>
  );

  const smallCaps = SMALL_CAPS;

  return (
    <div
      ref={rootRef}
      className="w-full min-h-screen overflow-x-clip"
      style={{
        backgroundColor: IVORY,
        color: INK,
        fontFamily: FONT_BODY,
        ...buildTemplateFontStyle("dentelle-lace", wedding.template_fonts),
      }}
      dir="ltr"
    >
      <style>{KEYFRAMES + EFFECTS_CSS}</style>
      {showLoader && (
        <TemplateLoader groomName={wedding.groom_name} brideName={wedding.bride_name} fadingOut={fadingOut} />
      )}
      {hasArabic && !arabicOnly && <LanguageToggle />}

      {wedding.audio_url && (
        <>
          <audio ref={setAudioElement} src={wedding.audio_url} preload="auto" onTimeUpdate={handleTimeUpdate} />
          <TapToPlayMusic visible={showTapToPlay && opened} isUnlocked={isMusicUnlocked} onTap={handleTapToPlay} />
        </>
      )}

      <div dir={isArabic ? "rtl" : "ltr"}>
        {/* ==================== HERO ==================== */}
        <section
          className="relative overflow-hidden"
          style={{ minHeight: "100svh", ...LINEN }}
        >
          <DentelleLace cardRef={heroCardRef} />
          <Petals ambient={14} active={opened} />
          <div className="relative mx-auto flex items-center" style={{ minHeight: "100svh", maxWidth: 560, padding: "44px clamp(28px, 8vw, 40px)" }}>
            {/* The invitation card, on linen */}
            <div
              ref={heroCardRef}
              className="relative w-full flex flex-col items-center justify-center text-center"
              style={{
                padding: "clamp(72px, 13vh, 112px) 30px",
                minHeight: "min(calc(100svh - 88px), 820px)",
              }}
            >
              <div
                style={{
                  opacity: opened || opening ? 1 : 0,
                  animation: opening || opened ? "dt-reveal 1.5s ease .75s both" : undefined,
                }}
                className="dt-anim flex flex-col items-center"
              >
                <p style={{ fontFamily: FONT_HEADING, fontSize: 17, lineHeight: 1.3, color: MUTED, maxWidth: 160 }}>
                  {t("dentelle.together", "Together with their families")}
                </p>
                <HeartTap color="#a9776b">
                <div style={{ fontFamily: FONT_TITLE, fontSize: "clamp(54px, 15vw, 86px)", lineHeight: 1.05, color: INK, marginTop: 26 }}>
                  <EditableField
                    fieldId="groom-name"
                    text={getFieldValue("groom-name", groomName)}
                    style={getFieldStyle("groom-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="span"
                    className=""
                  />
                </div>
                <div style={{ fontFamily: FONT_HEADING, fontSize: 16, color: MUTED, margin: "4px 0" }}>&amp;</div>
                <div style={{ fontFamily: FONT_TITLE, fontSize: "clamp(54px, 15vw, 86px)", lineHeight: 1.05, color: INK }}>
                  <EditableField
                    fieldId="bride-name"
                    text={getFieldValue("bride-name", brideName)}
                    style={getFieldStyle("bride-name")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="span"
                    className=""
                  />
                </div>
                </HeartTap>
                <p style={{ fontFamily: FONT_HEADING, fontSize: 18, letterSpacing: "0.04em", color: INK, marginTop: 30 }}>
                  {isArabic ? longDate : numericDate}
                </p>
                <div className="flex justify-center" style={{ marginTop: 30, minHeight: 54 }}>
                  {opened && (
                    <DrawOnView duration={2600}>
                      <Bow color={INK} width={86} />
                    </DrawOnView>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Envelope sealed with wax — tap to open */}
          {!opened && (
            <Envelope
              initials={initials}
              cardRef={heroCardRef}
              opening={opening}
              onOpen={openInvitation}
              label={t("dentelle.tapToOpen", "Tap to open")}
            />
          )}
        </section>

        {/* ==================== INVITATION ==================== */}
        <section className="text-center" style={{ padding: "96px 24px 104px", maxWidth: 600, margin: "0 auto" }}>
          <DrawOnView className="flex justify-center">
            <LoveLetter color={COCOA} />
          </DrawOnView>
          <Reveal delay={150}>
          <div style={{ marginTop: 22, fontFamily: FONT_HEADING, fontSize: 30, lineHeight: 1.2, color: INK }}>
            {t("dentelle.together", "Together with their families")}
          </div>
          <div style={{ marginTop: 14, fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 19, lineHeight: 1.6, color: MUTED }}>
            <EditableField
              fieldId="groom-family"
              text={formatFamily("groom_family", getFieldValue("groom-family", wedding.groom_family || ""))}
              style={getFieldStyle("groom-family")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="whitespace-pre-line"
            />
            <EditableField
              fieldId="bride-family"
              text={formatFamily("bride_family", getFieldValue("bride-family", wedding.bride_family || ""))}
              style={getFieldStyle("bride-family")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              tag="p"
              className="whitespace-pre-line"
            />
          </div>
          <div style={{ marginTop: 22, fontSize: 16.5, lineHeight: 1.75, color: "#4c4040", maxWidth: 460, marginInline: "auto" }}>
            <EditableField
              fieldId="dentelle-invitation-body"
              text={getFieldValue(
                "dentelle-invitation-body",
                getLocalizedValue("main_description", wedding.main_description || t("family.defaultInvitation")),
              )}
              style={getFieldStyle("dentelle-invitation-body")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline
              tag="p"
              className="whitespace-pre-line"
            />
          </div>
          </Reveal>
        </section>

        {/* ==================== COUNTDOWN ==================== */}
        <section style={{ background: COCOA, color: BAND_TEXT }}>
          <LaceEdge lace={IVORY} band={COCOA} />
          <div className="text-center" style={{ padding: "64px 20px 70px" }}>
            <DrawOnView className="flex justify-center">
              <PocketWatch color={BAND_ACCENT} />
            </DrawOnView>
            <div style={{ marginTop: 18 }}>{sectionTitle(t("dentelle.countdown", "Countdown"), BAND_TITLE)}</div>
            <div
              className="flex justify-center"
              style={{ gap: "clamp(18px, 7vw, 48px)", marginTop: 26 }}
              dir="ltr"
            >
              {countdownUnits.map((u) => (
                <div key={u.label} style={{ minWidth: 52 }}>
                  <div style={{ fontFamily: FONT_COUNTDOWN, fontSize: "clamp(36px, 10vw, 54px)", lineHeight: 1, color: BAND_NUMBER }}>
                    <RollingNumber value={u.value} />
                  </div>
                  <div style={{ ...smallCaps, fontSize: 9, letterSpacing: "0.24em", color: BAND_MUTED, marginTop: 10 }}>{u.label}</div>
                </div>
              ))}
            </div>
            <div aria-hidden className="flex items-center justify-center" style={{ marginTop: 34, gap: 10 }}>
              <span style={{ width: 54, height: 1, background: BAND_LINE }} />
              <span style={{ width: 5, height: 5, borderRadius: 999, background: BAND_ACCENT }} />
              <span style={{ width: 54, height: 1, background: BAND_LINE }} />
            </div>
          </div>
          <LaceEdge lace={IVORY} band={COCOA} flip />
        </section>

        {/* ==================== LOCATION ==================== */}
        {placesWithDirections.length > 0 && (
          <section className="text-center" style={{ padding: "96px 24px 40px", maxWidth: 620, margin: "0 auto" }}>
            <DrawOnView className="flex justify-center" style={{ marginBottom: 18 }}>
              <Chapel color={COCOA} />
            </DrawOnView>
            {sectionTitle(t("dentelle.location", "Location"))}
            <div className="flex flex-col" style={{ gap: 64, marginTop: 34 }}>
              {placesWithDirections.map((place: any) => {
                const isVenue = place === venue;
                const name = getLocalizedValue(isVenue ? "venue_location" : "ceremony_location", place.location_name || "");
                return (
                  <Reveal key={place.type} className="flex flex-col items-center">
                    {placesWithDirections.length > 1 && (
                      <p style={{ ...smallCaps, color: CHAMPAGNE }}>
                        {isVenue ? t("events.dinnerParty") : t("events.ceremony")}
                      </p>
                    )}
                    {/* Oval medallion with the time, date and place */}
                    <div
                      className="flex flex-col items-center justify-center text-center"
                      style={{
                        marginTop: placesWithDirections.length > 1 ? 18 : 0,
                        width: "min(66vw, 250px)",
                        aspectRatio: "3 / 4",
                        borderRadius: "50%",
                        background: COCOA,
                        border: `1px solid ${CHAMPAGNE}`,
                        outline: `3px dotted ${BAND_MUTED}`,
                        outlineOffset: -12,
                        color: BAND_TITLE,
                        padding: "0 26px",
                        boxShadow: "0 24px 50px -30px rgba(60,40,30,.7)",
                      }}
                    >
                      <p style={{ ...smallCaps, fontSize: 9.5, color: BAND_MUTED }}>{isVenue ? t("events.dinnerParty") : t("events.ceremony")}</p>
                      {place.time && (
                        <p style={{ fontFamily: FONT_HEADING, fontSize: 40, lineHeight: 1.1, marginTop: 10 }} dir="ltr">
                          {formatTimeTo12Hour(place.time)}
                        </p>
                      )}
                      <p style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 17, marginTop: 6 }}>{longDate}</p>
                      <span style={{ display: "block", width: 34, height: 1, background: BAND_LINE, margin: "16px 0" }} />
                      <p style={{ fontFamily: FONT_HEADING, fontSize: 18, lineHeight: 1.25 }}>{name}</p>
                    </div>
                    {place.location_link && (
                      <a
                        href={place.location_link}
                        target="_blank"
                        rel="noreferrer"
                        className="focus-visible:outline-none focus-visible:ring-2"
                        style={{
                          ...smallCaps,
                          marginTop: 30,
                          padding: "14px 30px",
                          border: `1px solid ${COCOA}`,
                          borderRadius: 999,
                          color: COCOA,
                          textDecoration: "none",
                        }}
                      >
                        {t("dentelle.getDirections", "Get directions")}
                      </a>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== THE DAY ==================== */}
        {dayEntries.length > 0 && (
          <section style={{ padding: "90px 22px 104px", maxWidth: 600, margin: "0 auto" }}>
            <DrawOnView className="flex justify-center" style={{ marginBottom: 18 }}>
              <Toast color={COCOA} />
            </DrawOnView>
            <Reveal className="text-center">
              {sectionTitle(t("dentelle.theDay", "The Day"))}
              <div style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.65, color: MUTED }}>
                <EditableField
                  fieldId="dentelle-day-subtitle"
                  text={getFieldValue(
                    "dentelle-day-subtitle",
                    t("dentelle.theDaySubtitle", "A day to celebrate,\nfrom the first hello to the last dance."),
                  )}
                  style={getFieldStyle("dentelle-day-subtitle")}
                  onUpdate={onFieldUpdate}
                  isPreview={isPreview}
                  multiline
                  tag="p"
                  className="whitespace-pre-line"
                />
              </div>
            </Reveal>

            <div className="relative" style={{ marginTop: 52 }}>
              {/* the line */}
              <div
                aria-hidden
                className="absolute top-2 bottom-2"
                style={{ insetInlineStart: "calc(42% - 0.5px)", width: 1, background: `linear-gradient(to bottom, transparent, ${CHAMPAGNE} 6%, ${CHAMPAGNE} 94%, transparent)` }}
              />
              <div className="flex flex-col" style={{ gap: 44 }}>
                {dayEntries.map((e, idx) => (
                  <TimelineRow key={e.key}>
                    {(lit) => (
                  <>
                    {/* the line fills down to the next event */}
                    {idx < dayEntries.length - 1 && (
                      <span
                        aria-hidden
                        className="absolute"
                        style={{
                          insetInlineStart: "calc(42% - 0.75px)",
                          top: 15,
                          width: 1.5,
                          height: "calc(100% + 44px)",
                          background: COCOA,
                          transformOrigin: "top",
                          transform: lit ? "scaleY(1)" : "scaleY(0)",
                          transition: "transform 1.4s cubic-bezier(.4,0,.2,1) .25s",
                        }}
                      />
                    )}
                    <div
                      className="flex items-center justify-end"
                      style={{ gap: 12, paddingInlineEnd: 20, paddingTop: 1, opacity: lit ? 1 : 0.35, transition: "opacity .8s ease" }}
                    >
                      <span style={{ color: CHAMPAGNE, display: "inline-flex" }}>
                        <EventIcon icon={e.icon} fallback={e.fallbackIcon} className="w-6 h-6 opacity-80" />
                      </span>
                      <span style={{ fontFamily: FONT_HEADING, fontSize: "clamp(20px, 5.4vw, 26px)", whiteSpace: "nowrap", color: INK }} dir="ltr">
                        {e.time}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className="absolute rounded-full"
                      style={{
                        insetInlineStart: "calc(42% - 5px)",
                        top: 10,
                        width: 10,
                        height: 10,
                        background: lit ? COCOA : IVORY,
                        border: `1.5px solid ${lit ? COCOA : CHAMPAGNE}`,
                        boxShadow: `0 0 0 3px ${IVORY}`,
                        transition: "background .5s ease, border-color .5s ease",
                        animation: lit ? "dt-pulse-dot 1.2s ease-out 1" : undefined,
                        zIndex: 1,
                      }}
                    />
                    <div
                      style={{
                        paddingInlineStart: 20,
                        opacity: lit ? 1 : 0.35,
                        transform: lit ? "none" : "translateX(10px)",
                        transition: "opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1)",
                      }}
                    >
                      <p style={{ ...smallCaps, fontSize: 12, color: INK, letterSpacing: "0.22em", paddingTop: 6 }}>{e.title}</p>
                      {e.place && (
                        <p style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 16, color: COCOA, marginTop: 4 }}>{e.place}</p>
                      )}
                      <div style={{ fontSize: 14, lineHeight: 1.6, color: MUTED, marginTop: 4 }}>
                        <EditableField
                          fieldId={`dentelle-day-${e.key}-note`}
                          text={getFieldValue(`dentelle-day-${e.key}-note`, e.note)}
                          style={getFieldStyle(`dentelle-day-${e.key}-note`)}
                          onUpdate={onFieldUpdate}
                          isPreview={isPreview}
                          multiline
                          tag="p"
                          className="whitespace-pre-line"
                        />
                      </div>
                    </div>
                  </>
                    )}
                  </TimelineRow>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== WEDDING GIFT ==================== */}
        {giftCards.length > 0 && (
          <section>
            <Reveal style={{ padding: "40px 20px 96px" }}>
              <div
                className="mx-auto text-center"
                style={{
                  maxWidth: 520,
                  background: "rgba(255,253,250,.94)",
                  border: `1px solid ${CHAMPAGNE}`,
                  borderRadius: 16,
                  padding: "46px 22px 34px",
                }}
              >
                <DrawOnView className="flex justify-center" style={{ marginBottom: 16 }}>
                  <GiftBox color={COCOA} />
                </DrawOnView>
                {sectionTitle(t("gifts.title", "Wedding Gift"))}
                <p style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 25, lineHeight: 1.3, color: COCOA, marginTop: 16 }}>
                  {t("dentelle.giftLead", "Your presence is our greatest gift.")}
                </p>
                <div style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: "#4c4040", maxWidth: 400, marginInline: "auto" }}>
                  <EditableField
                    fieldId="dentelle-gift-text"
                    text={getFieldValue(
                      "dentelle-gift-text",
                      t("dentelle.giftText", "Should you wish to give a gift, you can use the details below."),
                    )}
                    style={getFieldStyle("dentelle-gift-text")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    multiline
                    tag="p"
                    className="whitespace-pre-line"
                  />
                </div>
                <div style={{ marginTop: 26 }}>
                  <DentelleGiftCards giftCards={giftCards} />
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {/* ==================== RSVP ==================== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <section className="relative" style={{ background: COCOA }}>
            <Petals ref={rsvpPetals} ambient={0} active={false} />
            <LaceEdge lace={IVORY} band={COCOA} />
            <div style={{ padding: "40px 16px 56px" }}>
              <DrawOnView className="flex justify-center" style={{ marginBottom: 22 }}>
                <Quill color={BAND_ACCENT} />
              </DrawOnView>
              <div
                className="mx-auto"
                style={{ maxWidth: 760, background: IVORY, borderRadius: 16, overflow: "hidden", border: `1px solid ${CHAMPAGNE}`, boxShadow: "0 30px 60px -30px rgba(0,0,0,.45)" }}
              >
                <RsvpSection
                  wedding={wedding}
                  isPreview={isPreview}
                  invitees={invitees}
                  rsvpResponses={rsvpResponses}
                  handleRsvpToggle={handleRsvpToggle}
                  handleRsvpSubmit={submitRsvp}
                  numberOfPersons={numberOfPersons}
                  isRsvpDeadlinePassed={isRsvpDeadlinePassed}
                  submittingRsvp={submittingRsvp}
                  bgClassName="bg-transparent"
                  cardBgClassName="bg-white"
                  accentColorClass="text-[#6a5047]"
                  buttonClassName="border-[#6a5047] bg-[#6a5047] hover:bg-[#6a5047] text-[#fffaf3]"
                />
              </div>
            </div>
            <LaceEdge lace={IVORY} band={COCOA} flip />
          </section>
        )}

        {/* ==================== CLOSING ==================== */}
        <section className="text-center" style={{ padding: "84px 24px 96px" }}>
          <DrawOnView className="flex justify-center" duration={2600}>
            <Rings color={INK} />
          </DrawOnView>
          <Reveal delay={200}>
          <div style={{ marginTop: 20, fontFamily: FONT_HEADING, fontSize: 24, color: INK }}>
            <EditableField
              fieldId="dentelle-closing"
              text={getFieldValue("dentelle-closing", t("dentelle.closing", "We can't wait to celebrate with you."))}
              style={getFieldStyle("dentelle-closing")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline
              tag="p"
              className="whitespace-pre-line"
            />
          </div>
          <p style={{ marginTop: 26, fontSize: 14, color: MUTED }}>{t("dentelle.withLove", "With love,")}</p>
          <p style={{ fontFamily: FONT_TITLE, fontSize: "clamp(44px, 12vw, 64px)", lineHeight: 1.15, color: INK, marginTop: 6 }}>
            {groomName} <span style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: "0.42em", color: CHAMPAGNE }}>&amp;</span> {brideName}
          </p>
          <p style={{ marginTop: 10, fontSize: 14, letterSpacing: "0.08em", color: MUTED }}>{longDate}</p>
          <a
            href={calendarUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b79c78]"
            style={{
              ...smallCaps,
              marginTop: 30,
              gap: 10,
              padding: "14px 28px",
              border: `1px solid ${COCOA}`,
              borderRadius: 999,
              color: COCOA,
              textDecoration: "none",
            }}
          >
            <svg aria-hidden width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            {t("dentelle.addToCalendar", "Add to calendar")}
          </a>
          </Reveal>
        </section>

        <footer style={{ background: COCOA_DEEP }}>
          <LaceEdge lace={IVORY} band={COCOA_DEEP} />
          <div style={{ padding: "26px 20px 34px", textAlign: "center", color: BAND_MUTED, ...smallCaps, fontSize: 9 }}>
            Auréa Invites
          </div>
          <div style={{ background: "#fff" }}>
            <TemplatePreviewFooter />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DentelleTemplate;
