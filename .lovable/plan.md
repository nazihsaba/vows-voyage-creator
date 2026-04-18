

## Plan: Manual vertical position slider with smart visibility (final)

### Goal
Slider on the main/cover photo lets users pick which vertical part stays visible. Image keeps `object-cover`; only `object-position` Y changes. Slider is enabled only when the image is actually cropped vertically. Value is always persisted and clamped at render.

### Database
Migration adds:
- `weddings.main_picture_position_y numeric` — default `50`, nullable, CHECK `>= 0 AND <= 100`.

### Detection logic (form preview)
On `onLoad` **and** on container resize (via `ResizeObserver`):
```ts
const scale = Math.max(cw / naturalW, ch / naturalH);
const renderedH = naturalH * scale;
setCanAdjustY(renderedH > ch + 1);
```
- `ResizeObserver` watches the image's parent container; cleanup on unmount.
- Slider always rendered; **disabled** when `!canAdjustY` with helper text *"This image already fits perfectly — no adjustment needed."*

### Form UX (WeddingForm + RoseGoldTabsForm)
Below the main photo preview:
- Label: **Adjust vertical position**
- `Slider` (0–100, step 1) — enabled/disabled based on `canAdjustY`
- Small **Reset** button → `50`
- Live preview: `style={{ objectFit: "cover", objectPosition: \`50% ${posY}%\` }}`
- Initialize from `wedding.main_picture_position_y ?? 50`
- **Always persist** `main_picture_position_y` on save, even if slider was disabled (other templates have different aspect ratios)

### Render — apply saved position to main hero image
Helper applied wherever the main `<img>` is rendered:
```ts
const posY = Math.min(100, Math.max(0, wedding.main_picture_position_y ?? 50));
// style={{ objectPosition: `50% ${posY}%` }}
```
Files updated (keep `object-cover`):
- `AuraTemplate` + `AuraPreview`
- `EclatTemplate` + `EclatPreview`
- `OpulenceTemplate` + `OpulencePreview`
- `EtoileTemplate` + `EtoilePreview`
- `LumiereTemplate` + `LumierePreview`
- `VeriteTemplate` + `VeritePreview`
- `GraceTemplate` + `GracePreview`

### Locked-in safeguards
1. **DB CHECK** constraint `0–100`.
2. **Render-time clamp** `Math.min(100, Math.max(0, ... ?? 50))` in every template.
3. **ResizeObserver** re-runs detection when container size changes.
4. Always persist value (templates render at different aspect ratios than form preview).
5. Fallback always `50%` when null/missing/invalid.
6. Gallery thumbnails unaffected; horizontal axis unchanged.

### Out of scope
- Per-gallery-image vertical positioning.
- Horizontal positioning.
- Per-template adaptive auto-adjust.
- Face detection.

