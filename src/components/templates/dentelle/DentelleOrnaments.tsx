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

/** The Day: a bride and groom dancing a waltz twirl, fashion-illustration style. Draws itself, then keeps dancing. */
export const DancingCoupleArt = ({ color, width = 210 }: { color: string; width?: number }) => {
  const note = (x: number, y: number, i: number, cls: string) => (
    <g className={cls} style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }}>
      <P d={`M${x} ${y} V${y - 9} Q${x + 4} ${y - 7} ${x + 5} ${y - 4}`} w={0.8} o={0.75} i={i} />
      <ellipse pathLength={1} cx={x - 2} cy={y} rx={2.2} ry={1.6} transform={`rotate(-20 ${x - 2} ${y})`} strokeWidth={0.8} opacity={0.75} style={{ ["--i" as string]: i }} />
    </g>
  );
  const petal = (x: number, y: number, s: number, cls: string, i: number) => (
    <g className={`dt-dance-petal ${cls}`} style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }}>
      <P d={`M${x} ${y} q${f(s * 0.9)} ${f(-s * 0.9)} ${f(s * 1.6)} 0 q${f(-s * 0.7)} ${f(s * 0.8)} ${f(-s * 1.6)} 0`} w={0.6} o={0.7} i={i} />
    </g>
  );
  // lace dots across the bodice
  const lace: React.ReactNode[] = [];
  [[119, 44], [122.5, 44.5], [118.5, 49], [122, 49.5], [125, 48.5], [120, 53.5], [123.5, 53.5]].forEach(([x, y], k) =>
    lace.push(<circle key={k} pathLength={1} cx={x} cy={y} r={0.55} strokeWidth={0.5} opacity={0.6} style={{ ["--i" as string]: 9 + k * 0.2 }} />),
  );
  const necklace = [116.8, 118.6, 120.6, 122.6, 124.4].map((x, k) => (
    <circle key={k} pathLength={1} cx={x} cy={39.6 + Math.sin((k / 4) * Math.PI) * 1.4} r={0.45} strokeWidth={0.5} opacity={0.7} style={{ ["--i" as string]: 8 + k * 0.2 }} />
  ));
  return (
    <Art color={color} width={width}>
      {/* hanging rose garlands in the top corners */}
      <P d="M2 4 C20 16 38 20 56 16" w={0.8} o={0.7} i={0} />
      <P d="M198 4 C180 16 162 20 144 16" w={0.8} o={0.7} i={0} />
      {[0.12, 0.26, 0.4, 0.55, 0.7, 0.86].flatMap((t, k) => {
        const bez = (p0: number, p1: number, p2: number, p3: number) => (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3;
        const lx = bez(2, 20, 38, 56);
        const ly = bez(4, 16, 20, 16);
        const side = k % 2 ? 1 : -1;
        const l1 = leaf(lx, ly, -0.4 + side * 1.2, 5);
        const l2 = leaf(200 - lx, ly, Math.PI + 0.4 - side * 1.2, 5);
        return [<P key={`gl${k}`} d={l1.outline} w={0.6} o={0.85} i={1 + k * 0.3} />, <P key={`gr${k}`} d={l2.outline} w={0.6} o={0.85} i={1 + k * 0.3} />];
      })}
      <Rose x={22} y={13} r={4.2} i={1} />
      <Rose x={44} y={18} r={3.4} i={2} />
      <Rose x={178} y={13} r={4.2} i={1} />
      <Rose x={156} y={18} r={3.4} i={2} />
      <Sprig from={{ x: 30, y: 16 }} ang={Math.PI * 0.55} len={16} bend={0.2} leaves={3} leafLen={5} i={3} w={0.7} />
      <Sprig from={{ x: 170, y: 16 }} ang={Math.PI * 0.45} len={16} bend={-0.2} leaves={3} leafLen={5} i={3} w={0.7} />
      <Sprig from={{ x: 54, y: 16 }} ang={0.4} len={12} bend={0.2} leaves={2} leafLen={4.5} i={4} w={0.6} />
      <Sprig from={{ x: 146, y: 16 }} ang={Math.PI - 0.4} len={12} bend={-0.2} leaves={2} leafLen={4.5} i={4} w={0.6} />

      {/* floor: soft reflection */}
      <P d="M56 124.5 C84 128 136 128 172 124.5" w={0.7} o={0.5} i={0} />
      <P d="M76 127.5 h8 M92 128.5 h10 M112 128.5 h12 M132 127.8 h10 M150 126.8 h7" w={0.4} o={0.35} i={1} />

      {/* the couple sways together */}
      <g className="dt-dance-sway" style={{ transformBox: "view-box", transformOrigin: "110px 123px" }}>
        {/* ---------- groom (leaning into the dance) ---------- */}
        <g transform="rotate(-3 88 122)">
          <P d="M84 18.5 C88 16 93.2 17.4 94.2 21.2 L95.8 24.4 L94.5 25.1 C94.9 26 94.6 27.1 93.9 27.5 C93.7 29.6 92 31.3 89.4 31.1 C86 30.8 83.2 28.6 82.6 25.2 C82.2 22 82.6 19.9 84 18.5 Z" w={1.1} i={1} />
          <P d="M82.6 25 C80.8 18.5 85.5 14.6 91.5 16 C93.8 16.6 95 18 94.6 19.8 C92 18.4 89 18.6 86.6 20.5" w={1.2} i={2} />
          <P d="M84.5 19.5 C86 18 88.5 17.4 90.6 17.6 M83.6 22 C84.6 20.4 86.4 19.5 88.2 19.4" w={0.4} o={0.55} i={3} />
          <P d="M86.4 24 C85.2 24.2 85 26.6 86.6 26.8" w={0.6} o={0.7} i={3} />
          <P d="M88.6 31 V34.4 M91.6 30.4 V34" w={0.9} i={3} />
          <P d="M86 35 L89.6 36.6 L93 35 V38.4 L89.6 36.8 L86 38.4 Z" w={0.7} i={4} />
          {/* tailcoat */}
          <P d="M79.6 37.6 C82 35.6 85 35 87 35.4 M92.2 35.2 C94.5 35 97 35.8 98.2 37.8" w={1.2} i={4} />
          <P d="M79.6 37.6 C77.6 49 78 61 80.2 72.5 M98.2 37.8 C99 47 98.6 56 96.6 63 L92 72.5" w={1.25} i={5} />
          <P d="M87 35.6 L89.8 48 L92.2 35.4 M87 35.6 L84.6 42.6 L88.2 45 M92.2 35.4 L94.8 42 L91.4 44.8" w={0.7} o={0.85} i={6} />
          <P d="M89.8 48 V63 M89.2 53 h1.4 M89.2 58 h1.4" w={0.5} o={0.6} i={7} />
          <P d="M93.6 43.6 l3 -0.6 l-0.4 2.6 Z" w={0.5} o={0.7} i={7} />
          <circle pathLength={1} cx={84.2} cy={41.4} r={1.3} strokeWidth={0.6} style={{ ["--i" as string]: 7 }} />
          <P d="M83.6 42.8 l-1.2 2 M84.8 42.8 l1 2" w={0.45} o={0.7} i={7} />
          {/* coat tails flare behind him */}
          <g className="dt-dance-tails" style={{ transformBox: "view-box", transformOrigin: "80px 66px" }}>
            <P d="M80.2 66 C78.6 76 76 86 71.5 94 L77.6 92 L80.6 86" w={1} i={8} />
            <P d="M79.6 72 C78 80 76.4 86 74 91" w={0.4} o={0.5} i={9} />
          </g>
          {/* arms: one raised to lead her twirl, one at his waist */}
          <P d="M97 39 C102.5 31 108.4 21.6 114.6 12.8" w={1.1} i={8} />
          <P d="M98.4 40.6 C103.6 33 109.4 23.6 115.4 13.8" w={0.4} o={0.45} i={9} />
          <P d="M80.4 39.5 C77.4 47 77.6 54 81.4 59.5 C83 61.5 85.6 61 86.4 59" w={1.1} i={8} />
          <P d="M80.6 55.5 C82 57 83.6 57.4 85.4 57" w={0.45} o={0.5} i={9} />
          {/* trousers and shoes */}
          <P d="M81.2 72.5 L80 121 M87.4 74.5 L86 121" w={1.1} i={9} />
          <P d="M89.4 74.5 L95.4 120 M95.4 72.5 L101.2 119" w={1.1} i={9} />
          <P d="M83.8 76 L83 118 M92.8 78 L98.2 116" w={0.4} o={0.45} i={10} />
          <P d="M77.4 122 C80 120.6 85 120.6 87.6 122 Z M93.6 121.6 C97 119.8 101.6 119.6 104.4 121.4 Z" w={1.1} i={10} />
          <P d="M79 121 h3 M96 120.6 h3" w={0.4} o={0.6} i={11} />
        </g>

        {/* ---------- bride ---------- */}
        {/* veil */}
        <g className="dt-dance-veil" style={{ transformBox: "view-box", transformOrigin: "128px 24px" }}>
          <P d="M130.6 22.6 C141 25 149 34 153 46 C156 56 159 66 166 76" w={0.85} o={0.8} i={6} />
          <P d="M129.6 28.6 C131.6 40 136 52 140.4 62 C142 66 143 70 143.6 74" w={0.85} o={0.8} i={6} />
          <P d={ruffle(143.6, 74, 166, 76, 5, 2.2)} w={0.75} o={0.8} i={7} />
          <P d="M133 27 C139 36 144 48 148 60 C150 66 152 70 154 75 M136 25.6 C143 33 148 44 152 56 C154.6 63 157.6 69 160.6 75.4" w={0.4} o={0.45} i={8} />
        </g>
        {/* face, hair, comb */}
        <P d="M124.6 23.4 C120 22.4 116.6 25 116.2 28.4 L114.7 31 L116.2 31.6 C115.8 32.6 116 33.6 116.8 34 C117.2 35.6 118.8 36.7 120.8 36.4 C124 36 126.6 33.4 126.8 30 C127 26.6 126.4 24.4 124.6 23.4 Z" w={1.05} i={2} />
        <P d="M116.4 26.6 C117 21 123.4 19.4 127.4 22.6 C129 24 129 26.6 127.8 28.8" w={1.15} i={3} />
        <circle pathLength={1} cx={129} cy={23.6} r={3.4} strokeWidth={1.1} style={{ ["--i" as string]: 3 }} />
        <P d="M129 23.6 m-1.6 0 a1.6 1.6 0 1 1 1.6 1.6" w={0.5} o={0.6} i={4} />
        <P d="M118 24 C120.4 22.2 123.6 21.8 126 23 M117.4 26 C119.4 24.2 122 23.6 124.6 24.4" w={0.4} o={0.55} i={4} />
        <P d="M127 30.6 C128.8 33.6 128 36.8 126.2 38.6 C125.4 39.4 125.6 40.6 126.6 40.6" w={0.6} o={0.8} i={5} />
        <circle pathLength={1} cx={127.2} cy={20.6} r={1} strokeWidth={0.6} style={{ ["--i" as string]: 5 }} />
        <circle pathLength={1} cx={129.6} cy={20} r={0.8} strokeWidth={0.6} style={{ ["--i" as string]: 5.3 }} />
        <circle pathLength={1} cx={131.6} cy={21.2} r={0.9} strokeWidth={0.6} style={{ ["--i" as string]: 5.6 }} />
        <P d="M120.2 36.4 V39 M123.2 35.6 V38.6" w={0.9} i={5} />
        {necklace}
        {/* lace bodice with sweetheart neckline */}
        <P d="M115 40 C116.4 42.4 119 42.6 120.6 41 C122.2 42.6 124.8 42.4 126.4 40" w={1} i={6} />
        <P d="M115 40 C113.8 47 114.6 53 116.6 58.6 M126.4 40 C127.8 47 127.4 53 125 58.6" w={1.15} i={7} />
        {lace}
        <P d={ruffle(116, 47, 126.6, 46.6, 4, 1)} w={0.4} o={0.5} i={10} />
        {/* sash and bow at the waist */}
        <P d="M116.4 56.6 C119.4 57.6 122.6 57.6 125.4 56.6 M116.8 59 C119.6 60 122.6 60 125.2 59" w={0.9} i={11} />
        <P d="M125.4 57.8 C129 54 132 55 131 57.8 C130.4 59.4 127.6 59 125.4 57.8 C128.6 61 130.6 62.6 129 64.4" w={0.8} i={12} />
        {/* arms: one raised into his hand, one holding the bouquet out */}
        <P d="M115.6 41.4 C111.6 33 110.2 22.6 109.6 12.8" w={1.1} i={8} />
        <circle pathLength={1} cx={109.2} cy={11.2} r={1.9} strokeWidth={0.9} style={{ ["--i" as string]: 9 }} />
        <P d="M126.4 42 C133 45.4 137.6 50.4 138.6 55.4" w={1.1} i={9} />
        {/* bouquet with trailing ribbons */}
        <g className="dt-dance-bouquet" style={{ transformBox: "view-box", transformOrigin: "139px 57px" }}>
          <Rose x={139} y={58} r={3.2} i={10} />
          <Rose x={143.6} y={55.4} r={2.6} i={11} />
          <Rose x={142.4} y={61} r={2.4} i={12} />
          <P d={leaf(136, 60, Math.PI * 0.7, 6).outline} w={0.6} i={12} />
          <P d={leaf(146, 57, -0.3, 5.5).outline} w={0.6} i={12} />
          <P d={leaf(145, 63, 0.6, 5).outline} w={0.6} i={13} />
          <P d="M140 62 C139 70 142 76 138 84 M141.6 62.4 C143.6 70 147 74 146 82" w={0.6} o={0.8} i={13} />
        </g>
        {/* layered, ruffled skirt and train */}
        <g className="dt-dance-skirt" style={{ transformBox: "view-box", transformOrigin: "121px 58px" }}>
          <P d="M150 104 C163 110 176 116 190 120 C178 123.4 160 123.4 148 118" w={0.9} i={12} />
          <P d={ruffle(150, 118.5, 189, 120.4, 6, 1.4)} w={0.45} o={0.5} i={13} />
          <P d="M116.6 59.4 C111.4 76 105.8 96 100 115" w={1.25} i={13} />
          <P d="M125 59.4 C133.4 74 146.4 92 160.4 108" w={1.25} i={13} />
          <P d={ruffle(110.6, 78, 137, 77, 6, 2.4)} w={0.8} i={14} />
          <P d={ruffle(105.2, 96, 148.6, 93.2, 8, 2.8)} w={0.85} i={15} />
          <P d={ruffle(100, 115, 160.4, 108, 10, 3.4)} w={1.15} i={16} />
          <P d={ruffle(100.8, 117.6, 160.8, 110.8, 10, 2.6)} w={0.4} o={0.55} i={17} />
          <P d="M120 61 C118.6 72 117.6 74 117.2 79 M122.8 61 C126 70 128 72 130 79" w={0.45} o={0.5} i={17} />
          <P d="M116 82 C113.6 88 112.4 92 111.2 97 M126 81 C130 87 132.6 91 135 96 M136 81 C140.6 86 143 90 145.6 95" w={0.45} o={0.5} i={18} />
          <P d="M110 100 C107.6 106 106.4 110 105.6 116 M122.6 99 C123 106 123.4 110 123.4 117 M137 98 C141 104 143.4 108 145.6 113" w={0.45} o={0.5} i={18} />
        </g>
      </g>

      {/* music and drifting petals */}
      {note(56, 50, 19, "dt-dance-note dt-dance-note-1")}
      {note(166, 76, 20, "dt-dance-note dt-dance-note-2")}
      {note(44, 76, 21, "dt-dance-note dt-dance-note-3")}
      {petal(66, 28, 3, "dt-dance-petal-1", 20)}
      {petal(148, 30, 2.6, "dt-dance-petal-2", 21)}
      {petal(170, 40, 2.4, "dt-dance-petal-3", 21)}
      {petal(34, 44, 2.6, "dt-dance-petal-4", 22)}
      <Sparkle x={70} y={40} r={3.6} i={22} />
      <Sparkle x={150} y={86} r={2.8} i={23} o={0.6} />
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
