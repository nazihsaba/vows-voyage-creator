import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditableField } from "@/components/EditableField";
import TemplatePreviewFooter from "@/components/templates/TemplatePreviewFooter";
import LanguageToggle from "@/components/templates/LanguageToggle";
import { RsvpSection } from "@/components/templates/RsvpSection";
import { GiftCards } from "@/components/GiftCards";
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

/**
 * Dentelle — romantic lace invitation.
 * Ivory lace, a burgundy wax seal that opens the invitation, burgundy bands
 * with lace edges, and a vertical "The Day" timeline built from the events.
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
const LACE_WHITE = "#fffdfa";
const WINE = "#5a1824";
const WINE_DEEP = "#45111b";
const BLUSH = "#f2d6d6";
const INK = "#2f2626";
const MUTED = "#7b6c66";
const CHAMPAGNE = "#b79c78";

const FONT_TITLE = "var(--font-template-title)";
const FONT_HEADING = "var(--font-template-heading)";
const FONT_BODY = "var(--font-template-body)";
const FONT_COUNTDOWN = "var(--font-template-countdown)";
const FONT_MONOGRAM = "var(--font-template-monogram)";

/** Small repeating lace motif (eyelets, petals, dots) as a background image. */
const lacePattern = (stroke: string, bg: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'>
<rect width='56' height='56' fill='${bg}'/>
<g fill='none' stroke='${stroke}' stroke-width='0.9'>
<circle cx='28' cy='28' r='4.2'/>
<circle cx='28' cy='19.5' r='3'/><circle cx='28' cy='36.5' r='3'/><circle cx='19.5' cy='28' r='3'/><circle cx='36.5' cy='28' r='3'/>
<circle cx='0' cy='0' r='6'/><circle cx='56' cy='0' r='6'/><circle cx='0' cy='56' r='6'/><circle cx='56' cy='56' r='6'/>
<path d='M10 28 Q14 22 18 28 M38 28 Q42 34 46 28 M28 10 Q34 14 28 18 M28 38 Q22 42 28 46'/>
</g>
<g fill='${stroke}'>
<circle cx='28' cy='28' r='1.3'/><circle cx='28' cy='0' r='1.2'/><circle cx='0' cy='28' r='1.2'/><circle cx='56' cy='28' r='1.2'/><circle cx='28' cy='56' r='1.2'/>
<circle cx='14' cy='14' r='0.9'/><circle cx='42' cy='14' r='0.9'/><circle cx='14' cy='42' r='0.9'/><circle cx='42' cy='42' r='0.9'/>
</g></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/** A scalloped lace border that runs the full width. `holeColor` is the colour seen through the eyelets. */
const LaceEdge = ({
  lace = LACE_WHITE,
  holeColor = WINE,
  outline = LACE_LINE,
  flip = false,
}: {
  lace?: string;
  holeColor?: string;
  outline?: string;
  flip?: boolean;
}) => {
  const id = `lace-${useId().replace(/:/g, "")}`;
  return (
    <svg
      aria-hidden
      width="100%"
      height="34"
      style={{ display: "block", transform: flip ? "scaleY(-1)" : undefined }}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={id} width="44" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 0 H44 V14 A22 18 0 0 1 0 14 Z" fill={lace} />
          <path d="M44 14 A22 18 0 0 1 0 14" fill="none" stroke={outline} strokeWidth="1" />
          <path d="M40 13 A18 14 0 0 1 4 13" fill="none" stroke={outline} strokeWidth="0.6" strokeDasharray="1.5 2.5" />
          <circle cx="22" cy="15" r="4.2" fill={holeColor} />
          <circle cx="22" cy="15" r="5.6" fill="none" stroke={outline} strokeWidth="0.7" />
          <circle cx="9" cy="7" r="1.6" fill={holeColor} />
          <circle cx="35" cy="7" r="1.6" fill={holeColor} />
          <circle cx="22" cy="5" r="1.1" fill={outline} />
        </pattern>
      </defs>
      <rect width="100%" height="34" fill={`url(#${id})`} />
    </svg>
  );
};

/** Fine-line ribbon bow. */
const Bow = ({ color, width = 120 }: { color: string; width?: number }) => (
  <svg aria-hidden width={width} height={width * 0.62} viewBox="0 0 120 74" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round">
    <path d="M60 28 C44 6 14 6 18 24 C21 38 46 36 60 28 Z" />
    <path d="M60 28 C76 6 106 6 102 24 C99 38 74 36 60 28 Z" />
    <path d="M54 25 C42 17 30 16 26 22" opacity="0.6" />
    <path d="M66 25 C78 17 90 16 94 22" opacity="0.6" />
    <ellipse cx="60" cy="28" rx="5.5" ry="6.5" />
    <path d="M57 34 C52 46 46 56 36 68 L44 66 L42 72" />
    <path d="M63 34 C68 46 74 56 84 68 L76 66 L78 72" />
  </svg>
);

/** Two interlaced wedding rings. */
const Rings = ({ color }: { color: string }) => (
  <svg aria-hidden width="96" height="70" viewBox="0 0 120 88" fill="none" stroke={color} strokeWidth="1.3">
    <circle cx="48" cy="54" r="24" />
    <circle cx="48" cy="54" r="20.5" opacity="0.45" />
    <circle cx="74" cy="50" r="24" />
    <circle cx="74" cy="50" r="20.5" opacity="0.45" />
    <path d="M68 24 L74 16 L80 24 L74 31 Z" />
    <path d="M68 24 H80 M71 24 L74 31 L77 24" opacity="0.6" />
  </svg>
);

/** Embroidered lace with raised thread, a diamond lattice and scattered pearls. */
const embroideredLace = () => {
  const petals = (cx: number, cy: number, n: number, rx: number, ry: number, off: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (360 / n) * i;
      return `<ellipse cx='${cx}' cy='${cy - off}' rx='${rx}' ry='${ry}' transform='rotate(${a} ${cx} ${cy})'/>`;
    }).join("");
  const pearl = (x: number, y: number, r: number) =>
    `<circle cx='${x + 0.6}' cy='${y + 0.9}' r='${r}' fill='#b9a698' opacity='.45'/><circle cx='${x}' cy='${y}' r='${r}' fill='url(#p)'/>`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>
<defs><radialGradient id='p' cx='35%' cy='30%' r='70%'><stop offset='0' stop-color='#ffffff'/><stop offset='.55' stop-color='#f3ece6'/><stop offset='1' stop-color='#d9cbc0'/></radialGradient></defs>
<rect width='96' height='96' fill='#e6d9cf'/>
<g fill='none' stroke-width='1.1'>
<path d='M0 48 L48 0 L96 48 L48 96 Z' stroke='#c9b7aa' transform='translate(.6 .9)'/>
<path d='M0 48 L48 0 L96 48 L48 96 Z' stroke='#f6efe9'/>
<path d='M8 48 L48 8 L88 48 L48 88 Z' stroke='#f6efe9' stroke-width='.6' stroke-dasharray='1.4 2.6'/>
</g>
<g fill='#f1e8e1' stroke='#cbb9ac' stroke-width='.55'>${petals(48, 48, 6, 3.4, 6.6, 6.4)}${petals(0, 0, 5, 2.4, 4.6, 4.4)}${petals(96, 0, 5, 2.4, 4.6, 4.4)}${petals(0, 96, 5, 2.4, 4.6, 4.4)}${petals(96, 96, 5, 2.4, 4.6, 4.4)}</g>
<g fill='none' stroke='#f6efe9' stroke-width='.9' stroke-linecap='round'>
<path d='M30 30 q6 -2 8 4 M66 30 q-6 -2 -8 4 M30 66 q6 2 8 -4 M66 66 q-6 2 -8 -4'/>
<path d='M48 26 q-4 -5 0 -9 q4 4 0 9 M48 70 q-4 5 0 9 q4 -4 0 -9 M26 48 q-5 -4 -9 0 q4 4 9 0 M70 48 q5 -4 9 0 q-4 4 -9 0'/>
</g>
${pearl(48, 48, 2.6)}${pearl(48, 14, 2.3)}${pearl(48, 82, 2.3)}${pearl(14, 48, 2.3)}${pearl(82, 48, 2.3)}
${pearl(26, 26, 1.6)}${pearl(70, 26, 1.6)}${pearl(26, 70, 1.6)}${pearl(70, 70, 1.6)}
</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/** Cream oval wax seal with a pressed floral wreath and the couple's initials. */
const IvorySeal = ({ initials, width = 118 }: { initials: string; width?: number }) => {
  const id = `seal-${useId().replace(/:/g, "")}`;
  const edge = useMemo(() => {
    const pts: string[] = [];
    const n = 80;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wob = 1 + Math.sin(a * 9) * 0.018 + Math.sin(a * 5 + 0.7) * 0.014 + Math.cos(a * 13) * 0.01;
      pts.push(`${(60 + Math.cos(a) * 54 * wob).toFixed(2)} ${(75 + Math.sin(a) * 69 * wob).toFixed(2)}`);
    }
    return `M${pts.join(" L")} Z`;
  }, []);
  // Leaves around the top of the inner oval.
  const leaves = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (1.08 + (i / 8) * 0.84);
      const x = 60 + Math.cos(a) * 30 + Math.cos(a) * (i % 2 ? 3 : -3);
      const y = 62 + Math.sin(a) * 32 + Math.sin(a) * (i % 2 ? 3 : -3);
      const rot = (a * 180) / Math.PI + 90;
      out.push(
        `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="2.3" ry="4.6" transform="rotate(${(rot + (i % 2 ? 35 : -35)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`,
      );
    }
    return out.join("");
  }, []);
  return (
    <svg width={width} height={width * 1.25} viewBox="0 0 120 150" aria-hidden>
      <defs>
        <radialGradient id={`${id}-g`} cx="40%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#fbf7f2" />
          <stop offset="60%" stopColor="#ece2d8" />
          <stop offset="100%" stopColor="#d3c3b5" />
        </radialGradient>
        <filter id={`${id}-s`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#6b5446" floodOpacity="0.35" />
        </filter>
      </defs>
      <path d={edge} fill={`url(#${id}-g)`} filter={`url(#${id}-s)`} />
      {/* pressed rim */}
      <ellipse cx="60" cy="75" rx="43" ry="57" fill="none" stroke="#c5b3a4" strokeWidth="2.4" />
      <ellipse cx="59.3" cy="74.2" rx="43" ry="57" fill="none" stroke="#fffdf9" strokeWidth="1" opacity="0.9" />
      <ellipse cx="60" cy="75" rx="38" ry="51" fill="#efe6dd" opacity="0.55" />
      {/* wreath */}
      <path d="M30 60 Q34 34 60 30 Q86 34 90 60" fill="none" stroke="#c4b1a1" strokeWidth="0.9" />
      <path d="M30.6 59.4 Q34.6 33.4 60 29.4 Q85.4 33.4 89.4 59.4" fill="none" stroke="#fffdf9" strokeWidth="0.6" />
      <g
        fill="#e9dfd5"
        stroke="#bfac9c"
        strokeWidth="0.6"
        dangerouslySetInnerHTML={{ __html: leaves }}
      />
      <g fill="#f8f2ec" stroke="#c9b7a8" strokeWidth="0.7">
        <circle cx="60" cy="27" r="4.2" />
        <circle cx="52" cy="29.5" r="2.6" />
        <circle cx="68" cy="29.5" r="2.6" />
      </g>
      {/* initials, pressed: dark lower edge + light upper edge */}
      <g style={{ fontFamily: FONT_MONOGRAM }} fontSize="27" textAnchor="middle">
        <text x="60.8" y="94" fill="#b29f90">{initials}</text>
        <text x="59.4" y="92.6" fill="#fffdf9">{initials}</text>
        <text x="60" y="93.3" fill="#e2d5ca">{initials}</text>
      </g>
    </svg>
  );
};

/** Lace envelope: four lace flaps, a tulle X gathered at the centre, and the seal. */
const LaceEnvelope = ({
  initials,
  opening,
  onOpen,
  label,
}: {
  initials: string;
  opening: boolean;
  onOpen: () => void;
  label: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 390, h: 844 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth || 390, h: el.clientHeight || 844 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { w, h } = size;
  const cx = w / 2;
  const cy = h / 2;
  const diag = Math.hypot(w, h);
  const angle = (Math.atan2(h, w) * 180) / Math.PI;
  const lace = embroideredLace();

  // Scalloped, pearl-beaded lace edge for one side of a flap (from a corner to the centre),
  // pushed `off` px into the flap so it shows beside the tulle.
  const scallopEdge = (x1: number, y1: number, x2: number, y2: number, inward: [number, number], off: number) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const ox = inward[0] * off;
    const oy = inward[1] * off;
    const step = 15;
    const n = Math.floor(len / step);
    let d = `M${(x1 + ox).toFixed(1)} ${(y1 + oy).toFixed(1)}`;
    const pearls: Array<[number, number]> = [];
    for (let i = 0; i < n; i++) {
      const bx = x1 + ux * step * (i + 1) + ox;
      const by = y1 + uy * step * (i + 1) + oy;
      const mx = x1 + ux * step * (i + 0.5) + ox;
      const my = y1 + uy * step * (i + 0.5) + oy;
      // bump outward, toward the seam
      d += ` Q${(mx - inward[0] * 9).toFixed(1)} ${(my - inward[1] * 9).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
      pearls.push([mx + inward[0] * 3.5, my + inward[1] * 3.5]);
    }
    return { d, pearls };
  };

  type FlapDef = {
    key: string;
    clip: string;
    corners: Array<[number, number]>;
    centroid: [number, number];
    origin: string;
    openTransform: string;
    delay: string;
    shade: number;
  };
  const flaps: FlapDef[] = [
    { key: "left", clip: "polygon(0 0, 0 100%, 50% 50%)", corners: [[0, 0], [0, h]], centroid: [w / 6, h / 2], origin: "left center", openTransform: "rotateY(82deg)", delay: ".2s", shade: 0.965 },
    { key: "right", clip: "polygon(100% 0, 100% 100%, 50% 50%)", corners: [[w, 0], [w, h]], centroid: [(5 * w) / 6, h / 2], origin: "right center", openTransform: "rotateY(-82deg)", delay: ".2s", shade: 0.965 },
    { key: "bottom", clip: "polygon(0 100%, 100% 100%, 50% 50%)", corners: [[0, h], [w, h]], centroid: [w / 2, (5 * h) / 6], origin: "bottom center", openTransform: "translateY(102%)", delay: ".35s", shade: 0.94 },
    { key: "top", clip: "polygon(0 0, 100% 0, 50% 50%)", corners: [[0, 0], [w, 0]], centroid: [w / 2, h / 6], origin: "top center", openTransform: "translateY(-102%)", delay: "0s", shade: 1 },
  ];

  const flapEl = (f: FlapDef) => {
    const edges = f.corners.map(([x1, y1]) => {
      const len = Math.hypot(cx - x1, cy - y1);
      let nx = -(cy - y1) / len;
      let ny = (cx - x1) / len;
      const mx = (x1 + cx) / 2;
      const my = (y1 + cy) / 2;
      if ((f.centroid[0] - mx) * nx + (f.centroid[1] - my) * ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      return scallopEdge(x1, y1, cx, cy, [nx, ny], 50);
    });
    return (
      <div
        key={f.key}
        className="dt-anim absolute inset-0"
        style={{
          clipPath: f.clip,
          transformOrigin: f.origin,
          transform: opening ? f.openTransform : "none",
          transition: `transform 1.9s cubic-bezier(.6,0,.25,1) ${f.delay}, opacity .7s ease calc(${f.delay} + 1.3s)`,
          opacity: opening ? 0 : 1,
        }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: lace, backgroundSize: "96px 96px", backgroundPosition: "center", filter: `brightness(${f.shade})` }} />
        <svg aria-hidden className="absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {edges.map((e, i) => (
            <g key={i}>
              <path d={e.d} fill="none" stroke="#bda898" strokeWidth="1.6" transform="translate(.7 1)" />
              <path d={e.d} fill="none" stroke="#fbf7f2" strokeWidth="1.6" />
              {e.pearls.map(([px, py], j) => (
                <g key={j}>
                  <circle cx={px + 0.5} cy={py + 0.8} r="2.3" fill="#a8917f" opacity=".45" />
                  <circle cx={px} cy={py} r="2.3" fill="#fdfbf8" />
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div ref={ref} className="absolute inset-0 z-20 overflow-hidden" style={{ perspective: 1200, pointerEvents: opening ? "none" : "auto" }}>
      {flaps.map(flapEl)}

      {/* tulle X, gathered at the seal */}
      {[angle, -angle].map((deg) => (
        <div
          key={deg}
          className="dt-anim absolute left-1/2 top-1/2"
          style={{
            width: diag + 40,
            height: 150,
            marginLeft: -(diag + 40) / 2,
            marginTop: -75,
            transform: `rotate(${deg}deg)`,
            clipPath: "polygon(0 8%, 50% 40%, 100% 8%, 100% 92%, 50% 60%, 0 92%)",
            background:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,.5) 0px, rgba(255,255,255,.18) 6px, rgba(255,255,255,.62) 11px, rgba(250,245,240,.24) 17px)",
            boxShadow: "inset 0 0 18px rgba(255,255,255,.6)",
            backdropFilter: "blur(1.2px)",
            WebkitBackdropFilter: "blur(1.2px)",
            opacity: opening ? 0 : 0.95,
            transition: "opacity 1.1s ease .35s",
          }}
        />
      ))}

      {/* seal */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={onOpen}
          aria-label={label}
          className="dt-anim rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b79c78] focus-visible:ring-offset-4"
          style={{
            transform: opening ? `translateY(-${Math.round(h * 0.75)}px) rotate(-6deg)` : "none",
            transition: "transform 1.9s cubic-bezier(.6,0,.25,1), opacity 1s ease .7s",
            opacity: opening ? 0 : 1,
            animation: opening ? undefined : "dt-breathe 3.4s ease-in-out infinite",
          }}
        >
          <IvorySeal initials={initials} width={150} />
        </button>
        <p
          className="dt-anim"
          style={{
            marginTop: 20,
            fontFamily: FONT_HEADING,
            fontStyle: "italic",
            fontSize: 18,
            color: "#4f3f36",
            background: "rgba(251,247,242,.85)",
            padding: "4px 16px",
            borderRadius: 999,
            opacity: opening ? 0 : 1,
            transition: "opacity .3s ease",
            animation: opening ? undefined : "dt-hint 2.6s ease-in-out infinite",
          }}
        >
          {label}
        </p>
      </div>
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

  // ---------- Opening: lace veil with wax seal ----------
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const openInvitation = () => {
    if (opening) return;
    setOpening(true);
    audioRef.current?.play().catch(() => {});
    window.setTimeout(() => setOpened(true), 2400);
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

  const smallCaps: React.CSSProperties = {
    fontFamily: FONT_BODY,
    fontSize: 11,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
  };

  return (
    <div
      className="w-full min-h-screen overflow-x-clip"
      style={{
        backgroundColor: IVORY,
        color: INK,
        fontFamily: FONT_BODY,
        ...buildTemplateFontStyle("dentelle-lace", wedding.template_fonts),
      }}
      dir="ltr"
    >
      <style>{KEYFRAMES}</style>
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
          style={{ minHeight: "100svh", backgroundImage: embroideredLace(), backgroundSize: "96px 96px", backgroundPosition: "center" }}
        >
          <div className="relative mx-auto flex" style={{ minHeight: "100svh", maxWidth: 620, padding: "26px 24px" }}>
            {/* Cream panel with arched ends, edged in pearls */}
            <div
              className="relative w-full flex flex-col items-center justify-center text-center"
              style={{
                borderRadius: "50% / 17%",
                background: "radial-gradient(ellipse at 50% 40%, #fdfaf6 0%, #f8f2ec 70%, #f1e8e0 100%)",
                outline: "5px dotted #fbf8f4",
                outlineOffset: 5,
                boxShadow:
                  "0 0 0 1.5px #f7f0ea, 0 0 0 3px #cdbcae, 0 0 0 14px rgba(246,239,233,.55), 0 18px 40px -18px rgba(90,60,40,.45), inset 0 0 40px rgba(205,188,174,.35)",
                padding: "clamp(70px, 16vh, 120px) 26px",
                minHeight: "calc(100svh - 52px)",
              }}
            >
              <div
                style={{
                  opacity: opened || opening ? 1 : 0,
                  animation: opening || opened ? "dt-reveal 1.4s ease 1.2s both" : undefined,
                }}
                className="dt-anim flex flex-col items-center"
              >
                <p style={{ fontFamily: FONT_HEADING, fontSize: 17, lineHeight: 1.3, color: MUTED, maxWidth: 160 }}>
                  {t("dentelle.together", "Together with their families")}
                </p>
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
                <p style={{ fontFamily: FONT_HEADING, fontSize: 18, letterSpacing: "0.04em", color: INK, marginTop: 30 }}>
                  {isArabic ? longDate : numericDate}
                </p>
                <div className="flex justify-center" style={{ marginTop: 30 }}>
                  <Bow color={INK} width={86} />
                </div>
                {mainPlace?.location_name && (
                  <p style={{ fontFamily: FONT_HEADING, fontSize: 23, color: INK, lineHeight: 1.2, marginTop: 26 }}>
                    {getLocalizedValue(mainPlace === venue ? "venue_location" : "ceremony_location", mainPlace.location_name)}
                  </p>
                )}
                <div style={{ ...smallCaps, fontSize: 9.5, color: MUTED, marginTop: 8 }}>
                  <EditableField
                    fieldId="dentelle-city"
                    text={getFieldValue("dentelle-city", t("dentelle.city", "Beirut, Lebanon"))}
                    style={getFieldStyle("dentelle-city")}
                    onUpdate={onFieldUpdate}
                    isPreview={isPreview}
                    tag="span"
                    className=""
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lace envelope with tulle and wax seal — tap to open */}
          {!opened && (
            <LaceEnvelope
              initials={initials}
              opening={opening}
              onOpen={openInvitation}
              label={t("dentelle.tapToOpen", "Tap to open")}
            />
          )}
        </section>

        {/* ==================== INVITATION ==================== */}
        <section className="text-center" style={{ padding: "96px 24px 104px", maxWidth: 600, margin: "0 auto" }}>
          <div className="flex justify-center">
            <Bow color={WINE} width={112} />
          </div>
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
        </section>

        {/* ==================== COUNTDOWN ==================== */}
        <section style={{ background: WINE, color: BLUSH }}>
          <LaceEdge lace={IVORY} holeColor={WINE} outline="#e4d6cc" />
          <div className="text-center" style={{ padding: "64px 20px 70px" }}>
            <div className="flex justify-center">
              <Bow color="#e7aeb6" width={150} />
            </div>
            <div style={{ marginTop: 18 }}>{sectionTitle(t("dentelle.countdown", "Countdown"), "#fbeaea")}</div>
            <div
              className="flex justify-center"
              style={{ gap: "clamp(18px, 7vw, 48px)", marginTop: 26 }}
              dir="ltr"
            >
              {countdownUnits.map((u) => (
                <div key={u.label} style={{ minWidth: 52 }}>
                  <div style={{ fontFamily: FONT_COUNTDOWN, fontSize: "clamp(36px, 10vw, 54px)", lineHeight: 1, color: "#fff4f2" }}>
                    {u.value}
                  </div>
                  <div style={{ ...smallCaps, fontSize: 9, letterSpacing: "0.24em", color: "#dca7ae", marginTop: 10 }}>{u.label}</div>
                </div>
              ))}
            </div>
            <div aria-hidden className="flex items-center justify-center" style={{ marginTop: 34, gap: 10 }}>
              <span style={{ width: 54, height: 1, background: "#c98b94" }} />
              <span style={{ width: 5, height: 5, borderRadius: 999, background: "#e7aeb6" }} />
              <span style={{ width: 54, height: 1, background: "#c98b94" }} />
            </div>
          </div>
          <LaceEdge lace={IVORY} holeColor={WINE} outline="#e4d6cc" flip />
        </section>

        {/* ==================== LOCATION ==================== */}
        {placesWithDirections.length > 0 && (
          <section className="text-center" style={{ padding: "96px 24px 40px", maxWidth: 620, margin: "0 auto" }}>
            {sectionTitle(t("dentelle.location", "Location"))}
            <div className="flex flex-col" style={{ gap: 64, marginTop: 34 }}>
              {placesWithDirections.map((place: any) => {
                const isVenue = place === venue;
                const name = getLocalizedValue(isVenue ? "venue_location" : "ceremony_location", place.location_name || "");
                const note = place.note ? getLocalizedValue(isVenue ? "venue_note" : "ceremony_note", place.note) : "";
                return (
                  <div key={place.type} className="flex flex-col items-center">
                    {placesWithDirections.length > 1 && (
                      <p style={{ ...smallCaps, color: CHAMPAGNE }}>
                        {isVenue ? t("events.dinnerParty") : t("events.ceremony")}
                      </p>
                    )}
                    <p style={{ fontFamily: FONT_TITLE, fontSize: "clamp(40px, 11vw, 58px)", lineHeight: 1.15, color: INK, marginTop: 8 }}>
                      {name}
                    </p>
                    {note && (
                      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#4c4040", maxWidth: 440, marginTop: 14 }}>{note}</p>
                    )}
                    {/* Oval lace medallion — once, for the main place */}
                    {place === mainPlace && (
                    <div
                      style={{
                        marginTop: 30,
                        width: "min(66vw, 250px)",
                        aspectRatio: "3 / 4",
                        borderRadius: "50%",
                        border: `1px solid ${CHAMPAGNE}`,
                        padding: 6,
                        boxShadow: "0 24px 50px -34px rgba(90,40,40,.5)",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          border: `3px dotted ${LACE_LINE}`,
                          padding: 6,
                        }}
                      >
                        <div
                          className="flex items-center justify-center overflow-hidden"
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            border: `1px solid ${CHAMPAGNE}`,
                            backgroundImage: place.image_url ? undefined : lacePattern("#dccbc0", "#f6efe9"),
                          }}
                        >
                          {place.image_url ? (
                            <img src={place.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div
                              className="flex items-center justify-center rounded-full"
                              style={{ width: 92, height: 92, background: IVORY, border: `1px solid ${CHAMPAGNE}`, color: WINE }}
                            >
                              <EventIcon
                                icon={place.icon}
                                fallback={isVenue ? "solar:confetti-bold" : "material-symbols:church-rounded"}
                                className="w-10 h-10"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                    {place.location_link && (
                      <a
                        href={place.location_link}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:bg-[#5a1824] hover:text-white focus-visible:outline-none focus-visible:ring-2"
                        style={{
                          ...smallCaps,
                          marginTop: 30,
                          padding: "14px 30px",
                          border: `1px solid ${WINE}`,
                          borderRadius: 999,
                          color: WINE,
                          textDecoration: "none",
                        }}
                      >
                        {t("dentelle.getDirections", "Get directions")}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== THE DAY ==================== */}
        {dayEntries.length > 0 && (
          <section style={{ padding: "90px 22px 104px", maxWidth: 600, margin: "0 auto" }}>
            <div className="text-center">
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
            </div>

            <div className="relative" style={{ marginTop: 52 }}>
              {/* the line */}
              <div
                aria-hidden
                className="absolute top-2 bottom-2"
                style={{ insetInlineStart: "calc(42% - 0.5px)", width: 1, background: `linear-gradient(to bottom, transparent, ${CHAMPAGNE} 6%, ${CHAMPAGNE} 94%, transparent)` }}
              />
              <div className="flex flex-col" style={{ gap: 44 }}>
                {dayEntries.map((e) => (
                  <div key={e.key} className="relative grid items-start" style={{ gridTemplateColumns: "42% 58%" }}>
                    <div className="flex items-center justify-end" style={{ gap: 12, paddingInlineEnd: 20, paddingTop: 1 }}>
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
                      style={{ insetInlineStart: "calc(42% - 4px)", top: 11, width: 8, height: 8, background: WINE, boxShadow: `0 0 0 3px ${IVORY}` }}
                    />
                    <div style={{ paddingInlineStart: 20 }}>
                      <p style={{ ...smallCaps, fontSize: 12, color: INK, letterSpacing: "0.22em", paddingTop: 6 }}>{e.title}</p>
                      {e.place && (
                        <p style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 16, color: WINE, marginTop: 4 }}>{e.place}</p>
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
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==================== WEDDING GIFT ==================== */}
        {giftCards.length > 0 && (
          <section style={{ backgroundImage: lacePattern("#dccbc0", "#f4ece6") }}>
            <LaceEdge lace={IVORY} holeColor="#f4ece6" outline="#e4d6cc" />
            <div style={{ padding: "54px 20px 70px" }}>
              <div
                className="mx-auto text-center"
                style={{
                  maxWidth: 520,
                  background: "rgba(255,253,250,.94)",
                  border: `1px solid ${CHAMPAGNE}`,
                  outline: `3px dotted ${LACE_LINE}`,
                  outlineOffset: 6,
                  padding: "46px 22px 34px",
                }}
              >
                {sectionTitle(t("gifts.title", "Wedding Gift"))}
                <p style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 25, lineHeight: 1.3, color: WINE, marginTop: 16 }}>
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
                  <GiftCards giftCards={giftCards} />
                </div>
              </div>
            </div>
            <LaceEdge lace={IVORY} holeColor="#f4ece6" outline="#e4d6cc" flip />
          </section>
        )}

        {/* ==================== RSVP ==================== */}
        {(wedding.rsvp_deadline || invitees.length > 0) && (
          <section style={{ background: WINE }}>
            <LaceEdge lace={IVORY} holeColor={WINE} outline="#e4d6cc" />
            <div style={{ padding: "40px 16px 56px" }}>
              <div
                className="mx-auto"
                style={{ maxWidth: 760, background: IVORY, borderRadius: 4, border: `1px solid ${CHAMPAGNE}`, boxShadow: "0 30px 60px -30px rgba(0,0,0,.45)" }}
              >
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
                  cardBgClassName="bg-white"
                  accentColorClass="text-[#5a1824]"
                />
              </div>
            </div>
            <LaceEdge lace={IVORY} holeColor={WINE} outline="#e4d6cc" flip />
          </section>
        )}

        {/* ==================== CLOSING ==================== */}
        <section className="text-center" style={{ padding: "84px 24px 96px" }}>
          <div className="flex justify-center">
            <Rings color={INK} />
          </div>
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
        </section>

        <footer style={{ background: WINE_DEEP }}>
          <LaceEdge lace={IVORY} holeColor={WINE_DEEP} outline="#e4d6cc" />
          <div style={{ padding: "26px 20px 34px", textAlign: "center", color: "#d9aab1", ...smallCaps, fontSize: 9 }}>
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
