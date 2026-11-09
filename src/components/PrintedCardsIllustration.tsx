import { useId, useMemo } from "react";

/**
 * Printed stationery for the Physical Cards page: a paper envelope, a blush reply
 * card and a deckle-edged cotton invitation with gold-foil and letterpress details,
 * finished with a bronze wax seal on satin ribbon. Pure SVG, decorative only.
 */

// Small deterministic PRNG so the hand-torn edges look the same on every render.
const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A rectangle with a soft, hand-torn (deckled) edge. */
const deckle = (w: number, h: number, seed: number, amp = 0.9, step = 2.5) => {
  const rnd = mulberry32(seed);
  const j = () => (rnd() - 0.5) * 2 * amp;
  const pts: string[] = [];
  const p = (x: number, y: number) => pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  for (let x = 0; x <= w; x += step) p(x, j() + amp * 0.3);
  for (let y = step; y <= h; y += step) p(w + j() - amp * 0.3, y);
  for (let x = w - step; x >= 0; x -= step) p(x, h + j() - amp * 0.3);
  for (let y = h - step; y > 0; y -= step) p(j() + amp * 0.3, y);
  return `M${pts.join(" L")} Z`;
};

/** Irregular blob for the wax seal. */
const sealEdge = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  const n = 72;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wob = 1 + Math.sin(a * 7 + 0.6) * 0.035 + Math.sin(a * 3 + 1.9) * 0.03 + Math.cos(a * 11) * 0.015;
    pts.push(`${(cx + Math.cos(a) * r * wob).toFixed(2)} ${(cy + Math.sin(a) * r * wob).toFixed(2)}`);
  }
  return `M${pts.join(" L")} Z`;
};

const SCRIPT = "'Great Vibes', 'Dancing Script', cursive";
const SERIF = "'Cormorant Garamond', 'Playfair Display', serif";
const CAPS = "'Cinzel', 'Cormorant Garamond', serif";

const PrintedCardsIllustration = ({ className }: { className?: string }) => {
  const id = `pc-${useId().replace(/:/g, "")}`;
  const CW = 262;
  const CH = 330;
  const cardEdge = useMemo(() => deckle(CW, CH, 11, 0.65), []);
  const replyEdge = useMemo(() => deckle(232, 298, 29, 0.55), []);
  const seal = useMemo(() => sealEdge(0, 0, 25), []);

  // letterpress: a light edge below the pressed ink
  const pressed = (text: string, props: React.SVGProps<SVGTextElement>, ink: string) => (
    <>
      <text {...props} dy={0.6} fill="#ffffff" opacity={0.7}>
        {text}
      </text>
      <text {...props} fill={ink}>
        {text}
      </text>
    </>
  );

  return (
    <svg viewBox="0 0 320 380" className={className} style={{ overflow: "visible" }} aria-hidden>
      <defs>
        {/* cotton paper: a fine raised fibre texture, lit from the top left */}
        <filter id={`${id}-paper`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.7" numOctaves="2" seed="3" result="n" />
          <feDiffuseLighting in="n" surfaceScale="0.32" diffuseConstant="1" lightingColor="#ffffff" result="l">
            <feDistantLight azimuth="235" elevation="64" />
          </feDiffuseLighting>
          <feComponentTransfer in="l" result="lb">
            <feFuncR type="linear" slope="1.1" intercept="0.015" />
            <feFuncG type="linear" slope="1.1" intercept="0.015" />
            <feFuncB type="linear" slope="1.1" intercept="0.015" />
          </feComponentTransfer>
          <feComposite in="lb" in2="SourceAlpha" operator="in" result="lc" />
          <feBlend in="SourceGraphic" in2="lc" mode="multiply" />
        </filter>
        {/* a tight contact shadow plus a soft one, so each piece sits on the one below */}
        <filter id={`${id}-lift`} x="-25%" y="-20%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="b1" />
          <feOffset in="b1" dy="1.2" result="o1" />
          <feFlood floodColor="#3a2614" floodOpacity="0.3" result="f1" />
          <feComposite in="f1" in2="o1" operator="in" result="s1" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b2" />
          <feOffset in="b2" dy="13" result="o2" />
          <feFlood floodColor="#3a2614" floodOpacity="0.2" result="f2" />
          <feComposite in="f2" in2="o2" operator="in" result="s2" />
          <feMerge>
            <feMergeNode in="s2" />
            <feMergeNode in="s1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        {/* gold foil */}
        <linearGradient id={`${id}-foil`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="262" y2="330">
          <stop offset="0" stopColor="#7a5317" />
          <stop offset="0.3" stopColor="#c99b55" />
          <stop offset="0.48" stopColor="#865814" />
          <stop offset="0.68" stopColor="#d8b06c" />
          <stop offset="1" stopColor="#6e4a12" />
        </linearGradient>
        {/* papers */}
        <linearGradient id={`${id}-card`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="1" stopColor="#f7f1e6" />
        </linearGradient>
        <linearGradient id={`${id}-reply`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#f5e2dc" />
          <stop offset="1" stopColor="#ecd2ca" />
        </linearGradient>
        <linearGradient id={`${id}-env`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eddcc4" />
          <stop offset="1" stopColor="#e2cdb0" />
        </linearGradient>
        <linearGradient id={`${id}-envflap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1e3cf" />
          <stop offset="1" stopColor="#e8d5ba" />
        </linearGradient>
        {/* wax and satin */}
        <radialGradient id={`${id}-wax`} cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#b98a4d" />
          <stop offset="0.55" stopColor="#865814" />
          <stop offset="1" stopColor="#56380b" />
        </radialGradient>
        <radialGradient id={`${id}-well`} cx="60%" cy="66%" r="72%">
          <stop offset="0" stopColor="#94652a" />
          <stop offset="1" stopColor="#71490f" />
        </radialGradient>
        <linearGradient id={`${id}-satin`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9c3a3" />
          <stop offset="0.35" stopColor="#f6ecdc" />
          <stop offset="0.55" stopColor="#e6d4b8" />
          <stop offset="1" stopColor="#cdb48f" />
        </linearGradient>
      </defs>

      {/* Envelope, flap closed, lying behind */}
      <g transform="translate(20 176) rotate(7 142 96)" filter={`url(#${id}-lift)`}>
        <g filter={`url(#${id}-paper)`}>
          <rect width="284" height="192" rx="3" fill={`url(#${id}-env)`} />
          {/* bottom flap over the side flaps */}
          <path d="M0 192 L142 96 L284 192 Z" fill="#e6d2b6" />
        </g>
        <path d="M0 0 L142 100 L284 0" fill="none" stroke="#fbf4e8" strokeWidth="0.8" opacity="0.7" />
        <path d="M0 192 L142 96 L284 192" fill="none" stroke="#fbf4e8" strokeWidth="0.8" opacity="0.8" />
        {/* top flap and the shadow it casts */}
        <path d="M0 0 H284 L150 100 Q142 106 134 100 Z" transform="translate(0 3)" fill="rgba(58,38,20,.28)" filter={`url(#${id}-soft)`} />
        <path d="M0 0 H284 L150 100 Q142 106 134 100 Z" fill={`url(#${id}-envflap)`} filter={`url(#${id}-paper)`} />
        <path d="M0 0.5 L134 100 Q142 106 150 100 L284 0.5" fill="none" stroke="#fffaf0" strokeWidth="0.9" opacity="0.85" />
      </g>

      {/* Blush reply card */}
      <g transform="translate(10 34) rotate(-8 116 149)" filter={`url(#${id}-lift)`}>
        <path d={replyEdge} fill={`url(#${id}-reply)`} filter={`url(#${id}-paper)`} />
        <path d={replyEdge} fill="none" stroke="#fff7f3" strokeWidth="0.6" opacity="0.7" />
        <g transform="translate(20 236) rotate(-90)">
          {pressed(
            "KINDLY REPLY",
            { x: 0, y: 0, fontFamily: CAPS, fontSize: 7.5, letterSpacing: 2.6 },
            "#b07f74",
          )}
        </g>
      </g>

      {/* The invitation — settles into place once on load */}
      <g transform="translate(46 12)">
        <g
          className="motion-safe:animate-[card-settle_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]"
          style={{ transformBox: "fill-box", transformOrigin: "center", transform: "rotate(-2deg)" }}
        >
          <g filter={`url(#${id}-lift)`}>
            <path d={cardEdge} fill={`url(#${id}-card)`} filter={`url(#${id}-paper)`} />
            <path d={cardEdge} fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.8" />
          </g>
          {/* gold-foil double frame */}
          <rect x="13" y="13" width={CW - 26} height={CH - 26} fill="none" stroke={`url(#${id}-foil)`} strokeWidth="1.1" />
          <rect x="17.5" y="17.5" width={CW - 35} height={CH - 35} fill="none" stroke={`url(#${id}-foil)`} strokeWidth="0.5" opacity="0.75" />

          <g textAnchor="middle">
            <text x={CW / 2} y="92" fontFamily={SERIF} fontStyle="italic" fontSize="14" fontWeight="600" fill={`url(#${id}-foil)`}>
              Together with their families
            </text>
            {pressed("Maya", { x: CW / 2, y: 152, fontFamily: SCRIPT, fontSize: 54 }, "#2b241f")}
            <text x={CW / 2} y="176" fontFamily={SERIF} fontStyle="italic" fontSize="17" fill={`url(#${id}-foil)`}>
              &amp;
            </text>
            {pressed("Karim", { x: CW / 2, y: 222, fontFamily: SCRIPT, fontSize: 54 }, "#2b241f")}
            <path d={`M${CW / 2 - 26} 244 H${CW / 2 - 5} M${CW / 2 + 5} 244 H${CW / 2 + 26}`} stroke={`url(#${id}-foil)`} strokeWidth="0.9" />
            <path d={`M${CW / 2} 241 L${CW / 2 + 3} 244 L${CW / 2} 247 L${CW / 2 - 3} 244 Z`} fill={`url(#${id}-foil)`} />
            {pressed(
              "SATURDAY, THE TWELFTH OF JUNE",
              { x: CW / 2, y: 266, fontFamily: CAPS, fontSize: 7.6, letterSpacing: 1.6 },
              "#4f4237",
            )}
            {pressed("Beirut, Lebanon", { x: CW / 2, y: 282, fontFamily: SERIF, fontStyle: "italic", fontSize: 11 }, "#5f5044")}
          </g>

          {/* satin ribbon tails under the seal */}
          <g transform={`translate(${CW / 2} ${CH - 2})`} filter={`url(#${id}-lift)`}>
            <path d="M-3 0 L-24 40 L-19 37 L-15 44 L4 4 Z" fill={`url(#${id}-satin)`} />
            <path d="M3 0 L22 42 L17 38 L12 45 L-4 4 Z" fill={`url(#${id}-satin)`} />
          </g>
          {/* bronze wax seal */}
          <g transform={`translate(${CW / 2} ${CH - 4})`}>
            <path d={seal} fill={`url(#${id}-wax)`} filter={`url(#${id}-lift)`} />
            <circle r="18" fill={`url(#${id}-well)`} />
            <circle r="18" fill="none" stroke="#4a2f08" strokeWidth="1.3" opacity="0.7" />
            <circle cx="-0.4" cy="-0.5" r="19" fill="none" stroke="#d5ae74" strokeWidth="0.7" opacity="0.6" />
            <g textAnchor="middle" fontFamily={SCRIPT} fontSize="21">
              <text x="0.6" y="7.6" fill="#3f2806">A</text>
              <text x="-0.5" y="6.5" fill="#e2bf86" opacity="0.75">A</text>
              <text x="0" y="7" fill="#a0732f">A</text>
            </g>
            <ellipse cx="-8" cy="-12" rx="9" ry="4.5" fill="#ffffff" opacity="0.16" transform="rotate(-30 -8 -12)" />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default PrintedCardsIllustration;
