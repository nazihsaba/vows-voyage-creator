import { useState, useEffect } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import LumiereTornCard, { TornCardVariant } from "./LumiereTornCard";

interface LumiereCountdownProps {
  targetDate: string;
  title?: string;
  cardVariant?: TornCardVariant;
}

const LumiereCountdown = ({ targetDate, title = "Counting Down To Our Special Day", cardVariant = "solid" }: LumiereCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const isGlass = cardVariant === "glass";
  const textColor = isGlass ? "text-white" : "text-black";

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
    <LumiereTornCard variant={cardVariant}>
      <div className="py-14 px-6 text-center">
        <AnimatedSection animation="fade-in">
          <h2 className={`text-template-subtitle ${textColor} mb-8`}>{title}</h2>
        </AnimatedSection>
        <div className="flex justify-center gap-6 md:gap-10">
          {units.map((item, i) => (
            <AnimatedSection key={item.label} delay={i * 100} animation="fade-in">
              <div className="text-center">
                <div className={`text-3xl md:text-5xl font-light ${textColor}`}>{item.value}</div>
                <div className={`text-template-small mt-2 ${isGlass ? "text-white/70" : ""}`}>{item.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </LumiereTornCard>
  );
};

export default LumiereCountdown;
