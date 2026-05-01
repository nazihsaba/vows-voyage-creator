ALTER TABLE public.wedding_locations
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;