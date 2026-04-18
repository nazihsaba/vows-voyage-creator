import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import MainPhotoPositionSlider from "@/components/MainPhotoPositionSlider";

interface Props {
  imageUrl: string;
  altText?: string;
  positionY: number;
  onPositionChange: (value: number) => void;
  onRemove: () => void;
}

/**
 * Single editable gallery thumbnail with vertical-position slider.
 * Used in both WeddingForm and RoseGoldTabsForm for existing & pending images.
 */
const GalleryImageEditor = ({ imageUrl, altText, positionY, onPositionChange, onRemove }: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const clamped = Math.min(100, Math.max(0, positionY ?? 50));

  return (
    <div className="space-y-2">
      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
        <img
          ref={imgRef}
          src={imageUrl}
          alt={altText || "Gallery image"}
          loading="lazy"
          className="w-full h-full object-cover"
          style={{ objectPosition: `50% ${clamped}%` }}
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <MainPhotoPositionSlider
        imageUrl={imageUrl}
        value={clamped}
        onChange={onPositionChange}
        imageRef={imgRef}
      />
    </div>
  );
};

export default GalleryImageEditor;
