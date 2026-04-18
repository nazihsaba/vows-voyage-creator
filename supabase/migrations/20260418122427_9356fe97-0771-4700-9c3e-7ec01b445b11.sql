ALTER TABLE public.gallery_images
ADD COLUMN position_y numeric DEFAULT 50
CHECK (position_y >= 0 AND position_y <= 100);