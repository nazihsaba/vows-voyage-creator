-- Add audio fields to weddings table
ALTER TABLE public.weddings
ADD COLUMN audio_url TEXT,
ADD COLUMN audio_start_time NUMERIC DEFAULT 0,
ADD COLUMN audio_end_time NUMERIC DEFAULT 0;