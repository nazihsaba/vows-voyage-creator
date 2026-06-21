import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

interface BackgroundVideoProps {
  src: string;
  poster?: string;
  className?: string;
  loop?: boolean;
  groomInitial?: string;
  brideInitial?: string;
  /** Spinner color theme. "light" = white on dark overlay, "dark" = black on light overlay. */
  loaderTheme?: "light" | "dark";
  overlayClassName?: string;
  /** Optional <source> children fallback. If omitted, src is used directly. */
  type?: string;
  /** Fired when buffering state changes. true = still loading (<80%), false = ready. */
  onLoadingChange?: (loading: boolean) => void;
  /**
   * If false, do NOT attempt autoplay — parent template controls playback
   * (e.g. via a "Tap to Start" button). Defaults to true.
   */
  attemptAutoplay?: boolean;
  /**
   * If provided, called when programmatic autoplay is blocked (e.g. iOS Low
   * Power Mode). When set, the internal invisible tap layer is suppressed —
   * the parent is expected to render its own visible "Tap to Start" UI.
   */
  onAutoplayBlocked?: () => void;
}

/**
 * BackgroundVideo
 * - Waits for `canplaythrough` before playing.
 * - Shows an elegant initials loader (and poster) while buffering.
 * - Re-shows loader on `waiting`, hides on `playing`.
 * - autoplay + muted + playsInline + preload="auto" for iOS/Android autoplay.
 */
export const BackgroundVideo = forwardRef<HTMLVideoElement, BackgroundVideoProps>(
  (
    {
      src,
      poster,
      className = "",
      loop = true,
      groomInitial = "",
      brideInitial = "",
      loaderTheme = "light",
      overlayClassName,
      type = "video/mp4",
      onLoadingChange,
      attemptAutoplay = true,
      onAutoplayBlocked,
    },
    ref,
  ) => {
    const innerRef = useRef<HTMLVideoElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLVideoElement);
    const [loading, setLoading] = useState(true);
    const [needsTap, setNeedsTap] = useState(false);

    // Keep latest callback identities in refs so the setup effect below
    // doesn't re-run (and call video.load(), resetting playback) when a
    // parent re-renders with new inline arrow handlers — e.g. an RSVP
    // checkbox toggle in LumiereTemplate.
    const onLoadingChangeRef = useRef(onLoadingChange);
    const onAutoplayBlockedRef = useRef(onAutoplayBlocked);
    useEffect(() => {
      onLoadingChangeRef.current = onLoadingChange;
      onAutoplayBlockedRef.current = onAutoplayBlocked;
    });

    useEffect(() => {
      onLoadingChangeRef.current?.(loading);
    }, [loading]);

    useEffect(() => {
      const video = innerRef.current;
      if (!video) return;

      let ready = false;
      // Require a healthy buffer before revealing to avoid the
      // "play → stall → play" stutter that happens when we start playback
      // on just the first decoded frame. We want enough headroom that
      // playback can sustain itself for a few seconds.
      const THRESHOLD = 0.5;
      // Or: enough buffered seconds (whichever happens first) so very long
      // videos don't have to download 50% before we start.
      const MIN_BUFFERED_SECONDS = 6;

      const bufferedFraction = () => {
        const dur = video.duration;
        if (!dur || !isFinite(dur) || dur <= 0) return 0;
        let end = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          end = Math.max(end, video.buffered.end(i));
        }
        return end / dur;
      };

      const bufferedSeconds = () => {
        let end = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          end = Math.max(end, video.buffered.end(i));
        }
        return end;
      };

      const tryPlay = () => {
        if (!ready) return;
        if (!attemptAutoplay) return; // parent controls playback
        const p = video.play();
        if (p !== undefined) {
          p.then(() => setNeedsTap(false)).catch(() => {
            setNeedsTap(true);
            onAutoplayBlockedRef.current?.();
          });
        }
      };

      const reveal = () => {
        if (ready) return;
        ready = true;
        setLoading(false);
        tryPlay();
      };

      const checkProgress = () => {
        if (ready) return;
        if (bufferedFraction() >= THRESHOLD || bufferedSeconds() >= MIN_BUFFERED_SECONDS) {
          reveal();
        }
      };

      const onCanPlayThrough = () => {
        // Fully buffered (or browser confident) — safe to reveal.
        reveal();
      };
      const onWaiting = () => {
        if (!ready) setLoading(true);
      };
      const onPlaying = () => {
        if (ready) setLoading(false);
        setNeedsTap(false);
      };
      const onStalled = () => {
        if (!ready) setLoading(true);
      };
      const onProgress = () => {
        checkProgress();
      };
      const onLoadedMetadata = () => {
        checkProgress();
      };

      // Hard safety: never block the loader more than 8s, even on slow networks.
      const safety = window.setTimeout(reveal, 8000);

      video.addEventListener("canplaythrough", onCanPlayThrough);
      video.addEventListener("waiting", onWaiting);
      video.addEventListener("playing", onPlaying);
      video.addEventListener("stalled", onStalled);
      video.addEventListener("progress", onProgress);
      video.addEventListener("loadedmetadata", onLoadedMetadata);

      // Kick off load (preload="auto" handles it, but be explicit)
      try {
        video.load();
      } catch {
        /* noop */
      }

      // Resume if tab becomes visible again. Chrome (desktop & Android),
      // unlike Safari, often pauses muted background videos when the tab
      // is backgrounded (e.g. user clicks a Google Maps link and returns).
      // The `playing`/`canplay` events that normally drive autoplay don't
      // re-fire on return, so we proactively retry play on visibility,
      // focus, pageshow (incl. bfcache restore), AND any unexpected pause.
      const tryResume = () => {
        if (!attemptAutoplay) return;
        if (document.visibilityState !== "visible") return;
        if (!ready) return;
        if (!video.paused) return;
        const p = video.play();
        if (p !== undefined)
          p.then(() => setNeedsTap(false)).catch(() => {
            setNeedsTap(true);
            onAutoplayBlockedRef.current?.();
          });
      };
      // Retry a few times — Chrome sometimes rejects the first play() call
      // immediately after returning to the tab, but accepts a follow-up.
      const resume = () => {
        tryResume();
        setTimeout(tryResume, 150);
        setTimeout(tryResume, 600);
      };
      const onVisibility = () => {
        if (document.visibilityState === "visible") resume();
      };
      const onPause = () => {
        // If the browser paused us while the page is visible (Chrome tab
        // restore), kick playback back on. Don't fight a user-initiated
        // pause when they're not even looking at the tab.
        if (document.visibilityState === "visible") resume();
      };
      video.addEventListener("pause", onPause);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("focus", resume);
      window.addEventListener("pageshow", resume);

      return () => {
        window.clearTimeout(safety);
        video.removeEventListener("canplaythrough", onCanPlayThrough);
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("stalled", onStalled);
        video.removeEventListener("progress", onProgress);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("pause", onPause);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("focus", resume);
        window.removeEventListener("pageshow", resume);
      };
    }, [src, attemptAutoplay]);


    return (
      <>
        <video
          ref={innerRef}
          className={className}
          src={src}
          poster={poster}
          {...(attemptAutoplay ? { autoPlay: true } : {})}
          muted
          loop={loop}
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          // Always visible — the poster (or first decoded frame) shows
          // immediately so the user never sees a black/grey placeholder.
          // Playback is still gated by buffering below, but the visual is up.
          {...({
            "webkit-playsinline": "true",
            "x5-playsinline": "true",
            controlslist: "nodownload noplaybackrate noremoteplayback nofullscreen",
          } as Record<string, string>)}
        />

        {/* Invisible tap-to-play fallback — only when autoplay was blocked
            (e.g. iOS Low Power Mode) and parent does NOT have its own entry button. */}
        {attemptAutoplay && needsTap && !loading && !onAutoplayBlocked && (
          <div
            className={overlayClassName ?? className}
            style={{
              cursor: "pointer",
              background: "transparent",
              zIndex: 51,
            }}
            onClick={() => {
              const v = innerRef.current;
              if (!v) return;
              const p = v.play();
              if (p !== undefined) {
                p.then(() => setNeedsTap(false)).catch(() => {
                  /* keep layer visible to allow retry */
                });
              } else {
                setNeedsTap(false);
              }
            }}
            aria-hidden
          />
        )}

        {/* Poster overlay while buffering */}
        {(loading || needsTap) && poster && (
          <div
            className={overlayClassName ?? className}
            style={{
              backgroundImage: `url(${poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              pointerEvents: "none",
              zIndex: 49,
            }}
            aria-hidden
          />
        )}

        {/* Loader intentionally removed — the parent template/page renders the
            primary loader. Showing a second one here caused a duplicate loading
            view to flash after the main one. */}

        {/* Note: when autoplay is blocked (e.g. iOS Low Power Mode),
            the parent template's "Tap to Start" button is responsible
            for invoking videoRef.current.play(). No separate overlay here. */}
      </>
    );
  },
);

BackgroundVideo.displayName = "BackgroundVideo";

export default BackgroundVideo;
