/**
 * Compress a video file in the browser so its final size is under TARGET_BYTES (~15 MB).
 *
 * Strategy:
 *  - Play the source video silently/offscreen.
 *  - Render frames to a canvas (downscaled if very large).
 *  - Capture canvas + original audio track via MediaRecorder at a bitrate
 *    computed from the duration to land under the target size.
 *  - Encode to WebM (VP9 if available, else default) — best browser support.
 *
 * If anything fails or compression yields a bigger/unsupported file, the
 * original file is returned. Files already <= TARGET_BYTES are skipped.
 */

const TARGET_BYTES = 15 * 1024 * 1024; // 15 MB hard cap
const SAFETY = 0.9; // aim for 90% of target to leave headroom
const MAX_EDGE = 1280; // cap longest edge — plenty for backgrounds, much smaller files
const AUDIO_BITRATE = 96_000; // 96 kbps audio
const MIN_VIDEO_BITRATE = 400_000; // 400 kbps floor — below this looks bad

const pickMimeType = (): string => {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4", // Safari
  ];
  for (const c of candidates) {
    // @ts-ignore - isTypeSupported exists at runtime
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) {
      return c;
    }
  }
  return "";
};

const loadVideo = (file: File): Promise<HTMLVideoElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    (video as any).playsInline = true;
    video.src = url;
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video metadata"));
    };
  });

export async function compressVideo(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<File> {
  if (!file.type.startsWith("video/")) return file;
  if (file.size <= TARGET_BYTES) return file;

  // Capability checks
  if (
    typeof MediaRecorder === "undefined" ||
    typeof HTMLCanvasElement.prototype.captureStream !== "function"
  ) {
    return file;
  }
  const mimeType = pickMimeType();
  if (!mimeType) return file;

  let objectUrl: string | null = null;
  try {
    const video = await loadVideo(file);
    objectUrl = video.src;
    const duration = video.duration;
    if (!isFinite(duration) || duration <= 0) return file;

    // Compute target video bitrate from duration & target size.
    const targetTotalBits = TARGET_BYTES * 8 * SAFETY;
    const audioBits = AUDIO_BITRATE * duration;
    const videoBits = Math.max(MIN_VIDEO_BITRATE * duration, targetTotalBits - audioBits);
    const videoBitsPerSecond = Math.max(MIN_VIDEO_BITRATE, Math.floor(videoBits / duration));

    // Downscale if needed
    const longest = Math.max(video.videoWidth, video.videoHeight);
    const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
    const width = Math.round(video.videoWidth * scale);
    const height = Math.round(video.videoHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // @ts-ignore
    const canvasStream: MediaStream = canvas.captureStream(30);

    // Try to grab audio from the video element
    try {
      // @ts-ignore - captureStream on HTMLMediaElement
      const mediaStream: MediaStream | undefined = video.captureStream
        ? // @ts-ignore
          video.captureStream()
        : // @ts-ignore
          video.mozCaptureStream?.();
      if (mediaStream) {
        for (const track of mediaStream.getAudioTracks()) {
          canvasStream.addTrack(track);
        }
      }
    } catch {
      // ignore — proceed video-only
    }

    const recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond,
      audioBitsPerSecond: AUDIO_BITRATE,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const recorded: Promise<Blob> = new Promise((resolve, reject) => {
      recorder.onerror = (e) => reject((e as any).error || new Error("Recorder error"));
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });

    // Drive playback + per-frame draw
    video.currentTime = 0;
    await video.play().catch(() => {});
    recorder.start(1000);

    let rafId = 0;
    const draw = () => {
      ctx.drawImage(video, 0, 0, width, height);
      if (onProgress && duration > 0) {
        onProgress(Math.min(99, Math.round((video.currentTime / duration) * 100)));
      }
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    await new Promise<void>((resolve) => {
      const onEnded = () => {
        video.removeEventListener("ended", onEnded);
        resolve();
      };
      video.addEventListener("ended", onEnded);
    });

    cancelAnimationFrame(rafId);
    if (recorder.state !== "inactive") recorder.stop();
    const blob = await recorded;

    onProgress?.(100);

    // Sanity checks
    if (!blob || blob.size === 0) return file;
    if (blob.size >= file.size) return file; // didn't help
    if (blob.size > TARGET_BYTES) {
      // Still too big — better than original though, keep it
    }

    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.${ext}`, {
      type: mimeType.split(";")[0],
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn("Video compression failed, using original:", err);
    return file;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
