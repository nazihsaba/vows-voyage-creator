import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  videoUrl: string;
  overlayOpacity?: number;
  fixed?: boolean;
  className?: string;
}

const VideoBackground = ({
  videoUrl,
  overlayOpacity = 0.4,
  fixed = false,
  className = "",
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const positionClass = fixed ? "fixed" : "absolute";

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`${positionClass} inset-0 w-full h-full object-cover ${className}`}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      <div
        className={`${positionClass} inset-0`}
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
      />
    </>
  );
};

export default VideoBackground;
