ALTER TABLE public.weddings
ADD COLUMN main_picture_position_y numeric DEFAULT 50
CHECK (main_picture_position_y >= 0 AND main_picture_position_y <= 100);