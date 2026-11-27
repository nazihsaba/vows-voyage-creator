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
} from "@/components/templates/reverie/ReverieEffects";
import { ChapelArt, GiftArt, LoveLetterArt, PocketWatchArt, QuillArt, ToastArt } from "./reverie/ReverieOrnaments";

/**
 * Rêverie (formerly Dentelle) — romantic lace invitation.
 * Opens on mocha with an ivory envelope sealed in gold; tapping flies into it and
 * onto an ivory invitation card with a gold border. Then mocha bands with a fine
 * lace trim, and a vertical "The Day" timeline built from the events.
 */

interface ReverieTemplateProps {
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

// ---------- Opening & first section: ivory, mocha and champagne gold ----------
const HERO_INK = "#4a352e"; // names
const HERO_TEXT = "#8a6f63"; // small lettering
const GOLD = "#c4a274"; // fine gold lines
const GOLD_LIGHT = "#e3cfa8"; // gold on mocha
const OPENING_BG = "radial-gradient(120% 90% at 50% 16%, #7c5f53 0%, #5b443b 50%, #3c2c26 100%)";
const HERO_BG = "linear-gradient(180deg, #fcf8f2 0%, #f6eee4 58%, #faf6f1 100%)";

// Opening timeline (ms after the tap): the lettering fades and the seal cracks (0–550), the flap
// swings open (from 380), the card slides out (from 900), the view flies into the card (from 1500,
// 1.3s) and the opening fades away (from 2450). The first section's text rises as it fades.
const OPEN_FLAP_AT = 380;
const OPEN_CARD_AT = 900;
const OPEN_ZOOM_AT = 1500;
const OPEN_FADE_AT = 2450;
const OPENING_DONE_MS = 3050;
const HERO_REVEAL_S = 2.35;

/** Soft drifting light: three glows moving slowly. "night" for the mocha opening, "day" for ivory. */
const DreamLight = ({ tone = "day", strength = 1 }: { tone?: "day" | "night"; strength?: number }) => {
  const glows =
    tone === "night"
      ? ["rgba(227,207,168,.20)", "rgba(196,150,120,.16)", "rgba(255,232,196,.14)"]
      : ["rgba(236,216,186,.55)", "rgba(240,222,208,.5)", "rgba(255,247,230,.75)"];
  return (
    <span aria-hidden className="absolute inset-0 block overflow-hidden pointer-events-none">
      {[
        { s: "70vmax", x: "-22%", y: "-18%", a: "rv-drift1 22s" },
        { s: "62vmax", x: "48%", y: "46%", a: "rv-drift2 26s" },
        { s: "52vmax", x: "26%", y: "-20%", a: "rv-drift3 19s" },
      ].map((o, i) => (
        <span
          key={o.a}
          className="dt-anim absolute block rounded-full"
          style={{
            left: o.x,
            top: o.y,
            width: o.s,
            height: o.s,
            opacity: strength,
            background: `radial-gradient(circle, ${glows[i]} 0%, rgba(255,255,255,0) 68%)`,
            animation: `${o.a} ease-in-out infinite alternate`,
          }}
        />
      ))}
      <span className="absolute inset-0 block" style={{ backgroundImage: grain(tone === "night" ? 0.3 : 0.2), backgroundSize: "180px 180px", opacity: 0.45 }} />
    </span>
  );
};

/** A rounded rectangle filling a w×h box, inset by d. */
const framePath = (w: number, h: number, d: number, r = 4) =>
  `M${d + r} ${d} H${w - d - r} Q${w - d} ${d} ${w - d} ${d + r} V${h - d - r} Q${w - d} ${h - d} ${w - d - r} ${h - d} H${d + r} Q${d} ${h - d} ${d} ${h - d - r} V${d + r} Q${d} ${d} ${d + r} ${d} Z`;

/** Width and height of an element, kept up to date. */
function useBoxSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** A fine double gold border that draws itself, with a small star at the top. */
const FrameOutline = ({ w, h, draw, delay = 0 }: { w: number; h: number; draw: boolean; delay?: number }) => {
  if (!w || !h) return null;
  const line = (d: number, width: number, extra: number, opacity = 1) => (
    <path
      d={framePath(w, h, d)}
      fill="none"
      stroke={GOLD}
      strokeWidth={width}
      opacity={opacity}
      pathLength={1}
      strokeDasharray="1 1"
      className="dt-anim"
      style={{ strokeDashoffset: draw ? 0 : 1, transition: `stroke-dashoffset 1.9s cubic-bezier(.45,0,.2,1) ${delay + extra}s` }}
    />
  );
  const sx = w / 2;
  const sy = 14;
  const star = `M${sx} ${sy - 6} Q${sx} ${sy} ${sx + 6} ${sy} Q${sx} ${sy} ${sx} ${sy + 6} Q${sx} ${sy} ${sx - 6} ${sy} Q${sx} ${sy} ${sx} ${sy - 6} Z`;
  return (
    <svg aria-hidden className="absolute inset-0 pointer-events-none" width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      {line(14, 1.1, 0)}
      {line(19, 0.6, 0.12, 0.75)}
      <rect x={sx - 10} y={sy - 4} width={20} height={8} fill="#fffdf9" className="dt-anim" style={{ opacity: draw ? 1 : 0, transition: `opacity .6s ease ${delay + 1.1}s` }} />
      <path
        d={star}
        fill={GOLD}
        className="dt-anim"
        style={{ opacity: draw ? 1 : 0, transform: draw ? "scale(1)" : "scale(.4)", transformOrigin: `${sx}px ${sy}px`, transition: `opacity .8s ease ${delay + 1.2}s, transform .8s cubic-bezier(.2,.7,.2,1.4) ${delay + 1.2}s` }}
      />
    </svg>
  );
};

/**
 * A real-looking gold wax seal: an irregular spilled edge with small drips, a raised rim squeezed
 * out by the stamp, a pressed well with an embossed laurel and the initials, a soft wax texture,
 * a glossy highlight and a shadow on the paper. When `cracked`, it splits in two and falls away.
 */
const RealWaxSeal = ({ groomInitial, brideInitial, shown, cracked }: { groomInitial: string; brideInitial: string; shown: boolean; cracked: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const edge = useMemo(() => {
    const drips = [
      { a: 0.75, amp: 0.12, w: 0.2 },
      { a: 2.55, amp: 0.09, w: 0.16 },
      { a: 4.35, amp: 0.14, w: 0.22 },
      { a: 5.45, amp: 0.06, w: 0.14 },
    ];
    const pts: string[] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      let wob = 1 + Math.sin(a * 7 + 0.4) * 0.03 + Math.sin(a * 3 + 1.3) * 0.028 + Math.cos(a * 13) * 0.012;
      for (const d of drips) {
        const da = Math.atan2(Math.sin(a - d.a), Math.cos(a - d.a));
        wob += d.amp * Math.exp(-(da * da) / (2 * d.w * d.w));
      }
      pts.push(`${(60 + Math.cos(a) * 44 * wob).toFixed(2)} ${(60 + Math.sin(a) * 44 * wob).toFixed(2)}`);
    }
    return `M${pts.join(" L")} Z`;
  }, []);
  const leaves = useMemo(() => {
    let d = "";
    for (const side of [-1, 1]) {
      for (let k = 0; k < 6; k++) {
        const a = Math.PI / 2 + side * (0.42 + k * 0.33);
        const x = 60 + Math.cos(a) * 27;
        const y = 60 + Math.sin(a) * 27;
        const ta = a + side * (Math.PI / 2) + side * 0.6;
        const len = 6.2 - k * 0.35;
        const ex = x + Math.cos(ta) * len;
        const ey = y + Math.sin(ta) * len;
        const qx = -Math.sin(ta) * len * 0.36;
        const qy = Math.cos(ta) * len * 0.36;
        const mx = (x + ex) / 2;
        const my = (y + ey) / 2;
        d += `M${x.toFixed(1)} ${y.toFixed(1)} Q${(mx + qx).toFixed(1)} ${(my + qy).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(mx - qx).toFixed(1)} ${(my - qy).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
    }
    return d;
  }, []);
  // a jagged crack down the middle
  const crack = "60 -4, 56 16, 63 33, 57 50, 64 66, 58 84, 63 102, 60 124";
  const emboss = (node: (dx: number, dy: number, fill: string, op: number) => React.ReactNode) => (
    <>
      {node(0.7, 0.9, "#fff1cf", 0.8)}
      {node(-0.6, -0.8, "#5e4019", 0.55)}
      {node(0, 0, "#a9813f", 1)}
    </>
  );
  const body = (
    <>
      <path d={edge} fill={`url(#${uid}-wax)`} filter={`url(#${uid}-tex)`} />
      <path d={edge} fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="1.6" opacity="0.75" />
      {/* the rim the stamp squeezed out: lit at the top left, in shade at the bottom right */}
      <circle cx="60" cy="60" r="37.5" fill="none" stroke={`url(#${uid}-rim)`} strokeWidth="6" />
      <circle cx="60" cy="60" r="34.2" fill={`url(#${uid}-well)`} />
      <circle cx="60.6" cy="60.8" r="34.2" fill="none" stroke="#5b3e17" strokeWidth="1.4" opacity="0.35" />
      <circle cx="60" cy="60" r="30.5" fill="none" stroke="#e9cf98" strokeWidth="0.5" opacity="0.6" />
      {emboss((dx, dy, fill, op) => (
        <path d={leaves} transform={`translate(${dx} ${dy})`} fill={fill} opacity={op} />
      ))}
      {emboss((dx, dy, fill, op) => (
        <text
          x={60 + dx}
          y={66 + dy}
          textAnchor="middle"
          fill={fill}
          opacity={op}
          style={{ fontFamily: FONT_HEADING, letterSpacing: "0.02em" }}
          fontSize="19"
          fontWeight={600}
        >
          {groomInitial}
          <tspan fontSize="11" fontStyle="italic" dx="1.5" dy="-1">&amp;</tspan>
          <tspan dx="1.5" dy="1">{brideInitial}</tspan>
        </text>
      ))}
      {/* gloss */}
      <ellipse cx="41" cy="34" rx="15" ry="6.5" fill="#fff" opacity="0.32" transform="rotate(-38 41 34)" filter={`url(#${uid}-soft)`} />
      <ellipse cx="37" cy="31" rx="4" ry="1.6" fill="#fff" opacity="0.7" transform="rotate(-38 37 31)" />
      <path d="M86 78 Q92 70 92 58" fill="none" stroke="#fff4d6" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
    </>
  );
  const half = (side: "l" | "r") => (
    <g
      clipPath={`url(#${uid}-${side})`}
      className="dt-anim"
      style={{
        transformBox: "fill-box",
        transformOrigin: "center",
        transform: cracked ? (side === "l" ? "translate(-7px, 6px) rotate(-9deg)" : "translate(8px, 5px) rotate(11deg)") : "none",
        opacity: cracked ? 0 : 1,
        transition: "transform .65s cubic-bezier(.3,0,.4,1), opacity .4s ease .35s",
      }}
    >
      <use href={`#${uid}-body`} />
    </g>
  );
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden style={{ overflow: "visible", display: "block" }}>
      <defs>
        <radialGradient id={`${uid}-wax`} cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#f6e1ae" />
          <stop offset="0.35" stopColor="#d9b06e" />
          <stop offset="0.72" stopColor="#b58644" />
          <stop offset="1" stopColor="#7f5927" />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="0.15" y1="0.1" x2="0.85" y2="0.9">
          <stop offset="0" stopColor="#f8e5b6" />
          <stop offset="0.5" stopColor="#c99c58" />
          <stop offset="1" stopColor="#6f4d21" />
        </linearGradient>
        <radialGradient id={`${uid}-well`} cx="62%" cy="66%" r="72%">
          <stop offset="0" stopColor="#d6ad6a" />
          <stop offset="1" stopColor="#a47a3c" />
        </radialGradient>
        {/* wax surface: soft bumps lit from the top left */}
        <filter id={`${uid}-tex`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="11" result="n" />
          <feDiffuseLighting in="n" surfaceScale="2.2" diffuseConstant="1" lightingColor="#ffffff" result="l">
            <feDistantLight azimuth="225" elevation="58" />
          </feDiffuseLighting>
          <feComponentTransfer in="l" result="lb">
            <feFuncR type="linear" slope="1.12" intercept="0.02" />
            <feFuncG type="linear" slope="1.12" intercept="0.02" />
            <feFuncB type="linear" slope="1.12" intercept="0.02" />
          </feComponentTransfer>
          <feComposite in="lb" in2="SourceAlpha" operator="in" result="lc" />
          <feBlend in="SourceGraphic" in2="lc" mode="multiply" />
        </filter>
        <filter id={`${uid}-soft`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0.6" dy="2.4" stdDeviation="2.2" floodColor="#2c1d10" floodOpacity="0.42" />
        </filter>
        <clipPath id={`${uid}-l`}>
          <polygon points={`-10 -10, ${crack}, -10 130`} />
        </clipPath>
        <clipPath id={`${uid}-r`}>
          <polygon points={`130 -10, ${crack}, 130 130`} />
        </clipPath>
        <g id={`${uid}-body`}>{body}</g>
      </defs>
      <g
        className="dt-anim"
        filter={`url(#${uid}-shadow)`}
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          opacity: shown ? 1 : 0,
          transform: shown ? "scale(1)" : "scale(.55)",
          transition: "opacity .6s ease 1s, transform .7s cubic-bezier(.2,.7,.25,1.3) 1s",
        }}
      >
        {half("l")}
        {half("r")}
      </g>
    </svg>
  );
};

/**
 * A modern ivory envelope that opens: folded flaps with soft shading, a gold-lined top flap with a
 * gold-patterned lining inside, the invitation card tucked in it, and a gold wax seal on the flap.
 * Each part is its own layer so the flap can swing open in 3D and the card can slide out.
 */
const OpeningEnvelope = ({
  shown,
  stage,
  groomInitial,
  brideInitial,
  names,
  cardRef,
}: {
  shown: boolean;
  /** 0 sealed · 1 seal cracks · 2 flap opens · 3 flap behind the card · 4 card slides out */
  stage: number;
  groomInitial: string;
  brideInitial: string;
  names: string;
  cardRef: React.RefObject<HTMLSpanElement>;
}) => {
  const uid = useId().replace(/:/g, "");
  const FLAP_H = 134; // the flap's depth in the 300×210 envelope
  const flapPct = `${(FLAP_H / 210) * 100}%`;
  const layer: React.CSSProperties = { position: "absolute", left: 0, width: "100%" };
  const ease = "cubic-bezier(.55,0,.25,1)";
  return (
    <span className="absolute inset-0 block" style={{ perspective: 1100 }}>
      {/* inside of the envelope */}
      <svg viewBox="0 0 300 210" width="100%" height="100%" aria-hidden style={{ ...layer, top: 0, zIndex: 1, display: "block" }}>
        <defs>
          <linearGradient id={`${uid}-inside`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6d9c7" />
            <stop offset="1" stopColor="#efe5d6" />
          </linearGradient>
        </defs>
        <rect width="300" height="210" rx="5" fill={`url(#${uid}-inside)`} />
      </svg>

      {/* top flap: outside ivory with a gold lining along its edge; inside a gold-patterned liner */}
      <span
        aria-hidden
        className="dt-anim block"
        style={{
          ...layer,
          top: 0,
          height: "100%",
          zIndex: stage >= 3 ? 2 : 5,
          transformOrigin: "50% 0",
          transformStyle: "preserve-3d",
          transform: stage >= 2 ? "rotateX(180deg)" : "rotateX(0deg)",
          transition: `transform .85s ${ease}`,
        }}
      >
        <svg viewBox={`0 0 300 ${FLAP_H}`} aria-hidden style={{ ...layer, top: 0, height: flapPct, overflow: "visible", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
          <defs>
            <linearGradient id={`${uid}-flap`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fbf6ef" />
              <stop offset="1" stopColor="#f3eadf" />
            </linearGradient>
            <filter id={`${uid}-fblur`} x="-10%" y="-20%" width="120%" height="160%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
          </defs>
          <path d="M0 0 H300 L162 122 Q150 132 138 122 Z" fill="rgba(60,40,30,.28)" filter={`url(#${uid}-fblur)`} transform="translate(0 3)" />
          <path d="M0 0 H300 L162 122 Q150 132 138 122 Z" fill={`url(#${uid}-flap)`} />
          <path
            d="M10 6 L144 114 Q150 119 156 114 L290 6"
            fill="none"
            stroke={GOLD}
            strokeWidth="1.3"
            pathLength={1}
            strokeDasharray="1 1"
            className="dt-anim"
            style={{ strokeDashoffset: shown ? 0 : 1, transition: "stroke-dashoffset 1.8s cubic-bezier(.45,0,.2,1) .5s" }}
          />
        </svg>
        <svg
          viewBox={`0 0 300 ${FLAP_H}`}
          aria-hidden
          style={{
            ...layer,
            top: `-${flapPct}`,
            height: flapPct,
            overflow: "visible",
            transformOrigin: "50% 100%",
            transform: "rotateX(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <defs>
            <linearGradient id={`${uid}-liner`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#d9bd8c" />
              <stop offset="1" stopColor="#c49f68" />
            </linearGradient>
            <pattern id={`${uid}-dots`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <circle cx="5" cy="5" r="1.1" fill="#f3e2bd" opacity="0.55" />
            </pattern>
          </defs>
          <path d={`M0 ${FLAP_H} H300 L162 12 Q150 2 138 12 Z`} fill={`url(#${uid}-liner)`} />
          <path d={`M0 ${FLAP_H} H300 L162 12 Q150 2 138 12 Z`} fill={`url(#${uid}-dots)`} />
          <path d={`M8 ${FLAP_H - 5} L146 18 Q150 13 154 18 L292 ${FLAP_H - 5}`} fill="none" stroke="#f6e7c6" strokeWidth="0.9" opacity="0.8" />
        </svg>
      </span>

      {/* the invitation card, tucked inside */}
      <span
        ref={cardRef}
        aria-hidden
        className="dt-anim block text-center"
        style={{
          position: "absolute",
          left: "7%",
          width: "86%",
          top: "9%",
          height: "80%",
          zIndex: 3,
          borderRadius: 3,
          background: "linear-gradient(180deg, #fffdf9 0%, #fbf6ee 100%)",
          boxShadow: "0 1px 2px rgba(60,40,30,.12), 0 10px 20px -12px rgba(60,40,30,.35)",
          transform: stage >= 4 ? "translateY(-56%)" : "none",
          transition: `transform .8s ${ease}`,
        }}
      >
        <span className="absolute block" style={{ inset: "5%", border: `1px solid ${GOLD}`, borderRadius: 2 }} />
        <span className="absolute block" style={{ inset: "7.5%", border: `0.5px solid ${GOLD}`, opacity: 0.6, borderRadius: 1 }} />
        <span
          className="dt-anim absolute inset-x-0 block"
          style={{ top: "20%", fontFamily: FONT_TITLE, color: HERO_INK, fontSize: "clamp(18px, 5.6vw, 26px)", lineHeight: 1.1, opacity: stage >= 5 ? 0 : 1, transition: "opacity .3s ease" }}
        >
          {names}
        </span>
      </span>

      {/* front pocket: side flaps under the bottom flap */}
      <svg viewBox="0 0 300 210" width="100%" height="100%" aria-hidden style={{ ...layer, top: 0, zIndex: 4, display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f1e8db" />
            <stop offset="1" stopColor="#e8dccc" />
          </linearGradient>
          <linearGradient id={`${uid}-sideR`} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#efe5d8" />
            <stop offset="1" stopColor="#e6d9c8" />
          </linearGradient>
          <linearGradient id={`${uid}-bottom`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbf6ee" />
            <stop offset="1" stopColor="#f0e6d8" />
          </linearGradient>
          <filter id={`${uid}-pblur`} x="-10%" y="-20%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
        <path d="M0 0 L150 112 L0 210 Z" fill={`url(#${uid}-side)`} />
        <path d="M300 0 L150 112 L300 210 Z" fill={`url(#${uid}-sideR)`} />
        <path d="M0 210 L150 98 L300 210 Z" fill="rgba(70,48,38,.16)" filter={`url(#${uid}-pblur)`} transform="translate(0 -2)" />
        <path d="M0 210 L150 98 L300 210 Z" fill={`url(#${uid}-bottom)`} />
        <path d="M2 208 L150 99 L298 208" fill="none" stroke="#fffdf8" strokeWidth="1" opacity="0.85" />
        <path d="M0 1 L150 112 L300 1" fill="none" stroke="#fffdf8" strokeWidth="0.8" opacity="0.6" />
      </svg>

      {/* the wax seal, on the tip of the flap */}
      <span
        className="absolute block"
        style={{ left: "50%", top: `${(126 / 210) * 100}%`, width: "31%", aspectRatio: "1", transform: "translate(-50%, -50%)", zIndex: 6 }}
      >
        <RealWaxSeal groomInitial={groomInitial} brideInitial={brideInitial} shown={shown} cracked={stage >= 1} />
      </span>
    </span>
  );
};

/**
 * The opening screen: mocha with a soft gold light and an ivory envelope sealed with gold wax.
 * Tapping cracks the seal, opens the flap, slides the card out, then flies into the card.
 */
const Opening = ({
  opening,
  onOpen,
  label,
  groomInitial,
  brideInitial,
  names,
  dateText,
}: {
  opening: boolean;
  onOpen: () => void;
  label: string;
  groomInitial: string;
  brideInitial: string;
  names: string;
  dateText: string;
}) => {
  const reduced = prefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLSpanElement>(null);
  // envelope stages (see OpeningEnvelope), then 5 into the card · 6 fading away
  const [stage, setStage] = useState(0);
  const [shown, setShown] = useState(false);
  const [zoom, setZoom] = useState({ origin: "50% 45%", scale: 10 });
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    if (!opening) return;
    if (reduced) {
      setStage(6);
      return;
    }
    const timers = [
      window.setTimeout(() => setStage(1), 0),
      window.setTimeout(() => setStage(2), OPEN_FLAP_AT),
      window.setTimeout(() => setStage(3), OPEN_FLAP_AT + 430),
      window.setTimeout(() => setStage(4), OPEN_CARD_AT),
      window.setTimeout(() => {
        // fly into the part of the card that is out of the envelope, far enough to fill the screen
        const root = rootRef.current;
        const c = cardRef.current;
        if (root && c) {
          const r = root.getBoundingClientRect();
          const b = c.getBoundingClientRect();
          setZoom({
            origin: `${b.left - r.left + b.width / 2}px ${b.top - r.top + b.height * 0.24}px`,
            scale: 2.6 * Math.max(r.width / b.width, r.height / (b.height * 0.5)) + 1,
          });
        }
        setStage(5);
      }, OPEN_ZOOM_AT),
      window.setTimeout(() => setStage(6), OPEN_FADE_AT),
    ];
    return () => timers.forEach(clearTimeout);
  }, [opening, reduced]);

  // each line rises in on arrival, and drops away when tapped
  const rise = (delay: number): React.CSSProperties => {
    const visible = shown && stage === 0;
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : stage > 0 ? "translateY(8px)" : "translateY(14px)",
      transition: stage > 0 ? "opacity .35s ease, transform .35s ease" : `opacity 1s ease ${delay}s, transform 1.1s cubic-bezier(.2,.7,.2,1) ${delay}s`,
    };
  };

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-20 overflow-hidden"
      style={{ opacity: stage >= 6 ? 0 : 1, transition: `opacity ${reduced ? ".45s" : ".6s"} ease`, pointerEvents: opening ? "none" : "auto" }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={label}
        className="absolute inset-0 block focus-visible:outline-none"
        style={{ width: "100%", height: "100%", background: "none", border: 0, padding: 0, cursor: "pointer" }}
      >
        <span
          className="dt-anim absolute inset-0 block"
          style={{
            background: OPENING_BG,
            transformOrigin: zoom.origin,
            transform: stage >= 5 ? `scale(${zoom.scale})` : "scale(1)",
            transition: "transform 1.3s cubic-bezier(.66,0,.18,1)",
          }}
        >
          <DreamLight tone="night" />
          <span className="absolute inset-0 flex flex-col items-center justify-center" style={{ padding: "40px 24px" }}>
            <span
              className="dt-anim relative block"
              style={{
                width: "min(80vw, 60vh, 380px)",
                aspectRatio: "300 / 210",
                marginTop: "10vh",
                filter: stage >= 5 ? "none" : "drop-shadow(0 26px 34px rgba(20,12,8,.45)) drop-shadow(0 4px 8px rgba(20,12,8,.25))",
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : "translateY(18px) scale(.96)",
                transition: "opacity 1s ease, transform 1.3s cubic-bezier(.2,.7,.2,1)",
              }}
            >
              <OpeningEnvelope shown={shown} stage={stage} groomInitial={groomInitial} brideInitial={brideInitial} names={names} cardRef={cardRef} />
            </span>
            <span className="block" style={{ ...SMALL_CAPS, fontSize: 12, letterSpacing: "0.36em", color: "#f6ecdf", marginTop: 46, ...rise(1) }}>
              {names}
            </span>
            <span className="block" style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 17, letterSpacing: "0.12em", color: GOLD_LIGHT, marginTop: 10, ...rise(1.15) }}>
              {dateText}
            </span>
            <span className="relative inline-flex items-center justify-center" style={{ marginTop: 44, ...rise(1.4) }}>
              <span
                aria-hidden
                className="dt-anim absolute rounded-full"
                style={{ inset: -6, border: `1px solid ${GOLD_LIGHT}`, animation: "rv-ring 2.4s ease-out infinite" }}
              />
              <span
                className="rounded-full"
                style={{
                  ...SMALL_CAPS,
                  fontSize: 10.5,
                  letterSpacing: "0.32em",
                  color: "#f6ecdf",
                  padding: "11px 24px",
                  border: "1px solid rgba(227,207,168,.45)",
                  background: "rgba(255,255,255,.08)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                {label}
              </span>
            </span>
          </span>
        </span>
      </button>
    </div>
  );
};

/**
 * Gift details for Rêverie: each provider's name in small caps, the number set
 * in the heading serif, and a small copy pill, separated by a fine ornament.
 */
const ReverieGiftCards = ({ giftCards }: { giftCards: Array<{ id: string; card_name: string; card_number: string }> }) => {
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
              aria-label={`${t("reverie.copy", "Copy")} ${card.card_name}`}
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
              <span aria-live="polite">{copied ? t("reverie.copied", "Copied") : t("reverie.copy", "Copy")}</span>
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
@keyframes rv-drift1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(9vw, 7vh) scale(1.12); } }
@keyframes rv-drift2 { from { transform: translate(0, 0) scale(1.05); } to { transform: translate(-10vw, -6vh) scale(.94); } }
@keyframes rv-drift3 { from { transform: translate(0, 0) scale(.95); } to { transform: translate(6vw, 9vh) scale(1.1); } }
@keyframes rv-ring { 0% { opacity: .75; transform: scale(.92); } 100% { opacity: 0; transform: scale(1.3); } }
@keyframes rv-rise { from { opacity: 0; transform: translateY(16px); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
@keyframes rv-cue { 0% { transform: scaleY(0); transform-origin: top; } 48% { transform: scaleY(1); transform-origin: top; } 52% { transform: scaleY(1); transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }
@media (prefers-reduced-motion: reduce) {
  .dt-anim { animation: none !important; transition: opacity .4s ease !important; transform: none !important; }
}
`;

export const ReverieTemplate = ({
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
}: ReverieTemplateProps) => {
  const { t } = useTranslation();
  const { isArabic, hasArabic, arabicOnly, getLocalizedValue, formatFamily, giftMessage } = useArabicContent(wedding);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ceremony = locations.find((l) => l.type === "ceremony");
  const venue = locations.find((l) => l.type === "venue");
  const welcomeDrink = locations.find((l) => l.type === "welcome_drink");
  const mainPlace = venue || ceremony;

  const groomName = getLocalizedValue("groom_name", wedding.groom_name || "");
  const brideName = getLocalizedValue("bride_name", wedding.bride_name || "");
  const groomInitialLetter = (wedding.groom_name || "A").trim().charAt(0).toUpperCase();
  const brideInitialLetter = (wedding.bride_name || "A").trim().charAt(0).toUpperCase();
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

  // ---------- Opening: fly through the arch into the invitation ----------
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);
  const heroPetals = useRef<PetalsHandle>(null);
  const reducedMotion = prefersReducedMotion();
  const openInvitation = () => {
    if (opening) return;
    setOpening(true);
    audioRef.current?.play().catch(() => {});
    if (!reducedMotion) window.setTimeout(() => heroPetals.current?.burst(undefined, undefined, 36), OPEN_FADE_AT);
    // keep the opening screen until the view has gone through the arch (see Opening's timeline)
    window.setTimeout(() => setOpened(true), reducedMotion ? 600 : OPENING_DONE_MS);
  };
  // The first section's lines rise in one after another as the opening fades away.
  const heroIn = (i: number): React.CSSProperties =>
    reducedMotion
      ? {}
      : { opacity: 0, animation: opening || opened ? `rv-rise 1.1s cubic-bezier(.2,.7,.2,1) ${(HERO_REVEAL_S + i * 0.14).toFixed(2)}s both` : undefined };
  const [heroArchRef, heroArch] = useBoxSize<HTMLDivElement>();
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
      note: t("reverie.ceremonyNote", "We say “I do” surrounded by the people we love."),
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
      note: t("reverie.welcomeNote", "Drinks and warm hugs as the evening begins."),
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
      note: t("reverie.venueNote", "Dinner, toasts and dancing until late."),
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
        <section className="relative overflow-hidden" style={{ minHeight: "100svh", background: HERO_BG }}>
          <DreamLight tone="day" strength={0.8} />
          <Petals ref={heroPetals} ambient={12} active={opened} />
          <div className="relative mx-auto flex flex-col items-center justify-center" style={{ minHeight: "100svh", padding: "56px 22px 64px" }}>
            {/* the invitation card, just out of the envelope, with a fine gold double border */}
            <div ref={heroArchRef} className="relative" style={{ width: "min(86vw, 430px)" }}>
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  borderRadius: 6,
                  background: "linear-gradient(180deg, #fffdf9 0%, #fbf6ee 100%)",
                  boxShadow: "0 40px 70px -44px rgba(79,59,52,.45), 0 2px 8px rgba(79,59,52,.06)",
                  ...heroIn(0),
                }}
              />
              <FrameOutline w={heroArch.w} h={heroArch.h} draw={reducedMotion || opening || opened} delay={reducedMotion ? 0 : HERO_REVEAL_S - 0.1} />
              <div className="relative flex flex-col items-center text-center" style={{ padding: "clamp(84px, 14vh, 120px) 26px clamp(70px, 11vh, 100px)" }}>
                <p style={{ ...SMALL_CAPS, fontSize: 10.5, letterSpacing: "0.34em", lineHeight: 1.9, color: HERO_TEXT, maxWidth: 230, ...heroIn(1) }}>
                  {t("reverie.together", "Together with their families")}
                </p>
                <HeartTap color="#b98a7e">
                  <div style={{ fontFamily: FONT_TITLE, fontSize: "clamp(56px, 16vw, 92px)", lineHeight: 1.04, color: HERO_INK, marginTop: 28, ...heroIn(2) }}>
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
                  <div style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 22, color: GOLD, margin: "2px 0", ...heroIn(3) }}>&amp;</div>
                  <div style={{ fontFamily: FONT_TITLE, fontSize: "clamp(56px, 16vw, 92px)", lineHeight: 1.04, color: HERO_INK, ...heroIn(4) }}>
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
                <div className="flex items-center justify-center" style={{ gap: 14, marginTop: 32, ...heroIn(5) }}>
                  <span style={{ width: 34, height: 1, background: GOLD, opacity: 0.75 }} />
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 19, letterSpacing: "0.16em", color: HERO_INK }} dir="ltr">
                    {isArabic ? longDate : numericDate.replace(/\./g, " · ")}
                  </span>
                  <span style={{ width: 34, height: 1, background: GOLD, opacity: 0.75 }} />
                </div>
              </div>
            </div>
            {/* scroll cue */}
            <div className="flex flex-col items-center" style={{ marginTop: 30, ...heroIn(7) }}>
              <span style={{ ...SMALL_CAPS, fontSize: 9.5, letterSpacing: "0.4em", color: HERO_TEXT }}>{t("reverie.scroll", "Scroll")}</span>
              <span className="dt-anim block" style={{ width: 1, height: 34, marginTop: 10, background: GOLD, animation: "rv-cue 2.2s ease-in-out infinite" }} />
            </div>
          </div>

          {/* Opening: an ivory envelope sealed with gold wax — tap to open it and fly into the card */}
          {!opened && (
            <Opening
              opening={opening}
              onOpen={openInvitation}
              label={t("reverie.tapToOpen", "Tap to open")}
              groomInitial={groomInitialLetter}
              brideInitial={brideInitialLetter}
              names={`${groomName} & ${brideName}`}
              dateText={isArabic ? longDate : numericDate.replace(/\./g, " · ")}
            />
          )}
        </section>

        {/* ==================== INVITATION ==================== */}
        <section className="text-center" style={{ padding: "96px 24px 104px", maxWidth: 600, margin: "0 auto" }}>
          <DrawOnView className="flex justify-center" duration={1500} style={{ ["--dt-step" as string]: "70ms" }}>
            <LoveLetterArt color={COCOA} />
          </DrawOnView>
          <Reveal delay={150}>
          <div style={{ marginTop: 22, fontFamily: FONT_HEADING, fontSize: 30, lineHeight: 1.2, color: INK }}>
            {t("reverie.together", "Together with their families")}
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
            <DrawOnView className="flex justify-center" duration={1500} style={{ ["--dt-step" as string]: "70ms" }}>
              <PocketWatchArt color={BAND_ACCENT} />
            </DrawOnView>
            <div style={{ marginTop: 18 }}>{sectionTitle(t("reverie.countdown", "Countdown"), BAND_TITLE)}</div>
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
            <DrawOnView className="flex justify-center" duration={1500} style={{ ["--dt-step" as string]: "70ms", marginBottom: 18 }}>
              <ChapelArt color={COCOA} />
            </DrawOnView>
            {sectionTitle(t("reverie.location", "Location"))}
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
                        {t("reverie.getDirections", "Get directions")}
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
            <DrawOnView className="flex justify-center" duration={1500} style={{ ["--dt-step" as string]: "70ms", marginBottom: 18 }}>
              <ToastArt color={COCOA} />
            </DrawOnView>
            <Reveal className="text-center">
              {sectionTitle(t("reverie.theDay", "The Day"))}
              <div style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.65, color: MUTED }}>
                <EditableField
                  fieldId="dentelle-day-subtitle"
                  text={getFieldValue(
                    "dentelle-day-subtitle",
                    t("reverie.theDaySubtitle", "A day to celebrate,\nfrom the first hello to the last dance."),
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
                <DrawOnView className="flex justify-center" duration={1500} style={{ ["--dt-step" as string]: "70ms", marginBottom: 16 }}>
                  <GiftArt color={COCOA} />
                </DrawOnView>
                {sectionTitle(t("gifts.title", "Wedding Gift"))}
                {giftMessage ? (
                  // the couple's own sentence, set in the form
                  <p
                    className="whitespace-pre-line"
                    style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 21, lineHeight: 1.4, color: COCOA, marginTop: 16, maxWidth: 420, marginInline: "auto" }}
                  >
                    {giftMessage}
                  </p>
                ) : (
                  <>
                  <p style={{ fontFamily: FONT_HEADING, fontStyle: "italic", fontSize: 25, lineHeight: 1.3, color: COCOA, marginTop: 16 }}>
                    {t("reverie.giftLead", "Your presence is our greatest gift.")}
                  </p>
                  <div style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: "#4c4040", maxWidth: 400, marginInline: "auto" }}>
                    <EditableField
                      fieldId="dentelle-gift-text"
                      text={getFieldValue(
                        "dentelle-gift-text",
                        t("reverie.giftText", "Should you wish to give a gift, you can use the details below."),
                      )}
                      style={getFieldStyle("dentelle-gift-text")}
                      onUpdate={onFieldUpdate}
                      isPreview={isPreview}
                      multiline
                      tag="p"
                      className="whitespace-pre-line"
                    />
                  </div>
                  </>
                )}
                <div style={{ marginTop: 26 }}>
                  <ReverieGiftCards giftCards={giftCards} />
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
              <DrawOnView className="flex justify-center" duration={1500} style={{ ["--dt-step" as string]: "70ms", marginBottom: 22 }}>
                <QuillArt color={BAND_ACCENT} />
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
              text={getFieldValue("dentelle-closing", t("reverie.closing", "We can't wait to celebrate with you."))}
              style={getFieldStyle("dentelle-closing")}
              onUpdate={onFieldUpdate}
              isPreview={isPreview}
              multiline
              tag="p"
              className="whitespace-pre-line"
            />
          </div>
          <p style={{ marginTop: 26, fontSize: 14, color: MUTED }}>{t("reverie.withLove", "With love,")}</p>
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
            {t("reverie.addToCalendar", "Add to calendar")}
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

export default ReverieTemplate;
