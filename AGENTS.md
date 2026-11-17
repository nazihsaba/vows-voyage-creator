# Architecture rules

- Store Étoile Our Moments visibility in weddings.field_customizations.hide_our_moments and derive it through src/lib/etoileGallery.ts; this preserves existing photo storage and keeps background photos independent of section visibility.
- Derive template demo dates from src/lib/previewDates.ts, never from fixed calendar dates; previews stay future-dated without changing saved invitation countdowns.
- Create Elan photo walls only through the authenticated photo-wall function on unlock (after payment confirmation when charged), signing exact request bytes with server-only ELAN_KEY/ELAN_SECRET and using the wedding ID for idempotency; this prevents credential exposure and duplicate billing.
- Generate Elan dashboard login links only on an authenticated owner's click for a created wall, open the returned URL immediately in a new tab reserved during that click with its opener cleared, and never store or log them; the single-use links expire in two minutes.
- Reset Fast Refresh state for ManageLinks and usePhotoWall; nested hook changes must remount instead of reusing incompatible React hook queues in the preview.
- Keep invitation-image write access bound to the event owner or explicitly shared editor via invites/{slug}, and video uploads bound to auth.uid() folders; public social previews must retain their existing addresses.
- Manage promo-code records only through trusted service access; ordinary signed-in customers may read active codes but cannot write them.