import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { getEtoileGallerySettings } from "./etoileGallery";

const images = [{ image_url: "photo-1.jpg" }, { image_url: "photo-2.jpg" }];

describe("Étoile Our Moments visibility", () => {
  test("hides Our Moments when toggled on", () => {
    assert.equal(getEtoileGallerySettings({ hide_our_moments: true }, images).showOurMoments, false);
  });
  test("keeps all background photos when Our Moments is hidden", () => {
    assert.deepEqual(getEtoileGallerySettings({ hide_our_moments: true }, images).backgroundImages,
      ["photo-1.jpg", "photo-2.jpg"]);
  });
  test("shows Our Moments by default and when toggled off", () => {
    assert.equal(getEtoileGallerySettings(undefined, images).showOurMoments, true);
    assert.equal(getEtoileGallerySettings({ hide_our_moments: false }, images).showOurMoments, true);
  });
  test("reads saved string customizations", () => {
    assert.equal(getEtoileGallerySettings('{"hide_our_moments":true}', images).hideOurMoments, true);
  });
});