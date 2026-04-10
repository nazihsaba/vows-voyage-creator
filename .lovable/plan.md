

# Plan: Add Lumière Template

## Overview
Create a new "Lumière" wedding template with a fixed fullscreen background video, dark overlay, and clean torn-paper-edge cards floating above. Follow the exact same architecture as AuraTemplate/AuraPreview.

## Files to Create

### 1. `src/components/templates/lumiere/LumiereTornCard.tsx`
Reusable card wrapper with SVG filter-based deckled/torn edges (using `feTurbulence` + `feDisplacementMap` on the card boundary only). Interior stays clean white. Full-width cards with hidden left/right borders for seamless vertical flow.

### 2. `src/components/templates/lumiere/LumiereCountdown.tsx`
Countdown timer section inside a torn card. Uses the same countdown logic as existing templates. Typography: Dancing Script for headers, Montserrat for body. No background — transparent over the video.

### 3. `src/components/templates/lumiere/LumiereEvents.tsx`
Wedding events/timeline section in a torn card. Same timeline data structure as Aura (ceremony, venue from locations array). Vertical timeline with icons.

### 4. `src/components/templates/lumiere/LumiereGifts.tsx`
Gift cards section in a torn card. Reuses the same `giftCards` data structure. Copy-to-clipboard functionality.

### 5. `src/components/templates/lumiere/LumiereGallery.tsx`
Gallery section with watercolor/brush-mask effect on images. Displays gallery images in a grid inside a torn card.

### 6. `src/components/templates/lumiere/LumiereRsvp.tsx`
RSVP section in a torn card. Wraps the shared `RsvpSection` component with Lumière styling.

### 7. `src/components/templates/LumiereTemplate.tsx`
Main live template component. Same props interface as `AuraTemplateProps`. Three-layer architecture:
- **Layer 1**: Fixed fullscreen `<video>` using `wedding.hero_media` (autoplay, muted, loop, `object-fit: cover`, `position: fixed`, `100dvh`)
- **Layer 2**: Semi-transparent dark overlay (`bg-black/30`, fixed, z-index 1)
- **Layer 3**: Scrollable content (z-index 2) — Hero intro, then torn-card sections for Countdown, Events, Gallery, Gifts, RSVP

No section padding — edge-to-edge cards. Uses `EditableField` for all editable text. Reuses existing audio, language toggle, and footer components.

### 8. `src/components/templates/LumierePreview.tsx`
Static preview with the uploaded video (`src/assets/lumiere-preview-video.mp4`), sample data, and all sections. Same structure as `AuraPreview` but with Lumière design.

## Files to Modify

### 9. `src/config/templates.ts`
Add `lumiere-editorial` template entry with component `'LumiereTemplate'`, Dancing Script / Montserrat fonts, dark color scheme.

### 10. `src/components/templates/TemplateRenderer.tsx`
Add `LumiereTemplate` import and `if (template.component === 'LumiereTemplate')` block passing all props.

### 11. `src/utils/templateMapping.ts`
Add `'lumiere-editorial'` mapping so it resolves correctly.

### 12. `src/components/InvitationPreviewSection.tsx`
Add Lumière to the preview cards array and lazy-load `LumierePreview`. Add `"lumiere"` to `TemplateKey` union.

### 13. `src/pages/WeddingTemplates.tsx`
Add Lumière card to the wedding templates array with route to `/dashboard/lumiere-form`.

### 14. `src/App.tsx`
Add route: `<Route path="/dashboard/lumiere-form" element={<WeddingForm />} />`

### 15. Copy uploaded video
Copy `user-uploads://WhatsApp_Video_2026-04-09_at_1.44.59_PM-3.mp4` to `src/assets/lumiere-preview-video.mp4` for use in the preview.

## Technical Details

**Torn paper edge implementation** (SVG filter approach):
```tsx
<svg className="absolute" width="0" height="0">
  <filter id="torn-edge">
    <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="5" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
  </filter>
</svg>
```
Applied via CSS `filter: url(#torn-edge)` on the card container — affects only the silhouette/edges while keeping interior clean.

**Video background**:
```tsx
<video className="fixed inset-0 w-full h-[100dvh] object-cover z-0"
  autoPlay muted loop playsInline />
```

**No CountdownTimer component reuse** — Lumière intentionally omits the countdown per the memory note, but since the user explicitly requested countdown sections, it will be included with a dark variant for readability over the video.

