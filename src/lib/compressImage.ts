/**
 * Optimized client-side image compression for upload.
 * - Resizes to a max long-edge (default 1920px)
 * - Re-encodes to JPEG (default quality 0.82) — preserves PNG only if transparency matters
 * - Skips work if the source is already small enough
 *
 * Designed to balance file-size reduction with minimal visible quality loss.
 */

export interface CompressImageOptions {
  maxDimension?: number; // longest edge in px
  quality?: number; // 0..1 JPEG quality
  skipIfSmallerThan?: number; // bytes — skip compression if file is already this small
  mimeType?: "image/jpeg" | "image/webp";
}

const DEFAULTS: Required<CompressImageOptions> = {
  maxDimension: 1920,
  quality: 0.82,
  skipIfSmallerThan: 200 * 1024, // 200 KB
  mimeType: "image/jpeg",
};

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

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));

export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  // Don't touch GIFs (would lose animation) or non-image files
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const opts = { ...DEFAULTS, ...options };

  // Skip compression for small files that are already JPEG/WebP
  if (
    file.size <= opts.skipIfSmallerThan &&
    (file.type === "image/jpeg" || file.type === "image/webp")
  ) {
    return file;
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    return file;
  }

  const { width: srcW, height: srcH } = img;
  if (!srcW || !srcH) return file;

  const longest = Math.max(srcW, srcH);
  const scale = longest > opts.maxDimension ? opts.maxDimension / longest : 1;
  const dstW = Math.round(srcW * scale);
  const dstH = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  // White background for JPEG to handle PNG transparency cleanly
  if (opts.mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, dstW, dstH);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, dstW, dstH);

  const blob = await canvasToBlob(canvas, opts.mimeType, opts.quality);
  if (!blob) return file;

  // Only swap to compressed version if it's actually smaller
  if (blob.size >= file.size) return file;

  const ext = opts.mimeType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.${ext}`, {
    type: opts.mimeType,
    lastModified: Date.now(),
  });
}
