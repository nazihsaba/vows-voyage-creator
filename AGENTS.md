# Architecture rules

- Store Étoile Our Moments visibility in weddings.field_customizations.hide_our_moments and derive it through src/lib/etoileGallery.ts; this preserves existing photo storage and keeps background photos independent of section visibility.
- Derive template demo dates from src/lib/previewDates.ts, never from fixed calendar dates; previews stay future-dated without changing saved invitation countdowns.