CREATE TABLE public.guest_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL,
  storage_path text NOT NULL,
  uploader_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_photos
  ADD CONSTRAINT fk_guest_photos_wedding
  FOREIGN KEY (wedding_id) REFERENCES public.weddings(id) ON DELETE CASCADE;

CREATE INDEX idx_guest_photos_wedding_id
  ON public.guest_photos(wedding_id);

ALTER TABLE public.guest_photos ENABLE ROW LEVEL SECURITY;

-- Couple (owner) reads their own wedding's photos
CREATE POLICY "Owners read their wedding's photos"
  ON public.guest_photos FOR SELECT
  USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));

-- Couple (owner) deletes their own wedding's photos
CREATE POLICY "Owners delete their wedding's photos"
  ON public.guest_photos FOR DELETE
  USING (wedding_id IN (SELECT id FROM public.weddings WHERE user_id = auth.uid()));