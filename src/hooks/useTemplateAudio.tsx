import { useEffect, useRef, useState } from "react";

const isIOSDevice = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports as Mac
  if ((navigator as any).platform === "MacIntel" && (navigator as any).maxTouchPoints > 1) return true;
  return false;
};

/**
 * Audio playback controller for templates.
 * - iOS: starts on first scroll/wheel (existing behavior).
 * - Non-iOS (Android etc.): exposes `showTapToPlay` so the template can render
 *   a "Tap to play music" button. First tap anywhere unlocks audio; after that,
 *   scroll can control playback.
 */
export const useTemplateAudio = (
  audioRef: React.RefObject<HTMLAudioElement>,
  audioUrl: string | null | undefined,
  audioStartTime: number | null | undefined,
) => {
  const [showTapToPlay, setShowTapToPlay] = useState(false);
  const [isMusicUnlocked, setIsMusicUnlocked] = useState(false);
  const unlockedRef = useRef(false);

  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    const audio = audioRef.current;
    unlockedRef.current = false;
    setIsMusicUnlocked(false);
    audio.currentTime = audioStartTime || 0;
    audio.loop = true;
    audio.volume = 0.5;

    const ios = isIOSDevice();
    let started = false;

    const safePlay = () => {
      let p: Promise<void> | void;
      try {
        p = audio.play();
      } catch {
        return;
      }
      if (p && typeof p.then === "function") {
        p.then(() => {
          if (!audio.paused) {
            started = true;
            if (!ios) setIsMusicUnlocked(true);
          }
        }).catch(() => {});
      }
    };

    if (ios) {
      // iOS: start on first scroll
      const events = ["scroll", "wheel"];
      const tryStart = () => {
        if (started) {
          cleanup();
          return;
        }
        safePlay();
      };
      const cleanup = () => {
        events.forEach((ev) =>
          window.removeEventListener(ev, tryStart, { capture: true } as any),
        );
      };
      events.forEach((ev) =>
        window.addEventListener(ev, tryStart, { passive: true, capture: true } as any),
      );
      return cleanup;
    }

    // Non-iOS: keep a visible music control, unlock on first user tap, then let scroll resume playback
    setShowTapToPlay(true);

    const onFirstTap = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      safePlay();
      window.removeEventListener("pointerdown", onFirstTap, { capture: true } as any);
      window.removeEventListener("touchstart", onFirstTap, { capture: true } as any);
      window.removeEventListener("click", onFirstTap, { capture: true } as any);
    };

    const onScroll = () => {
      if (!unlockedRef.current) return;
      if (audio.paused) safePlay();
    };

    window.addEventListener("pointerdown", onFirstTap, { passive: true, capture: true } as any);
    window.addEventListener("touchstart", onFirstTap, { passive: true, capture: true } as any);
    window.addEventListener("click", onFirstTap, { passive: true, capture: true } as any);
    window.addEventListener("scroll", onScroll, { passive: true } as any);

    return () => {
      window.removeEventListener("pointerdown", onFirstTap, { capture: true } as any);
      window.removeEventListener("touchstart", onFirstTap, { capture: true } as any);
      window.removeEventListener("click", onFirstTap, { capture: true } as any);
      window.removeEventListener("scroll", onScroll as any);
    };
  }, [audioUrl, audioStartTime, audioRef]);

  const handleTapToPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    unlockedRef.current = true;
    let p: Promise<void> | void;
    try {
      p = audio.play();
    } catch {
      return;
    }
    if (p && typeof p.then === "function") {
      p.then(() => setIsMusicUnlocked(true)).catch(() => {});
    }
  };

  return { showTapToPlay, handleTapToPlay, isMusicUnlocked };
};
