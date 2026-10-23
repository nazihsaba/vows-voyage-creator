import { describe, expect, test } from "bun:test";
import { getEtoileGallerySettings } from "./etoileGallery";

const images = [{ image_url: "photo-1.jpg" }, { image_url: "photo-2.jpg" }];

describe("Étoile Our Moments visibility", () => {
  test("hides Our Moments when toggled on", () => {
    expect(getEtoileGallerySettings({ hide_our_moments: true }, images).showOurMoments).toBe(false);
  });
  test("keeps all background photos when Our Moments is hidden", () => {
    expect(getEtoileGallerySettings({ hide_our_moments: true }, images).backgroundImages)
      .toEqual(["photo-1.jpg", "photo-2.jpg"]);
  });
  test("shows Our Moments by default and when toggled off", () => {
    expect(getEtoileGallerySettings(undefined, images).showOurMoments).toBe(true);
    expect(getEtoileGallerySettings({ hide_our_moments: false }, images).showOurMoments).toBe(true);
  });
  test("reads saved string customizations", () => {
    expect(getEtoileGallerySettings('{"hide_our_moments":true}', images).hideOurMoments).toBe(true);
  });
});