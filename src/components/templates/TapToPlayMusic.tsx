interface TapToPlayMusicProps {
  isUnlocked?: boolean;
  onTap: () => void;
  visible: boolean;
}

/**
 * Music playback stays fully automatic (autoplay attempt + first-gesture and
 * scroll fallbacks in useTemplateAudio). No visible music icon is rendered.
 */
const TapToPlayMusic = (_props: TapToPlayMusicProps) => null;

export default TapToPlayMusic;
