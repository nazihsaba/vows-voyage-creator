

## Plan: Remove Default Story-Style Layout from WeddingInvite.tsx

### Problem
`WeddingInvite.tsx` contains two rendering paths:
1. **Lines 379-468**: Template-based rendering via `TemplateRenderer` (used when `template` exists)
2. **Lines 471-812**: A legacy "story-style" fallback layout with swipeable sections

The fallback is no longer needed since all weddings should use the template system.

### Changes

**`src/pages/WeddingInvite.tsx`**:
- Remove the entire default story-style layout (lines 471-812) including the swipeable sections (hero, quote, family, gallery, countdown, ceremony, venue, gifts)
- Remove the `if (template)` conditional check at line 379 -- always use the `TemplateRenderer` path
- Remove unused imports that were only needed by the fallback layout: `WeddingGallery`, `EventLocation`, `EditableImage`, `format`, `MapPin`, `Calendar`, `ChevronLeft`, `ChevronRight`, `Download`, `heroImage`
- Remove unused state: `currentSection`, `downloadingCard`
- Remove the `updateMainImage` function and the outer `getFieldValue`/`getFieldStyle` functions (lines 102-108), keeping only the ones defined inside the template block (lines 380-389)
- Remove the `handleDownloadCard` function if only used by the fallback
- For weddings without a `template_type`, default to Verite template by updating `useTemplate` hook or adding a fallback in the rendering logic

**`src/hooks/useTemplate.tsx`** (if needed):
- Ensure it returns a default template (e.g., Verite) when `template_type` is null/undefined, so the `TemplateRenderer` always receives a valid template

**`src/components/templates/TemplateRenderer.tsx`**:
- Remove the generic `renderSection` fallback at the bottom since all templates now use dedicated components
- The `VeriteTemplate` branch should also pass RSVP props (currently missing -- lines 65-72 don't pass them)

