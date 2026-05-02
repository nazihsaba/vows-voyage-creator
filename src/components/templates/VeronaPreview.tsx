import paperTexture from "@/assets/envelope-paper-texture.jpeg";
import waxSealHeart from "@/assets/wax-seal-heart.webp";

const PAPER = "rgb(248, 240, 222)";
const INK = "#3a2a14";
const GOLD = "#865814";
const SERIF_DISPLAY = "'Cormorant Garamond', Georgia, serif";
const SERIF_LABEL = "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif";

const staticData = {
  groom_name: "Lorenzo",
  bride_name: "Aurelia",
  wedding_date: "2026-07-30",
};

/**
 * Static, miniature preview for the template-picker grid.
 * Shows the *closed* envelope with names visible — no animation.
 */
export const VeronaPreview = () => {
  const day = 30;
  const month = "JULY";
  const year = 2026;

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, hsl(20 14% 10%) 0%, hsl(20 14% 4%) 100%)",
        minHeight: "100%",
      }}
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${GOLD}26 0%, transparent 60%)`,
        }}
      />

      {/* Closed envelope */}
      <div
        className="relative"
        style={{
          width: "min(86%, 360px)",
          aspectRatio: "600 / 840",
          borderRadius: 14,
          background: `url(${paperTexture}) center/cover, ${PAPER}`,
          boxShadow:
            "0 38px 58px rgba(0,0,0,.55), 0 12px 18px rgba(0,0,0,.35)",
          overflow: "hidden",
        }}
      >
        {/* Subtle paper grain */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(58,42,20,0.6) 1px, transparent 0)",
            backgroundSize: "3px 3px",
          }}
        />

        {/* Front face content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center"
          style={{ color: INK }}
        >
          <p
            style={{
              fontFamily: SERIF_LABEL,
              letterSpacing: "0.46em",
              textTransform: "uppercase",
              color: GOLD,
              fontSize: "clamp(7px, 1.6vw, 10px)",
              fontWeight: 500,
            }}
          >
            The Wedding Of
          </p>

          <div
            aria-hidden
            className="my-3"
            style={{
              width: "44%",
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(134,88,20,0.55), transparent)",
            }}
          />

          <p
            style={{
              fontFamily: SERIF_DISPLAY,
              fontStyle: "italic",
              fontWeight: 500,
              color: INK,
              fontSize: "clamp(18px, 6vw, 32px)",
              lineHeight: 1.05,
            }}
          >
            {staticData.groom_name}
          </p>
          <p
            aria-hidden
            style={{
              fontFamily: SERIF_DISPLAY,
              fontStyle: "italic",
              color: GOLD,
              fontSize: "clamp(22px, 7.5vw, 40px)",
              lineHeight: 1,
              margin: "2px 0",
            }}
          >
            &amp;
          </p>
          <p
            style={{
              fontFamily: SERIF_DISPLAY,
              fontStyle: "italic",
              fontWeight: 500,
              color: INK,
              fontSize: "clamp(18px, 6vw, 32px)",
              lineHeight: 1.05,
            }}
          >
            {staticData.bride_name}
          </p>

          <div
            aria-hidden
            className="my-3"
            style={{
              width: "44%",
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(134,88,20,0.55), transparent)",
            }}
          />

          <p
            style={{
              fontFamily: SERIF_LABEL,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: GOLD,
              fontSize: "clamp(8px, 1.8vw, 11px)",
              fontWeight: 500,
            }}
          >
            {day} · {month} · {year}
          </p>
        </div>

        {/* Envelope flap (top half triangle, slightly lifted) */}
        <svg
          viewBox="0 0 600 840"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="verona-flap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(244, 234, 212)" />
              <stop offset="100%" stopColor="rgb(232, 218, 188)" />
            </linearGradient>
          </defs>
          <polygon
            points="0,0 600,0 300,360"
            fill="url(#verona-flap)"
            opacity="0.92"
          />
          <line
            x1="0"
            y1="0"
            x2="300"
            y2="360"
            stroke="rgba(58,42,20,0.18)"
            strokeWidth="1"
          />
          <line
            x1="600"
            y1="0"
            x2="300"
            y2="360"
            stroke="rgba(58,42,20,0.18)"
            strokeWidth="1"
          />
        </svg>

        {/* Wax seal heart */}
        <img
          src={waxSealHeart}
          alt=""
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: "calc(360 / 840 * 100%)",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "18%",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,.35))",
          }}
        />
      </div>
    </div>
  );
};

export default VeronaPreview;
