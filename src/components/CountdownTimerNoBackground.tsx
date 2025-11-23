import { useEffect, useState } from "react";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";
import AOS from "aos";
import "aos/dist/aos.css";

interface CountdownTimerNoBackgroundProps {
  targetDate: Date;
}

export const CountdownTimerNoBackground = ({ targetDate }: CountdownTimerNoBackgroundProps) => {
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
    <div className="flex flex-col items-center justify-center min-w-[80px] md:min-w-[100px]">
      <div className="text-4xl md:text-6xl font-serif font-bold text-white mb-2">{value}</div>
      <div className="text-sm md:text-base uppercase tracking-widest text-white">{label}</div>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 py-12">
      <div data-aos="fade-up" data-aos-delay="0">
        <TimeUnit value={timeRemaining.days} label="Days" />
      </div>
      <div data-aos="fade-up" data-aos-delay="100">
        <TimeUnit value={timeRemaining.hours} label="Hours" />
      </div>
      <div data-aos="fade-up" data-aos-delay="200">
        <TimeUnit value={timeRemaining.minutes} label="Minutes" />
      </div>
      <div data-aos="fade-up" data-aos-delay="300" className="text-xs">
        <TimeUnit value={timeRemaining.seconds} label="Seconds" />
      </div>
    </div>
  );
};
