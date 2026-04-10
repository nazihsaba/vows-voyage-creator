import { ReactNode } from "react";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
}

const WaveTop = () => (
  <svg
    className="block w-full -mb-px"
    viewBox="0 0 1440 30"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 30V18C20 14 40 20 80 16C120 12 160 18 200 14C240 10 280 16 320 13C360 10 400 17 440 15C480 13 520 9 560 12C600 15 640 11 680 14C720 17 760 10 800 12C840 14 880 18 920 15C960 12 1000 16 1040 13C1080 10 1120 15 1160 17C1200 19 1240 12 1280 10C1320 8 1360 14 1400 16C1420 17 1440 15 1440 15V30H0Z"
      fill="rgba(255,255,255,0.95)"
    />
  </svg>
);

const WaveBottom = () => (
  <svg
    className="block w-full -mt-px"
    viewBox="0 0 1440 30"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0V12C20 16 40 10 80 14C120 18 160 12 200 16C240 20 280 14 320 17C360 20 400 13 440 15C480 17 520 21 560 18C600 15 640 19 680 16C720 13 760 20 800 18C840 16 880 12 920 15C960 18 1000 14 1040 17C1080 20 1120 15 1160 13C1200 11 1240 18 1280 20C1320 22 1360 16 1400 14C1420 13 1440 15 1440 15V0H0Z"
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
