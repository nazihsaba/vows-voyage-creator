/**
 * Compresses an image file to fit social preview requirements:
 * - Resized to 1200x630 (cover-fit)
 * - JPEG, file size kept under MAX_BYTES (default 300 KB) for WhatsApp compatibility
 *
 * Iteratively lowers JPEG quality until the size target is met.
 * Returns a new File (always JPEG) ready to upload.
 */
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 630;
const MAX_BYTES = 300 * 1024; // 300 KB — WhatsApp practical limit

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

export async function compressSocialPreview(file: File): Promise<File> {
  // Skip work if already a small JPEG
  if (file.type === "image/jpeg" && file.size <= MAX_BYTES) {
    return file;
  }

  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  // Cover-fit (crop to fill 1200x630)
  const srcRatio = img.width / img.height;
  const dstRatio = TARGET_WIDTH / TARGET_HEIGHT;

  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (srcRatio > dstRatio) {
    // Source is wider — crop sides
    sw = img.height * dstRatio;
    sx = (img.width - sw) / 2;
  } else if (srcRatio < dstRatio) {
    // Source is taller — crop top/bottom
    sh = img.width / dstRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // Iteratively reduce quality until under MAX_BYTES
  let quality = 0.92;
  let blob = await canvasToBlob(canvas, quality);

  while (blob && blob.size > MAX_BYTES && quality > 0.4) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  // Last resort: shrink dimensions if still too large
  if (blob && blob.size > MAX_BYTES) {
    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = 900;
    smallCanvas.height = Math.round(900 / dstRatio);
    const smallCtx = smallCanvas.getContext("2d");
    if (smallCtx) {
      smallCtx.fillStyle = "#ffffff";
      smallCtx.fillRect(0, 0, smallCanvas.width, smallCanvas.height);
      smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
      blob = await canvasToBlob(smallCanvas, 0.75);
    }
  }

  if (!blob) return file;

  return new File([blob], "social-preview.jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
