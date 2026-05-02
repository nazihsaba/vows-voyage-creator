import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import LumiereTornCard from "./LumiereTornCard";

interface LumiereCountdownProps {
  targetDate: string;
}

const LumiereCountdown = ({ targetDate }: LumiereCountdownProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
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

  const formatNum = (n: number) => isArabic ? n.toLocaleString("ar-SA") : String(n);

  const units = [
    { value: formatNum(timeRemaining.days), label: t("countdown.days") },
    { value: formatNum(timeRemaining.hours), label: t("countdown.hours") },
    { value: formatNum(timeRemaining.minutes), label: t("countdown.minutes") },
    { value: formatNum(timeRemaining.seconds), label: t("countdown.seconds") },
  ];

  return (
    <LumiereTornCard>
      <div className="py-14 px-6 text-center">
        <AnimatedSection animation="fade-in">
          <h2 className="text-template-heading text-black mb-8">{t("countdown.title")}</h2>
        </AnimatedSection>
        <div className="flex justify-center gap-6 md:gap-10">
          {units.map((item, i) => (
            <AnimatedSection key={i} delay={i * 100} animation="fade-in">
              <div className="text-center">
                <div
                  className="text-3xl md:text-5xl font-light text-black"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  {item.value}
                </div>
                <div className="text-template-small mt-2">{item.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </LumiereTornCard>
  );
};

export default LumiereCountdown;
