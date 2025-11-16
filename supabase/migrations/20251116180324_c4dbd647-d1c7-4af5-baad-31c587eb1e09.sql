-- Add text description columns to weddings table
ALTER TABLE public.weddings
ADD COLUMN IF NOT EXISTS welcoming_text TEXT,
ADD COLUMN IF NOT EXISTS middle_text TEXT,
ADD COLUMN IF NOT EXISTS end_text TEXT;