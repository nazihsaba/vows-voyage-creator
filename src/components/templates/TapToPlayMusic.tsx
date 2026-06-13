import { Music } from "lucide-react";

interface TapToPlayMusicProps {
  isUnlocked?: boolean;
  onTap: () => void;
  visible: boolean;
}

/**
 * On-brand, minimal floating music control shown on non-iOS devices where
 * scroll cannot unlock audio. It dims after the first successful unlock.
 */
const TapToPlayMusic = ({ isUnlocked = false, onTap, visible }: TapToPlayMusicProps) => {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={isUnlocked ? "Music enabled" : "Tap to play music"}
      className={`fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-lg backdrop-blur transition-all animate-[fadeIn_0.4s_ease-out] ${
        isUnlocked ? "opacity-45" : "opacity-100"
      }`}
    >
      <Music className="w-5 h-5" />
    </button>
  );
};

export default TapToPlayMusic;
