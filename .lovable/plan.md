

## Plan: Add desktop padding to Lumière preview

The other template previews (Aura, Éclat, Grâce, Vérité) all use `lg:px-[25%]` on their outermost container for desktop view padding. Lumière currently uses `lg:max-w-[600px] lg:mx-auto` which is a different approach.

### Change

In `src/components/templates/LumierePreview.tsx`, update the root `<div>` class:
- **Remove**: `lg:max-w-[600px] lg:mx-auto`
- **Add**: `lg:px-[25%]`

This aligns the Lumière preview with all other template previews for consistent desktop padding.

