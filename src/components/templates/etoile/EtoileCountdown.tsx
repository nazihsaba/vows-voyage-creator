import { useState, useEffect } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import EtoileTornCard from "./EtoileTornCard";

interface EtoileCountdownProps {
  targetDate: string;
  align?: "left" | "right";
  title?: string;
}

const EtoileCountdown = ({ targetDate, align = "left", title = "Counting Down To Our Special Day" }: EtoileCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { value: timeRemaining.days, label: "Days" },
    { value: timeRemaining.hours, label: "Hours" },
    { value: timeRemaining.minutes, label: "Minutes" },
    { value: timeRemaining.seconds, label: "Seconds" },
  ];

  return (
    <EtoileTornCard align={align}>
      <div className="py-14 px-6 text-center">
        <AnimatedSection animation="fade-in">
          <h2 className="text-template-subtitle text-black mb-8">{title}</h2>
        </AnimatedSection>
        <div className="flex justify-center gap-6 md:gap-10">
          {units.map((item, i) => (
            <AnimatedSection key={item.label} delay={i * 100} animation="fade-in">
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-light text-black">{item.value}</div>
                <div className="text-template-small mt-2">{item.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </EtoileTornCard>
  );
};

export default EtoileCountdown;
