import { useEffect, useState } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

interface CountdownTimerProps {
  targetDate: Date | string;
  variant?: "default" | "dark";
}

export const CountdownTimer = ({ targetDate, variant = "default" }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        setTimeRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isDark = variant === "dark";

  return (
    <div className="text-center">
      <h2 className={`text-template-subtitle mb-6 ${isDark ? "text-white" : ""}`}>
        Counting Down To Our Special Day
      </h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: timeRemaining.days, label: "Days" },
          { value: timeRemaining.hours, label: "Hours" },
          { value: timeRemaining.minutes, label: "Minutes" },
          { value: timeRemaining.seconds, label: "Seconds" },
        ].map((item, index) => (
          <AnimatedSection key={item.label} delay={index * 100} animation="scale-in">
            <div className="text-center">
              <div className={`text-3xl md:text-5xl font-bold ${isDark ? "text-white" : "text-primary"}`}>
                {item.value}
              </div>
              <div className={`text-sm md:text-base mt-2 ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
                {item.label}
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
};
