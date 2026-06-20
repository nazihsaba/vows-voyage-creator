import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared audio controller for invitation templates.
 *
 * Cross-browser autoplay strategy (Chrome/Android friendly):
 * 1. Try to autoplay with sound. If it works, great.
 * 2. If blocked, start MUTED autoplay (allowed by every modern browser) so the
 *    audio element is actively playing in the background.
 * 3. Bind one-time gesture listeners on the WHOLE window for every possible
 *    first interaction: pointerdown, touchstart, click, keydown, scroll,
 *    wheel, touchmove. On the very first gesture we unmute — the audio is
 *    already playing, so unmuting is not subject to autoplay restrictions and
 *    produces no further play() promise rejection.
 * 4. As a safety net, if the element gets paused after unlock, scroll resumes
 *    it.
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
    // Hint browsers this element is intended for playback (helps Android Chrome).
    audio.setAttribute("playsinline", "");
    (audio as any).playsInline = true;
    audio.preload = "auto";
    if (audio.volume === 1) audio.volume = 0.5;
    audio.muted = false;

    const markUnlocked = () => {
      unlockedRef.current = true;
      setIsMusicUnlocked(true);
      setShowTapToPlay(false);
    };

    const safePlay = () => {
      try {
        const p = audio.play();
        return p && typeof (p as Promise<void>).then === "function"
          ? (p as Promise<void>)
          : Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const unmuteAndPlay = () => {
      if (unlockedRef.current) return;
      audio.muted = false;
      try {
        if (audio.currentTime < (audioStartTime || 0)) {
          audio.currentTime = audioStartTime || 0;
        }
      } catch {}
      safePlay()
        .then(() => {
          if (!audio.paused) markUnlocked();
        })
        .catch(() => {
          // Last resort: keep the floating button visible.
          setShowTapToPlay(true);
        });
    };

    const gestureOpts: AddEventListenerOptions = { passive: true, capture: true };
    const gestureEvents = [
      "pointerdown",
      "touchstart",
      "touchmove",
      "click",
      "keydown",
      "scroll",
      "wheel",
    ] as const;
    let gesturesBound = false;
    const bindGestures = () => {
      if (gesturesBound) return;
      gesturesBound = true;
      gestureEvents.forEach((ev) =>
        window.addEventListener(ev, unmuteAndPlay, gestureOpts),
      );
    };
    const unbindGestures = () => {
      gestureEvents.forEach((ev) =>
        window.removeEventListener(ev, unmuteAndPlay, { capture: true } as any),
      );
    };

    // 1) Try unmuted autoplay first.
    audio.muted = false;
    safePlay()
      .then(() => {
        if (!audio.paused && !audio.muted) markUnlocked();
      })
      .catch(() => {
        // 2) Fallback: muted autoplay (allowed everywhere) + wait for gesture.
        audio.muted = true;
        safePlay().catch(() => {});
        setShowTapToPlay(true);
        bindGestures();
      });

    const onScroll = () => {
      if (!unlockedRef.current) return;
      if (audio.paused) {
        safePlay().catch(() => {});
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      unbindGestures();
      window.removeEventListener("scroll", onScroll as any);
    };
  }, [audioUrl, audioStartTime, audioRef, audioReadyTick]);

  const handleTapToPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    try {
      if (audio.currentTime < (audioStartTime || 0)) {
        audio.currentTime = audioStartTime || 0;
      }
    } catch {}
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
