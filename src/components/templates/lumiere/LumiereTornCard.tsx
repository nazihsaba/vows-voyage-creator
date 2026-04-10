import { ReactNode, useId } from "react";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
}

const LumiereTornCard = ({ children, className = "" }: LumiereTornCardProps) => {
  const id = useId().replace(/:/g, "");

  return (
    <div className={`relative w-full ${className}`} style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
      {/* SVG filter for ripped paper edge */}
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id={`rip-${id}`}>
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="5" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Top ripped edge — overflow visible so displacement isn't clipped */}
      <div className="relative overflow-hidden">
        <div
          className="h-[20px] bg-white -mb-[10px]"
          style={{ filter: `url(#rip-${id})`, marginLeft: "-16px", marginRight: "-16px" }}
        />
      </div>

      {/* Clean content area — full width white background */}
      <div className="relative bg-white w-full" style={{ margin: 0, padding: 0 }}>
        {children}
      </div>

      {/* Bottom ripped edge */}
      <div className="relative overflow-hidden">
        <div
          className="h-[20px] bg-white -mt-[10px]"
          style={{ filter: `url(#rip-${id})`, marginLeft: "-16px", marginRight: "-16px" }}
        />
      </div>
    </div>
  );
};

export default LumiereTornCard;
