import { ReactNode } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

interface EtoileTornCardProps {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

const EtoileTornCard = ({ children, align = "left", className = "" }: EtoileTornCardProps) => {
  const animation = align === "left" ? "slide-left" : "slide-right";

  return (
    <AnimatedSection animation={animation}>
      <div className={`relative w-full ${className}`}>
        <div className="relative bg-white/95 backdrop-blur-sm w-full">
          {children}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default EtoileTornCard;
