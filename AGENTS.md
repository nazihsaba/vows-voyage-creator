# Architecture rules

- Store Étoile Our Moments visibility in weddings.field_customizations.hide_our_moments and derive it through src/lib/etoileGallery.ts; this preserves existing photo storage and keeps background photos independent of section visibility.
- Derive template demo dates from src/lib/previewDates.ts, never from fixed calendar dates; previews stay future-dated without changing saved invitation countdowns.
- Create Elan photo walls only through the authenticated photo-wall function on unlock (after payment confirmation when charged), signing exact request bytes with server-only ELAN_KEY/ELAN_SECRET and using the wedding ID for idempotency; this prevents credential exposure and duplicate billing.