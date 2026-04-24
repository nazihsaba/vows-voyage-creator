---
name: Data Sanitization Capitalization
description: Title Case enforced at save time for invitee names, link names, and now bride/groom names + family names across both wedding forms and EditableWeddingInvite
type: feature
---

Title Case is applied at save time using the regex pattern:
`s.trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())`

Applied to:
- Invitee names (ManageLinks, GenerateLinkDialog)
- Invitation link names (ManageLinks, GenerateLinkDialog)
- `groom_name`, `bride_name`, `groom_family`, `bride_family` in:
  - `src/pages/WeddingForm.tsx` (handleSubmit)
  - `src/pages/RoseGoldTabsForm.tsx` (handleSubmit)
  - `src/components/EditableWeddingInvite.tsx` (handleSave — family names only, since names are not editable inline)

Family fields are only normalized when non-empty to preserve null/empty state.
