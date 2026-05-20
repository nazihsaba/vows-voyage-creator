ALTER TABLE public.invitation_links
  ADD COLUMN IF NOT EXISTS invite_sent_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS invite_sent_count integer NOT NULL DEFAULT 0;