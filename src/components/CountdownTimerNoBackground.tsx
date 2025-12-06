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
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
          <span className="text-2xl md:text-4xl font-serif font-bold text-white drop-shadow-lg">
            {value.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/70 mt-3 font-medium">
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <div className="flex flex-col items-center justify-center gap-2 h-16 md:h-24">
      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-16">
      <div className="flex items-center justify-center gap-2 md:gap-4">
        <div data-aos="fade-up" data-aos-delay="0">
          <TimeUnit value={timeRemaining.days} label="Days" />
        </div>
        <div data-aos="fade-up" data-aos-delay="50">
          <Separator />
        </div>
        <div data-aos="fade-up" data-aos-delay="100">
          <TimeUnit value={timeRemaining.hours} label="Hours" />
        </div>
        <div data-aos="fade-up" data-aos-delay="150">
          <Separator />
        </div>
        <div data-aos="fade-up" data-aos-delay="200">
          <TimeUnit value={timeRemaining.minutes} label="Minutes" />
        </div>
        <div data-aos="fade-up" data-aos-delay="250">
          <Separator />
        </div>
        <div data-aos="fade-up" data-aos-delay="300">
          <TimeUnit value={timeRemaining.seconds} label="Seconds" />
        </div>
      </div>
      <p data-aos="fade-up" data-aos-delay="400" className="text-xs md:text-sm text-white/60 mt-6 text-center italic tracking-wide">
        Until the big day arrives
      </p>
    </div>
  );
};
