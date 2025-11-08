-- Add video_url column to weddings table for video background templates
ALTER TABLE public.weddings 
ADD COLUMN video_url TEXT;