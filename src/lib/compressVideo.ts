/**
 * Client-side video compression using ffmpeg.wasm.
 * Lazy-loads ffmpeg core (~25MB) only when first invoked, so it doesn't
 * affect the initial bundle.
 *
 * Strategy: re-encode to H.264 MP4, scale to max 720p height, CRF 28 (good
 * visual quality at meaningful size savings), AAC 128k audio, +faststart for
 * fast playback. Falls back to the original file if compression fails or
 * doesn't actually reduce size.
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
  maxHeight?: number; // scaled down if source is taller; aspect preserved
  crf?: number; // 18-28 typical; higher = smaller/lower quality
  audioBitrate?: string; // e.g. "128k"
  skipIfSmallerThan?: number; // bytes — skip transcoding if already small
  onProgress?: (ratio: number) => void;
}

const DEFAULTS: Required<Omit<CompressVideoOptions, "onProgress">> = {
  maxHeight: 720,
  crf: 28,
  audioBitrate: "128k",
  skipIfSmallerThan: 5 * 1024 * 1024, // 5 MB
};

export async function compressVideo(
  file: File,
  options: CompressVideoOptions = {},
): Promise<File> {
  if (!file.type.startsWith("video/")) return file;

  const opts = { ...DEFAULTS, ...options };

  if (file.size <= opts.skipIfSmallerThan) {
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

    // Scale: keep aspect ratio, cap height at maxHeight, ensure even dims for H.264.
    // NOTE: ff.exec receives args as an array (not a shell string), so we must NOT
    // backslash-escape the commas inside min(1,H/ih). Escaping caused ffmpeg to
    // reject the filtergraph and the catch block silently returned the original
    // (uncompressed) file — which is exactly the bug we were seeing.
    const vfScale = `scale='trunc(iw*min(1,${opts.maxHeight}/ih)/2)*2':'trunc(ih*min(1,${opts.maxHeight}/ih)/2)*2'`;

    const execCode = await ff.exec([
      "-i", inputName,
      "-vf", vfScale,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", String(opts.crf),
      "-c:a", "aac",
      "-b:a", opts.audioBitrate,
      "-movflags", "+faststart",
      "-pix_fmt", "yuv420p",
      outputName,
    ]);
    if (execCode !== 0) {
      throw new Error(`ffmpeg exited with code ${execCode}`);
    }

    const data = await ff.readFile(outputName);
    let blob: Blob;
    if (data instanceof Uint8Array) {
      const ab = new ArrayBuffer(data.byteLength);
      new Uint8Array(ab).set(data);
      blob = new Blob([ab], { type: "video/mp4" });
    } else {
      blob = new Blob([], { type: "video/mp4" });
    }

    // Cleanup virtual FS
    try { await ff.deleteFile(inputName); } catch {}
    try { await ff.deleteFile(outputName); } catch {}

    if (blob.size === 0 || blob.size >= file.size) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
    return new File([blob], `${baseName}.mp4`, {
      type: "video/mp4",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("Video compression failed; uploading original:", err);
    return file;
  } finally {
    if (onProgress) {
      try { ff.off("progress", onProgress); } catch {}
    }
  }
}
