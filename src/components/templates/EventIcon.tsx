import { Icon } from "@iconify/react";
import iconBride from "@/assets/icon-bride.png";
import iconBrideFlowers from "@/assets/icon-bride-flowers.png";
import iconSuit from "@/assets/icon-suit.png";

const ASSET_ICON_MAP: Record<string, string> = {
  "asset:bride": iconBride,
  "asset:bride-flowers": iconBrideFlowers,
  "asset:suit": iconSuit,
};

interface EventIconProps {
  icon?: string;
  className?: string;
  fallback?: string;
}

/**
 * Renders an event icon. Supports custom asset icons (asset:*) and Iconify icons.
 */
export const EventIcon = ({ icon, className, fallback }: EventIconProps) => {
  const resolved = icon || fallback || "";
  const assetSrc = ASSET_ICON_MAP[resolved];
  if (assetSrc) {
    // Render as a CSS mask so the icon inherits currentColor (e.g. text-primary).
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          display: "inline-block",
          backgroundColor: "currentColor",
          WebkitMaskImage: `url(${assetSrc})`,
          maskImage: `url(${assetSrc})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    );
  }
  return <Icon icon={resolved} className={className} />;
};
