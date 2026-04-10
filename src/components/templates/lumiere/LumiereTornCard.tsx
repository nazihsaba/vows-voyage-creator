import { ReactNode } from "react";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
}

const WaveTop = () => (
  <svg
    className="block w-full -mb-px"
    viewBox="0 0 1440 50"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 50V30C30 22 50 34 90 26C120 18 150 30 190 22C220 14 260 28 300 20C330 12 370 26 410 22C440 18 470 8 520 16C560 24 590 14 640 20C680 26 710 12 760 18C800 24 830 32 880 24C920 16 950 28 1000 22C1040 16 1070 26 1120 30C1160 34 1190 18 1240 14C1280 10 1310 24 1360 28C1400 32 1420 22 1440 20V50H0Z"
      fill="rgba(255,255,255,0.95)"
    />
  </svg>
);

const WaveBottom = () => (
  <svg
    className="block w-full -mt-px"
    viewBox="0 0 1440 50"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0V20C30 28 50 16 90 24C120 32 150 20 190 28C220 36 260 22 300 30C330 38 370 24 410 28C440 32 470 42 520 34C560 26 590 36 640 30C680 24 710 38 760 32C800 26 830 18 880 26C920 34 950 22 1000 28C1040 34 1070 24 1120 20C1160 16 1190 32 1240 36C1280 40 1310 26 1360 22C1400 18 1420 28 1440 30V0H0Z"
      fill="rgba(255,255,255,0.95)"
    />
  </svg>
);

const LumiereTornCard = ({ children, className = "" }: LumiereTornCardProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      <WaveTop />
      <div className="bg-white/95 backdrop-blur-sm">
        {children}
      </div>
      <WaveBottom />
    </div>
  );
};

export default LumiereTornCard;
