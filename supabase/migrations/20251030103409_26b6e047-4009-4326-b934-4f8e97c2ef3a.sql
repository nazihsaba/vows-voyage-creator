-- Add font customization columns to weddings table
ALTER TABLE public.weddings 
ADD COLUMN IF NOT EXISTS custom_font_heading text DEFAULT 'Playfair Display',
ADD COLUMN IF NOT EXISTS custom_font_body text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS heading_font_size text DEFAULT 'large',
ADD COLUMN IF NOT EXISTS locked_name_style jsonb DEFAULT '{"fontSize": "6xl", "fontFamily": "Dancing Script"}'::jsonb;