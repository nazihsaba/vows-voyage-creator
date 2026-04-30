import { useEffect, useState } from "react";

interface UseHeroLoaderOptions {
  /** URL of the hero image (or first carousel image) to wait for. */
  imageUrl?: string | null;
  /** Hard safety timeout — never block the loader longer than this. */
  safetyMs?: number;
  /** Length of the loader fade-out animation. */
  fadeMs?: number;
}

interface HeroLoaderState {
  /** True while the loader should be in the DOM. */
  showLoader: boolean;
  /** True when the loader is mid fade-out (kept mounted for the transition). */
  fadingOut: boolean;
}

/**
 * Hook that:
 *   1. Adds a `<link rel="preload" as="image" fetchpriority="high">` for
 *      the hero image so the browser starts downloading it ASAP.
 *   2. Fires `Image()` to detect when it's actually ready in the cache.
 *   3. Provides a two-phase fade-out so the parent template's content has
 *      time to paint underneath before the loader disappears.
 *
 * Defaults are tuned for "feels fast": 2.5s safety timeout, 320ms fade.
 */
export function useHeroLoader({
  imageUrl,
  safetyMs = 2500,
  fadeMs = 450,
}: UseHeroLoaderOptions): HeroLoaderState {
  const [ready, setReady] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  // Phase 1: wait for the image (or safety timeout).
  useEffect(() => {
    if (!imageUrl) {
      setReady(true);
      return;
    }

    let cancelled = false;
    const finish = () => {
      if (!cancelled) setReady(true);
    };

    // Inject a high-priority preload link so the browser starts the
    // download in parallel with the React tree mount.
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = imageUrl;
    // fetchpriority is supported in Chromium/Safari; ignored elsewhere.
    (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = "high";
    document.head.appendChild(link);

    const img = new Image();
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "high";
    img.decoding = "async";
    img.src = imageUrl;
    if (img.complete && img.naturalWidth > 0) {
      finish();
    } else {
      img.onload = finish;
      img.onerror = finish;
    }

    const safety = window.setTimeout(finish, safetyMs);
    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      try {
        document.head.removeChild(link);
      } catch {
        /* noop */
      }
    };
  }, [imageUrl, safetyMs]);

  // Phase 2: once ready, wait for the browser to paint the template
  // underneath (two animation frames + a small settle), THEN start the
  // fade-out. This guarantees the template is fully on-screen behind the
  // loader before the loader's opacity drops, so there's never a blank
  // flash between the two.
  useEffect(() => {
    if (!ready) return;
    let raf1 = 0;
    let raf2 = 0;
    let settle = 0;
    let unmount = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        // After two rAFs the next paint has flushed — schedule the fade.
        settle = window.setTimeout(() => {
          setFadingOut(true);
          unmount = window.setTimeout(() => setShowLoader(false), fadeMs);
        }, 80);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(settle);
      window.clearTimeout(unmount);
    };
  }, [ready, fadeMs]);

  return { showLoader, fadingOut };
}
