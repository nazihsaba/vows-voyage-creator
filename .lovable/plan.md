

## Plan: Add uploaded images to assets and use in Eclat Preview

### What we're doing
Save the 6 uploaded wedding photos as new Eclat preview assets, then update the EclatPreview component to use them instead of the current `eclat-wedding-*.jpg` images.

### Asset mapping
| Uploaded file | Asset name | Usage |
|---|---|---|
| `WhatsApp_Image_2026-03-20_at_4.44.16_PM.jpeg` (close-up couple) | `eclat-wedding-1.jpg` | Hero/main image |
| `WhatsApp_Image_2026-03-20_at_4.44.17_PM.jpeg` (sunset road) | `eclat-wedding-2.jpg` | Gallery image 1 |
| `WhatsApp_Image_2026-03-20_at_4.44.17_PM_1.jpeg` (sunglasses couple) | `eclat-wedding-3.jpg` | Gallery image 2 |
| `WhatsApp_Image_2026-03-20_at_4.44.16_PM_1.jpeg` (walking together, color) | `eclat-wedding-4.jpg` | Gallery image 3 |
| `ELF_3548.JPG.jpeg` (field B&W) | `eclat-wedding-5.jpg` | Gallery image 4 |
| `ELF_3805.JPG.jpeg` (walking B&W) | `eclat-wedding-6.jpg` | Gallery image 5 |

### File changes

1. **Copy 6 images** to `src/assets/` as `eclat-wedding-1.jpg` through `eclat-wedding-6.jpg` (overwriting existing files)

2. **Update `src/components/templates/EclatPreview.tsx`**:
   - Remove import for `eclatWedding7` (no longer needed — only 6 images now)
   - Update `staticGallery` array to use all 5 gallery images (eclat-wedding-2 through eclat-wedding-6) without repeating any
   - The hero stays as `eclatWedding1`, gallery uses images 2-6

