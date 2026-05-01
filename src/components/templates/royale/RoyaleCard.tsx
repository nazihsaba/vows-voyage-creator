import { ReactNode } from "react";

/**
 * Decorative content card with gold corner brackets, soft shadow,
 * and subtle paper-cream gradient. Reusable across Royale sections.
 */
interface RoyaleCardProps {
  children: ReactNode;
  className?: string;
  goldColor?: string;
}

const RoyaleCard = ({
  children,
  className = "",
  goldColor = "#b08a3e",
}: RoyaleCardProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Card body */}
      <div
        className="relative rounded-sm px-6 py-8 sm:px-10 sm:py-12"
        style={{
          background:
            "linear-gradient(180deg, #fbf6ec 0%, #f5ecda 100%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.6) inset, 0 18px 40px -22px rgba(80,55,15,0.35)",
          border: `1px solid ${goldColor}33`,
        }}
      >
        {/* Inner gold frame */}
        <div
          className="pointer-events-none absolute inset-3 rounded-sm"
          style={{ border: `1px solid ${goldColor}55` }}
        />

        {/* Corner brackets */}
        {(
          [
            { top: 0, left: 0, rot: 0 },
            { top: 0, right: 0, rot: 90 },
            { bottom: 0, right: 0, rot: 180 },
            { bottom: 0, left: 0, rot: 270 },
          ] as const
        ).map((pos, i) => {
          const { rot, ...placement } = pos;
          return (
          <svg
            key={i}
            viewBox="0 0 40 40"
            className="absolute pointer-events-none"
            width="28"
            height="28"
            style={{
              ...placement,
              transform: `rotate(${rot}deg)`,
              color: goldColor,
            } as React.CSSProperties}
            aria-hidden="true"
          >
            <path
              d="M4 18 C 4 10, 10 4, 18 4 M4 4 L4 14 M4 4 L14 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="6" cy="6" r="1.4" fill="currentColor" />
          </svg>
          );
        })}

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default RoyaleCard;
