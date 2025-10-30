-- Add field customizations column to weddings table
ALTER TABLE public.weddings 
ADD COLUMN IF NOT EXISTS field_customizations jsonb DEFAULT '{}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.weddings.field_customizations IS 'Stores custom styles for each field: {fieldId: {fontSize, fontFamily, color, text}}';
