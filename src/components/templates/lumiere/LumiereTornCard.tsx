import { ReactNode, useId } from "react";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
}

const LumiereTornCard = ({ children, className = "" }: LumiereTornCardProps) => {
  const id = useId().replace(/:/g, "");

  return (
    <div className={`relative w-full ${className}`} style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
      {/* SVG filter for ripped paper edge — stronger displacement */}
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id={`rip-${id}`}>
            <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="6" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="25" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Top ripped edge */}
      <div className="relative overflow-hidden">
        <div
          className="h-[30px] bg-white -mb-[14px]"
          style={{ filter: `url(#rip-${id})`, marginLeft: "-20px", marginRight: "-20px" }}
        />
      </div>

      {/* Clean content area */}
      <div className="relative bg-white w-full" style={{ margin: 0, padding: 0 }}>
        {children}
      </div>

      {/* Bottom ripped edge — same filter for consistent look */}
      <div className="relative overflow-hidden">
        <div
          className="h-[30px] bg-white -mt-[14px]"
          style={{ filter: `url(#rip-${id})`, marginLeft: "-20px", marginRight: "-20px" }}
        />
      </div>
    </div>
  );
};

export default LumiereTornCard;
