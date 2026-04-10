import { ReactNode, useId } from "react";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
}

const LumiereTornCard = ({ children, className = "" }: LumiereTornCardProps) => {
  const id = useId().replace(/:/g, "");

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* SVG filter for ripped paper edge — applied only to top/bottom edge strips */}
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id={`rip-${id}`}>
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="5" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Top ripped edge */}
      <div
        className="relative w-full h-[20px] bg-white -mb-[10px]"
        style={{ filter: `url(#rip-${id})` }}
      />

      {/* Clean content area */}
      <div className="relative bg-white">
        {children}
      </div>

      {/* Bottom ripped edge */}
      <div
        className="relative w-full h-[20px] bg-white -mt-[10px]"
        style={{ filter: `url(#rip-${id})` }}
      />
    </div>
  );
};

export default LumiereTornCard;
