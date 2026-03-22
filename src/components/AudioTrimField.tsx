import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";

interface AudioTrimFieldProps {
  onAudioTrimmed: (blob: Blob, startTime: number, endTime: number) => void;
  onAudioRemoved?: () => void;
  initialAudioUrl?: string;
  initialStartTime?: number;
  initialEndTime?: number;
}

const AudioTrimField: React.FC<AudioTrimFieldProps> = ({
  onAudioTrimmed,
  onAudioRemoved,
  initialAudioUrl,
  initialStartTime = 0,
  initialEndTime = 60,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(initialStartTime);
  const [endTime, setEndTime] = useState<number>(initialEndTime);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    setFile(selectedFile);
    setTrimmedUrl(null);

    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
  };

  const handleLoadedMetadata = async () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      setDuration(d);
      setStartTime(0);
      setEndTime(Math.min(60, d));
      // Auto-trim on load
      if (file) {
        await autoTrim(file, 0, Math.min(60, d));
      }
    }
  };

  const autoTrim = async (audioFile: File, start: number, end: number) => {
    setIsTrimming(true);
    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioContext = new (window.AudioContext ||
        // @ts-ignore
        window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(Math.max(0, start) * sampleRate);
      const endSample = Math.floor(Math.min(end, audioBuffer.duration) * sampleRate);
      const trimmedLength = endSample - startSample;

      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        trimmedData.set(channelData.subarray(startSample, endSample));
      }

      const trimmedBlob = await audioBufferToWavBlob(trimmedBuffer);
      const trimmedObjectUrl = URL.createObjectURL(trimmedBlob);
      setTrimmedUrl(trimmedObjectUrl);
      onAudioTrimmed(trimmedBlob, start, end);
    } catch (err) {
      console.error(err);
      alert("Error while trimming audio");
    } finally {
      setIsTrimming(false);
    }
  };


  const audioBufferToWavBlob = (audioBuffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numOfChan = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numOfChan * 2 + 44;
      const buffer = new ArrayBuffer(length);
      const view = new DataView(buffer);

      const writeString = (view: DataView, offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };

      let offset = 0;

      writeString(view, offset, "RIFF");
      offset += 4;
      view.setUint32(offset, 36 + audioBuffer.length * numOfChan * 2, true);
      offset += 4;
      writeString(view, offset, "WAVE");
      offset += 4;
      writeString(view, offset, "fmt ");
      offset += 4;
      view.setUint32(offset, 16, true);
      offset += 4;
      view.setUint16(offset, 1, true);
      offset += 2;
      view.setUint16(offset, numOfChan, true);
      offset += 2;
      view.setUint32(offset, audioBuffer.sampleRate, true);
      offset += 4;
      view.setUint32(offset, audioBuffer.sampleRate * numOfChan * 2, true);
      offset += 4;
      view.setUint16(offset, numOfChan * 2, true);
      offset += 2;
      view.setUint16(offset, 16, true);
      offset += 2;
      writeString(view, offset, "data");
      offset += 4;
      view.setUint32(offset, audioBuffer.length * numOfChan * 2, true);
      offset += 4;

      const channels: Float32Array[] = [];
      for (let i = 0; i < numOfChan; i++) {
        channels.push(audioBuffer.getChannelData(i));
      }

      let sampleIndex = 0;
      while (sampleIndex < audioBuffer.length) {
        for (let ch = 0; ch < numOfChan; ch++) {
          const sample = Math.max(-1, Math.min(1, channels[ch][sampleIndex]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
          offset += 2;
        }
        sampleIndex++;
      }

      resolve(new Blob([buffer], { type: "audio/wav" }));
    });
  };

  const removeAudio = () => {
    setFile(null);
    setAudioUrl(null);
    setTrimmedUrl(null);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    onAudioRemoved?.();
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="space-y-2">
        <Label htmlFor="audio-file">Background Music (Optional)</Label>
        <div className="flex gap-2">
          <Input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="flex-1"
          />
          {(audioUrl || file) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeAudio}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onLoadedMetadata={handleLoadedMetadata}
            className="hidden"
          />

          {isTrimming ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Auto-trimming to 60 seconds...
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Original duration: {duration.toFixed(0)}s — trimmed to {Math.min(60, duration).toFixed(0)}s
            </div>
          )}
        </>
      )}

      {trimmedUrl && (
        <div className="space-y-2 border-t pt-4">
          <Label>Trimmed Preview:</Label>
          <audio src={trimmedUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
};

export default AudioTrimField;
