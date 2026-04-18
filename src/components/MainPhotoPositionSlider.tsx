import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface Props {
  imageUrl: string;
  value: number;
  onChange: (value: number) => void;
  /**
   * Ref to the rendered preview <img>. Kept for backward compatibility
   * with existing callers; no longer used to gate the slider since the
   * form preview's crop differs from the live template hero.
   */
  imageRef: React.RefObject<HTMLImageElement>;
  /** Show the helper sentence above the slider (only used for the main photo). */
  showHelperText?: boolean;
}

/**
 * Renders the "Adjust vertical position" control under a photo preview.
 * Always enabled: the saved position controls how the image is cropped
 * inside the live template (typically a much taller `h-screen` hero),
 * so adjustment can matter even when the form preview itself doesn't crop.
 */
const MainPhotoPositionSlider = ({ value, onChange, showHelperText = false }: Props) => {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
      {showHelperText && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Use the slider to align the image and highlight what matters most. ✨
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">Adjust vertical position</Label>
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
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
};

export default MainPhotoPositionSlider;
