import { ReactNode, useId } from "react";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
  hideTop?: boolean;
  hideBottom?: boolean;
}

const LumiereTornCard = ({ children, className = "", hideTop = false, hideBottom = false }: LumiereTornCardProps) => {
  const id = useId().replace(/:/g, "");

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
      {!hideTop && (
        <div className="relative overflow-hidden">
          <div
            className="h-[36px] bg-white -mb-[16px]"
            style={{ filter: `url(#rip-top-${id})`, marginLeft: "-24px", marginRight: "-24px" }}
          />
        </div>
      )}

      {/* Clean content area */}
      <div className="relative bg-white w-full" style={{ margin: 0, padding: 0 }}>
        {children}
      </div>

      {/* Bottom ripped edge — different seed + rotated for a distinct rip */}
      {!hideBottom && (
        <div className="relative overflow-hidden">
          <div
            className="h-[36px] bg-white -mt-[16px]"
            style={{
              filter: `url(#rip-bottom-${id})`,
              marginLeft: "-24px",
              marginRight: "-24px",
              transform: "rotate(180deg)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LumiereTornCard;
