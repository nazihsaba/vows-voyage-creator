## Théâtre — new Auréa template

A dark, editorial "opera" invitation inspired by the uploaded design: burgundy stage curtains that rise on tap, a cream three-act story sequence, and a black RSVP finale. Fully dynamic — every text, image, date, event, and RSVP field is bound to the existing wedding form fields.

### Visual concept (mapped to real data)

```
┌──────────────────────────────────────┐
│ Act 0 — CURTAIN                      │  Burgundy velvet curtains, gold "SCROLL"
│                                      │  → Tap to Start opens curtains
├──────────────────────────────────────┤
│ Act 0 — STAGE                        │  Black stage: "The marriage of"
│                                      │  Groom · and · Bride · Date (Roman num.)
├──────────────────────────────────────┤
│ Act 1 — INVITATION                   │  Cream: family invite text
│  Main photo (Beirut · MMXXVI corners)│  Countdown "Curtain rises in"
├──────────────────────────────────────┤
│ Act 2 — OUR STORY (In three acts)    │  Up to 3 gallery images + editable
│  Act I · The Meeting                 │  captions (title + paragraph each)
│  Act II · The Years Between          │
│  Act III · The Question              │
├──────────────────────────────────────┤
│ Act 3 — THE CEREMONY / THE SETTING   │  Ceremony & Venue from locations,
│  Date · Time · Church · Venue · Map  │  dress code, directions button
├──────────────────────────────────────┤
│ Act 4 — RUNNING ORDER / THE EVENING  │  Timeline from ordered locations
├──────────────────────────────────────┤
│ Act 5 — GIFT REGISTRY (if any)       │  Cream section reusing GiftCards
├──────────────────────────────────────┤
│ Act 6 — RÉPONDEZ (RSVP)              │  Black section reusing RsvpSection
├──────────────────────────────────────┤
│ Footer                               │  Names · Auréa Invites
└──────────────────────────────────────┘
```

Palette: burgundy `#4d0f1b`, gold `#c9a76a`, cream `#faf9f5`, black `#0d0d0d`.
Typography: Cormorant Garamond (display), Playfair (secondary), Inter uppercase tracking labels. Roman numerals for the date.

### Data binding

All content pulls from the current form — no new form fields:
- Names, wedding_date (also rendered as Roman numerals), main_description, main_picture_url, audio_url.
- Ceremony / Venue / custom timeline entries from `wedding_locations` (same pattern as Opulence).
- Gallery images fill the three-act story image slots (first 3), plus optional venue photo.
- `giftCards` → registry section (reuses `GiftCards`).
- `invitees` / RSVP → reuses `RsvpSection` with dark theming.
- Editable via `EditableField` for: "with joyful hearts" line, three act titles + descriptions, "black tie" note, "Répondez" subtitle. Everything has sensible defaults so it works out of the box.

### Files

New:
- `src/components/templates/TheatreTemplate.tsx` — main dynamic template.
- `src/components/templates/TheatrePreview.tsx` — static demo preview (Elie & Clara sample data) for Dashboard.
- `src/components/templates/theatre/Curtains.tsx` — SVG stage curtains + open-on-start.
- `src/components/templates/theatre/ThreeActs.tsx` — story section with editable act captions.

Edits:
- `src/config/templates.ts` — register `theatre-opera` template.
- `src/components/templateFontDefaults.ts` — Théâtre font defaults (Cormorant/Playfair).
- `src/components/templates/TemplateRenderer.tsx` — dispatch `TheatreTemplate`.
- `src/pages/Dashboard.tsx` — add card + preview + form route (reuses generic `/dashboard/wedding-form`).
- `src/pages/WeddingForm.tsx` — include `theatre-opera` in the same permissive lists Etoile/Tresor use (optional main image, optional gallery limit = 6, custom timeline enabled).
- `src/pages/MyEvents.tsx` — height mapping entry.

### Notes / non-goals

- No new database columns; the three story acts use `EditableField` overrides just like other templates.
- Reuses `useTemplateAudio`, `TapToPlayMusic`, `CountdownTimer`, `EventLocation` pattern, `GiftCards`, `RsvpSection` — no duplicated logic.
- Arabic/RTL support inherited via existing utilities (`formatLocalizedDate`), with Roman-numeral date shown only in Latin mode; Arabic falls back to the localized long date.
- Mobile-first, `overflow-x-hidden`, `lg:` 25% side padding per the project's desktop convention.
