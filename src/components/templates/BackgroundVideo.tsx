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
      const THRESHOLD = 0.8; // require 80% buffered before reveal

      const bufferedFraction = () => {
        const dur = video.duration;
        if (!dur || !isFinite(dur) || dur <= 0) return 0;
        let end = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          end = Math.max(end, video.buffered.end(i));
        }
        return end / dur;
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
        if (bufferedFraction() >= THRESHOLD) reveal();
      };

      const onCanPlayThrough = () => {
        // Fully buffered (or browser confident) — safe to reveal regardless of threshold.
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
      const onLoadedData = () => {
        checkProgress();
      };
      const onProgress = () => {
        checkProgress();
      };
      const onLoadedMetadata = () => {
        checkProgress();
      };

      video.addEventListener("canplaythrough", onCanPlayThrough);
      video.addEventListener("waiting", onWaiting);
      video.addEventListener("playing", onPlaying);
      video.addEventListener("stalled", onStalled);
      video.addEventListener("loadeddata", onLoadedData);
      video.addEventListener("progress", onProgress);
      video.addEventListener("loadedmetadata", onLoadedMetadata);

      // Kick off load (preload="auto" handles it, but be explicit)
      try {
        video.load();
      } catch {
        /* noop */
      }

      // Resume if tab becomes visible again
      const resume = () => {
        if (!attemptAutoplay) return;
        if (video.paused && ready) {
          const p = video.play();
          if (p !== undefined)
            p.then(() => setNeedsTap(false)).catch(() => {
              setNeedsTap(true);
              onAutoplayBlockedRef.current?.();
            });
        }
      };
      const onVisibility = () => {
        if (document.visibilityState === "visible") resume();
      };
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("focus", resume);
      window.addEventListener("pageshow", resume);

      return () => {
        video.removeEventListener("canplaythrough", onCanPlayThrough);
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("stalled", onStalled);
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("progress", onProgress);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
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
          preload="metadata"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          style={{ visibility: loading || (attemptAutoplay && needsTap) ? "hidden" : "visible" }}
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
