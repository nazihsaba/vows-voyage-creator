import { Music, VolumeX } from "lucide-react";

interface TapToPlayMusicProps {
  isUnlocked?: boolean;
  onTap: () => void;
  visible?: boolean;
}

/**
 * Always-visible floating music control. Playback still starts automatically
 * (autoplay attempt + first-gesture/scroll fallbacks in useTemplateAudio);
 * this button lets guests mute/unmute at any time.
 */
const TapToPlayMusic = ({ isUnlocked = false, onTap }: TapToPlayMusicProps) => (
  <button
    type="button"
    onClick={onTap}
    aria-label={isUnlocked ? "Mute music" : "Play music"}
    className="fixed bottom-5 right-5 z-[100] flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/60"
  >
    {isUnlocked ? (
      <Music className="h-5 w-5 animate-pulse" />
    ) : (
      <VolumeX className="h-5 w-5 opacity-80" />
    )}
  </button>
);

export default TapToPlayMusic;
