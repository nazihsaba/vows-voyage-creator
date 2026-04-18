

## Plan: Per-image vertical position slider for gallery photos

### Goal
Extend the existing manual vertical-position control to every gallery image, so each gallery photo can be cropped independently (top / center / bottom). Same UX as the main cover photo: slider 0–100, default 50, disabled when no vertical cropping is needed, value persisted per image.

### Database
Migration adds one column to `gallery_images`:
- `position_y numeric` — default `50`, nullable, CHECK `>= 0 AND <= 100`.

Existing rows fall back to `50` (centered) — visually unchanged.

### Form UX (WeddingForm + RoseGoldTabsForm)

**Existing gallery thumbnails** (already-uploaded images):
- Each thumbnail already renders an `<img>` in the grid. Below each thumbnail, render the same `MainPhotoPositionSlider` (compact mode).
- State: keep a map `{ [imageId]: position_y }` initialized from the fetched `gallery_images.position_y ?? 50`.
- On slider change, update the map and immediately persist that one row to the DB (`update gallery_images set position_y = ... where id = ...`). No need to wait for full save — keeps UX snappy and avoids losing values when the user navigates.
- Live thumbnail updates via `style={{ objectPosition: \`50% ${posY}%\` }}`.

**Newly added gallery files** (not yet uploaded):
- Track local `position_y` per pending file in a parallel array, default `50`.
- On submit, after `gallery_images` insert returns the new IDs, update each row with its chosen `position_y`. (Simpler alternative: include `position_y` in the insert payload — preferred.)
- Live preview uses the same slider component.

### Render — apply saved position to gallery images
Helper applied wherever a gallery `<img>` is rendered (clamped):
```ts
const posY = Math.min(100, Math.max(0, image.position_y ?? 50));
// style={{ objectPosition: `50% ${posY}%` }}
```

Files updated (gallery sections only — keep `object-cover`):
- `src/components/templates/aura/AuraGallery.tsx` *(if exists — check)*
- `src/components/templates/etoile/EtoileGallery.tsx`
- `src/components/templates/lumiere/LumiereGallery.tsx`
- `src/components/templates/AuraTemplate.tsx` (gallery section)
- `src/components/templates/EclatTemplate.tsx` (gallery section)
- `src/components/templates/VeriteTemplate.tsx` (gallery section)
- `src/components/templates/GraceTemplate.tsx` (gallery section)
- `src/components/templates/OpulenceTemplate.tsx` (gallery section)
- `src/components/WeddingGallery.tsx` (shared component)

Previews (sample images) keep default `50%` — visually unchanged.

### Component reuse
Reuse the existing `MainPhotoPositionSlider` — it already handles:
- ResizeObserver for responsive containers
- Render-time clamp
- Disabled state with helper text when no cropping
- Reset button
- Always-rendered slider (so layout doesn't shift)

Optional small visual tweak: pass an `compact` prop to shrink padding for the gallery grid (nice-to-have, not required).

### Locked-in safeguards
1. **DB CHECK** constraint `0–100` on `gallery_images.position_y`.
2. **Render-time clamp** `Math.min(100, Math.max(0, ... ?? 50))` everywhere.
3. **Per-image persistence** — slider value saved to that specific row.
4. **Fallback** always `50%` when null/missing/invalid.
5. Existing images render exactly as before until adjusted.
6. Gallery `image_order`, `alt_text`, etc. are untouched.

### Out of scope
- Horizontal position (X axis).
- Bulk "apply this position to all gallery images" action.
- Per-template adaptive auto-crop.
- Face / focal-point detection.

### Files

**Migration:** add `gallery_images.position_y`.

**Modified:**
- `src/pages/WeddingForm.tsx` — slider under each existing + pending gallery thumbnail, persist on change / on submit.
- `src/pages/RoseGoldTabsForm.tsx` — same.
- All template gallery render sites listed above — apply `objectPosition`.

**Possibly new:**
- Small `compact` variant of `MainPhotoPositionSlider` (optional polish).

