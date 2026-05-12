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

  // Letterbox-fit (contain entire image, pad with sampled background)
  const srcRatio = img.width / img.height;
  const dstRatio = TARGET_WIDTH / TARGET_HEIGHT;

  let dw = TARGET_WIDTH;
  let dh = TARGET_HEIGHT;

  if (srcRatio > dstRatio) {
    // Source is wider — fit width, pad top/bottom
    dh = Math.round(TARGET_WIDTH / srcRatio);
  } else if (srcRatio < dstRatio) {
    // Source is taller — fit height, pad left/right
    dw = Math.round(TARGET_HEIGHT * srcRatio);
  }

  const dx = Math.round((TARGET_WIDTH - dw) / 2);
  const dy = Math.round((TARGET_HEIGHT - dh) / 2);

  // Sample background color from edge pixels of the source image
  let bgColor = "#1a0a0e"; // default dark wine
  try {
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = img.width;
    sampleCanvas.height = img.height;
    const sampleCtx = sampleCanvas.getContext("2d");
    if (sampleCtx) {
      sampleCtx.drawImage(img, 0, 0);
      // Sample corners + edge midpoints
      const points: Array<[number, number]> = [
        [0, 0],
        [img.width - 1, 0],
        [0, img.height - 1],
        [img.width - 1, img.height - 1],
        [Math.floor(img.width / 2), 0],
        [Math.floor(img.width / 2), img.height - 1],
        [0, Math.floor(img.height / 2)],
        [img.width - 1, Math.floor(img.height / 2)],
      ];
      let r = 0, g = 0, b = 0;
      for (const [x, y] of points) {
        const d = sampleCtx.getImageData(x, y, 1, 1).data;
        r += d[0]; g += d[1]; b += d[2];
      }
      r = Math.round(r / points.length);
      g = Math.round(g / points.length);
      b = Math.round(b / points.length);
      bgColor = `rgb(${r}, ${g}, ${b})`;
    }
  } catch {
    // tainted canvas or other error — fall back to default
  }

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);

  // Iteratively reduce quality until under MAX_BYTES
  let quality = 0.85;
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
