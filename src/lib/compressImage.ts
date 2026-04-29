/**
 * Compress an image file while preserving visible quality.
 *
 * - Keeps high perceived quality (starts at 0.9, never goes below 0.75).
 * - Caps the longest edge at MAX_EDGE px (default 2560) — large enough for
 *   retina/full-screen display but avoids 6000px phone camera originals.
 * - Re-encodes to JPEG (best size/quality ratio for photos).
 * - Skips non-image files and tiny images that wouldn't benefit.
 *
 * Returns a new File. If anything fails, returns the original file.
 */
const MAX_EDGE = 2560;
const MAX_BYTES = 1.5 * 1024 * 1024; // 1.5 MB target — visually lossless for photos

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", quality));

export async function compressImage(file: File): Promise<File> {
  // Only handle raster images (skip videos, audio, gifs, svgs)
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  // Already small enough — skip
  if (file.size <= MAX_BYTES && file.type === "image/jpeg") return file;

  try {
    const img = await loadImage(file);

    // Compute target dims (cap longest edge, preserve aspect ratio)
    const longest = Math.max(img.width, img.height);
    const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Step quality down only if needed, never below 0.75 to keep quality "perfect"
    let quality = 0.9;
    let blob = await canvasToBlob(canvas, quality);
    while (blob && blob.size > MAX_BYTES && quality > 0.75) {
      quality -= 0.05;
      blob = await canvasToBlob(canvas, quality);
    }

    if (!blob) return file;

    // If compression made it bigger (rare for already-tiny images), keep original
    if (blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("Image compression failed, using original:", err);
    return file;
  }
}
