

## Plan: 2D Venue Layout as Slide-in Panel

### What Changes
Add a "Venue Layout" button next to Guest List and Table Occupancy tabs. Clicking it slides in the full venue layout planner from the right (using a Sheet component), keeping the user on the same page.

### Database Migration
Same as the previously approved schema:
- **`venue_projects`** table: id, wedding_id, name, plan_image_url, scale, created_at, updated_at (with `update_updated_at_column` trigger)
- **`venue_tables`** table: id, venue_project_id, name, shape, width, height, x_position, y_position, rotation, guest_count, created_at
- RLS policies: owner access via wedding_id join to weddings.user_id (same pattern as gallery_images)

### New Dependency
- `react-konva` + `konva` for the 2D canvas

### UI Approach
- Add a third button "Venue Layout" in the tab toggle group (lines 655-674 of ManageLinks.tsx)
- Clicking it opens a **full-width Sheet** (sliding from the right) containing the venue layout editor
- The Sheet contains the three-panel layout: left toolbar, center Konva canvas, right properties panel
- Sheet can be closed to return to the guest list/table occupancy view

### New Files

1. **`src/components/venue/VenueLayoutSheet.tsx`** — Sheet wrapper containing the full editor layout with top bar (project name, save status, close button)

2. **`src/components/venue/VenueCanvas.tsx`** — Konva Stage with background image layer + tables layer. Zoom (scroll wheel), pan (drag), optional grid overlay.

3. **`src/components/venue/VenueToolbar.tsx`** — Left panel: add table (round/rect/square/oval), upload venue plan, grid toggle, zoom controls.

4. **`src/components/venue/VenueTableProperties.tsx`** — Right panel when table selected: name, guest count, shape, size, rotation, delete/duplicate.

5. **`src/components/venue/VenueTableShape.tsx`** — Konva Group rendering correct shape with drag, resize/rotate handles via Transformer, label text.

6. **`src/hooks/useVenueProject.ts`** — Fetches/auto-creates venue_project for the wedding. CRUD for venue_tables. Debounced auto-save (1.5s) with status indicator. Image upload to `wedding-images` bucket.

### Modified Files

1. **`src/pages/ManageLinks.tsx`**
   - Add state: `venueLayoutOpen` (boolean)
   - Add third button in the tab group with `LayoutGrid` icon labeled "Venue Layout"
   - Clicking it sets `venueLayoutOpen = true`
   - Render `<VenueLayoutSheet open={venueLayoutOpen} onClose={...} weddingId={weddingId} />` at bottom of component

No new routes or pages needed.

### Technical Notes
- Sheet uses `side="right"` with full width (`w-full` or `w-[95vw]`) so the canvas has enough space
- Auto-save with visual status: "Saved", "Saving...", "Error"
- Konva handles 50-100 tables performantly
- Venue plan images uploaded to `wedding-images` bucket at `{userId}/{filename}` path
- Uses auto-generated Supabase types only

