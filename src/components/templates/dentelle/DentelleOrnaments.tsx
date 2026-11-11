import { useId } from "react";

/**
 * Pen-and-ink section illustrations for the Dentelle template.
 * Every stroke has pathLength=1 so <DrawOnView> can draw it; --i staggers the strokes
 * so the drawing appears as if sketched live. A light displacement filter gives the
 * lines a hand-drawn wobble.
 */

type V = { x: number; y: number };
const f = (n: number) => n.toFixed(1);

/** One stroke. w = pen width, o = ink strength, i = order in which it is drawn. */
const P = ({ d, w = 1, o = 1, i = 0 }: { d: string; w?: number; o?: number; i?: number }) => (
  <path pathLength={1} d={d} strokeWidth={w} opacity={o} style={{ ["--i" as string]: i }} />
);

const Art = ({ color, width, children }: { color: string; width: number; children: React.ReactNode }) => {
  const id = `ink${useId().replace(/:/g, "")}`;
  return (
    <svg
      aria-hidden
      width={width}
      height={(width * 130) / 200}
      viewBox="0 0 200 130"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="11" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </svg>
  );
};

// ---------- small drawing helpers ----------

/** Almond leaf with a centre vein. */
function leaf(x: number, y: number, ang: number, len: number, wid = 0.36) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const tx = x + c * len;
  const ty = y + s * len;
  const mx = x + c * len * 0.5;
  const my = y + s * len * 0.5;
  const px = -s * len * wid;
  const py = c * len * wid;
  return {
    outline: `M${f(x)} ${f(y)} Q${f(mx + px)} ${f(my + py)} ${f(tx)} ${f(ty)} Q${f(mx - px)} ${f(my - py)} ${f(x)} ${f(y)}`,
    vein: `M${f(x)} ${f(y)} L${f(x + c * len * 0.78)} ${f(y + s * len * 0.78)}`,
  };
}

/** A curved stem with alternating leaves. */
const Sprig = ({ from, ang, len, bend = 0.25, leaves = 5, leafLen = 9, i = 0, w = 0.9, round = false }: {
  from: V;
  ang: number;
  len: number;
  bend?: number;
  leaves?: number;
  leafLen?: number;
  i?: number;
  w?: number;
  round?: boolean;
}) => {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const end = { x: from.x + c * len, y: from.y + s * len };
  const ctrl = { x: from.x + c * len * 0.5 - s * len * bend, y: from.y + s * len * 0.5 + c * len * bend };
  const at = (t: number) => ({
    x: (1 - t) ** 2 * from.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x,
    y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y,
  });
  const out: React.ReactNode[] = [
    <P key="stem" d={`M${f(from.x)} ${f(from.y)} Q${f(ctrl.x)} ${f(ctrl.y)} ${f(end.x)} ${f(end.y)}`} w={w} i={i} />,
  ];
  for (let k = 0; k < leaves; k++) {
    const t = 0.22 + (k / Math.max(1, leaves - 1)) * 0.72;
    const p = at(t);
    const q = at(Math.min(1, t + 0.02));
    const tang = Math.atan2(q.y - p.y, q.x - p.x);
    const side = k % 2 ? 1 : -1;
    const size = leafLen * (1 - t * 0.35);
    if (round) {
      const a = tang + side * 1.1;
      const cx = p.x + Math.cos(a) * size * 0.55;
      const cy = p.y + Math.sin(a) * size * 0.55;
      out.push(<P key={`l${k}`} d={`M${f(cx - size * 0.45)} ${f(cy)} a${f(size * 0.45)} ${f(size * 0.4)} 0 1 0 ${f(size * 0.9)} 0 a${f(size * 0.45)} ${f(size * 0.4)} 0 1 0 ${f(-size * 0.9)} 0`} w={w * 0.85} i={i + 1 + k} />);
    } else {
      const l = leaf(p.x, p.y, tang + side * 0.75, size);
      out.push(<P key={`l${k}`} d={l.outline} w={w * 0.85} i={i + 1 + k} />);
      out.push(<P key={`v${k}`} d={l.vein} w={0.5} o={0.55} i={i + 2 + k} />);
    }
  }
  // final leaf at the tip
  const p = at(0.97);
  const tl = leaf(end.x, end.y, Math.atan2(end.y - p.y, end.x - p.x), leafLen * 0.8);
  out.push(<P key="tip" d={tl.outline} w={w * 0.85} i={i + leaves + 1} />);
  return <>{out}</>;
};

/** Calligraphic swirl; mirror flips it horizontally. */
const Flourish = ({ x, y, scale = 1, mirror = false, i = 0, o = 0.75 }: { x: number; y: number; scale?: number; mirror?: boolean; i?: number; o?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${mirror ? -scale : scale} ${scale})`}>
    <P d="M0 0 C8 -9 24 -10 29 0 C33 9 23 15 17 10 C12 6 17 -1 24 1 C38 5 48 -2 56 -6" w={0.9 / scale} o={o} i={i} />
    <P d="M30 5 C36 12 46 13 52 8" w={0.6 / scale} o={o * 0.7} i={i + 1} />
    <circle pathLength={1} cx="-3" cy="2" r={1.2} strokeWidth={0.8 / scale} opacity={o} style={{ ["--i" as string]: i + 2 }} />
  </g>
);

/** Small open rose: a spiral heart and layered petals. */
const Rose = ({ x, y, r, i = 0 }: { x: number; y: number; r: number; i?: number }) => (
  <>
    <P d={`M${f(x)} ${f(y)} c${f(r * 0.3)} ${f(-r * 0.3)} ${f(r * 0.5)} ${f(r * 0.2)} ${f(r * 0.1)} ${f(r * 0.35)} c${f(-r * 0.5)} ${f(r * 0.2)} ${f(-r * 0.7)} ${f(-r * 0.4)} ${f(-r * 0.25)} ${f(-r * 0.7)} c${f(r * 0.55)} ${f(-r * 0.35)} ${f(r * 1.05)} ${f(r * 0.1)} ${f(r * 0.85)} ${f(r * 0.65)}`} w={0.8} i={i} />
    <P d={`M${f(x - r * 0.8)} ${f(y + r * 0.1)} C${f(x - r * 0.9)} ${f(y - r * 0.8)} ${f(x + r * 0.2)} ${f(y - r * 1.05)} ${f(x + r * 0.75)} ${f(y - r * 0.5)}`} w={0.9} i={i + 1} />
    <P d={`M${f(x + r * 0.95)} ${f(y - r * 0.2)} C${f(x + r * 1.15)} ${f(y + r * 0.6)} ${f(x + r * 0.4)} ${f(y + r * 1.05)} ${f(x - r * 0.3)} ${f(y + r * 0.9)}`} w={0.9} i={i + 2} />
    <P d={`M${f(x - r * 0.45)} ${f(y + r * 0.95)} C${f(x - r * 1.15)} ${f(y + r * 0.85)} ${f(x - r * 1.2)} ${f(y - r * 0.1)} ${f(x - r * 0.85)} ${f(y - r * 0.55)}`} w={0.9} i={i + 3} />
  </>
);

/** Four-point sparkle. */
const Sparkle = ({ x, y, r, i = 0, o = 0.8 }: { x: number; y: number; r: number; i?: number; o?: number }) => (
  <P
    d={`M${f(x)} ${f(y - r)} Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y + r)} Q${f(x)} ${f(y)} ${f(x - r)} ${f(y)} Q${f(x)} ${f(y)} ${f(x)} ${f(y - r)}`}
    w={0.7}
    o={o}
    i={i}
  />
);

const heart = (x: number, y: number, s: number) =>
  `M${f(x)} ${f(y + s * 0.9)} C${f(x - s)} ${f(y + s * 0.3)} ${f(x - s * 0.9)} ${f(y - s * 0.55)} ${f(x - s * 0.4)} ${f(y - s * 0.55)} C${f(x - s * 0.1)} ${f(y - s * 0.55)} ${f(x)} ${f(y - s * 0.3)} ${f(x)} ${f(y - s * 0.15)} C${f(x)} ${f(y - s * 0.3)} ${f(x + s * 0.1)} ${f(y - s * 0.55)} ${f(x + s * 0.4)} ${f(y - s * 0.55)} C${f(x + s * 0.9)} ${f(y - s * 0.55)} ${f(x + s)} ${f(y + s * 0.3)} ${f(x)} ${f(y + s * 0.9)} Z`;

/** Handwriting-like wavy line. */
const scribble = (x: number, y: number, len: number) => {
  let d = `M${f(x)} ${f(y)}`;
  for (let k = 0; k < len / 6; k++) d += ` q1.5 ${k % 2 ? 2.4 : -2.4} 3 0 t3 0`;
  return d;
};

// ---------- illustrations ----------

/** Invitation: a letter rising from its envelope, a heart wax seal, a rose sprig and flourishes. */
export const LoveLetterArt = ({ color, width = 176 }: { color: string; width?: number }) => (
  <Art color={color} width={width}>
    <Flourish x={22} y={74} scale={0.9} i={0} />
    <Flourish x={178} y={74} scale={0.9} mirror i={0} />
    <g transform="rotate(-5 100 74)">
      <P d="M68 64 V26 H132 V64" w={1.1} i={3} />
      <P d={scribble(76, 35, 40)} w={0.6} o={0.6} i={5} />
      <P d={scribble(76, 43, 46)} w={0.6} o={0.6} i={6} />
      <P d={scribble(76, 51, 30)} w={0.6} o={0.6} i={7} />
      <P d="M60 46 V104 H140 V46" w={1.3} i={4} />
      <P d="M60 50 L100 78 L140 50" w={1.1} i={8} />
      <P d="M60 104 L92 76 M140 104 L108 76" w={0.7} o={0.55} i={9} />
      <P d={heart(100, 82, 7.5)} w={1.2} i={10} />
      <P d="M88.5 80 C86 86 89 92 95 92.5 M111.5 80 C114 86 111 92 105 92.5" w={0.7} o={0.6} i={11} />
      <P d="M100 92 V95.5 M94 91 L92.5 94.5" w={0.7} o={0.6} i={12} />
    </g>
    <Rose x={56} y={104} r={7} i={13} />
    <Sprig from={{ x: 60, y: 108 }} ang={Math.PI * 0.98} len={30} bend={-0.25} leaves={4} leafLen={8} i={15} />
    <Sprig from={{ x: 62, y: 100 }} ang={-Math.PI * 0.75} len={20} bend={0.3} leaves={3} leafLen={7} i={18} round />
    <Sparkle x={150} y={22} r={4} i={20} />
    <Sparkle x={160} y={34} r={2.4} i={21} o={0.6} />
  </Art>
);

/** Countdown: an engraved pocket watch with its chain, and forget-me-nots. */
export const PocketWatchArt = ({ color, width = 176 }: { color: string; width?: number }) => {
  const cx = 112;
  const cy = 72;
  const ticks: React.ReactNode[] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const major = k % 3 === 0;
    const r0 = major ? 19 : 21.5;
    ticks.push(
      <P key={k} d={`M${f(cx + Math.sin(a) * r0)} ${f(cy - Math.cos(a) * r0)} L${f(cx + Math.sin(a) * 24)} ${f(cy - Math.cos(a) * 24)}`} w={major ? 1.3 : 0.7} i={6 + k * 0.3} />,
    );
  }
  // chain links along a curve from the bow to the fob
  const links: React.ReactNode[] = [];
  const a0 = { x: 105, y: 30 };
  const a1 = { x: 58, y: 8 };
  const a2 = { x: 40, y: 66 };
  for (let k = 0; k <= 15; k++) {
    const t = k / 15;
    const x = (1 - t) ** 2 * a0.x + 2 * (1 - t) * t * a1.x + t * t * a2.x;
    const y = (1 - t) ** 2 * a0.y + 2 * (1 - t) * t * a1.y + t * t * a2.y;
    const dx = 2 * (1 - t) * (a1.x - a0.x) + 2 * t * (a2.x - a1.x);
    const dy = 2 * (1 - t) * (a1.y - a0.y) + 2 * t * (a2.y - a1.y);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI + (k % 2 ? 90 : 0);
    links.push(
      <ellipse key={k} pathLength={1} cx={f(x)} cy={f(y)} rx={k % 2 ? 1.6 : 2.8} ry={k % 2 ? 1.1 : 1.6} transform={`rotate(${f(ang)} ${f(x)} ${f(y)})`} strokeWidth={0.7} opacity={0.75} style={{ ["--i" as string]: 14 + k * 0.4 }} />,
    );
  }
  const forget = (x: number, y: number, r: number, i: number) => (
    <>
      {[0, 1, 2, 3, 4].map((k) => {
        const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
        return <circle key={k} pathLength={1} cx={f(x + Math.cos(a) * r)} cy={f(y + Math.sin(a) * r)} r={f(r * 0.72)} strokeWidth={0.7} style={{ ["--i" as string]: i + k * 0.3 }} />;
      })}
      <circle pathLength={1} cx={x} cy={y} r={r * 0.3} strokeWidth={0.7} style={{ ["--i" as string]: i + 2 }} />
    </>
  );
  return (
    <Art color={color} width={width}>
      <ellipse pathLength={1} cx={cx} cy={27} rx={7} ry={6} strokeWidth={1.2} style={{ ["--i" as string]: 0 }} />
      <P d={`M${cx - 3.5} 33 H${cx + 3.5} V39 H${cx - 3.5} Z`} w={1} i={1} />
      <P d={`M${cx - 2} 35 V37 M${cx} 35 V37 M${cx + 2} 35 V37`} w={0.5} o={0.6} i={2} />
      <circle pathLength={1} cx={cx} cy={cy} r={31} strokeWidth={1.5} style={{ ["--i" as string]: 2 }} />
      <circle pathLength={1} cx={cx} cy={cy} r={27.5} strokeWidth={0.7} opacity={0.6} style={{ ["--i" as string]: 3 }} />
      <circle pathLength={1} cx={cx} cy={cy} r={25.5} strokeWidth={0.4} opacity={0.45} style={{ ["--i" as string]: 4 }} />
      {ticks}
      <circle pathLength={1} cx={cx} cy={cy + 11} r={4.5} strokeWidth={0.5} opacity={0.6} style={{ ["--i" as string]: 10 }} />
      <P d={`M${cx} ${cy} L${cx - 2} ${cy - 8} L${cx} ${cy - 15} L${cx + 2} ${cy - 8} Z`} w={0.9} i={11} />
      <P d={`M${cx} ${cy} L${cx + 15} ${cy + 6}`} w={0.9} i={12} />
      <circle pathLength={1} cx={cx} cy={cy} r={1.6} strokeWidth={1} style={{ ["--i" as string]: 12 }} />
      {links}
      <P d="M35 68 H45 M40 66 V72" w={1} i={21} />
      <circle pathLength={1} cx={40} cy={76} r={3.2} strokeWidth={0.9} style={{ ["--i" as string]: 22 }} />
      <Sprig from={{ x: 142, y: 100 }} ang={-0.35} len={34} bend={-0.2} leaves={4} leafLen={8} i={22} />
      <Sprig from={{ x: 84, y: 104 }} ang={Math.PI + 0.25} len={30} bend={0.22} leaves={4} leafLen={7.5} i={24} />
      {forget(150, 96, 3.4, 27)}
      {forget(160, 106, 2.6, 29)}
      {forget(76, 108, 3, 30)}
      <Flourish x={128} y={118} scale={0.75} i={31} o={0.6} />
    </Art>
  );
};

/** Location: an ink sketch of a chapel among cypress trees, with birds overhead. */
export const ChapelArt = ({ color, width = 176 }: { color: string; width?: number }) => {
  const hatch: string[] = [];
  for (let k = 0; k < 9; k++) hatch.push(`M${122 - k * 0.2} ${74 + k * 4.6} l5 -4`);
  const roofHatch: string[] = [];
  for (let k = 0; k < 6; k++) roofHatch.push(`M${108 + k * 4} ${49 + k * 2.6} l3 2`);
  const cypress = (x: number, base: number, h: number, wd: number, i: number) => (
    <>
      <P d={`M${x} ${base} C${x - wd} ${base - h * 0.35} ${x - wd * 0.8} ${base - h * 0.75} ${x} ${base - h} C${x + wd * 0.8} ${base - h * 0.75} ${x + wd} ${base - h * 0.35} ${x} ${base}`} w={1} i={i} />
      <P d={`M${x - wd * 0.4} ${base - h * 0.25} q${wd * 0.4} -3 ${wd * 0.8} 0 M${x - wd * 0.5} ${base - h * 0.45} q${wd * 0.5} -3 ${wd} 0 M${x - wd * 0.35} ${base - h * 0.65} q${wd * 0.35} -3 ${wd * 0.7} 0`} w={0.5} o={0.55} i={i + 1} />
    </>
  );
  return (
    <Art color={color} width={width}>
      <P d="M18 118 C55 114 85 120 112 117 C140 114 165 119 184 116" w={1} i={0} />
      <P d="M70 118 V70 H130 V118" w={1.3} i={1} />
      <P d="M64 72 L100 44 L136 72" w={1.3} i={2} />
      <P d="M68 72 L100 48 L132 72" w={0.6} o={0.6} i={3} />
      <P d="M90 50 V22 H110 V50" w={1.2} i={3} />
      <P d="M87 23 L100 7 L113 23" w={1.2} i={4} />
      <P d="M100 7 V0 M96.5 3 H103.5" w={1} i={5} />
      <P d="M95 36 V29 C95 25 105 25 105 29 V36" w={0.8} i={6} />
      <P d="M100 29 V31.5" w={0.6} o={0.6} i={6} />
      <circle pathLength={1} cx={100} cy={60} r={6} strokeWidth={0.9} style={{ ["--i" as string]: 7 }} />
      <P d="M100 54 V66 M94 60 H106 M95.8 55.8 L104.2 64.2 M104.2 55.8 L95.8 64.2" w={0.4} o={0.6} i={8} />
      <P d="M92 118 V100 C92 90 108 90 108 100 V118" w={1.1} i={8} />
      <P d="M100 92 V118" w={0.5} o={0.6} i={9} />
      <P d="M77 92 V84 C77 79 84 79 84 84 V92 Z M116 92 V84 C116 79 123 79 123 84 V92 Z" w={0.8} i={9} />
      <P d={hatch.join(" ")} w={0.45} o={0.45} i={10} />
      <P d={roofHatch.join(" ")} w={0.45} o={0.45} i={10} />
      <P d="M92 118 C88 122 84 125 78 129 M108 118 C112 122 116 125 122 129" w={0.7} o={0.6} i={11} />
      {cypress(52, 118, 54, 8, 12)}
      {cypress(38, 118, 38, 6, 13)}
      {cypress(148, 118, 50, 7.5, 14)}
      <P d="M158 118 C152 112 156 102 164 104 C166 96 178 96 178 106 C186 106 186 117 178 118" w={0.9} i={15} />
      <P d="M164 112 q3 -2 6 0 M168 106 q3 -2 6 0" w={0.45} o={0.5} i={16} />
      <P d="M30 30 q4 -4 7 0 q3 -4 7 0" w={0.8} i={17} />
      <P d="M46 20 q3 -3 5.5 0 q2.5 -3 5.5 0" w={0.7} o={0.8} i={18} />
      <P d="M150 26 q3 -3 5.5 0 q2.5 -3 5.5 0" w={0.7} o={0.8} i={18} />
    </Art>
  );
};

/** Wavy, ruffled line between two points (used for skirt tiers and lace hems). */
function ruffle(x1: number, y1: number, x2: number, y2: number, n: number, amp: number) {
  let d = `M${f(x1)} ${f(y1)}`;
  for (let k = 1; k <= n; k++) {
    const t0 = (k - 1) / n;
    const t1 = k / n;
    const mx = x1 + (x2 - x1) * ((t0 + t1) / 2);
    const my = y1 + (y2 - y1) * ((t0 + t1) / 2) + amp;
    d += ` Q${f(mx)} ${f(my)} ${f(x1 + (x2 - x1) * t1)} ${f(y1 + (y2 - y1) * t1)}`;
  }
  return d;
}

/** The Day: a couple slow-dancing by candlelight, their shadow dancing on the wall behind them. */
export const CandlelitDanceArt = ({ color, width = 210, paper = "#faf6f1" }: { color: string; width?: number; paper?: string }) => {
  const id = useId().replace(/:/g, "");
  // Silhouettes (also used for the shadow). He kisses her forehead; she stands in front.
  const groom =
    "M64.6 118 C65.4 98 64.8 80 64.4 70.4 C63.6 62 63.8 54 65 46.6 C65.6 43.4 67.4 41.4 69.8 40.2 C68.6 38 67.8 36 67.6 33.4 " +
    "C67 27.6 70.6 23.6 75.4 23.4 C78.4 23.3 80 25.4 79.8 27.6 L81.8 30.4 L80.2 31 L80.8 32.2 L80 33 C80.6 33.8 80.6 34.8 79.8 35.2 " +
    "C78.8 36.8 77.4 37.4 76.2 37.6 L76.4 40 C78 42.6 79.6 46 80 50 L79 72 L76.6 118 Z";
  const bride =
    "M87 30 C84.6 29.6 82.8 30.8 82.4 33 L82.2 34.6 L80.6 37.2 L82 37.8 L81.4 39 L82.2 39.6 C81.8 40.6 82 41.4 82.8 41.8 " +
    "C84 43 85.8 43.2 87.4 42.6 L87.8 45 C84 47 81.6 50 82.4 54 C83 57 84 59 84.4 60.4 C82 78 80 98 79 118.6 " +
    "C86 121 92 116 98 119.6 C104 122 110 116 120 116.4 C116 108 108 92 101 78 C97 70 93.6 64 91.8 60 " +
    "C93.4 56 94 52 93.6 48 C93 46 91.6 45 90.8 44.2 L90.6 40.2 C92 38.6 92.6 36.6 92 34 " +
    "C94.6 33.4 95.6 30.6 94 28.8 C92.6 27.2 90.4 27.6 89.6 28.8 C88.8 29.6 88 29.8 87 30 Z";
  const veil = "M93.6 29.8 C100.6 38.6 104.6 55 105 74 C105.2 87 102.4 98.6 97.6 106.6 C99 92 99.2 76 97.2 61 C96.2 52 94.8 44.6 92.6 36.2 Z";
  const grow = "translate(90 119) scale(1.12) translate(-90 -119)";
  return (
    <Art color={color} width={width}>
      <defs>
        <radialGradient id={`glow${id}`}>
          <stop offset="0" stopColor="#f6c77e" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#f6c77e" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f6c77e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`flame${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff6dd" />
          <stop offset="0.55" stopColor="#f8cf7c" />
          <stop offset="1" stopColor="#e39a4e" />
        </linearGradient>
        <filter id={`soft${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>

      {/* the room: a panelled wall and the floor */}
      <P d="M0 120 H200" w={0.8} o={0.6} i={0} />
      <P d="M8 86 H196 M8 89 H196" w={0.5} o={0.4} i={1} />
      <P d="M104 10 H190 V80 H104 Z M108 14 H186 V76 H108 Z" w={0.5} o={0.35} i={2} />
      <P d="M14 22 H52 V80 H14 Z" w={0.5} o={0.3} i={2} />
      <P d="M20 126 L12 130 M60 126 L56 130 M120 126 L124 130 M170 126 L178 130" w={0.4} o={0.3} i={3} />

      {/* warm candle glow */}
      <circle className="dt-late dt-candle-glow" cx="30" cy="52" r="58" fill={`url(#glow${id})`} stroke="none" style={{ transformBox: "view-box", transformOrigin: "30px 52px" }} />

      {/* their shadow on the wall: larger, softer, leaning away from the flame */}
      <g className="dt-late dt-shadow-flicker" style={{ transformBox: "view-box", transformOrigin: "126px 119px" }}>
        <g transform="translate(34 0) translate(90 119) skewX(-9) scale(1.14) translate(-90 -119)">
          <g className="dt-candle-sway" style={{ transformBox: "view-box", transformOrigin: "90px 119px" }}>
            <g filter={`url(#soft${id})`} fill={color} stroke="none" opacity="0.2" transform={grow}>
              <path d={groom} />
              <path d={bride} />
              <path d={veil} />
            </g>
          </g>
        </g>
      </g>

      {/* candlestick */}
      <ellipse pathLength={1} cx={30} cy={118.4} rx={11} ry={2.4} strokeWidth={1} style={{ ["--i" as string]: 3 }} />
      <P d="M23 117 C25 113 27 112 27.4 108 C27.6 104 25.6 102 25.6 99 C25.6 96 28.4 95.4 28.4 92 V86.6 M37 117 C35 113 33 112 32.6 108 C32.4 104 34.4 102 34.4 99 C34.4 96 31.6 95.4 31.6 92 V86.6" w={1} i={4} />
      <P d="M26 104.6 H34 M26.8 99 H33.2" w={0.5} o={0.6} i={5} />
      <ellipse pathLength={1} cx={30} cy={85.6} rx={8.4} ry={2} strokeWidth={1} style={{ ["--i" as string]: 5 }} />
      <P d="M26.4 85 V61.4 C27.6 60.4 32.4 60.4 33.6 61.4 V85" w={1.1} i={6} />
      <P d="M26.4 63 C27.4 66 28.2 67 27.8 70 M33.6 62.6 C32.8 64.6 32.8 66 33.2 67.6" w={0.6} o={0.7} i={7} />
      <P d="M30 60.6 V57.6" w={0.8} i={7} />

      {/* the flame */}
      <g className="dt-late dt-flame" style={{ transformBox: "view-box", transformOrigin: "30px 58px" }}>
        <path d="M30 58 C26.4 56 26.6 51.4 30 44.6 C33.4 51.4 33.6 56 30 58 Z" fill={`url(#flame${id})`} stroke="none" />
        <path d="M30 57.4 C28.8 56.4 28.8 54.4 30 52 C31.2 54.4 31.2 56.4 30 57.4 Z" fill="#fffaf0" stroke="none" />
      </g>

      {/* the couple: he kisses her forehead as they sway */}
      <g className="dt-candle-sway" style={{ transformBox: "view-box", transformOrigin: "90px 119px" }}>
        <g transform={grow}>
          {/* groom */}
          <path d={groom} fill={paper} stroke="none" />
          <P d={groom} w={1.1} i={8} />
          <P d="M67.8 33 C66.8 26.6 71 22.8 76.2 23.2 C78.6 23.4 80 24.8 80 26.4 C77 25.8 73.6 26.4 71.6 29" w={1} i={9} />
          <P d="M70 27.6 C71.6 25.4 74 24.4 76.6 24.6" w={0.4} o={0.55} i={10} />
          <P d="M72.4 31.2 C71 31.4 70.8 33.8 72.6 34" w={0.6} o={0.75} i={10} />
          <P d="M78.6 29.6 q-1.2 0.6 -2.2 0.1" w={0.5} o={0.7} i={11} />
          <P d="M69.8 40.4 L73.2 45.8 L76.4 40.2 M73.2 45.8 V68" w={0.7} o={0.85} i={11} />
          <P d="M64.4 70.4 C68 72 73 72.2 78.8 71" w={0.8} i={12} />
          <P d="M71 74 L70.2 117" w={0.6} o={0.7} i={12} />
          <P d="M62.6 118.4 C65.6 116.8 70.6 116.8 73.6 118.6" w={1} i={13} />
          {/* bride, in front of him */}
          <path d={bride} fill={paper} stroke="none" />
          <P d={bride} w={1.1} i={10} />
          <P d="M82.6 32.6 C83 28.8 87.8 27.2 91.4 29.6" w={0.9} i={11} />
          <P d="M92.6 30.8 m-1.2 0 a1.2 1.2 0 1 1 1.2 1.2" w={0.45} o={0.6} i={12} />
          <P d="M89.6 27.4 C90.6 26.2 92 25.8 93.4 26.2" w={0.6} o={0.8} i={12} />
          <P d="M84.4 34.6 q1.1 0.9 2.2 0.1" w={0.5} o={0.8} i={13} />
          <P d="M86.2 30.6 C87.6 31.6 88.8 33.4 89.2 35.6" w={0.4} o={0.5} i={13} />
          {/* sheer veil down her back */}
          <path d={veil} fill={paper} fillOpacity={0.55} stroke="none" />
          <P d={veil} w={0.7} o={0.75} i={14} />
          <P d="M95.4 40 C98 52 99.6 66 99.8 80 M96.4 46 C98.6 58 99.4 72 99.2 88" w={0.4} o={0.45} i={15} />
          {/* her arm over his shoulder, his around her waist */}
          <P d="M89.4 47.4 C82 44.4 74.6 43.8 67.4 46" w={0.9} i={15} />
          <P d="M67.4 46 l-1.2 -1.6 M67.6 47 l-1.6 -0.8" w={0.5} o={0.7} i={16} />
          <P d="M79.6 52 C84.6 56.4 89.6 57.6 93.4 54.4" w={0.9} i={15} />
          <P d="M93.4 54.4 l1.4 -1.4 M93.4 55.6 l1.8 -0.6" w={0.5} o={0.7} i={16} />
          {/* sash and gown */}
          <P d="M84.2 59.6 C87 61.4 89.8 61.6 92 60" w={0.8} i={16} />
          <P d={ruffle(79.4, 120.6, 120, 117.6, 8, 2)} w={0.4} o={0.5} i={17} />
          <P d="M88.4 63 C89.4 80 91 98 92 118 M85.2 64 C84.6 82 84.4 100 84.8 118.6 M91.2 62.6 C97 78 104 94 110.4 112" w={0.45} o={0.5} i={17} />
        </g>
      </g>

      {/* a few motes of light drifting up from the candle */}
      <circle className="dt-late dt-mote dt-mote-1" cx="34" cy="46" r="0.9" fill="#e9b46a" stroke="none" />
      <circle className="dt-late dt-mote dt-mote-2" cx="26" cy="44" r="0.7" fill="#e9b46a" stroke="none" />
      <circle className="dt-late dt-mote dt-mote-3" cx="31" cy="40" r="0.8" fill="#e9b46a" stroke="none" />
    </Art>
  );
};

/** Wedding gift: a lidded box with a full bow, flowing tails, a tag and a eucalyptus sprig. */
export const GiftArt = ({ color, width = 176 }: { color: string; width?: number }) => (
  <Art color={color} width={width}>
    <P d="M70 68 H128 V118 H70 Z" w={1.3} i={0} />
    <P d="M128 68 L142 60 V110 L128 118" w={1.1} i={1} />
    <P d="M66 58 H132 V68 H66 Z" w={1.2} i={2} />
    <P d="M66 58 L80 49 H146 L132 58 M132 68 L146 59 V49" w={1.1} i={3} />
    <P d="M96 68 V118 M102 68 V118" w={0.9} i={4} />
    <P d="M96 58 V68 M102 58 V68" w={0.9} i={4} />
    <P d="M99 53 L113 49" w={0.9} o={0.7} i={5} />
    <P d="M131 64 L139 59.5 M131 108 L139 103" w={0.5} o={0.5} i={5} />
    <P d="M74 110 l6 -5 M74 114 l9 -7 M80 116 l9 -7" w={0.45} o={0.45} i={6} />
    {/* bow */}
    <P d="M104 51 C92 30 70 30 76 44 C80 52 94 53 104 51 Z" w={1.2} i={7} />
    <P d="M104 51 C118 28 142 32 134 46 C130 53 115 54 104 51 Z" w={1.2} i={8} />
    <P d="M100 48 C92 41 85 39 82 42 M108 48 C117 40 125 39 129 42" w={0.55} o={0.6} i={9} />
    <ellipse pathLength={1} cx={104} cy={51} rx={4.5} ry={4} strokeWidth={1.1} style={{ ["--i" as string]: 10 }} />
    <P d="M101 55 C95 66 88 70 80 76 C76 79 77 84 82 82" w={0.9} i={11} />
    <P d="M107 55 C116 64 124 70 134 72 C139 73 140 79 134 79" w={0.9} i={12} />
    {/* tag on a string */}
    <P d="M108 54 C118 70 140 76 152 82" w={0.5} o={0.7} i={13} />
    <P d="M152 82 L166 78 L172 90 L158 94 Z" w={0.9} i={14} />
    <circle pathLength={1} cx={155} cy={85} r={1.3} strokeWidth={0.7} style={{ ["--i" as string]: 15 }} />
    <P d={heart(164, 86, 3.2)} w={0.7} i={15} />
    <Sprig from={{ x: 68, y: 62 }} ang={Math.PI + 0.45} len={34} bend={0.22} leaves={6} leafLen={8} i={16} round />
    <Sprig from={{ x: 72, y: 118 }} ang={Math.PI + 0.1} len={34} bend={-0.18} leaves={4} leafLen={8} i={20} />
    <Sparkle x={150} y={30} r={4} i={23} />
    <Sparkle x={52} y={34} r={3} i={24} o={0.6} />
  </Art>
);

/** RSVP: a quill writing a flourish, beside a cut-glass inkwell. */
export const QuillArt = ({ color, width = 176 }: { color: string; width?: number }) => {
  const nib = { x: 104, y: 110 };
  const tip = { x: 178, y: 10 };
  const ctrl = { x: 134, y: 52 };
  const at = (t: number) => ({
    x: (1 - t) ** 2 * nib.x + 2 * (1 - t) * t * ctrl.x + t * t * tip.x,
    y: (1 - t) ** 2 * nib.y + 2 * (1 - t) * t * ctrl.y + t * t * tip.y,
  });
  const barbs: string[] = [];
  const left: V[] = [];
  const right: V[] = [];
  for (let k = 0; k <= 20; k++) {
    const t = 0.2 + (k / 20) * 0.78;
    const p = at(t);
    const q = at(t + 0.01);
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const wL = 15 * Math.sin(Math.PI * Math.min(1, (t - 0.12) / 0.9)) + 1;
    const wR = 9 * Math.sin(Math.PI * Math.min(1, (t - 0.15) / 0.87)) + 1;
    const l = { x: p.x + Math.cos(ang - 1.0) * wL, y: p.y + Math.sin(ang - 1.0) * wL };
    const r = { x: p.x + Math.cos(ang + 1.0) * wR, y: p.y + Math.sin(ang + 1.0) * wR };
    left.push(l);
    right.push(r);
    if (k % 2 === 0 && k < 19) {
      barbs.push(`M${f(p.x)} ${f(p.y)} L${f(p.x + (l.x - p.x) * 0.85)} ${f(p.y + (l.y - p.y) * 0.85)}`);
      barbs.push(`M${f(p.x)} ${f(p.y)} L${f(p.x + (r.x - p.x) * 0.8)} ${f(p.y + (r.y - p.y) * 0.8)}`);
    }
  }
  const start = at(0.2);
  const vaneL = `M${f(start.x)} ${f(start.y)} ` + left.map((p, k) => `${k % 5 === 3 ? "L" : "L"}${f(p.x + (k % 5 === 3 ? -1.5 : 0))} ${f(p.y + (k % 5 === 3 ? 1.5 : 0))}`).join(" ") + ` L${tip.x} ${tip.y}`;
  const vaneR = `M${f(start.x)} ${f(start.y)} ` + right.map((p) => `L${f(p.x)} ${f(p.y)}`).join(" ") + ` L${tip.x} ${tip.y}`;
  return (
    <Art color={color} width={width}>
      {/* inkwell */}
      <P d="M28 120 H64" w={1.1} i={0} />
      <P d="M31 120 L34 98 H58 L61 120" w={1.2} i={1} />
      <P d="M34 98 L38 92 H54 L58 98" w={1} i={2} />
      <P d="M40 92 V86 H52 V92" w={1} i={3} />
      <P d="M38.5 86 H53.5" w={1.2} i={3} />
      <P d="M41 120 L43 98 M51 120 L49 98" w={0.5} o={0.55} i={4} />
      <P d="M36 108 C40 106 44 110 48 108" w={0.5} o={0.5} i={5} />
      {/* quill */}
      <P d={`M${nib.x} ${nib.y} Q${ctrl.x} ${ctrl.y} ${tip.x} ${tip.y}`} w={1.1} i={6} />
      <P d={vaneL} w={0.9} i={7} />
      <P d={vaneR} w={0.9} i={8} />
      <P d={barbs.join(" ")} w={0.4} o={0.55} i={9} />
      <P d={`M${nib.x} ${nib.y} L${nib.x - 3} ${nib.y + 8} L${nib.x + 3} ${nib.y + 4} Z M${nib.x - 1.5} ${nib.y + 5} L${nib.x} ${nib.y + 1}`} w={0.9} i={10} />
      {/* the flourish it is writing */}
      <P d="M101 118 C112 126 134 124 146 114 C156 105 148 96 140 103 C132 111 150 126 176 116 C184 113 188 108 186 104" w={1} i={11} />
      <P d="M120 124 C128 127 136 127 142 125" w={0.6} o={0.55} i={12} />
      <circle pathLength={1} cx={190} cy={100} r={1.2} strokeWidth={0.8} style={{ ["--i" as string]: 13 }} />
      <Sprig from={{ x: 26, y: 120 }} ang={-Math.PI * 0.8} len={30} bend={0.25} leaves={5} leafLen={7.5} i={14} />
      <Sparkle x={70} y={80} r={3.5} i={18} o={0.6} />
    </Art>
  );
};
