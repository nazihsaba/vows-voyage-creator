import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  groomName: string;
  brideName: string;
  dateDisplay: string;
  subtitle?: string;
  hasStarted?: boolean;
  onStart?: () => void;
  startButtonText?: string;
  className?: string;
  textClassName?: string;
  overlay?: ReactNode;
  background?: ReactNode;
  showChevron?: boolean;
  namesSeparator?: ReactNode;
}

const HeroSection = ({
  groomName,
  brideName,
  dateDisplay,
  subtitle = "The Wedding Of",
  hasStarted = true,
  onStart,
  startButtonText = "Tap To Start",
  className = "",
  textClassName = "text-white",
  overlay,
  background,
  showChevron = true,
  namesSeparator,
}: HeroSectionProps) => {
  return (
    <section
      className={`relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden ${className}`}
    >
      {background}
      {overlay}

      <div className={`relative z-10 space-y-6 px-4 max-w-2xl animate-fade-in ${textClassName}`}>
        <p className="text-template-small">{subtitle}</p>

        <div className="space-y-2">
          <h1 className="text-template-title">{groomName}</h1>
          {namesSeparator ?? <p className="text-4xl md:text-5xl">&</p>}
          <h1 className="text-template-title">{brideName}</h1>
        </div>

        <p className="text-template-body tracking-wide">{dateDisplay}</p>

        {!hasStarted && onStart && (
          <Button
            onClick={onStart}
            className="mt-8 bg-white/20 hover:bg-white/30 text-white border-2 border-white px-8 py-6 text-lg backdrop-blur-sm"
          >
            {startButtonText}
          </Button>
        )}
      </div>

      {showChevron && (
        <div className="absolute bottom-8 animate-bounce z-10">
          <ChevronDown className="w-8 h-8 text-white" />
        </div>
      )}
    </section>
  );
};

export default HeroSection;
