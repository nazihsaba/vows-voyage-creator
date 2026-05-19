ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS wishes_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.invitees ADD COLUMN IF NOT EXISTS wishes_message text;