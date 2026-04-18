import { useEffect, useRef, useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface Props {
  imageUrl: string;
  value: number;
  onChange: (value: number) => void;
  /**
   * Ref to the actual rendered preview <img> element so we can detect
   * whether the image is being cropped vertically by object-cover.
   */
  imageRef: React.RefObject<HTMLImageElement>;
}

/**
 * Renders the "Adjust vertical position" control under the main photo preview.
 * Uses ResizeObserver + image natural size to detect whether vertical cropping
 * is actually happening; disables the slider with a helpful message otherwise.
 *
 * Value is always preserved (other templates may render at different aspect
 * ratios and still benefit from the saved position).
 */
const MainPhotoPositionSlider = ({ imageUrl, value, onChange, imageRef }: Props) => {
  const [canAdjustY, setCanAdjustY] = useState(false);

  const recompute = useCallback(() => {
    const img = imageRef.current;
    const container = img?.parentElement;
    if (!img || !container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!cw || !ch || !nw || !nh) return;

    const scale = Math.max(cw / nw, ch / nh);
    const renderedH = nh * scale;
    setCanAdjustY(renderedH > ch + 1);
  }, [imageRef]);

  // Recompute when the image source changes (re-attach load listener)
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;
    if (img.complete) {
      recompute();
    } else {
      img.addEventListener("load", recompute);
      return () => img.removeEventListener("load", recompute);
    }
  }, [imageUrl, recompute, imageRef]);

  // Recompute on container resize
  useEffect(() => {
    const img = imageRef.current;
    const container = img?.parentElement;
    if (!container) return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(container);
    return () => ro.disconnect();
  }, [imageUrl, recompute, imageRef]);

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm">Adjust vertical position</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onChange(50)}
          disabled={value === 50}
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={1}
        disabled={!canAdjustY}
        onValueChange={(v) => onChange(v[0])}
      />
      <p className="text-xs text-muted-foreground">
        {canAdjustY
          ? "Move the photo up or down to choose what stays visible."
          : "This image already fits perfectly — no adjustment needed."}
      </p>
    </div>
  );
};

export default MainPhotoPositionSlider;
