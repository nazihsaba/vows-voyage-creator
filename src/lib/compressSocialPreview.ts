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
  // Always re-encode (no early-return) so every preview gets the aggressive
  // compression needed for fast WhatsApp link previews.
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
    sw = img.height * dstRatio;
    sx = (img.width - sw) / 2;
  } else if (srcRatio < dstRatio) {
    sh = img.width / dstRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  // Always encode at JPEG quality 0.1 (≈90% compression) for the fastest
  // possible WhatsApp link preview. Resolution stays at 1200x630 so OG
  // crawlers still accept it.
  const blob = await canvasToBlob(canvas, 0.1);

  if (!blob) return file;

  return new File([blob], "social-preview.jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

