import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { getCountdownTarget } from "@/lib/weddingDate";

interface CountdownTimerProps {
  targetDate: Date | string;
  variant?: "default" | "dark";
}

export const CountdownTimer = ({ targetDate, variant = "default" }: CountdownTimerProps) => {
  const { t, i18n } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const target = getCountdownTarget(targetDate);
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
  const isArabic = i18n.language === "ar";
  const formatNum = (n: number) =>
    isArabic ? n.toLocaleString("ar-SA") : String(n);

  return (
    <div className="text-center">
      <h2 className={`text-template-subtitle mb-6 ${isDark ? "text-white" : ""}`}>
        {t("countdown.title")}
      </h2>
      <div className="flex justify-center gap-4 md:gap-8">
        {[
          { value: formatNum(timeRemaining.days), label: t("countdown.days") },
          { value: formatNum(timeRemaining.hours), label: t("countdown.hours") },
          { value: formatNum(timeRemaining.minutes), label: t("countdown.minutes") },
          { value: formatNum(timeRemaining.seconds), label: t("countdown.seconds") },
        ].map((item, index) => (
          <AnimatedSection key={index} delay={index * 100} animation="scale-in">
            <div className="text-center">
              <div
                className={`text-3xl md:text-5xl font-bold ${isDark ? "text-white" : "text-primary"}`}
                style={{ fontFamily: 'var(--font-template-countdown, "Playfair Display", serif)' }}
              >
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
