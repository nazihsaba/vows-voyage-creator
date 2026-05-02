ALTER TABLE public.weddings
ADD COLUMN IF NOT EXISTS template_fonts jsonb NOT NULL DEFAULT '{}'::jsonb;