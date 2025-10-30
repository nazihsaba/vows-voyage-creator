-- Add color customization columns to weddings table
ALTER TABLE public.weddings 
ADD COLUMN IF NOT EXISTS custom_primary_color text,
ADD COLUMN IF NOT EXISTS custom_accent_color text,
ADD COLUMN IF NOT EXISTS custom_text_color text;