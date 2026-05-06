/**
 * Smooth fade-out + restart loop helper for background audio.
 * Call from an <audio onTimeUpdate> handler.
 *
 * As the audio approaches `endTime`, the volume fades to 0 over `fadeDuration`
 * seconds. Once it reaches the end, currentTime is reset to `startTime` and
 * the volume fades back up to the original value.
 */
const FADE_DURATION = 1.5; // seconds

export function applyFadeLoop(
  audio: HTMLAudioElement,
  startTime: number = 0,
  endTime?: number | null,
  baseVolume: number = 1
) {
  if (!audio || !endTime) return;

  const remaining = endTime - audio.currentTime;

  if (audio.currentTime >= endTime) {
    audio.currentTime = startTime;
    fadeTo(audio, baseVolume, FADE_DURATION);
    return;
  }

  if (remaining <= FADE_DURATION) {
    const ratio = Math.max(0, remaining / FADE_DURATION);
    audio.volume = Math.max(0, Math.min(baseVolume, baseVolume * ratio));
  } else if (audio.volume < baseVolume) {
    // ensure volume is at base when not fading
    audio.volume = baseVolume;
  }
}

function fadeTo(audio: HTMLAudioElement, target: number, duration: number) {
  const steps = 20;
  const stepTime = (duration * 1000) / steps;
  const start = audio.volume;
  let i = 0;
  const id = window.setInterval(() => {
    i++;
    const v = start + ((target - start) * i) / steps;
    audio.volume = Math.max(0, Math.min(1, v));
    if (i >= steps) window.clearInterval(id);
  }, stepTime);
}
