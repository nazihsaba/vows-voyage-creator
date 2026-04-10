import { ReactNode } from "react";

interface LumiereTornCardProps {
  children: ReactNode;
  className?: string;
}

const WaveTop = () => (
  <svg
    className="block w-full"
    viewBox="0 0 1440 40"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 40V20C120 8 240 0 360 4C480 8 600 24 720 28C840 32 960 24 1080 16C1200 8 1320 0 1380 0H1440V40H0Z"
      fill="rgba(255,255,255,0.95)"
    />
  </svg>
);

const WaveBottom = () => (
  <svg
    className="block w-full"
    viewBox="0 0 1440 40"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 0V20C120 32 240 40 360 36C480 32 600 16 720 12C840 8 960 16 1080 24C1200 32 1320 40 1380 40H1440V0H0Z"
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
