import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";
import AOS from "aos";
import "aos/dist/aos.css";

interface CountdownTimerNoBackgroundProps {
  targetDate: Date;
}

export const CountdownTimerNoBackground = ({ targetDate }: CountdownTimerNoBackgroundProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const formatNum = (n: number) =>
    isArabic ? n.toLocaleString("ar-SA") : String(n);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const days = differenceInDays(targetDate, now);
      const hours = differenceInHours(targetDate, now) % 24;
      const minutes = differenceInMinutes(targetDate, now) % 60;
      const seconds = differenceInSeconds(targetDate, now) % 60;

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center min-w-[60px] md:min-w-[100px] px-2">
      <span
        className="text-2xl md:text-6xl font-bold text-white drop-shadow-lg mb-1 md:mb-2"
        style={{ fontFamily: 'var(--font-template-countdown, "Playfair Display", serif)' }}
      >
        {formatNum(value)}
      </span>
      <span className="text-[9px] md:text-sm uppercase tracking-widest text-white drop-shadow-md">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      <h3 className="text-template-subtitle mb-6 text-white">{t("countdown.title")}</h3>
      <div className="flex flex-row items-center justify-center gap-4 md:gap-8">
        <TimeUnit value={timeRemaining.days} label={t("countdown.days")} />
        <TimeUnit value={timeRemaining.hours} label={t("countdown.hours")} />
        <TimeUnit value={timeRemaining.minutes} label={t("countdown.minutes")} />
        <TimeUnit value={timeRemaining.seconds} label={t("countdown.seconds")} />
      </div>
    </div>
  );
};
