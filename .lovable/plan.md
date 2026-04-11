

## Plan: Auto-detect tables from uploaded venue plan image

### What it does
After a venue plan image is uploaded, an AI model analyzes it to detect tables (the white circles with chairs, rectangular tables, etc.) and automatically creates editable VenueTable objects at their approximate positions on the canvas. No manual table adding needed — the tables from the image become interactive.

### How it works

1. **New edge function `detect-venue-tables`**
   - Receives the uploaded image URL
   - Sends it to Gemini 2.5 Pro (via Lovable AI gateway) with a prompt asking it to identify all tables in the image and return their approximate positions (as percentage of image width/height), shapes, names, and guest counts
   - Returns a JSON array of detected tables

2. **Update `VenueLayoutPlanner.tsx`**
   - After a successful plan image upload, call the new edge function
   - Show a loading indicator ("Detecting tables...")
   - Map the AI response (percentage-based coordinates) to canvas pixel positions (relative to the 1000px-wide image)
   - Create VenueTable objects for each detected table and add them to state
   - Auto-save triggers as usual

3. **Update `VenueToolbar.tsx`**
   - Add a "Detect Tables" button (with a Wand/Sparkles icon) that appears when a plan image is loaded, allowing re-detection if needed

### Technical details

**Edge function prompt strategy:**
The prompt will ask Gemini to return JSON with each table's:
- `name` (e.g. "Table 1", "Bridal Table", "Cake", "Bar")
- `shape` ("round" | "rectangle" | "square" | "oval")
- `x_percent` / `y_percent` (center position as 0-100% of image dimensions)
- `width_percent` / `height_percent` (size as % of image)
- `guest_count` (estimated from chairs visible)

**Coordinate mapping:**
- Image renders at 1000px wide on canvas
- `x_position = (x_percent / 100) * 1000 - (width / 2)`
- `y_position = (y_percent / 100) * imageAspectRatio * 1000 - (height / 2)`
- Sizes similarly scaled from percentages to pixels

**Files to create:**
- `supabase/functions/detect-venue-tables/index.ts`

**Files to modify:**
- `src/components/venue/VenueLayoutPlanner.tsx` — add detection call after upload
- `src/components/venue/VenueToolbar.tsx` — add re-detect button

