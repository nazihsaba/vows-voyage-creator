import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared, platform-agnostic audio controller for invitation templates.
 *
 * Strategy: attempt-then-fallback.
 * 1. When the <audio> element is ready, seek to audioStartTime and call play().
 * 2. If play() resolves: autoplay works — mark unlocked, hide the button.
 * 3. If play() rejects: show the floating music button and register one-time
 *    pointerdown/touchstart listeners (capture, passive) so the first user
 *    gesture anywhere on the page also unlocks audio.
 * 4. After unlock by any path, a scroll listener resumes playback if the
 *    browser pauses the element.
 *
 * Every play() call is wrapped in .catch(() => {}). No autoPlay attribute is
 * used anywhere — we always drive playback through scripted play() so we can
 * observe the promise rejection.
 */
export const useTemplateAudio = (
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  audioUrl: string | null | undefined,
  audioStartTime: number | null | undefined,
) => {
  const [showTapToPlay, setShowTapToPlay] = useState(false);
  const [isMusicUnlocked, setIsMusicUnlocked] = useState(false);
  const [audioReadyTick, setAudioReadyTick] = useState(0);
  const unlockedRef = useRef(false);

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
    if (!audio) return;

    unlockedRef.current = false;
    setIsMusicUnlocked(false);
    setShowTapToPlay(false);

    try {
      audio.currentTime = audioStartTime || 0;
    } catch {}
    audio.loop = true;
    if (audio.volume === 1) audio.volume = 0.5;

    const markUnlocked = () => {
      unlockedRef.current = true;
      setIsMusicUnlocked(true);
      setShowTapToPlay(false);
    };

    const tryPlay = (onFail?: () => void) => {
      try {
        const p = audio.play();
        if (p && typeof (p as Promise<void>).then === "function") {
          (p as Promise<void>)
            .then(() => {
              if (!audio.paused) markUnlocked();
              else onFail?.();
            })
            .catch(() => {
              onFail?.();
            });
        } else {
          if (!audio.paused) markUnlocked();
        }
      } catch {
        onFail?.();
      }
    };

    const onFirstGesture = () => {
      if (unlockedRef.current) return;
      try {
        audio.currentTime = audioStartTime || 0;
      } catch {}
      tryPlay();
    };

    const gestureOpts: AddEventListenerOptions = { passive: true, capture: true };
    let gestureBound = false;
    const bindGestures = () => {
      if (gestureBound) return;
      gestureBound = true;
      window.addEventListener("pointerdown", onFirstGesture, gestureOpts);
      window.addEventListener("touchstart", onFirstGesture, gestureOpts);
    };

    // Initial autoplay attempt; reveal button + bind gesture fallback on failure.
    tryPlay(() => {
      setShowTapToPlay(true);
      bindGestures();
    });

    const onScroll = () => {
      if (!unlockedRef.current) return;
      if (audio.paused) {
        try {
          const p = audio.play();
          if (p && typeof (p as Promise<void>).then === "function") {
            (p as Promise<void>).catch(() => {});
          }
        } catch {}
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture, { capture: true } as any);
      window.removeEventListener("touchstart", onFirstGesture, { capture: true } as any);
      window.removeEventListener("scroll", onScroll as any);
    };
  }, [audioUrl, audioStartTime, audioRef, audioReadyTick]);

  // Keep the icon state in sync with actual playback (pause/play/ended).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () => setIsMusicUnlocked(!audio.paused);
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);
    audio.addEventListener("ended", sync);
    sync();
    return () => {
      audio.removeEventListener("play", sync);
      audio.removeEventListener("pause", sync);
      audio.removeEventListener("ended", sync);
    };
  }, [audioRef, audioReadyTick, audioUrl]);

  // Toggles playback: acts as unlock on first tap, mute/unmute afterwards.
  const handleTapToPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setIsMusicUnlocked(false);
      return;
    }
    if (!unlockedRef.current) {
      try {
        audio.currentTime = audioStartTime || 0;
      } catch {}
    }
    try {
      const p = audio.play();
      if (p && typeof (p as Promise<void>).then === "function") {
        (p as Promise<void>)
          .then(() => {
            unlockedRef.current = true;
            setIsMusicUnlocked(true);
            setShowTapToPlay(false);
          })
          .catch(() => {});
      }
    } catch {}
  }, [audioRef, audioStartTime]);

  return { showTapToPlay, handleTapToPlay, isMusicUnlocked, setAudioElement };
};

