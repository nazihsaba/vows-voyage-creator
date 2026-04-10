import { ReactNode, useId } from "react";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
}

const LumiereTornCard = ({ children, className = "" }: LumiereTornCardProps) => {
  const filterId = useId().replace(/:/g, "");

  return (
    <>
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id={`torn-${filterId}`}>
            <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="5" seed="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div className={`relative w-full ${className}`}>
        {/* Background layer with torn edge effect */}
        <div
          className="absolute inset-0 bg-white/95"
          style={{ filter: `url(#torn-${filterId})` }}
        />
        {/* Content layer - no filter, clean text */}
        <div className="relative backdrop-blur-sm">
          {children}
        </div>
      </div>
    </>
  );
};

export default LumiereTornCard;
