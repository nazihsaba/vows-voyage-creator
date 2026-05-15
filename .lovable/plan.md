# Allow custom timeline sections on all templates

Today the **Additional Sections** card (with `+ Add Section`) in the wedding form is only shown for the Aura family (Dorée, Lumière, Étoile). The other active templates — **Éclat**, **Vérité**, **Grâce**, **Opulence** — neither expose the form option nor render the extra events. The goal is to make the option universal and have each template display the custom events alongside Ceremony / Venue.

No DB changes are needed: custom sections are already stored as `wedding_locations` rows with `type = 'custom_N'` and `display_order`, with Arabic copies under `custom_title_custom_N` / `custom_location_custom_N`.

## 1. Wedding form (`src/pages/WeddingForm.tsx`)

- Remove the `isAuraTemplate` gate around the **Additional Sections** card (≈ line 2318) so it renders for every template.
- Apply the same change to the validation block at line 887 (require complete custom sections) and the save/persist blocks at lines 1017 and 1231 (Arabic remap + insert into `wedding_locations`) so they run regardless of template.
- Keep the Aura-only `TimelineOrderControls` (up/down reordering) gated as it is — Éclat/Vérité/Grâce/Opulence don't have a reorderable timeline; their custom sections will simply append after Venue in `display_order`.
- No copy or layout changes; the card text "Add up to 4 more events…" already reads generically.

## 2. Template rendering

Each non-Aura template currently picks specific rows: `locations.find(l => l.type === 'ceremony' | 'venue' | 'welcome_drink')`. Add a derived list of custom events and render one extra card/block per entry, sorted by `display_order`, using the template's existing event-card styling. Each entry uses:

- title → `getLocalizedValue('custom_title_' + loc.type, loc.custom_title)`
- time → `formatTimeTo12Hour(loc.time)`
- location → `getLocalizedValue('custom_location_' + loc.type, loc.location_name)`
- map link → `loc.location_link`
- icon → `loc.icon` (fallback `solar:confetti-bold`), rendered via `<EventIcon>`

Files to update (template + matching live-preview file, per the live-preview parity rule):

- `src/components/templates/EclatTemplate.tsx` + `EclatPreview.tsx` — append custom cards after the Venue card in the Events section, reusing the cream card styling.
- `src/components/templates/VeriteTemplate.tsx` + `VeritePreview.tsx` — append after Venue using the same fade-in animation block.
- `src/components/templates/GraceTemplate.tsx` + `GracePreview.tsx` — append after Venue using the white card style.
- `src/components/templates/OpulenceTemplate.tsx` + `OpulencePreview.tsx` — append after Venue using its existing event panel style.

Aura / Lumière / Étoile are already wired and need no changes.

## 3. Verification

- Open `/dashboard/eclat-form` (Éclat), confirm the Additional Sections card appears, add one section, save, and check it renders in the Eclat live preview and full template.
- Repeat for Vérité, Grâce, Opulence.
- Sanity-check Aura/Lumière/Étoile still behave the same (validation, ordering, Arabic translation).

## 4. Memory update

After implementation, update `mem://features/custom-timeline-sections` so it states the feature is available on **all active templates**, not just Dorée/Étoile/Lumière.
