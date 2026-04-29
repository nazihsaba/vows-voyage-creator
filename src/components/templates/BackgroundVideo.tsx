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
    },
    ref
  ) => {
    const innerRef = useRef<HTMLVideoElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLVideoElement);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

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
        video.play().catch(() => {
          // Autoplay can fail silently; muted+playsinline should normally allow it.
        });
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
        if (video.paused && ready) video.play().catch(() => {});
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
    }, [src]);

    const ringColor = loaderTheme === "dark" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.25)";
    const ringActive = loaderTheme === "dark" ? "#865814" : "#ffffff";
    const textColor = loaderTheme === "dark" ? "#1a1a1a" : "#ffffff";
    const loaderBg = loaderTheme === "dark" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.55)";

    const g = (groomInitial || "").charAt(0).toUpperCase();
    const b = (brideInitial || "").charAt(0).toUpperCase();

    return (
      <>
        <video
          ref={innerRef}
          className={className}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop={loop}
          playsInline
          preload="auto"
          style={{ visibility: loading ? "hidden" : "visible" }}
          {...({
            "webkit-playsinline": "true",
            "x5-playsinline": "true",
          } as Record<string, string>)}
        />

        {/* Poster overlay while buffering */}
        {loading && poster && (
          <div
            className={overlayClassName ?? className}
            style={{
              backgroundImage: `url(${poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              pointerEvents: "none",
            }}
            aria-hidden
          />
        )}

        {/* Elegant initials loader — forced above all overlays */}
        {loading && (
          <div
            className={overlayClassName ?? className}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: loaderBg,
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              pointerEvents: "none",
            }}
            aria-live="polite"
            aria-busy="true"
          >
            <div
              style={{
                position: "relative",
                width: 120,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Outer rotating ring */}
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                style={{
                  position: "absolute",
                  inset: 0,
                  animation: "aurea-spin 1.6s linear infinite",
                }}
              >
                <circle cx="60" cy="60" r="54" fill="none" stroke={ringColor} strokeWidth="1.5" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={ringActive}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="40 300"
                />
              </svg>

              {/* Initials G & B */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: textColor,
                  fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                  letterSpacing: "0.05em",
                }}
              >
                <span style={{ fontSize: 34, fontWeight: 300 }}>{g || "G"}</span>
                <span
                  style={{
                    fontSize: 22,
                    fontStyle: "italic",
                    opacity: 0.7,
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  &amp;
                </span>
                <span style={{ fontSize: 34, fontWeight: 300 }}>{b || "B"}</span>
              </div>
            </div>
            <style>{`
              @keyframes aurea-spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}
      </>
    );
  }
);

BackgroundVideo.displayName = "BackgroundVideo";

export default BackgroundVideo;
