/**
 * Client-side video compression using ffmpeg.wasm.
 * Lazy-loads ffmpeg core (~25MB) only when first invoked.
 *
 * Strategy: re-encode to H.264 MP4 with progressive passes until output
 * fits under a target size cap (default 25MB). Each pass tightens CRF and,
 * if needed, lowers max height. Preserves the best quality that still fits
 * within the cap. AAC 128k audio, +faststart for fast start playback.
 */
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

const CORE_BASE_URL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ff = new FFmpeg();
    await ff.load({
      coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegInstance = ff;
    return ff;
  })();

  return loadPromise;
}

export interface CompressVideoOptions {
  /** Hard cap on output size in bytes. Default 25MB. */
  targetMaxBytes?: number;
  /** Skip transcoding entirely if input already ≤ this size. Default 8MB. */
  skipIfSmallerThan?: number;
  onProgress?: (ratio: number) => void;
}

const DEFAULT_TARGET = 25 * 1024 * 1024; // 25 MB
const DEFAULT_SKIP = 8 * 1024 * 1024; // 8 MB — already small enough

// Quality ladder: each pass tightens until output fits under the cap.
// Higher CRF = smaller file, slightly lower fidelity. 23 is visually
// near-lossless for web; 32 is the floor before quality drops noticeably.
const PASSES: Array<{ height: number; crf: number; audioBitrate: string }> = [
  { height: 1080, crf: 24, audioBitrate: "128k" },
  { height: 1080, crf: 27, audioBitrate: "128k" },
  { height: 720,  crf: 26, audioBitrate: "128k" },
  { height: 720,  crf: 29, audioBitrate: "128k" },
  { height: 720,  crf: 32, audioBitrate: "96k"  },
  { height: 540,  crf: 30, audioBitrate: "96k"  },
  { height: 480,  crf: 32, audioBitrate: "96k"  },
];

export async function compressVideo(
  file: File,
  options: CompressVideoOptions = {},
): Promise<File> {
  if (!file.type.startsWith("video/")) return file;

  const targetMaxBytes = options.targetMaxBytes ?? DEFAULT_TARGET;
  const skipIfSmallerThan = options.skipIfSmallerThan ?? DEFAULT_SKIP;

  // Already comfortably small — no need to transcode.
  if (file.size <= skipIfSmallerThan && file.size <= targetMaxBytes) {
    return file;
  }

  let ff: FFmpeg;
  try {
    ff = await getFFmpeg();
  } catch (err) {
    console.warn("ffmpeg load failed; uploading original video:", err);
    return file;
  }

  const inputName = "input";
  const outputName = "output.mp4";

  const onProgress = options.onProgress
    ? ({ progress }: { progress: number }) => {
        try {
          options.onProgress!(Math.max(0, Math.min(1, progress)));
        } catch {}
      }
    : null;

  if (onProgress) ff.on("progress", onProgress);

  try {
    await ff.writeFile(inputName, await fetchFile(file));

    let bestFile: File | null = null;

    for (let i = 0; i < PASSES.length; i++) {
      const { height, crf, audioBitrate } = PASSES[i];

      // Scale: keep aspect ratio, cap height, ensure even dims for H.264.
      // Never upscales — only scales down if source is taller than `height`.
      const vfScale = `scale='trunc(iw*min(1\\,${height}/ih)/2)*2':'trunc(ih*min(1\\,${height}/ih)/2)*2'`;

      try {
        await ff.exec([
          "-i", inputName,
          "-vf", vfScale,
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-crf", String(crf),
          "-c:a", "aac",
          "-b:a", audioBitrate,
          "-movflags", "+faststart",
          "-pix_fmt", "yuv420p",
          "-y",
          outputName,
        ]);
      } catch (err) {
        console.warn(`Compression pass ${i + 1} failed:`, err);
        continue;
      }

      const data = await ff.readFile(outputName);
      let blob: Blob;
      if (data instanceof Uint8Array) {
        const ab = new ArrayBuffer(data.byteLength);
        new Uint8Array(ab).set(data);
        blob = new Blob([ab], { type: "video/mp4" });
      } else {
        continue;
      }

      try { await ff.deleteFile(outputName); } catch {}

      if (blob.size === 0) continue;

      const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
      const candidate = new File([blob], `${baseName}.mp4`, {
        type: "video/mp4",
        lastModified: Date.now(),
      });

      // Track the smallest successful encode as a fallback.
      if (!bestFile || candidate.size < bestFile.size) {
        bestFile = candidate;
      }

      if (candidate.size <= targetMaxBytes) {
        try { await ff.deleteFile(inputName); } catch {}
        // Always prefer the optimized H.264/+faststart encode so templates
        // render the device-friendly version, even if the original was a
        // touch smaller in raw bytes.
        return candidate;
      }
    }

    try { await ff.deleteFile(inputName); } catch {}

    // No pass got under the cap; still return the smallest optimized
    // encode we produced — it's H.264 + faststart and will play more
    // smoothly than the original across devices.
    if (bestFile) return bestFile;
    return file;
  } catch (err) {
    console.warn("Video compression failed; uploading original:", err);
    return file;
  } finally {
    if (onProgress) {
      try { ff.off("progress", onProgress); } catch {}
    }
  }
}
