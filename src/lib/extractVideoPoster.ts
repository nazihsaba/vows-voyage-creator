/**
 * Extract the first frame of a video file as a JPEG Blob, fully client-side.
 * Uses an off-DOM <video> element + canvas. Returns null if extraction fails.
 *
 * Quality ~0.82 keeps the poster small (typically 50-150KB) so it loads
 * instantly while remaining visually crisp on the hero.
 */
export async function extractFirstFrame(
  file: File | Blob,
  quality = 0.82
): Promise<Blob | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result: Blob | null) => {
      if (settled) return;
      settled = true;
      try {
        URL.revokeObjectURL(video.src);
      } catch {}
      resolve(result);
    };

    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.src = URL.createObjectURL(file);

    // Safety timeout — never block the upload more than 8s
    const timeout = window.setTimeout(() => finish(null), 8000);

    const grabFrame = () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) {
          window.clearTimeout(timeout);
          return finish(null);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          window.clearTimeout(timeout);
          return finish(null);
        }
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            window.clearTimeout(timeout);
            finish(blob);
          },
          "image/jpeg",
          quality
        );
      } catch {
        window.clearTimeout(timeout);
        finish(null);
      }
    };

    video.addEventListener("loadeddata", () => {
      // Seek to a hair past 0 to ensure a real frame is decoded on iOS/Safari.
      try {
        video.currentTime = Math.min(0.05, (video.duration || 1) / 2);
      } catch {
        grabFrame();
      }
    });
    video.addEventListener("seeked", grabFrame);
    video.addEventListener("error", () => {
      window.clearTimeout(timeout);
      finish(null);
    });
  });
}
