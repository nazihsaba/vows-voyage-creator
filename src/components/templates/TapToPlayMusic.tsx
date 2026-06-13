import { Music } from "lucide-react";

interface TapToPlayMusicProps {
  onTap: () => void;
  visible: boolean;
}

/**
 * On-brand, minimal floating "Tap to play music" control shown on non-iOS
 * devices where scroll cannot unlock audio. Hides itself after the first tap.
 */
const TapToPlayMusic = ({ onTap, visible }: TapToPlayMusicProps) => {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="Tap to play music"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-background/85 backdrop-blur px-3.5 py-2.5 shadow-lg border border-border/60 text-foreground/80 hover:text-foreground hover:bg-background transition-all animate-[fadeIn_0.4s_ease-out]"
    >
      <Music className="w-4 h-4" />
      <span className="text-xs tracking-wide">Tap to play music</span>
    </button>
  );
};

export default TapToPlayMusic;
