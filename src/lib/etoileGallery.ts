type GalleryImage = { image_url: string };

export function getEtoileGallerySettings(customizations: unknown, images: GalleryImage[] = []) {
  const parsed = typeof customizations === "string" ? JSON.parse(customizations || "{}") : customizations;
  const hideOurMoments = typeof parsed === "object" && parsed !== null &&
    "hide_our_moments" in parsed && parsed.hide_our_moments === true;
  return {
    hideOurMoments,
    showOurMoments: images.length > 0 && !hideOurMoments,
    backgroundImages: images.map((image) => image.image_url),
  };
}