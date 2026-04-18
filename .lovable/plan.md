
## Plan: Prevent Leading Spaces on Bride/Groom Name Fields

### Goal
Prevent users from typing leading spaces in the Bride Name and Groom Name inputs, and ensure values are trimmed before being saved.

### Changes in `src/pages/WeddingForm.tsx`

1. **Input handlers** — For both `groom_name` and `bride_name` Input components:
   - Strip leading whitespace as the user types: `value.replace(/^\s+/, "")` on `onChange`.
   - This blocks spaces at the start while still allowing spaces between words (e.g., middle names).

2. **Save logic** — In the form submission/save flow, trim both fields before sending to the database:
   - `groom_name: formData.groom_name.trim()`
   - `bride_name: formData.bride_name.trim()`

### Notes
- Apply the same treatment in `src/pages/RoseGoldTabsForm.tsx` for consistency, since prior name-field changes were applied to both forms.
- No DB schema changes needed.
- No UI/visual changes — purely input sanitization.
