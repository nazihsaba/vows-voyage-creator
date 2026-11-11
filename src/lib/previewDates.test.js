import { test } from "node:test";
import { strict as assert } from "node:assert";
import { getPreviewDates } from "./previewDates";

test("preview timers have positive future values even after old sample dates expire", () => {
  for (const year of [2026, 2028, 2035]) {
    const now = new Date(year, 10, 11, 19, 24);
    const dates = getPreviewDates(now);
    const diff = dates.weddingDate.getTime() - now.getTime();
    assert.ok(Math.floor(diff / 86400000) > 0);
    assert.ok(Math.floor(diff / 3600000) % 24 > 0);
    assert.ok(Math.floor(diff / 60000) % 60 > 0);
    assert.ok(Math.floor(diff / 1000) % 60 > 0);
    assert.ok(new Date(`${dates.weddingDateString}T00:00:00`).getTime() > now.getTime());
  }
});