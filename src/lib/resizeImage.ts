export async function resizeImageForOG(file: File): Promise<Blob> {
  const TARGET_WIDTH = 1200;
  const TARGET_HEIGHT = 630;
  const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });

  const sourceRatio = img.width / img.height;
  let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

  if (sourceRatio > TARGET_RATIO) {
    sWidth = img.height * TARGET_RATIO;
    sx = (img.width - sWidth) / 2;
  } else if (sourceRatio < TARGET_RATIO) {
    sHeight = img.width / TARGET_RATIO;
    sy = (img.height - sHeight) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/jpeg',
      0.85
    );
  });
}
