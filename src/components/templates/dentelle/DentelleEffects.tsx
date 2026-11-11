import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

/**
 * Small, lightweight effects for the Dentelle template.
 * Everything respects "reduce motion" and pauses when off screen.
 */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** True once the element has scrolled into view (works inside any scrolling container). */
export function useInView<T extends Element>(options: { once?: boolean; rootMargin?: string; threshold?: number } = {}) {
  const { once = true, rootMargin = "0px 0px -12% 0px", threshold = 0.15 } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);
  return { ref, inView };
}

/** Fades and lifts its content in the first time it comes into view. */
export const Reveal = ({
  children,
  delay = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = prefersReducedMotion();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView || reduced ? 1 : 0,
        transform: inView || reduced ? "none" : "translateY(22px)",
        transition: `opacity .9s ease ${delay}ms, transform 1s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/** Wraps a line drawing so its strokes draw themselves when it comes into view. */
export const DrawOnView = ({
  children,
  duration = 2200,
  className,
  style,
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reduced = prefersReducedMotion();
  const drawn = inView || reduced;
  return (
    <div
      ref={ref}
      className={`dt-draw ${drawn ? "dt-drawn" : ""} ${className ?? ""}`}
      style={{ ...style, ["--dt-draw-ms" as string]: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

export const EFFECTS_CSS = `
.dt-draw path, .dt-draw ellipse, .dt-draw circle {
  stroke-dasharray: 1; stroke-dashoffset: 1;
  transition: stroke-dashoffset var(--dt-draw-ms, 2200ms) cubic-bezier(.45,.05,.25,1);
  transition-delay: calc(var(--i, 0) * var(--dt-step, 0ms));
}
.dt-draw.dt-drawn path, .dt-draw.dt-drawn ellipse, .dt-draw.dt-drawn circle { stroke-dashoffset: 0; }
@keyframes dt-tick { from { transform: translateY(-55%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes dt-heart { 0% { transform: translate(-50%, 0) scale(.4); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(calc(-50% + var(--dx)), -150px) scale(1.15) rotate(var(--rot)); opacity: 0; } }
@keyframes dt-shine { 0%, 62% { transform: translateX(-140%) rotate(18deg); } 82%, 100% { transform: translateX(140%) rotate(18deg); } }
@keyframes dt-pulse-dot { 0% { box-shadow: 0 0 0 3px #faf6f1, 0 0 0 3px rgba(106,80,71,.35); } 100% { box-shadow: 0 0 0 3px #faf6f1, 0 0 0 12px rgba(106,80,71,0); } }
/* Dancing couple (The Day): starts once drawn and never stops */
@keyframes dt-sway { 0% { transform: rotate(-3.2deg) translateY(0); } 25% { transform: rotate(0deg) translateY(-1.6px); } 50% { transform: rotate(3.2deg) translateY(0); } 75% { transform: rotate(0deg) translateY(-1.6px); } 100% { transform: rotate(-3.2deg) translateY(0); } }
@keyframes dt-skirt { 0%, 100% { transform: rotate(-5deg) scaleX(.95); } 50% { transform: rotate(6deg) scaleX(1.07); } }
@keyframes dt-veil { 0%, 100% { transform: rotate(4deg); } 50% { transform: rotate(-9deg) scaleX(1.05); } }
@keyframes dt-note { 0% { transform: translate(0, 6px) rotate(-8deg); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(6px, -26px) rotate(10deg); opacity: 0; } }
.dt-drawn .dt-dance-sway { animation: dt-sway 3.6s ease-in-out 1.8s infinite; }
.dt-drawn .dt-dance-skirt { animation: dt-skirt 1.8s ease-in-out 1.8s infinite; }
.dt-drawn .dt-dance-veil { animation: dt-veil 1.8s ease-in-out 2.1s infinite; }
.dt-drawn .dt-dance-note { animation: dt-note 4.2s ease-in-out infinite; opacity: 0; }
.dt-drawn .dt-dance-note-1 { animation-delay: 2s; }
.dt-drawn .dt-dance-note-2 { animation-delay: 3.4s; }
.dt-drawn .dt-dance-note-3 { animation-delay: 4.8s; }
@media (prefers-reduced-motion: reduce) {
  .dt-draw path, .dt-draw ellipse, .dt-draw circle { stroke-dasharray: none; transition: none; }
  .dt-tick, .dt-shine, .dt-heart, .dt-dance-sway, .dt-dance-skirt, .dt-dance-veil { animation: none !important; }
  .dt-dance-note { animation: none !important; opacity: 1 !important; }
}
`;

/** A number that rolls in from above each time it changes. */
export const RollingNumber = ({ value, style }: { value: string; style?: React.CSSProperties }) => (
  <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", ...style }}>
    <span key={value} className="dt-tick" style={{ display: "inline-block", animation: "dt-tick .45s cubic-bezier(.2,.8,.2,1)" }}>
      {value}
    </span>
  </span>
);

// ---------- Petals (canvas) ----------
type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  sway: number;
  phase: number;
  color: string;
  life: number;
  burst: boolean;
};

const PETAL_COLORS = ["#f6e3e1", "#f1d3d3", "#fbf3ee", "#ead2cc", "#f8e9e4"];

export type PetalsHandle = { burst: (x?: number, y?: number, count?: number) => void };

/**
 * Soft drifting petals on a transparent canvas that fills its parent.
 * `ambient` = how many petals keep falling. Call `burst()` for a celebratory shower.
 */
export const Petals = forwardRef<PetalsHandle, { ambient?: number; active?: boolean }>(
  ({ ambient = 12, active = true }, handleRef) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const petals = useRef<Petal[]>([]);
    const visible = useRef(true);
    const raf = useRef(0);
    const reduced = prefersReducedMotion();

    const size = () => {
      const c = canvasRef.current;
      return { w: c?.clientWidth || 390, h: c?.clientHeight || 800 };
    };

    const spawn = useCallback((burstAt?: { x: number; y: number }, scatter = false): Petal => {
      const { w, h } = size();
      const burst = !!burstAt;
      const angle = burst ? -Math.PI / 2 + (Math.random() - 0.5) * 2.2 : 0;
      const speed = burst ? 3 + Math.random() * 4.5 : 0;
      return {
        x: burst ? burstAt!.x : Math.random() * w,
        y: burst ? burstAt!.y : scatter ? Math.random() * h * 0.9 : -20 - Math.random() * h * 0.6,
        vx: burst ? Math.cos(angle) * speed : (Math.random() - 0.5) * 0.3,
        vy: burst ? Math.sin(angle) * speed : 0.35 + Math.random() * 0.45,
        r: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.03,
        sway: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        life: 0,
        burst,
      };
    }, []);

    useImperativeHandle(handleRef, () => ({
      burst: (x?: number, y?: number, count = 46) => {
        if (reduced) return;
        const { w, h } = size();
        const at = { x: x ?? w / 2, y: y ?? h * 0.6 };
        for (let i = 0; i < count; i++) petals.current.push(spawn(at));
        start();
      },
    }));

    const draw = () => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { w, h } = size();
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const next: Petal[] = [];
      for (const p of petals.current) {
        p.life += 1;
        if (p.burst) {
          p.vx *= 0.985;
          p.vy = p.vy * 0.985 + 0.06;
        }
        p.x += p.vx + Math.sin(p.life * 0.02 + p.phase) * p.sway * 0.5;
        p.y += p.vy;
        p.rot += p.vr + Math.sin(p.life * 0.03 + p.phase) * 0.01;
        if (p.y < h + 30 && p.x > -40 && p.x < w + 40) next.push(p);
        else if (!p.burst && active) next.push(spawn());
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, 0.55 + Math.abs(Math.sin(p.life * 0.04 + p.phase)) * 0.45);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = "#c9a9a3";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
      }
      petals.current = next;
    };

    const loop = () => {
      draw();
      if (petals.current.length && visible.current) raf.current = requestAnimationFrame(loop);
      else raf.current = 0;
    };
    const start = () => {
      if (!raf.current) raf.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
      if (reduced) return;
      if (active) {
        const have = petals.current.filter((p) => !p.burst).length;
        for (let i = have; i < ambient; i++) petals.current.push(spawn(undefined, true));
        start();
      }
      const c = canvasRef.current;
      let io: IntersectionObserver | undefined;
      if (c && typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(([e]) => {
          visible.current = e.isIntersecting;
          if (e.isIntersecting) start();
        });
        io.observe(c);
      }
      return () => {
        io?.disconnect();
        cancelAnimationFrame(raf.current);
        raf.current = 0;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, ambient]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none", zIndex: 5 }}
      />
    );
  },
);
Petals.displayName = "Petals";

// ---------- Hearts on tap ----------
type Heart = { id: number; x: number; y: number; dx: number; rot: number; size: number };

/** Wrap anything: tapping it sends up a few small hearts from the tap point. */
export const HeartTap = ({ children, color = "#b8606d" }: { children: React.ReactNode; color?: string }) => {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const idRef = useRef(0);
  const reduced = prefersReducedMotion();
  const onTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const batch: Heart[] = Array.from({ length: 5 }, () => ({
      id: ++idRef.current,
      x,
      y,
      dx: (Math.random() - 0.5) * 90,
      rot: (Math.random() - 0.5) * 40,
      size: 12 + Math.random() * 10,
    }));
    setHearts((h) => [...h, ...batch]);
    const ids = new Set(batch.map((b) => b.id));
    window.setTimeout(() => setHearts((h) => h.filter((x) => !ids.has(x.id))), 1500);
  };
  return (
    <div className="relative" onPointerDown={onTap} style={{ touchAction: "manipulation" }}>
      {children}
      {hearts.map((h, i) => (
        <svg
          key={h.id}
          aria-hidden
          className="dt-heart absolute pointer-events-none"
          width={h.size}
          height={h.size}
          viewBox="0 0 24 24"
          style={{
            left: h.x,
            top: h.y - h.size / 2,
            ["--dx" as string]: `${h.dx}px`,
            ["--rot" as string]: `${h.rot}deg`,
            animation: `dt-heart 1.4s cubic-bezier(.2,.7,.3,1) ${(i % 5) * 60}ms both`,
          }}
        >
          <path
            d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2.1 0 3.6 1.2 4.6 2.7C12 6.2 13.5 5 15.6 5 19 5 21.1 8.4 19.6 11.8 17.5 16.4 12 21 12 21z"
            fill={color}
            opacity=".85"
          />
        </svg>
      ))}
    </div>
  );
};
