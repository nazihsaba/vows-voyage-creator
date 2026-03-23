import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
}

const PhoneFrame = ({ children, className }: PhoneFrameProps) => {
  return (
    <div className={cn("relative mx-auto", className)}>
      {/* Phone body */}
      <div className="relative rounded-[2.5rem] border-[6px] border-foreground/80 bg-foreground/80 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[1.4rem] bg-foreground/80 rounded-b-2xl z-20" />
        {/* Screen */}
        <div className="relative w-full overflow-hidden bg-white">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[35%] h-1 bg-white/40 rounded-full z-20" />
      </div>
    </div>
  );
};

export default PhoneFrame;
