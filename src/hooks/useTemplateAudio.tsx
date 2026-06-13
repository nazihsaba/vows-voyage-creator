import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared, platform-agnostic audio controller for invitation templates.
 *
 * Behavior (identical on iOS, Android, desktop):
 * - Renders a music-unlock button whenever an `audioUrl` is provided
 *   (consumers read `showTapToPlay`).
 * - On the first real user gesture anywhere on the page (pointerdown /
 *   touchstart, captured), seeks to `audioStartTime` and attempts to play.
 * - The floating button's onTap triggers the same unlock as a guaranteed
 *   fallback for users who scroll without tapping.
 * - After unlock, a scroll listener resumes playback if the browser pauses
 *   the element.
 * - Every play() call is wrapped in .catch(() => {}) to swallow rejections.
 * - The setup effect re-runs when the <audio> element becomes available
 *   (via the returned `setAudioElement` ref callback) so we don't miss the
 *   mount.
 */
export const useTemplateAudio = (
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  audioUrl: string | null | undefined,
  audioStartTime: number | null | undefined,
) => {
  const [showTapToPlay, setShowTapToPlay] = useState(false);
  const [isMusicUnlocked, setIsMusicUnlocked] = useState(false);
  // Bumped whenever the <audio> element mounts/unmounts so the effect re-runs.
  const [audioReadyTick, setAudioReadyTick] = useState(0);
  const unlockedRef = useRef(false);

  // Ref callback consumers can pass to <audio ref={setAudioElement} />.
  const setAudioElement = useCallback(
    (el: HTMLAudioElement | null) => {
      audioRef.current = el;
      setAudioReadyTick((n) => n + 1);
    },
    [audioRef],
  );

  useEffect(() => {
    if (!audioUrl) {
      setShowTapToPlay(false);
      setIsMusicUnlocked(false);
      unlockedRef.current = false;
      return;
    }
    const audio = audioRef.current;
    if (!audio) {
      setShowTapToPlay(false);
      return;
    }

    unlockedRef.current = false;
    setIsMusicUnlocked(false);
    setShowTapToPlay(true);

    try {
      audio.currentTime = audioStartTime || 0;
    } catch {}
    audio.loop = true;
    if (audio.volume === 1) audio.volume = 0.5;

    const safePlay = () => {
      try {
        const p = audio.play();
        if (p && typeof (p as Promise<void>).then === "function") {
          (p as Promise<void>)
            .then(() => {
              if (!audio.paused) {
                unlockedRef.current = true;
                setIsMusicUnlocked(true);
              }
            })
            .catch(() => {});
        }
      } catch {}
    };

    const onFirstGesture = () => {
      if (unlockedRef.current) return;
      try {
        audio.currentTime = audioStartTime || 0;
      } catch {}
      safePlay();
    };

    const onScroll = () => {
      if (!unlockedRef.current) return;
      if (audio.paused) safePlay();
    };

    const gestureOpts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener("pointerdown", onFirstGesture, gestureOpts);
    window.addEventListener("touchstart", onFirstGesture, gestureOpts);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture, { capture: true } as any);
      window.removeEventListener("touchstart", onFirstGesture, { capture: true } as any);
      window.removeEventListener("scroll", onScroll as any);
    };
  }, [audioUrl, audioStartTime, audioRef, audioReadyTick]);

  const handleTapToPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = audioStartTime || 0;
    } catch {}
    try {
      const p = audio.play();
      if (p && typeof (p as Promise<void>).then === "function") {
        (p as Promise<void>)
          .then(() => {
            unlockedRef.current = true;
            setIsMusicUnlocked(true);
          })
          .catch(() => {});
      }
    } catch {}
  }, [audioRef, audioStartTime]);

  return { showTapToPlay, handleTapToPlay, isMusicUnlocked, setAudioElement };
};
