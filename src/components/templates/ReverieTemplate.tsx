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
import { ReverieLace } from "./reverie/ReverieLace";
import { ChapelArt, GiftArt, LoveLetterArt, PocketWatchArt, QuillArt, ToastArt } from "./reverie/ReverieOrnaments";

/**
 * Rêverie (formerly Dentelle) — romantic lace invitation.
 * Opens from a paper envelope sealed with wax, then an ivory card on linen,
 * mocha bands with a fine lace trim, and a vertical "The Day" timeline built
 * from the events.
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

// ---------- Handmade-paper envelope ----------

/** Tiny seeded random generator, so the paper and its torn edges look the same on every visit. */
function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * A tile of handmade cotton paper: soft bumps lit from the top left, pressed fibres and a few
 * flecks. Drawn once on a canvas and reused as a repeating image.
 */
let handmadeTile: string | null = null;
function handmadePaper(): string | null {
  if (handmadeTile) return handmadeTile;
  if (typeof document === "undefined") return null;
  try {
    const S = 600;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d");
    if (!g) return null;
    const rnd = seededRandom(7);
    // periodic value noise, so the tile repeats without seams
    const layer = (cells: number) => {
      const v = Array.from({ length: cells * cells }, () => rnd());
      return (x: number, y: number) => {
        const fx = (x / S) * cells;
        const fy = (y / S) * cells;
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const tx = fx - x0;
        const ty = fy - y0;
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const at = (i: number, j: number) => v[((j % cells) + cells) % cells * cells + (((i % cells) + cells) % cells)];
        const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
        const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
        return a + (b - a) * sy;
      };
    };
    const octaves: Array<[(x: number, y: number) => number, number]> = [
      [layer(6), 0.42],
      [layer(14), 0.3],
      [layer(30), 0.18],
      [layer(75), 0.1],
    ];
    const height = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let hgt = 0;
      for (const [f, a] of octaves) hgt += f(x, y) * a;
      height[y * S + x] = hgt;
    }
    const img = g.createImageData(S, S);
    const d = img.data;
    const base = [243, 239, 231];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const l = height[y * S + ((x - 1 + S) % S)];
      const r = height[y * S + ((x + 1) % S)];
      const u = height[((y - 1 + S) % S) * S + x];
      const dn = height[((y + 1) % S) * S + x];
      // light from the top left: slopes facing it are brighter
      const lit = ((l - r) * -0.6 + (u - dn) * -0.8) * 38;
      const tone = 1 + lit * 0.065 + (height[i] - 0.5) * 0.04;
      const n = (rnd() - 0.5) * 3;
      d[i * 4] = base[0] * tone + n;
      d[i * 4 + 1] = base[1] * tone + n;
      d[i * 4 + 2] = base[2] * tone + n;
      d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // pressed fibres and flecks, drawn on every side so the tile still repeats cleanly
    const wrapDraw = (draw: (ox: number, oy: number) => void) => {
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) draw(ox, oy);
    };
    for (let k = 0; k < 170; k++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const len = 8 + rnd() * 34;
      const a = rnd() * Math.PI * 2;
      const bend = (rnd() - 0.5) * len * 0.8;
      const light = rnd() < 0.55;
      g.strokeStyle = light ? "rgba(255,255,252,0.55)" : "rgba(150,128,100,0.16)";
      g.lineWidth = 0.6 + rnd() * 0.7;
      wrapDraw((ox, oy) => {
        g.beginPath();
        g.moveTo(x + ox, y + oy);
        g.quadraticCurveTo(x + ox + Math.cos(a) * len * 0.5 - Math.sin(a) * bend, y + oy + Math.sin(a) * len * 0.5 + Math.cos(a) * bend, x + ox + Math.cos(a) * len, y + oy + Math.sin(a) * len);
        g.stroke();
      });
    }
    for (let k = 0; k < 90; k++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const r = 0.4 + rnd() * 1.1;
      g.fillStyle = rnd() < 0.7 ? "rgba(160,138,108,0.22)" : "rgba(255,255,255,0.7)";
      wrapDraw((ox, oy) => {
        g.beginPath();
        g.arc(x + ox, y + oy, r, 0, Math.PI * 2);
        g.fill();
      });
    }
    handmadeTile = c.toDataURL("image/jpeg", 0.9);
    return handmadeTile;
  } catch {
    return null;
  }
}

/** A torn, deckled edge along a polyline (handmade paper is never cut perfectly straight). */
function deckle(points: Array<[number, number]>, seed: number, amp = 1.6) {
  const rnd = seededRandom(seed);
  const out: string[] = [];
  for (let k = 0; k < points.length - 1; k++) {
    const [ax, ay] = points[k];
    const [bx, by] = points[k + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const nx = -(by - ay) / (len || 1);
    const ny = (bx - ax) / (len || 1);
    const steps = Math.max(2, Math.round(len / 3.2));
    for (let j = k === 0 ? 0 : 1; j <= steps; j++) {
      const t = j / steps;
      const ends = j === 0 || j === steps ? 0 : 1;
      const off = ends * (Math.sin(t * len * 0.045 + seed) * amp * 0.6 + (rnd() - 0.5) * amp);
      out.push(`${(ax + (bx - ax) * t + nx * off).toFixed(1)} ${(ay + (by - ay) * t + ny * off).toFixed(1)}`);
    }
  }
  return out;
}

type RopePt = [number, number];
type RopeBez = [RopePt, RopePt, RopePt, RopePt];

/** Points along a chain of cubic curves, spaced about `step` apart, with their direction. */
function sampleRope(segs: RopeBez[], step: number) {
  const out: Array<{ x: number; y: number; tx: number; ty: number }> = [];
  for (const [p0, p1, p2, p3] of segs) {
    const at = (t: number) => {
      const u = 1 - t;
      return [
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ];
    };
    let len = 0;
    let prev = at(0);
    for (let k = 1; k <= 24; k++) {
      const q = at(k / 24);
      len += Math.hypot(q[0] - prev[0], q[1] - prev[1]);
      prev = q;
    }
    const n = Math.max(2, Math.round(len / step));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const [x, y] = at(t);
      const [x2, y2] = at(Math.min(1, t + 0.01));
      const l = Math.hypot(x2 - x, y2 - y) || 1;
      out.push({ x, y, tx: (x2 - x) / l, ty: (y2 - y) / l });
    }
  }
  return out;
}

/**
 * Vintage jute rope: three twisted plies drawn strand by strand, a few loose fibres,
 * and optionally unravelled, frayed ends.
 */
const Rope = ({ segs, width, seed, frayEnd = false, flow = 0 }: { segs: RopeBez[]; width: number; seed: number; frayEnd?: boolean; flow?: number }) => {
  const rnd = seededRandom(seed);
  const step = width * 0.82;
  const pts = sampleRope(segs, step);
  // shifting the twists along the rope makes it look like it is sliding
  const slide = ((flow % step) + step) % step;
  const f = (n: number) => n.toFixed(1);
  const core = segs.map(([p0, p1, p2, p3], i) => `${i ? "" : `M${f(p0[0])} ${f(p0[1])} `}C${f(p1[0])} ${f(p1[1])} ${f(p2[0])} ${f(p2[1])} ${f(p3[0])} ${f(p3[1])}`).join(" ");
  let plies = "";
  let grooves = "";
  let fuzz = "";
  const half = width / 2;
  pts.forEach(({ x, y, tx, ty }, i) => {
    const nx = -ty;
    const ny = tx;
    // each ply crosses the rope on a slant, bulging slightly, like twisted strands
    const ply = (o: number) => {
      const px = x + tx * o;
      const py = y + ty * o;
      const ax = px - nx * half * 0.92 - tx * half * 0.8;
      const ay = py - ny * half * 0.92 - ty * half * 0.8;
      const bx = px + nx * half * 0.92 + tx * half * 0.8;
      const by = py + ny * half * 0.92 + ty * half * 0.8;
      return `M${f(ax)} ${f(ay)} Q${f(px + tx * half * 0.35)} ${f(py + ty * half * 0.35)} ${f(bx)} ${f(by)}`;
    };
    plies += ply(slide);
    grooves += ply(slide + width * 0.41);
    if (rnd() < 0.22) {
      const side = rnd() < 0.5 ? -1 : 1;
      const sx = x + nx * half * side * 0.9;
      const sy = y + ny * half * side * 0.9;
      const a = Math.atan2(ny * side, nx * side) + (rnd() - 0.5) * 1.6;
      const l = width * (0.35 + rnd() * 0.75);
      fuzz += `M${f(sx)} ${f(sy)} q${f(Math.cos(a) * l * 0.5 + tx * 1.2)} ${f(Math.sin(a) * l * 0.5 + ty * 1.2)} ${f(Math.cos(a) * l)} ${f(Math.sin(a) * l)}`;
    }
    void i;
  });
  // unravelled end: fibres spreading out from the last point
  let fray = "";
  if (frayEnd && pts.length) {
    const end = segs[segs.length - 1][3];
    const last = pts[pts.length - 1];
    for (let k = 0; k < 9; k++) {
      const spread = (k / 8 - 0.5) * 1.3 + (rnd() - 0.5) * 0.25;
      const ca = Math.cos(spread);
      const sa = Math.sin(spread);
      const dx = last.tx * ca - last.ty * sa;
      const dy = last.tx * sa + last.ty * ca;
      const l = width * (2.2 + rnd() * 2.4);
      const bend = (rnd() - 0.5) * width * 1.4;
      fray += `M${f(end[0] + (rnd() - 0.5) * width * 0.6)} ${f(end[1])} q${f(dx * l * 0.5 - dy * bend)} ${f(dy * l * 0.5 + dx * bend)} ${f(dx * l)} ${f(dy * l)}`;
    }
  }
  return (
    <>
      <path d={core} fill="none" stroke="#5c4329" strokeWidth={width * 1.1} strokeLinecap="round" />
      <path d={core} fill="none" stroke="#94734a" strokeWidth={width * 0.88} strokeLinecap="round" />
      <path d={plies} fill="none" stroke="#c7a676" strokeWidth={width * 0.3} strokeLinecap="round" opacity="0.95" />
      <path d={grooves} fill="none" stroke="#523b23" strokeWidth={width * 0.13} strokeLinecap="round" opacity="0.75" />
      {fuzz && <path d={fuzz} fill="none" stroke="#b39468" strokeWidth={0.55} strokeLinecap="round" opacity="0.8" />}
      {fray && <path d={fray} fill="none" stroke="#a5855a" strokeWidth={width * 0.16} strokeLinecap="round" opacity="0.9" />}
    </>
  );
};

/** Letterpress monogram pressed into the paper: initials in calligraphy within a fine laurel wreath. */
const PressedMonogram = ({ x, y, size, groom, bride }: { x: number; y: number; size: number; groom: string; bride: string }) => {
  const ink = "#8a705a";
  const rx = size * 1.02;
  const ry = size * 0.74;
  const laurel = (side: 1 | -1) => {
    let stem = "";
    let leaves = "";
    const n = 9;
    for (let k = 0; k <= n; k++) {
      // from the bottom, round the side, towards the top
      const a = Math.PI / 2 + side * (0.32 + (k / n) * 1.95);
      const px = x + Math.cos(a) * rx;
      const py = y + Math.sin(a) * ry;
      stem += `${k ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)} `;
      if (k > 0 && k < n + 1) {
        const ta = a + side * Math.PI / 2;
        for (const out of [1, -1]) {
          const la = ta + out * 0.55 * side;
          const len = size * (0.15 - k * 0.007);
          const ex = px + Math.cos(la) * len;
          const ey = py + Math.sin(la) * len;
          const mx = (px + ex) / 2;
          const my = (py + ey) / 2;
          const qx = -Math.sin(la) * len * 0.32;
          const qy = Math.cos(la) * len * 0.32;
          leaves += `M${px.toFixed(1)} ${py.toFixed(1)} Q${(mx + qx).toFixed(1)} ${(my + qy).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(mx - qx).toFixed(1)} ${(my - qy).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)} `;
        }
      }
    }
    return { stem, leaves };
  };
  const L = laurel(1);
  const R = laurel(-1);
  const letters = (dx: number, dy: number, fill: string, opacity: number) => (
    <text
      x={x + dx}
      y={y + dy + size * 0.16}
      textAnchor="middle"
      fill={fill}
      opacity={opacity}
      style={{ fontFamily: "var(--font-template-title), 'Great Vibes', cursive" }}
      fontSize={size * 0.6}
    >
      {groom}
      <tspan fontSize={size * 0.34} dy={-size * 0.03} dx={size * 0.02}>
        {" & "}
      </tspan>
      <tspan dy={size * 0.03}>{bride}</tspan>
    </text>
  );
  const wreath = (dx: number, dy: number, color: string, opacity: number) => (
    <g transform={`translate(${dx} ${dy})`} opacity={opacity} fill="none" stroke={color} strokeLinecap="round">
      <path d={L.stem + R.stem} strokeWidth={0.9} />
      <path d={L.leaves + R.leaves} strokeWidth={0.7} />
    </g>
  );
  return (
    <g aria-hidden>
      {/* pressed into the paper: a light catch below each stroke, a soft shade above it */}
      {wreath(0.7, 1, "#ffffff", 0.9)}
      {wreath(-0.5, -0.7, "#5d4532", 0.25)}
      {wreath(0, 0, ink, 0.7)}
      {letters(0.8, 1.1, "#ffffff", 0.9)}
      {letters(-0.6, -0.8, "#5d4532", 0.3)}
      {letters(0, 0, ink, 0.82)}
    </g>
  );
};

/**
 * A handmade-paper envelope, tied with jute twine, that fills the opening screen. The invitation
 * card underneath sits inside it: tapping slips the twine off and folds the flap back so the
 * card shows through, then the envelope slides away, leaving the card.
 */
const Envelope = ({
  cardRef,
  opening,
  onOpen,
  label,
  groomInitial,
  brideInitial,
}: {
  /** The invitation card below the envelope; the envelope leaves a window where it sits. */
  cardRef: React.RefObject<HTMLDivElement>;
  opening: boolean;
  onOpen: () => void;
  label: string;
  groomInitial: string;
  brideInitial: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const uid = useId().replace(/:/g, "");
  const [paper, setPaper] = useState<string | null>(handmadeTile);
  useEffect(() => {
    if (!paper) setPaper(handmadePaper());
  }, [paper]);
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
  // 0 closed · 1 the rope unties · 2 flap opens · 3 flap behind · 4 envelope slides away
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!opening || reducedMotion) return;
    const steps: Array<[number, number]> = [[1, 0], [2, 1350], [3, 1800], [4, 2320]];
    const timers = steps.map(([p, ms]) => window.setTimeout(() => setPhase(p), ms));
    return () => timers.forEach(clearTimeout);
  }, [opening, reducedMotion]);
  // how far the bow has been untied, 0 → 1 over 1.7s, redrawn every frame so the rope really moves
  const [u, setU] = useState(0);
  useEffect(() => {
    if (!opening || reducedMotion) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1700);
      setU(t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [opening, reducedMotion]);

  // Geometry, in px. The envelope covers the whole first section; the flap and the knot are
  // placed against the visible screen so they stay centred when the section is taller.
  const { w, h, vh } = size;
  const flapH = Math.round(vh * 0.54);
  const meetY = vh * 0.5;
  const bottomTop = vh * 0.46;
  const cx = w / 2;
  const s = Math.min(Math.max(Math.min(w, vh) / 390, 0.85), 1.5) * 1.18; // twine/bow scale
  const knotY = flapH - 10 * s;

  // flaps with torn edges
  const flapEdgePts = deckle([[0, 0], [cx, flapH], [w, 0]], 3);
  const flapPath = `M${flapEdgePts.join(" L")} Z`;
  const flapEdge = `M${flapEdgePts.join(" L")}`;
  const bottomEdgePts = deckle([[0, h], [cx, bottomTop], [w, h]], 11);
  const bottomEdge = `M${bottomEdgePts.join(" L")}`;
  const bottomPath = `${bottomEdge} Z`;

  const paperFill = paper ? `url(#${uid}-paper)` : "#f2eee7";
  // Inside of the envelope: the same paper, a shade deeper.
  const inside: React.CSSProperties = paper
    ? { backgroundColor: "#e9e3d9", backgroundImage: `linear-gradient(rgba(120,96,70,.08), rgba(120,96,70,.08)), url(${paper})`, backgroundSize: "auto, 400px 400px" }
    : { backgroundColor: "#e9e3d9" };

  // Inside of the envelope, around the window where the card sits.
  const strips = card
    ? [
        { x: 0, y: 0, w, h: card.y },
        { x: 0, y: card.y + card.h, w, h: h - card.y - card.h },
        { x: 0, y: card.y, w: card.x, h: card.h },
        { x: card.x + card.w, y: card.y, w: w - card.x - card.w, h: card.h },
      ].filter((r) => r.w > 0 && r.h > 0)
    : [{ x: 0, y: 0, w, h }];

  // vintage rope: wrapped twice around the envelope, tied in a full bow at the flap's tip
  const rw = 4.4 * s;
  const K: RopePt = [cx, knotY];
  const at = (dx: number, dy: number): RopePt => [cx + dx * s, knotY + dy * s];
  const wrapA: RopeBez[] = [
    [[-20, knotY + 4 * s], [w * 0.22, knotY + 7 * s], [cx - 60 * s, knotY + 1 * s], K],
    [K, [cx + 60 * s, knotY + 1 * s], [w * 0.78, knotY + 8 * s], [w + 20, knotY + 4 * s]],
  ];
  const wrapB: RopeBez[] = [
    [[-20, knotY + 4 * s + rw * 1.9], [w * 0.25, knotY + 6 * s + rw * 1.9], [cx - 50 * s, knotY + 8 * s], at(-6, 3)],
    [at(6, 3), [cx + 50 * s, knotY + 8 * s], [w * 0.75, knotY + 7 * s + rw * 1.9], [w + 20, knotY + 5 * s + rw * 1.9]],
  ];
  // The bow, as a function of how far it has been untied (u goes 0 → 1 after the tap):
  //   A · the right tail is pulled, its loop slides through the knot and the twists run along the tail
  //   B · the left loop slides through the same way as its tail is pulled
  //   C · the knot opens, both ends lie flat and each half of the rope slides off its side
  const sm = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const eA = sm(0, 0.4, u);
  const eB = sm(0.28, 0.68, u);
  const eC = sm(0.6, 1, u);
  const fade = 1 - sm(0.86, 1, u);
  const towardKnot = (segs: RopeBez[], f: number, turn: number): RopeBez[] =>
    segs.map((seg) =>
      seg.map(([x, y]) => {
        const dx = (x - K[0]) * f;
        const dy = (y - K[1]) * f;
        return [K[0] + dx * Math.cos(turn) - dy * Math.sin(turn), K[1] + dx * Math.sin(turn) + dy * Math.cos(turn)] as RopePt;
      }) as RopeBez,
    );
  const mix = (a: RopeBez[], b: RopeBez[], t: number): RopeBez[] =>
    a.map((seg, i) => seg.map((pt, j) => [pt[0] + (b[i][j][0] - pt[0]) * t, pt[1] + (b[i][j][1] - pt[1]) * t]) as RopeBez);
  const loopL = towardKnot(
    [
      [K, at(-26, -40), at(-80, -34), at(-74, -4)],
      [at(-74, -4), at(-70, 18), at(-28, 16), K],
    ],
    1 - eB,
    -0.45 * eB,
  );
  const loopR = towardKnot(
    [
      [K, at(24, -44), at(86, -36), at(78, -2)],
      [at(78, -2), at(74, 20), at(26, 14), K],
    ],
    1 - eA,
    0.45 * eA,
  );
  const tailL = mix(
    mix([[K, at(-8, 24), at(-34, 46), at(-40, 92)]], [[K, at(-12, 30), at(-50, 74), at(-60, 140)]], eB),
    [[K, at(-30, 3), at(-72, 5), at(-124, 9)]],
    eC,
  );
  const tailR = mix(
    mix([[K, at(10, 28), at(36, 58), at(30, 108)]], [[K, at(14, 32), at(54, 72), at(64, 150)]], eA),
    [[K, at(30, 3), at(72, 5), at(124, 9)]],
    eC,
  );
  const slideOff = eC * (cx + 150 * s);
  const knotScale = 1 - sm(0.58, 0.8, u);
  const knotOrigin: React.CSSProperties = { transformBox: "view-box", transformOrigin: `${cx}px ${knotY}px` };
  const wrapLeft = useMemo(
    () => (
      <>
        <Rope segs={[wrapB[0]]} width={rw} seed={21} />
        <Rope segs={[wrapA[0]]} width={rw} seed={22} />
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [w, knotY, rw],
  );
  const wrapRight = useMemo(
    () => (
      <>
        <Rope segs={[wrapB[1]]} width={rw} seed={27} />
        <Rope segs={[wrapA[1]]} width={rw} seed={28} />
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [w, knotY, rw],
  );
  const monoSize = Math.round(Math.min(Math.max(Math.min(w, vh) * 0.2, 72), 128));
  const monoY = Math.min(flapH * 0.5, knotY - 70 * s - monoSize * 0.9);

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
          {strips.map((r, i) => (
            <span
              key={i}
              className="absolute block"
              style={{ left: r.x, top: r.y, width: r.w, height: r.h, ...inside, backgroundPosition: `0 0, ${-r.x}px ${-r.y}px` }}
            />
          ))}
          {/* front pocket: two side flaps under a bottom flap */}
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0" style={{ overflow: "visible" }}>
            <defs>
              {paper && (
                <pattern id={`${uid}-paper`} patternUnits="userSpaceOnUse" width="400" height="400">
                  <image href={paper} width="400" height="400" />
                </pattern>
              )}
              <filter id={`${uid}-soft`} x="-10%" y="-20%" width="120%" height="140%">
                <feGaussianBlur stdDeviation="3.4" />
              </filter>
            </defs>
            <path d={`M0 0 L${cx} ${meetY} L0 ${h} Z`} fill={paperFill} />
            <path d={`M0 0 L${cx} ${meetY} L0 ${h} Z`} fill="rgba(255,255,255,.18)" />
            <path d={`M${w} 0 L${cx} ${meetY} L${w} ${h} Z`} fill={paperFill} />
            <path d={`M${w} 0 L${cx} ${meetY} L${w} ${h} Z`} fill="rgba(110,86,60,.07)" />
            {/* the bottom flap's torn edge casts a soft shadow */}
            <path d={bottomEdge} fill="none" stroke="rgba(70,52,36,.22)" strokeWidth="8" filter={`url(#${uid}-soft)`} transform="translate(0 -3)" />
            <path d={bottomPath} fill={paperFill} />
            <path d={bottomPath} fill="rgba(110,86,60,.035)" />
            <path d={bottomEdge} fill="none" stroke="#fffefb" strokeWidth="1.4" opacity="0.9" />
            <path d={bottomEdge} fill="none" stroke="rgba(120,98,74,.25)" strokeWidth="0.7" transform="translate(0 1.4)" />
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
              {paper && (
                <pattern id={`${uid}-paper2`} patternUnits="userSpaceOnUse" width="400" height="400">
                  <image href={paper} width="400" height="400" />
                </pattern>
              )}
              <filter id={`${uid}-blur`} x="-10%" y="-10%" width="120%" height="140%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            <path d={flapPath} transform="translate(0 5)" fill="rgba(70,52,36,.3)" filter={`url(#${uid}-blur)`} />
            <path d={flapPath} fill={paper ? `url(#${uid}-paper2)` : "#f4f0e9"} />
            <path d={flapPath} fill="rgba(255,255,255,.12)" />
            <path d={flapEdge} fill="none" stroke="#fffefb" strokeWidth="1.5" opacity="0.95" />
            <path d={flapEdge} fill="none" stroke="rgba(120,98,74,.28)" strokeWidth="0.7" transform="translate(0 1.5)" />
            <PressedMonogram x={cx} y={monoY} size={monoSize} groom={groomInitial} bride={brideInitial} />
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

        {/* vintage rope tied in a bow; on tap it unties itself before the flap opens.
            The long halves are drawn once and only slid (cheap); only the small bow is redrawn each frame. */}
        {([["left", -1, wrapLeft], ["right", 1, wrapRight]] as const).map(([side, dir, strands]) => (
          <span
            key={side}
            aria-hidden
            className="absolute inset-0 block pointer-events-none"
            style={{ zIndex: 5, transform: `translate3d(${dir * slideOff}px, 0, 0)`, opacity: fade, willChange: opening ? "transform, opacity" : undefined }}
          >
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0" style={{ overflow: "visible" }}>
              <defs>
                <filter id={`${uid}-rope-${side}`} x="-5%" y="-50%" width="110%" height="200%">
                  <feDropShadow dx={1 * s} dy={2.2 * s} stdDeviation={1.6 * s} floodColor="#3d2a18" floodOpacity="0.32" />
                </filter>
              </defs>
              <g filter={`url(#${uid}-rope-${side})`}>{strands}</g>
            </svg>
          </span>
        ))}
        <span aria-hidden className="absolute inset-0 block pointer-events-none" style={{ zIndex: 5, opacity: fade }}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0" style={{ overflow: "visible" }}>
            <defs>
              <filter id={`${uid}-bow`} x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx={1 * s} dy={2.2 * s} stdDeviation={1.6 * s} floodColor="#3d2a18" floodOpacity="0.32" />
              </filter>
            </defs>
            <g filter={`url(#${uid}-bow)`} style={{ ...knotOrigin, animation: opening ? undefined : "dt-breathe 3.4s ease-in-out infinite" }}>
              {/* the two ends travel with their halves once the knot opens */}
              <g transform={`translate(${-slideOff} 0)`}>
                <Rope segs={tailL} width={rw} seed={23} frayEnd flow={eB * 96 * s} />
              </g>
              <g transform={`translate(${slideOff} 0)`}>
                <Rope segs={tailR} width={rw} seed={24} frayEnd flow={eA * 96 * s} />
              </g>
              {eB < 0.985 && <Rope segs={loopL} width={rw} seed={25} flow={-eB * 60 * s} />}
              {eA < 0.985 && <Rope segs={loopR} width={rw} seed={26} flow={-eA * 60 * s} />}
              {/* the knot, wound round itself; it opens as the ends pull apart */}
              {knotScale > 0.01 && (
                <g transform={`translate(${cx} ${knotY}) scale(${knotScale}) translate(${-cx} ${-knotY})`}>
                  <ellipse cx={cx} cy={knotY} rx={8 * s} ry={6.6 * s} fill="#7a5c3a" />
                  <path
                    d={`M${cx - 6 * s} ${knotY - 4 * s} q${4 * s} ${4 * s} ${2 * s} ${10 * s} M${cx - 1 * s} ${knotY - 6 * s} q${4 * s} ${5 * s} ${2 * s} ${12 * s} M${cx + 4 * s} ${knotY - 5 * s} q${3 * s} ${5 * s} ${1 * s} ${10 * s}`}
                    fill="none"
                    stroke="#c7a676"
                    strokeWidth={1.3 * s}
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          </svg>
        </span>
        <span
          className="dt-anim absolute left-0 right-0 block text-center"
          style={{
            top: knotY + 122 * s,
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
        <section
          className="relative overflow-hidden"
          style={{ minHeight: "100svh", ...LINEN }}
        >
          <ReverieLace cardRef={heroCardRef} />
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
                  {t("reverie.together", "Together with their families")}
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
              cardRef={heroCardRef}
              opening={opening}
              onOpen={openInvitation}
              label={t("reverie.tapToOpen", "Tap to open")}
              groomInitial={(wedding.groom_name || "A").trim().charAt(0).toUpperCase()}
              brideInitial={(wedding.bride_name || "A").trim().charAt(0).toUpperCase()}
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
