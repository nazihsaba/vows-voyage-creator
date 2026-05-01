import RoyaleOrnament from "./RoyaleOrnament";

interface RoyaleSectionTitleProps {
  eyebrow?: string;
  title: string;
  goldColor?: string;
}

/**
 * Editorial section title: small uppercase eyebrow, serif display title,
 * and a delicate ornament beneath. Used across all Royale sections.
 */
const RoyaleSectionTitle = ({
  eyebrow,
  title,
  goldColor = "#b08a3e",
}: RoyaleSectionTitleProps) => {
  return (
    <div className="text-center mb-10">
      {eyebrow && (
        <p
          className="text-[11px] sm:text-xs uppercase tracking-[0.4em] mb-3"
          style={{ color: goldColor, fontFamily: "Inter, sans-serif" }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "#3a2a14",
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </h2>
      <div className="mt-5">
        <RoyaleOrnament color={goldColor} width={180} />
      </div>
    </div>
  );
};

export default RoyaleSectionTitle;
