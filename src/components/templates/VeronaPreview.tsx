import { MapPin } from "lucide-react";

const CREAM = "rgb(248, 240, 222)";
const CREAM_DEEP = "rgb(243, 233, 210)";
const TEXT = "#3a2a14";
const GOLD = "#865814";
const DARK_BG_TOP = "hsl(20, 14%, 10%)";
const DARK_BG_BOTTOM = "hsl(20, 14%, 4%)";

const Hairline = ({ width = "44%" }: { width?: string }) => (
  <div
    aria-hidden
    style={{
      width,
      height: "1px",
      margin: "0 auto",
      background:
        "linear-gradient(to right, transparent, rgba(134,88,20,0.45), transparent)",
    }}
  />
);

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    style={{
      fontFamily: "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
      textTransform: "uppercase",
      letterSpacing: "0.46em",
      color: GOLD,
      fontWeight: 500,
      fontSize: "clamp(10px, 2.6vw, 12px)",
    }}
  >
    {children}
  </p>
);

const Heart = ({ size = 12 }: { size?: number }) => (
  <span
    aria-hidden
    style={{ color: GOLD, fontSize: size, lineHeight: 1, display: "inline-block" }}
  >
    ♥
  </span>
);

const VeronaPreview = () => {
  return (
    <div
      dir="ltr"
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: CREAM,
        color: TEXT,
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(134,88,20,0.04), transparent 40%), radial-gradient(circle at 80% 70%, rgba(134,88,20,0.035), transparent 45%)",
      }}
    >
      {/* HERO */}
      <section className="px-6 pt-20 pb-16 text-center">
        <div className="max-w-xl mx-auto space-y-7">
          <Eyebrow>Together with their families</Eyebrow>
          <Hairline />
          <div className="space-y-2 md:space-y-3">
            <p
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: TEXT,
                fontSize: "clamp(40px, 10vw, 72px)",
                lineHeight: 1.05,
              }}
            >
              Alessandro
            </p>
            <p
              aria-hidden
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: GOLD,
                fontSize: "clamp(48px, 12vw, 90px)",
                lineHeight: 1,
              }}
            >
              &amp;
            </p>
            <p
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: TEXT,
                fontSize: "clamp(40px, 10vw, 72px)",
                lineHeight: 1.05,
              }}
            >
              Isabella
            </p>
          </div>
          <Hairline />
          <p
            style={{
              fontFamily: "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
              color: GOLD,
              letterSpacing: "0.46em",
              fontWeight: 500,
              fontSize: "clamp(13px, 3vw, 16px)",
            }}
          >
            30 · JULY · 2026
          </p>
          <Eyebrow>Verona, Italy</Eyebrow>
        </div>
      </section>

      <Hairline />

      {/* OPENING LINE */}
      <section className="px-6 py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <p
            style={{
              fontStyle: "italic",
              color: TEXT,
              fontSize: "clamp(18px, 4.2vw, 22px)",
              lineHeight: 1.7,
            }}
          >
            With joyful hearts, we invite you to celebrate the beginning of our forever.
          </p>
          <div className="mt-6 flex justify-center">
            <Heart size={14} />
          </div>
        </div>
      </section>

      <Hairline />

      {/* CEREMONY */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <Eyebrow>Ceremony</Eyebrow>
          <h2
            style={{
              fontStyle: "italic",
              color: TEXT,
              fontSize: "clamp(28px, 6.5vw, 40px)",
              lineHeight: 1.15,
            }}
          >
            The vows
          </h2>
          <div className="flex justify-center">
            <Heart />
          </div>
          <p
            style={{
              fontFamily: "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
              color: GOLD,
              letterSpacing: "0.4em",
              fontWeight: 500,
              fontSize: "clamp(12px, 2.8vw, 14px)",
              textTransform: "uppercase",
            }}
          >
            4:30 PM
          </p>
          <p style={{ fontStyle: "italic", color: TEXT, fontSize: "clamp(20px, 4.6vw, 24px)" }}>
            Basilica di Santa Anastasia
          </p>
          <p style={{ color: TEXT, opacity: 0.75, fontSize: "clamp(14px, 3.4vw, 16px)" }}>
            Piazza Sant'Anastasia, 37121 Verona, Italy
          </p>
          <div className="pt-2">
            <span
              className="inline-flex items-center gap-2"
              style={{
                fontFamily: "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                color: GOLD,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                fontSize: "12px",
                borderBottom: "1px solid rgba(134,88,20,0.5)",
                paddingBottom: 4,
              }}
            >
              <MapPin className="w-3.5 h-3.5" />
              View on Map
            </span>
          </div>
        </div>
      </section>

      <Hairline />

      {/* SCHEDULE */}
      <section className="px-6 py-16" style={{ backgroundColor: CREAM_DEEP }}>
        <div className="max-w-xl mx-auto space-y-8 text-center">
          <Eyebrow>Order of the Day</Eyebrow>
          <h2 style={{ fontStyle: "italic", color: TEXT, fontSize: "clamp(28px, 6.5vw, 40px)" }}>
            Schedule
          </h2>
          <ul className="space-y-5 text-left">
            {[
              { time: "4:30 PM", label: "Ceremony · Basilica di Santa Anastasia" },
              { time: "6:00 PM", label: "Welcome drink" },
              { time: "7:30 PM", label: "Reception · Villa Mosconi Bertani" },
            ].map((row) => (
              <li key={row.time} className="flex items-baseline gap-4">
                <Heart size={11} />
                <div
                  className="flex-1 flex items-baseline gap-4 border-b border-dotted"
                  style={{ borderColor: "rgba(134,88,20,0.35)" }}
                >
                  <span
                    style={{
                      fontFamily:
                        "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
                      color: GOLD,
                      letterSpacing: "0.32em",
                      textTransform: "uppercase",
                      fontSize: "12px",
                      minWidth: 80,
                    }}
                  >
                    {row.time}
                  </span>
                  <span
                    style={{
                      fontStyle: "italic",
                      color: TEXT,
                      fontSize: "clamp(15px, 3.6vw, 17px)",
                      flex: 1,
                      paddingBottom: 8,
                    }}
                  >
                    {row.label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Hairline />

      {/* FOOTER (dark band) */}
      <footer
        className="px-6 py-16 text-center"
        style={{
          background: `radial-gradient(ellipse at center, ${DARK_BG_TOP} 0%, ${DARK_BG_BOTTOM} 100%)`,
          color: CREAM,
        }}
      >
        <div className="max-w-xl mx-auto space-y-6">
          <p
            style={{
              fontStyle: "italic",
              color: CREAM,
              fontSize: "clamp(18px, 4.4vw, 22px)",
              lineHeight: 1.7,
              opacity: 0.92,
            }}
          >
            With all our love, we await your company.
          </p>
          <div className="flex justify-center">
            <Heart size={14} />
          </div>
          <div
            style={{
              width: "44%",
              height: 1,
              margin: "0 auto",
              background:
                "linear-gradient(to right, transparent, rgba(214,183,106,0.5), transparent)",
            }}
          />
          <p
            style={{
              fontStyle: "italic",
              color: CREAM,
              fontSize: "clamp(20px, 4.6vw, 24px)",
              lineHeight: 1.3,
            }}
          >
            Alessandro <span style={{ color: "#d6b76a" }}>&amp;</span> Isabella
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Upright', 'Cormorant Garamond', Georgia, serif",
              color: "#d6b76a",
              letterSpacing: "0.46em",
              fontWeight: 500,
              fontSize: "clamp(11px, 2.6vw, 13px)",
              textTransform: "uppercase",
            }}
          >
            30 · JULY · 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VeronaPreview;
