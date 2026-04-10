import { ReactNode, useId } from "react";

export type TornCardVariant = "solid" | "glass";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
  variant?: TornCardVariant;
}

const LumiereTornCard = ({ children, className = "", variant = "solid" }: LumiereTornCardProps) => {
  const id = useId().replace(/:/g, "");

  const isGlass = variant === "glass";
  const bgClass = isGlass ? "" : "bg-white";
  const bgStyle = isGlass
    ? { background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }
    : {};
  const edgeBgClass = isGlass ? "" : "bg-white";
  const edgeStyle = isGlass
    ? { background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }
    : {};

  return (
    <div className={`relative w-full ${className}`} style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
      {/* SVG filters — separate seeds for top and bottom so both look fully ripped */}
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id={`rip-top-${id}`}>
            <feTurbulence type="turbulence" baseFrequency="0.013" numOctaves="6" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="32" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id={`rip-bottom-${id}`}>
            <feTurbulence type="turbulence" baseFrequency="0.013" numOctaves="6" seed="17" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="32" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Top ripped edge */}
      <div className="relative overflow-hidden">
        <div
          className={`h-[36px] ${edgeBgClass} -mb-[16px]`}
          style={{ filter: `url(#rip-top-${id})`, marginLeft: "-24px", marginRight: "-24px", ...edgeStyle }}
        />
      </div>

      {/* Clean content area */}
      <div className={`relative ${bgClass} w-full`} style={{ margin: 0, padding: 0, ...bgStyle }}>
        {children}
      </div>

      {/* Bottom ripped edge — different seed + rotated for a distinct rip */}
      <div className="relative overflow-hidden">
        <div
          className={`h-[36px] ${edgeBgClass} -mt-[16px]`}
          style={{
            filter: `url(#rip-bottom-${id})`,
            marginLeft: "-24px",
            marginRight: "-24px",
            transform: "rotate(180deg)",
            ...edgeStyle,
          }}
        />
      </div>
    </div>
  );
};

export default LumiereTornCard;
