import { useEffect, useRef, useState } from "react";

/**
 * Pressed lace backdrop for the Rêverie hero.
 * A smooth ivory panel with a fine beaded, scalloped rim sits exactly where the invitation
 * card is. Around it runs one delicate lace vine (small leaves, the odd tiny flower, a rosette
 * at the top of the arch and at the bottom corners); wide screens add an outer picot thread,
 * then plain linen. Tone-on-tone with a soft relief, drawn once per size on a canvas.
 */

type Pt = { x: number; y: number };
type RGB = [number, number, number];

const BG: RGB = [234, 228, 221]; // linen behind the lace
const LACE: RGB = [245, 241, 236]; // the pressed lace, a shade lighter than the linen
const PANEL: RGB = [250, 247, 243]; // smooth centre panel

// Light comes from the top left.
const LX = -0.55;
const LY = -0.83;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Evenly spaced points (clockwise) around a rounded rectangle with an arched top. */
function outline(x: number, y: number, w: number, h: number, spacing: number) {
  const rt = Math.max(4, Math.min(w / 2, h * 0.32) * 0.92);
  const rb = Math.max(4, Math.min(w * 0.14, h * 0.1, 48));
  type Seg = { len: number; at: (t: number) => Pt };
  const line = (a: Pt, b: Pt): Seg => ({ len: Math.hypot(b.x - a.x, b.y - a.y), at: (t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }) });
  const arc = (cx: number, cy: number, r: number, a0: number, a1: number): Seg => ({
    len: Math.abs(a1 - a0) * r,
    at: (t) => ({ x: cx + r * Math.cos(a0 + (a1 - a0) * t), y: cy + r * Math.sin(a0 + (a1 - a0) * t) }),
  });
  const segs: Seg[] = [
    line({ x: x + rt, y }, { x: x + w - rt, y }),
    arc(x + w - rt, y + rt, rt, -Math.PI / 2, 0),
    line({ x: x + w, y: y + rt }, { x: x + w, y: y + h - rb }),
    arc(x + w - rb, y + h - rb, rb, 0, Math.PI / 2),
    line({ x: x + w - rb, y: y + h }, { x: x + rb, y: y + h }),
    arc(x + rb, y + h - rb, rb, Math.PI / 2, Math.PI),
    line({ x, y: y + h - rb }, { x, y: y + rt }),
    arc(x + rt, y + rt, rt, Math.PI, Math.PI * 1.5),
  ];
  const total = segs.reduce((s, g) => s + g.len, 0);
  const n = Math.max(12, Math.round(total / spacing));
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    let d = (i / n) * total;
    let k = 0;
    while (k < segs.length - 1 && d > segs[k].len) d -= segs[k++].len;
    pts.push(segs[k].at(segs[k].len ? Math.min(1, d / segs[k].len) : 0));
  }
  // outward normals (clockwise order on screen => (ty, -tx))
  const normals = pts.map((_, i) => {
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    const tx = b.x - a.x;
    const ty = b.y - a.y;
    const l = Math.hypot(tx, ty) || 1;
    return { x: ty / l, y: -tx / l };
  });
  return { pts, normals };
}

function scallopPath(o: ReturnType<typeof outline>, depth: number) {
  const p = new Path2D();
  const { pts, normals } = o;
  p.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const na = normals[i];
    const nb = normals[(i + 1) % pts.length];
    const nx = (na.x + nb.x) / 2;
    const ny = (na.y + nb.y) / 2;
    p.quadraticCurveTo((a.x + b.x) / 2 + nx * depth * 2, (a.y + b.y) / 2 + ny * depth * 2, b.x, b.y);
  }
  p.closePath();
  return p;
}

function smoothPath(o: ReturnType<typeof outline>) {
  const p = new Path2D();
  o.pts.forEach((pt, i) => (i ? p.lineTo(pt.x, pt.y) : p.moveTo(pt.x, pt.y)));
  p.closePath();
  return p;
}

// ---------- lace motifs (drawn as solid shapes into a mask) ----------
function leaf(g: CanvasRenderingContext2D, x: number, y: number, ang: number, s: number) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  g.beginPath();
  g.moveTo(0, 0);
  g.quadraticCurveTo(s * 0.8, -s * 0.46, s * 1.75, 0);
  g.quadraticCurveTo(s * 0.8, s * 0.46, 0, 0);
  g.fill();
  g.restore();
}

function flower(g: CanvasRenderingContext2D, x: number, y: number, r: number, petals = 5, rot = 0) {
  for (let k = 0; k < petals; k++) {
    const a = rot + (k / petals) * Math.PI * 2;
    g.beginPath();
    g.ellipse(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.52, r * 0.3, a, 0, Math.PI * 2);
    g.fill();
  }
  g.beginPath();
  g.arc(x, y, r * 0.24, 0, Math.PI * 2);
  g.fill();
}

function rosette(g: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  for (let k = 0; k < 8; k++) {
    const a = rot + (k / 8) * Math.PI * 2;
    g.beginPath();
    g.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.42, r * 0.2, a, 0, Math.PI * 2);
    g.fill();
  }
  flower(g, x, y, r * 0.42, 6, rot + 0.3);
  for (let k = 0; k < 12; k++) {
    const a = rot + (k / 12) * Math.PI * 2;
    g.beginPath();
    g.arc(x + Math.cos(a) * r * 1.18, y + Math.sin(a) * r * 1.18, r * 0.07, 0, Math.PI * 2);
    g.fill();
  }
}

// ---------- image helpers ----------
function alphaOf(c: HTMLCanvasElement) {
  const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
  const a = new Float32Array(c.width * c.height);
  for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3] / 255;
  return a;
}

/** Separable box blur, run twice (close to a gaussian). */
function blur(src: Float32Array, w: number, h: number, r: number) {
  if (r < 1) return src.slice();
  const a = src.slice();
  const b = new Float32Array(a.length);
  const inv = 1 / (2 * r + 1);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let s = 0;
      for (let x = -r; x <= r; x++) s += a[row + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[row + x] = s * inv;
        s += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let y = -r; y <= r; y++) s += b[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = s * inv;
        s += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
      }
    }
  }
  return a;
}

function render(out: HTMLCanvasElement, cssW: number, cssH: number, card: { x: number; y: number; w: number; h: number }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.round(cssW * dpr);
  const H = Math.round(cssH * dpr);
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    g.fillStyle = g.strokeStyle = "#fff";
    g.lineCap = g.lineJoin = "round";
    return { c, g };
  };
  const mobile = cssW < 600;
  const spacing = mobile ? 17 : 21;
  const rim = outline(card.x, card.y, card.w, card.h, spacing);
  const rimPath = scallopPath(rim, spacing * 0.2);

  // 1) lace mask
  const lace = mk();
  const g = lace.g;
  const rnd = seeded(20271);

  // margin between the card and the screen edge, so the vine sits in the middle of it on phones
  const margin = Math.min(card.x, card.y, cssW - card.x - card.w);
  const off = Math.max(10, Math.min(mobile ? 16 : 22, margin * 0.5));

  // one fine wavy vine running evenly around the panel
  const step = 3;
  const trail = outline(card.x - off, card.y - off, card.w + off * 2, card.h + off * 2, step);
  const tn = trail.pts.length;
  const period = (mobile ? 52 : 60) / step; // points per wave — a long, gentle curve
  const amp = mobile ? 1.3 : 1.6;
  const at = (i: number) => {
    const k = ((i % tn) + tn) % tn;
    const a = Math.sin((i / period) * Math.PI * 2) * amp;
    return { x: trail.pts[k].x + trail.normals[k].x * a, y: trail.pts[k].y + trail.normals[k].y * a, n: trail.normals[k] };
  };
  const vine = new Path2D();
  for (let i = 0; i <= tn; i++) {
    const q = at(i);
    if (i) vine.lineTo(q.x, q.y);
    else vine.moveTo(q.x, q.y);
  }
  g.lineWidth = mobile ? 0.9 : 1.1;
  g.stroke(vine);
  // a small leaf on each crest, alternating sides; now and then a tiny flower or three dots
  const half = Math.max(2, Math.round(period / 2));
  for (let i = 0, k = 0; i < tn; i += half, k++) {
    const q = at(i);
    const q2 = at(i + 1);
    const tl = Math.hypot(q2.x - q.x, q2.y - q.y) || 1;
    const tx = (q2.x - q.x) / tl;
    const ty = (q2.y - q.y) / tl;
    const side = k % 2 ? -1 : 1;
    const dx = tx * Math.cos(0.8) + q.n.x * side * Math.sin(0.8);
    const dy = ty * Math.cos(0.8) + q.n.y * side * Math.sin(0.8);
    leaf(g, q.x, q.y, Math.atan2(dy, dx), mobile ? 4.4 : 5.2);
    if (k % 9 === 4) flower(g, q.x + q.n.x * side * 5, q.y + q.n.y * side * 5, mobile ? 3 : 3.6, 5, rnd() * 6);
    else if (k % 9 === 8) {
      for (let d = 0; d < 3; d++) {
        g.beginPath();
        g.arc(q.x - q.n.x * side * (4 + d * 2.2) + tx * (d - 1) * 2.4, q.y - q.n.y * side * (4 + d * 2.2) + ty * (d - 1) * 2.4, 0.9, 0, Math.PI * 2);
        g.fill();
      }
    }
  }
  // a rosette at the top of the arch and at the two bottom corners
  const nearest = (x: number, y: number) =>
    trail.pts.reduce((best, p) => (Math.hypot(p.x - x, p.y - y) < Math.hypot(best.x - x, best.y - y) ? p : best), trail.pts[0]);
  [
    nearest(card.x + card.w / 2, card.y - off),
    nearest(card.x - off, card.y + card.h + off),
    nearest(card.x + card.w + off, card.y + card.h + off),
  ].forEach((p, i) => rosette(g, p.x, p.y, mobile ? 5.5 : 7, i * 0.7));

  // wide screens: an outer picot thread, then plain linen
  if (!mobile) {
    const off2 = off + 26;
    const thread = outline(card.x - off2, card.y - off2, card.w + off2 * 2, card.h + off2 * 2, 10);
    g.lineWidth = 0.8;
    g.stroke(smoothPath(thread));
    thread.pts.forEach((p, i) => {
      const n = thread.normals[i];
      g.beginPath();
      g.arc(p.x + n.x * 2.6, p.y + n.y * 2.6, 0.95, 0, Math.PI * 2);
      g.fill();
    });
  }

  // fine beaded, scalloped rim + a hairline just inside it
  g.lineWidth = mobile ? 2 : 2.4;
  g.stroke(rimPath);
  rim.pts.forEach((p, i) => {
    const n = rim.normals[i];
    g.beginPath();
    g.arc(p.x + n.x * 1.4, p.y + n.y * 1.4, mobile ? 1.4 : 1.7, 0, Math.PI * 2);
    g.fill();
  });
  g.lineWidth = 0.8;
  g.stroke(smoothPath(outline(card.x + 9, card.y + 9, card.w - 18, card.h - 18, 6)));

  // 2) panel area
  const panel = mk();
  panel.g.fill(rimPath);

  // 3) light it
  const M = alphaOf(lace.c);
  const P = alphaOf(panel.c);
  const Hh = blur(M, W, H, Math.max(1, Math.round(0.9 * dpr)));
  const shifted = new Float32Array(M.length);
  const ox = Math.round(1.1 * dpr);
  const oy = Math.round(1.7 * dpr);
  for (let y = oy; y < H; y++) for (let x = ox; x < W; x++) shifted[y * W + x] = M[(y - oy) * W + (x - ox)];
  const S = blur(shifted, W, H, Math.round(1.6 * dpr));
  const Pb = blur(P, W, H, Math.round(14 * dpr));

  const img = out.getContext("2d")!.createImageData(W, H);
  const d = img.data;
  const cx = W / 2;
  const cy = H * 0.45;
  const maxR = Math.hypot(cx, Math.max(cy, H - cy));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const m = M[i];
      const p = P[i];
      // base: linen (slightly darker towards the screen edges) or the smooth panel
      const vig = 1 - 0.07 * Math.pow(Math.hypot(x - cx, y - cy) / maxR, 2);
      let r = BG[0] * vig;
      let gg = BG[1] * vig;
      let b = BG[2] * vig;
      if (p > 0) {
        const inner = 1 - 0.04 * (1 - Pb[i]) * 2; // soft recess just inside the rim
        r = r * (1 - p) + PANEL[0] * inner * p;
        gg = gg * (1 - p) + PANEL[1] * inner * p;
        b = b * (1 - p) + PANEL[2] * inner * p;
      }
      // cast shadow of the lace onto what lies beneath
      const sh = 1 - 0.16 * S[i] * (1 - m);
      r *= sh;
      gg *= sh;
      b *= sh;
      // the lace itself
      r = r * (1 - m) + LACE[0] * m;
      gg = gg * (1 - m) + LACE[1] * m;
      b = b * (1 - m) + LACE[2] * m;
      // relief lighting
      if (x > 0 && x < W - 1 && y > 0 && y < H - 1) {
        const nx = Hh[i - 1] - Hh[i + 1];
        const ny = Hh[i - W] - Hh[i + W];
        const lit = (nx * LX + ny * LY) * 1.6;
        if (lit > 0) {
          const k = Math.min(1, lit) * 0.6;
          r += (255 - r) * k;
          gg += (253 - gg) * k;
          b += (250 - b) * k;
        } else {
          const k = Math.min(0.3, -lit * 0.5);
          r *= 1 - k;
          gg *= 1 - k * 1.04;
          b *= 1 - k * 1.1;
        }
      }
      const n = (Math.random() - 0.5) * 3;
      d[i * 4] = r + n;
      d[i * 4 + 1] = gg + n;
      d[i * 4 + 2] = b + n;
      d[i * 4 + 3] = 255;
    }
  }
  out.width = W;
  out.height = H;
  out.getContext("2d")!.putImageData(img, 0, 0);
}

export const ReverieLace = ({ cardRef }: { cardRef: React.RefObject<HTMLDivElement> }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;
    let timer = 0;
    let last = "";
    const draw = () => {
      const card = cardRef.current;
      if (!card) return;
      const o = wrap.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      if (!o.width || !o.height || !r.width) return;
      const box = { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
      const key = [o.width, o.height, box.x, box.y, box.w, box.h].map(Math.round).join(",");
      if (key === last) return;
      last = key;
      try {
        render(cv, o.width, o.height, box);
        setReady(true);
      } catch {
        /* keep the plain linen background */
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = window.setTimeout(draw, 120);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(wrap);
    if (cardRef.current) ro.observe(cardRef.current);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [cardRef]);

  return (
    <div ref={wrapRef} aria-hidden className="absolute inset-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ opacity: ready ? 1 : 0, transition: "opacity .6s ease" }}
      />
    </div>
  );
};
