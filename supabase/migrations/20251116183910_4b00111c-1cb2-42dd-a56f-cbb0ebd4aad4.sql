-- Add columns for Christmas dinner invitation template
ALTER TABLE public.weddings
ADD COLUMN IF NOT EXISTS recipient_name text,
ADD COLUMN IF NOT EXISTS invitation_text text,
ADD COLUMN IF NOT EXISTS event_title text,
ADD COLUMN IF NOT EXISTS closing_message text;