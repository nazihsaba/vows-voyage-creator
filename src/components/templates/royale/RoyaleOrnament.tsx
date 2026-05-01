/**
 * Decorative gold filigree divider used between Royale sections.
 * Lightweight inline SVG — no images, no animations, fully scalable.
 */
interface RoyaleOrnamentProps {
  color?: string;
  width?: number;
  className?: string;
}

const RoyaleOrnament = ({
  color = "#b08a3e",
  width = 220,
  className = "",
}: RoyaleOrnamentProps) => {
  return (
    <div className={`flex items-center justify-center w-full ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 220 28"
        width={width}
        height={28}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        style={{ maxWidth: "85%" }}
      >
        {/* left flourish */}
        <path d="M2 14 L70 14" />
        <path d="M70 14 C 80 14, 82 8, 92 8" />
        <path d="M70 14 C 80 14, 82 20, 92 20" />
        {/* center diamond */}
        <path d="M104 14 L110 8 L116 14 L110 20 Z" fill={color} fillOpacity="0.18" />
        <circle cx="110" cy="14" r="1.6" fill={color} />
        {/* right flourish */}
        <path d="M128 8 C 138 8, 140 14, 150 14" />
        <path d="M128 20 C 138 20, 140 14, 150 14" />
        <path d="M150 14 L218 14" />
      </svg>
    </div>
  );
};

export default RoyaleOrnament;
