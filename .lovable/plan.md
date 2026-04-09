

# Plan: New "Lumière" Wedding Invitation Template

## Overview
Create a romantic, editorial, minimal wedding invitation template called **Lumière** that plugs into the existing Aurea Invites system using the exact same technical patterns as Grace, Vérité, Éclat, Aura (Dorée), and Opulence.

## Design Direction
- Long single-page scroll, mobile-first, luxury editorial feel
- White space heavy, soft typography, black/warm neutral palette
- Script font (Dancing Script) for names/titles, serif (Cormorant Garamond) for body
- Subtle fade-in animations via `AnimatedSection`
- No glassmorphism, no heavy shadows, no card-heavy layouts

## Files to Create

### 1. `src/components/templates/LumiereTemplate.tsx`
The live template component — follows the exact same interface and props as `AuraTemplate`, `VeriteTemplate`, etc:
- Same props interface (`wedding`, `locations`, `gallery`, `giftCards`, `isOwner`, `isPreview`, `onFieldUpdate`, `getFieldValue`, `getFieldStyle`, `invitees`, `rsvpResponses`, etc.)
- Uses `EditableField` for all dynamic text fields
- Uses `useTranslation`, `useArabicContent`, `LanguageToggle` for multilingual support
- Uses `CountdownTimer`, `GiftCards`, `RsvpSection`, `TemplatePreviewFooter`, `AnimatedSection`
- Uses `formatTimeTo12Hour` for time display
- Audio playback logic matching Aura pattern
- Sections in order: Hero (full-width image + names), Invitation Message (quote + names + invite text), Date Section, Ceremony, Celebration/Reception, Gallery, Gifts, RSVP, Footer
- Map links via `<a href={location.location_link} target="_blank">` pattern
- Template ID: `lumiere-editorial`

### 2. `src/components/templates/LumierePreview.tsx`
Static preview component with hardcoded sample data — follows AuraPreview/OpulencePreview pattern:
- Static countdown timer component
- Sample couple names, dates, venues
- Uses same local preview assets (beach wedding imagery)
- Static RSVP section via `RsvpSection` component
- `TemplatePreviewFooter` at bottom

### 3. Preview image asset
Source an appropriate preview thumbnail image for dashboard/landing page cards.

## Files to Modify

### 4. `src/components/templates/TemplateRenderer.tsx`
Add `LumiereTemplate` import and a new `if (template.component === 'LumiereTemplate')` block passing all standard props — identical pattern to the existing five template blocks.

### 5. `src/config/templates.ts`
Add a new template entry:
```ts
{
  id: 'lumiere-editorial',
  name: 'Lumière',
  category: 'elegant',
  component: 'LumiereTemplate',
  isPremium: true,
  isPopular: true,
  // sections, style config...
}
```

### 6. `src/pages/Dashboard.tsx`
- Import `LumierePreview`
- Add Lumière to `weddingTemplates` array with features, image, and id
- Add preview rendering in the Dialog: `{showPreview === "lumiere-editorial" && <LumierePreview />}`
- Add route mapping: `"lumiere-editorial": "/dashboard/lumiere-form"`

### 7. `src/App.tsx`
Add route: `<Route path="/dashboard/lumiere-form" element={<WeddingForm />} />`

### 8. `src/pages/WeddingForm.tsx`
- Add `isLumiereTemplate` flag: `template === "lumiere-editorial"`
- Include `lumiere-editorial` in gallery templates array
- Gallery limit: 7 images (same as Aura/Vérité)
- Main photo required (not a video template)

### 9. `src/components/InvitationPreviewSection.tsx`
Add Lumière as a 5th card in the landing page preview carousel with lazy-loaded `LumierePreview`.

### 10. `src/utils/templateMapping.ts`
No changes needed — `lumiere-editorial` is a new native ID, no legacy mapping required.

## Dynamic Fields (via EditableField, same pattern as Aura)
All editable fields use `getFieldValue` / `getFieldStyle` / `onFieldUpdate`:
- `lumiere-quote` — intro romantic quote
- `lumiere-invitation-line` — invitation message text  
- `wedding-date-formatted` — formatted wedding date
- `groom-family-name`, `bride-family-name` — family names
- `together-text` — "together with their families"
- Couple names rendered from `wedding.groom_name` / `wedding.bride_name`
- Ceremony/venue data from `locations` array (same approach as all templates)
- Gift cards from `giftCards` array via `GiftCards` component
- RSVP via `RsvpSection` component

## Section Layout (mobile-first, centered narrow column)
1. **Hero** — Full-width romantic image (`wedding.main_picture_url`), couple names overlay, subtle monogram initials
2. **Invitation Message** — Editable quote, couple names, invitation line
3. **Date** — Wedding date with elegant typography hierarchy
4. **Ceremony** — Venue, time, map button (outlined minimal style)
5. **Celebration** — Same structure as ceremony for venue location
6. **Gallery** — Grid of images from `gallery` array
7. **Gifts** — `GiftCards` component with elegant heading
8. **RSVP** — `RsvpSection` component
9. **Footer** — Editable closing line + `TemplatePreviewFooter`

## Styling Approach
- Root: `lg:px-[25%]` for centered desktop column (same as Aura)
- Font: Cormorant Garamond for headings/body, Dancing Script for names
- Colors: `text-foreground` on white background, `text-primary` accents
- Buttons: `variant="outline"` with rounded-full, minimal borders
- Spacing: `py-20` to `py-24` between sections for generous whitespace
- Animations: `AnimatedSection` with `fade-in` only

