ALTER TABLE public.invitees ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_invitees_link_order ON public.invitees(invitation_link_id, display_order);