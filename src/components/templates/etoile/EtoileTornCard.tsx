import { ReactNode, useId } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

interface EtoileTornCardProps {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

const EtoileTornCard = ({ children, align = "left", className = "" }: EtoileTornCardProps) => {
  const id = useId().replace(/:/g, "");

  const animation = align === "left" ? "slide-left" : "slide-right";
  const alignment = align === "left" ? "mr-auto rounded-r-2xl" : "ml-auto rounded-l-2xl";

  return (
    <AnimatedSection animation={animation}>
      <div
        className={`relative w-[88%] md:w-[82%] ${alignment} ${className}`}
        style={{ margin: align === "left" ? "0 auto 0 0" : "0 0 0 auto" }}
      >
        {/* SVG filters */}
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
            className="h-[36px] bg-white/95 -mb-[16px]"
            style={{ filter: `url(#rip-top-${id})`, marginLeft: "-24px", marginRight: "-24px" }}
          />
        </div>

        {/* Content */}
        <div
          className={`relative bg-white/95 backdrop-blur-sm w-full ${
            align === "left" ? "rounded-r-2xl" : "rounded-l-2xl"
          }`}
        >
          {children}
        </div>

        {/* Bottom ripped edge */}
        <div className="relative overflow-hidden">
          <div
            className="h-[36px] bg-white/95 -mt-[16px]"
            style={{
              filter: `url(#rip-bottom-${id})`,
              marginLeft: "-24px",
              marginRight: "-24px",
              transform: "rotate(180deg)",
            }}
          />
        </div>
      </div>
    </AnimatedSection>
  );
};

export default EtoileTornCard;
