import { ReactNode } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

interface EtoileTornCardProps {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

const EtoileTornCard = ({ children, align = "left", className = "" }: EtoileTornCardProps) => {
  const animation = align === "left" ? "slide-left" : "slide-right";
  const alignment = align === "left" ? "mr-auto rounded-r-2xl" : "ml-auto rounded-l-2xl";

  return (
    <AnimatedSection animation={animation}>
      <div
        className={`relative w-[88%] md:w-[82%] ${alignment} ${className}`}
        style={{ margin: align === "left" ? "0 auto 0 0" : "0 0 0 auto" }}
      >
        <div
          className={`relative bg-white/95 backdrop-blur-sm w-full ${
            align === "left" ? "rounded-r-2xl" : "rounded-l-2xl"
          }`}
        >
          {children}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default EtoileTornCard;
