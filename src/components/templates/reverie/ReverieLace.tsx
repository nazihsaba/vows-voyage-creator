import { useEffect, useRef, useState } from "react";

/**
 * Embossed lace backdrop for the Rêverie hero.
 * Raised ivory lace (vines, leaves, small flowers, rosettes) surrounds a smooth ivory
 * panel with a scalloped, beaded rim. The panel sits exactly where the invitation card is.
 * Drawn once per size on a canvas, then lit like a relief, so it costs nothing while
 * the page animates or scrolls.
 */

type Pt = { x: number; y: number };
type RGB = [number, number, number];

const BG: RGB = [230, 224, 218]; // linen behind the lace
const LACE: RGB = [247, 243, 239]; // the raised lace
const PANEL: RGB = [250, 247, 244]; // smooth centre panel

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

function curl(g: CanvasRenderingContext2D, x: number, y: number, ang: number, r0: number, dir: number) {
  g.beginPath();
  const turns = Math.PI * 3;
  for (let i = 0; i <= 28; i++) {
    const th = (i / 28) * turns;
    const r = r0 * (1 - th / (turns * 1.15));
    const a = ang + dir * th;
    const px = x + Math.cos(a - (dir * Math.PI) / 2) * r0 + Math.cos(a + (dir * Math.PI) / 2) * r;
    const py = y + Math.sin(a - (dir * Math.PI) / 2) * r0 + Math.sin(a + (dir * Math.PI) / 2) * r;
    if (i) g.lineTo(px, py);
    else g.moveTo(px, py);
  }
  g.stroke();
}

function sprig(g: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, rnd: () => number, sc = 1) {
  const bend = (rnd() - 0.5) * 1.6;
  const ex = x + Math.cos(ang) * len;
  const ey = y + Math.sin(ang) * len;
  const px = -Math.sin(ang);
  const py = Math.cos(ang);
  const c1 = { x: x + Math.cos(ang) * len * 0.33 + px * bend * len * 0.35, y: y + Math.sin(ang) * len * 0.33 + py * bend * len * 0.35 };
  const c2 = { x: x + Math.cos(ang) * len * 0.66 - px * bend * len * 0.25, y: y + Math.sin(ang) * len * 0.66 - py * bend * len * 0.25 };
  const at = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * u * x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * ex,
      y: u * u * u * y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * ey,
    };
  };
  g.lineWidth = 1.4 * sc;
  g.beginPath();
  g.moveTo(x, y);
  g.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, ex, ey);
  g.stroke();
  const step = (10 * sc) / len;
  let side = rnd() < 0.5 ? 1 : -1;
  for (let t = 0.12; t < 0.86; t += step) {
    const a = at(t);
    const b = at(Math.min(1, t + 0.02));
    const tang = Math.atan2(b.y - a.y, b.x - a.x);
    leaf(g, a.x, a.y, tang + side * (0.7 + rnd() * 0.25), (4 + rnd() * 3) * sc);
    side = -side;
  }
  const end = rnd();
  const ea = Math.atan2(ey - at(0.95).y, ex - at(0.95).x);
  if (end < 0.38) flower(g, ex, ey, (4.5 + rnd() * 2.5) * sc, 5, rnd() * 6);
  else if (end < 0.7) {
    g.lineWidth = 1.3;
    curl(g, ex, ey, ea, (3.2 + rnd() * 2) * sc, rnd() < 0.5 ? 1 : -1);
  } else {
    for (let k = 0; k < 4; k++) {
      g.beginPath();
      g.arc(ex + (rnd() - 0.5) * 7 * sc, ey + (rnd() - 0.5) * 7 * sc, (1.4 + rnd() * 1.1) * sc, 0, Math.PI * 2);
      g.fill();
    }
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
  g.save();
  const outside = new Path2D();
  outside.rect(0, 0, cssW, cssH);
  outside.addPath(rimPath);
  g.clip(outside, "evenodd");

  // rosettes standing just outside the rim
  const ros = outline(card.x - (mobile ? 17 : 24), card.y - (mobile ? 17 : 24), card.w + (mobile ? 34 : 48), card.h + (mobile ? 34 : 48), mobile ? 74 : 96);
  ros.pts.forEach((p) => rosette(g, p.x, p.y, mobile ? 7.5 : 10, rnd() * Math.PI));

  // dense free lace filling the whole border, right up to the rim
  const keepOut = smoothPath(outline(card.x - 5, card.y - 5, card.w + 10, card.h + 10, 12));
  const bw = Math.max(70, Math.min(150, card.w * 0.24));
  const band = smoothPath(outline(card.x - bw, card.y - bw, card.w + bw * 2, card.h + bw * 2, 12));
  const bandCore = smoothPath(outline(card.x - bw * 0.62, card.y - bw * 0.62, card.w + bw * 1.24, card.h + bw * 1.24, 12));
  const sc = mobile ? 0.78 : 1;
  const cell = mobile ? 18 : 25;
  for (let y = -cell; y < cssH + cell; y += cell) {
    for (let x = -cell; x < cssW + cell; x += cell) {
      const px = x + rnd() * cell;
      const py = y + rnd() * cell;
      if (g.isPointInPath(keepOut, px * dpr, py * dpr)) continue;
      // wide screens: a lace border around the panel that thins out into plain linen
      if (!mobile) {
        if (!g.isPointInPath(band, px * dpr, py * dpr)) continue;
        if (!g.isPointInPath(bandCore, px * dpr, py * dpr) && rnd() < 0.55) continue;
      }
      // grow roughly along the panel's edge, with variety
      const ang = Math.atan2(py - (card.y + card.h / 2), px - (card.x + card.w / 2)) + Math.PI / 2 + (rnd() - 0.5) * 2.4;
      sprig(g, px, py, ang, (20 + rnd() * 24) * sc, rnd, sc);
      if (rnd() < 0.08) rosette(g, px + (rnd() - 0.5) * 16, py + (rnd() - 0.5) * 16, (6 + rnd() * 4) * sc, rnd() * 6);
    }
  }
  g.restore();

  // beaded, scalloped rim + fine inner line
  g.lineWidth = mobile ? 3.6 : 4.4;
  g.stroke(rimPath);
  rim.pts.forEach((p, i) => {
    const n = rim.normals[i];
    g.beginPath();
    g.arc(p.x + n.x * 1.5, p.y + n.y * 1.5, mobile ? 2.3 : 2.8, 0, Math.PI * 2);
    g.fill();
  });
  g.lineWidth = 1.1;
  g.stroke(smoothPath(outline(card.x + 9, card.y + 9, card.w - 18, card.h - 18, 6)));
  // larger lobes crowning the arched top
  const lobeGap = mobile ? 7 : 9;
  const lobes = outline(card.x - lobeGap, card.y - lobeGap, card.w + lobeGap * 2, card.h + lobeGap * 2, mobile ? 40 : 52);
  const archBottom = card.y + Math.min(card.w / 2, card.h * 0.32) * 0.92;
  g.save();
  const top = new Path2D();
  top.rect(0, 0, cssW, archBottom);
  g.clip(top);
  g.lineWidth = mobile ? 3 : 3.6;
  g.stroke(scallopPath(lobes, (mobile ? 40 : 52) * 0.24));
  lobes.pts.forEach((p, i) => {
    if (p.y > archBottom) return;
    const n = lobes.normals[i];
    leaf(g, p.x, p.y, Math.atan2(n.y, n.x) - 0.5, mobile ? 4.6 : 5.6);
    leaf(g, p.x, p.y, Math.atan2(n.y, n.x) + 0.5, mobile ? 4.6 : 5.6);
  });
  g.restore();

  // 2) panel area
  const panel = mk();
  panel.g.fill(rimPath);

  // 3) light it
  const M = alphaOf(lace.c);
  const P = alphaOf(panel.c);
  const Hh = blur(M, W, H, Math.max(1, Math.round(1.1 * dpr)));
  const shifted = new Float32Array(M.length);
  const ox = Math.round(1.6 * dpr);
  const oy = Math.round(2.4 * dpr);
  for (let y = oy; y < H; y++) for (let x = ox; x < W; x++) shifted[y * W + x] = M[(y - oy) * W + (x - ox)];
  const S = blur(shifted, W, H, Math.round(2.2 * dpr));
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
        const inner = 1 - 0.06 * (1 - Pb[i]) * 2; // soft recess just inside the rim
        r = r * (1 - p) + PANEL[0] * inner * p;
        gg = gg * (1 - p) + PANEL[1] * inner * p;
        b = b * (1 - p) + PANEL[2] * inner * p;
      }
      // cast shadow of the lace onto what lies beneath
      const sh = 1 - 0.32 * S[i] * (1 - m);
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
        const lit = (nx * LX + ny * LY) * 2.4;
        if (lit > 0) {
          const k = Math.min(1, lit) * 0.9;
          r += (255 - r) * k;
          gg += (253 - gg) * k;
          b += (250 - b) * k;
        } else {
          const k = Math.min(0.55, -lit * 0.75);
          r *= 1 - k;
          gg *= 1 - k * 1.04;
          b *= 1 - k * 1.1;
        }
      }
      const n = (Math.random() - 0.5) * 4;
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
